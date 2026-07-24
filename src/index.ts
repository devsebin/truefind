import express, { Application } from "express";
import mongoose from "mongoose";
import compression from "compression";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
// import { activityLog } from "./middlewares/request.middleware";
import cookieParser from "cookie-parser";
import { validateJson } from "./middlewares/request-format-validation.middleware";
import routes from "./routes/index.routes";
import masterRoutes from "./routes/master.routes";
import { geoMiddleware } from "./middlewares/user-location-fetching.middleware";
import { COOKIE_SECRET } from "./utils/validate-env";
// import "./resources/v1/masters/providers/helpers/handler.startup";
import { AsyncLocalStorage } from "async_hooks";

const asyncLocalStorage = new AsyncLocalStorage();

class Index {
    public express: Application;
    public port: number;

    constructor(port: number) {
        this.express = express();
        this.port = port;

        this.initializeDatabaseConnection();
        this.initializeMiddleware();
        this.initializeRoutes();
    }
    private initializeRoutes(): void {
        this.express.use("/api/v1", routes);
        this.express.use("/api/v1/masters", masterRoutes);
    }
    private initializeMiddleware(): void {
        this.express.set("trust proxy", true); // If behind a proxy like Nginx
        this.express.use(cookieParser(COOKIE_SECRET));
        this.express.use(geoMiddleware);

        // this.express.use(activityLog);
        this.express.use(helmet());
        this.express.use(cors());
        this.express.use(morgan("dev"));
        this.express.use(express.json());
        this.express.use(validateJson);
        this.express.use(express.urlencoded({ extended: false }));
        this.express.use(compression());
    }

    private initializeDatabaseConnection(): void {
        mongoose.set("strictQuery", false);
        mongoose.connect(process.env.MONGO_PATH as string, {
            readPreference: "primary",
            writeConcern: { w: "majority", j: true, wtimeout: 5000 },
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });
        const db = mongoose.connection;
        db.on("error", (err) => console.error("DB connection failed", err));
        db.once("open", () => console.log("Connected to MongoDB!"));
    }

    public listen(): void {
        this.express.listen(this.port, () => {
            console.log(`App listening on the port ${this.port}`);
        });
    }
}

export default Index;

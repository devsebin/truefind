import validateEnv from "./utils/validate-env";
import dotenv from "dotenv";
import "module-alias/register";
import Index from "./index";
dotenv.config();
validateEnv();

const app = new Index(Number(process.env.PORT));
app.listen();

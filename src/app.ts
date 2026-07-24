import validateEnv from "./utils/validate-env";
import "module-alias/register";
import Index from "./index";
validateEnv();

const app = new Index(Number(process.env.PORT));
app.listen();

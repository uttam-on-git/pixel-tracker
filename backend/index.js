import config from "./utils/config.js";
import app from './app.js'
import client from "./prisma.js";

const checkDbConnection = async () => {
    try {
      await client.$connect();
      console.log("Database connected!");
    } catch (error) {
      console.error("Database connection failed:", error.message);
      process.exit(1);
    }
}
  
checkDbConnection();

app.listen(config.PORT, () => {
    console.log(`Server running on PORT ${config.PORT}.`)
})
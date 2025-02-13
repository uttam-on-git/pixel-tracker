import config from "./utils/config.js";
import app from "./app.js";
import client from "./client.js";

const checkDbConnection = async (retries = 5, delay = 5000) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await client.$connect();
      console.log("database connected");
      return;
    } catch (error) {
      console.error(
        `database connection failed (Attempt ${attempt} / ${retries}): `,
        error.message
      );
      if (attempt < retries) {
        console.log(`Retrying in ${delay / 1000} seconds...`);
        await new Promise((res) => setTimeout(res, delay));
      } else {
        console.log("All retry attempts failed. Exiting...");
        process.exit(1);
      }
    }
  }
};

checkDbConnection().then(() => {
  app.listen(config.PORT, () => {
    console.log(`Server running on PORT ${config.PORT}`);
  });
});

process.on("SIGINT", async () => {
  console.log("Closing Prisma connection...");
  await client.$disconnect();
  process.exit(0);
});
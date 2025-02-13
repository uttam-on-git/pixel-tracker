import express from "express";
const trackerRouter = express.Router();
import client from "../client.js";

trackerRouter.get("/", async (request, response) => {
  try {
    const trackers = await client.tracker.findMany({
      orderBy: { createdAt: "desc" },
    });
    response.json(trackers);
  } catch (error) {
    return response.status(500).json({ error: "Error fetching trackers" });
  }
});

export default trackerRouter

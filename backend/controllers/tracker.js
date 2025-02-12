import express from "express";
const trackerRouter = express.Router();
import client from "../prisma.js";

trackerRouter.get("/", async (request, response) => {
  try {
    const trackers = await client.tracker.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json(trackers);
  } catch (error) {
    res.status(500).json({ error: "Error fetching trackers" });
  }
});

export default trackerRouter

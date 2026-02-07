import http from "http";
import "dotenv/config.js";
import app from "./app.js";
import connectDB from "./config/db.js";

const server = http.createServer(app);

const port = process.env.PORT || 8000;

const startServer = async () => {
  try {
    await connectDB();
    server.listen(port, () => {
      console.log("Server started successfully", {
        port: port,
        environment: process.env.NODE_ENV || "development",
        healthCheck: `http://localhost:${port}/health`,
        apiBase: `http://localhost:${port}/api/v1`,
      });
    });
  } catch (error) {
    console.log(error);
    console.error("Failed to start server", error);
    process.exit(1);
  }
};

startServer();
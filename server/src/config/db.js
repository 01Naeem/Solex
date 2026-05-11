import mongoose from "mongoose";
import { config } from "./env.js";
let isConnected = false;

const connectDB = async () => {
  try {
    if (isConnected) return;

    const conn = await mongoose.connect(config.MONGO_URI_TEST, {
      autoIndex: false,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    isConnected = conn.connections[0].readyState === 1;

    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // 📌 Event Listeners
    mongoose.connection.on("connected", () => {
      console.log("Mongoose connected to DB");
    });

    mongoose.connection.on("disconnected", () => {
      console.warn("Mongoose disconnected from DB");
    });

    mongoose.connection.on("error", (err) => {
      console.error("Mongoose error:", err.message);
    });

  } catch (error) {
    console.error("MongoDB Connection Error:", error.message);
    process.exit(1);
  }
};

// 📌 Graceful Shutdown
const gracefulShutdown = async (signal) => {
  try {
    console.log(`${signal} received. Closing MongoDB connection...`);
    await mongoose.connection.close(false);
    console.log("MongoDB connection closed.");
    process.exit(0);
  } catch (error) {
    console.error("Error during MongoDB shutdown:", error.message);
    process.exit(1);
  }
};

process.on("SIGINT", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);

export default connectDB;
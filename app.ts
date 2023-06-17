import 'reflect-metadata';
const express = require("express");
import { AppDataSource } from './app-data-source';

async function main() {
  try {
    // Establish database connection
    await AppDataSource.initialize();

    // Create and setup express app
    const app = express();
    app.use(express.json());

    // Register routes and other application logic

    // Start express server
    app.listen(3000, () => {
      console.log("Express server is running on port 3000");
    });
  } catch (error) {
    console.error("Error connecting to the database:", error);
  }
}

main();
// const { AppDataSource } = require("./orm");
const express = require("express");

async function main() {
  try {
    // Create and setup express app
    const app = express();
    app.use(express.json());

    // Register routes and other application logic

    // Start express server
    app.listen(3000, () => {
      console.log("Express server is running on port 3000");
    });

    app.get("/", (req, res) => {
      res.send("Hello, Express!");
    });
  } catch (error) {
    console.error("Error connecting to the database:", error);
  }
}

main();

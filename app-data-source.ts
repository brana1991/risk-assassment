import 'reflect-metadata';
import {  DataSource } from 'typeorm';

    // Create a new DataSource instance
     export const AppDataSource = new DataSource({
      type: "mysql",
      host: "localhost",
      port: 3306,
      username: "brana",
      password: "101Dalmatinac101",
      database: "risk_assessment_database",
      entities: ["src/entity/*.js"],
      synchronize: true,
      logging: true,
    });

    // Initialize the DataSource

    console.log('Data Source has been initialized!');

    // Perform your database operations using the DataSource

    // Close the DataSource connection when done
    AppDataSource.initialize()
    .then(() => {
        console.log("Data Source has been initialized!")
    })
    .catch((err) => {
        console.error("Error during Data Source initialization", err)
    })








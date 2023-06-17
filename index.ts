import { createConnection } from "typeorm";

async function main() {
  try {
    await createConnection();

  } catch (error) {
    console.error('Error connecting to the database:', error);
  }
}

main();
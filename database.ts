// IMPORTS
import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();
const uri: string = process.env.MONGO_URI ?? "mongodb://localhost:27017";
const client = new MongoClient(uri);

async function exit() {
  try {
    await client.close();
    console.log("Disconnected from database");
  } catch (error) {
    console.error(error);
  }
  process.exit(0);
}

export async function writeToDatabase(data: any[]) {
  try {
    const collection = client.db("milestone").collection("players");
    const existingIds = await collection.distinct("id");
    const newData = data.filter((doc) => !existingIds.includes(doc.id));
    if (newData.length === 0) {
      console.log("No new data to insert.");
      return;
    }

    await collection.deleteMany({});
    await collection.insertMany(newData);
    console.log(`${newData.length} new documents inserted into MongoDB.`);
  } catch (error) {
    console.error("Error writing to database:", error);
  }
}

export async function connect() {
  try {
    await client.connect();
    console.log("Connected to database");

    const collection = client.db("milestone").collection("players");
    const count = await collection.countDocuments();

    if (count === 0) {
      console.log(
        "No data in database. Fetching data and writing to database..."
      );
    } else {
      console.log("Data found in database. Using existing data.");
    }

    process.on("SIGINT", exit);
  } catch (error) {
    console.error(error);
  }
}

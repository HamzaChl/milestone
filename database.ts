// IMPORTS
import { fetchDataAndWriteToMongoDB } from "./functions";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();
const uri: string = process.env.MONGO_URI ?? "mongodb://localhost:27017";
const client = new MongoClient(uri);

//GENGENEREERD

//EXIT FUNCTIE VOOR CONNECT
async function exit() {
  try {
    await client.close();
    console.log("Disconnected from database");
  } catch (error) {
    console.error(error);
  }
  process.exit(0);
}

//CONNECT FUNCTIE
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
      await fetchDataAndWriteToMongoDB();
    } else {
      console.log("Data found in database. Using existing data.");
    }

    process.on("SIGINT", exit);
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  }
}

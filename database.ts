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

export async function writeToDatabase(collectionName: string, data: any[]) {
  try {
    const collection = client.db("milestone").collection(collectionName);

    for (const doc of data) {
      if (!doc.id && collectionName === "players") {
        console.warn(`Skipping document without ID: ${JSON.stringify(doc)}`);
        continue;
      }

      let query: any;
      if (collectionName === "players") {
        query = { id: doc.id };
      } else {
        const clubInfos = doc["club-infos"];
        if (!clubInfos || !clubInfos.id) {
          console.warn(
            `Skipping document without club ID: ${JSON.stringify(doc)}`
          );
          continue;
        }
        query = { id: doc.id, "club-infos.id": clubInfos.id };
      }

      const existingDoc = await collection.findOne(query);
      if (existingDoc) {
        console.log(
          `Document with ID ${doc.id} already exists in collection ${collectionName}, skipping.`
        );
      } else {
        await collection.updateOne(
          { id: doc.id },
          { $set: doc },
          { upsert: true }
        );
        console.log(
          `Document with ID ${doc.id} inserted/updated in collection ${collectionName}.`
        );
      }
    }

    console.log(
      `${data.length} documents inserted into MongoDB collection: ${collectionName}.`
    );
  } catch (error) {
    console.error(
      `Error writing to database collection ${collectionName}:`,
      error
    );
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

import { MongoClient } from "mongodb";
import { connect } from "./database";
import dotenv from "dotenv";

dotenv.config();
const uri: string = process.env.MONGO_URI ?? "mongodb://localhost:27017";
const client = new MongoClient(uri);

//FETCH NAAR MONGODB

export async function fetchDataAndWriteToMongoDB() {
  try {
    await client.connect();

    const responsePlayers = await fetch(
      "https://hamzachl.github.io/milestone1-json/soccerplayers.json"
    );
    const responseLeagues = await fetch(
      "https://hamzachl.github.io/milestone1-json/leagues.json"
    );

    const dataPlayers = await responsePlayers.json();
    const dataLeagues = await responseLeagues.json();

    await writeToDatabase("players", dataPlayers.players);
    await writeToDatabase("leagues", dataLeagues.leagues);

    console.log("Data fetched and written to MongoDB successfully.");
  } catch (error) {
    console.error("Error fetching and writing data to MongoDB:", error);
  }
}

//FETCH FUNCTIE VANAF MONGODB

export async function fetchDataFromMongoDB() {
  try {
    await client.connect();

    console.log("Connected to MongoDB");

    const database = client.db("milestone");
    const playersCollection = database.collection("players");
    const leaguesCollection = database.collection("leagues");

    const players = await playersCollection.find({}).toArray();

    const leagues = await leaguesCollection.find({}).toArray();

    return {
      players: players,
      leagues: leagues,
    };
  } catch (error) {
    throw new Error("Error fetching data from MongoDB: " + error);
  } finally {
    await client.close();
    // console.log("Disconnected from MongoDB");
  }
}

//GENGENEREERD
export async function writeToDatabase(collectionName: string, data: any[]) {
  try {
    const collection = client.db("milestone").collection(collectionName);

    for (const doc of data) {
      if (!doc.id) {
        console.warn(`Skipping document without ID: ${JSON.stringify(doc)}`);
        continue;
      }

      const query = { id: doc.id };

      const existingDoc = await collection.findOne(query);
      if (existingDoc) {
        //CHECK
        // console.log(
        //   `Document with ID ${doc.id} already exists in collection ${collectionName}, skipping.`
        // );
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

//ZOEKFUNCTIE

export function sortPlayers(players: any[], sortBy: string, order: string) {
  if (order === "ASC") {
    return players.sort((a, b) => (a[sortBy] > b[sortBy] ? 1 : -1));
  } else {
    return players.sort((a, b) => (a[sortBy] < b[sortBy] ? 1 : -1));
  }
}

export function sortLeagues(leagues: any[], sortBy: string, order: string) {
  if (order === "ASC") {
    return leagues.sort((a, b) => (a[sortBy] > b[sortBy] ? 1 : -1));
  } else {
    return leagues.sort((a, b) => (a[sortBy] < b[sortBy] ? 1 : -1));
  }
}

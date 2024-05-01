import { MongoClient } from "mongodb";
import { connect, writeToDatabase } from "./database";
import dotenv from "dotenv";

dotenv.config();
const uri: string = process.env.MONGO_URI ?? "mongodb://localhost:27017";
const client = new MongoClient(uri);

//FETCH NAAR MONGODB

export async function fetchDataAndWriteToMongoDB() {
  try {
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

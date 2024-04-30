import { connect, writeToDatabase } from "./database";

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

    await writeToDatabase(dataPlayers.players);
    // await writeToDatabase(dataPlayers);
    // await writeToDatabase(dataLeagues);

    console.log("Data fetched and written to MongoDB successfully.");
  } catch (error) {
    console.error("Error fetching and writing data to MongoDB:", error);
  }
}

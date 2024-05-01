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
    let dataLeagues = await responseLeagues.json();

    if (!Array.isArray(dataLeagues)) {
      // Als dataLeagues geen array is, probeer de leagues property te gebruiken
      dataLeagues = dataLeagues.leagues || [];
    }

    await writeToDatabase("players", dataPlayers.players);
    await writeToDatabase("leagues", dataLeagues);

    console.log("Data fetched and written to MongoDB successfully.");
  } catch (error) {
    console.error("Error fetching and writing data to MongoDB:", error);
  }
}

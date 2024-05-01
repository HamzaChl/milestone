import express, { Express } from "express";
import dotenv from "dotenv";
import path from "path";
import { filterPlayers } from "./search";
import { connect, writeToDatabase } from "./database";
import { fetchDataAndWriteToMongoDB, fetchDataFromMongoDB } from "./functions";

dotenv.config();

const app: Express = express();
const pages = ["home", "players", "leagues", "settings", "logout"];

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.set("views", path.join(__dirname, "views"));

app.set("port", process.env.PORT || 3000);

function sortPlayers(players: any[], sortBy: string, order: string) {
  if (order === "ASC") {
    return players.sort((a, b) => (a[sortBy] > b[sortBy] ? 1 : -1));
  } else {
    return players.sort((a, b) => (a[sortBy] < b[sortBy] ? 1 : -1));
  }
}

app.get("/", (req, res) => {
  res.render("login");
});

app.post("/", (req, res) => {
  res.redirect("/home");
});

app.get("/home", async (req, res) => {
  try {
    const data = await fetchDataFromMongoDB();
    const numberOfPlayers = data.players.length;
    const numberOfLeagues = data.leagues.length;
    const percentage = 60;
    res.render("index", {
      title: "Hello World",
      message: "Hello World",
      currentPage: "home",
      numberOfPlayers: numberOfPlayers,
      numberOfLeagues: numberOfLeagues,
      percentage: percentage,
    });
  } catch (error) {
    console.log("Error fetching data:", error);
    res.status(500).send("An error occurred.");
  }
});

app.get("/players", async (req, res) => {
  try {
    const data = await fetchDataFromMongoDB();

    res.render("players", {
      title: "Hello World",
      message: "Hello World",
      currentPage: "players",
      players: data.players,
    });
  } catch (error) {
    console.log("Erreur lors de la récupération des données :", error);
    res
      .status(500)
      .send("Une erreur s'est produite lors du chargement des joueurs.");
  }
});

app.post("/players", async (req, res) => {
  try {
    const searchTerm: string = req.body.searchTerm || "";
    const filters = {
      name: searchTerm,
      league: req.body.league || "",
      club: req.body.club || "",
      country: req.body.country || "",
    };

    const data = await fetchDataFromMongoDB();

    const filteredPlayers = filterPlayers(data.players, filters);

    res.render("players", {
      title: "Résultats de la recherche",
      message: "Résultats de la recherche",
      currentPage: "players",
      players: filteredPlayers,
    });
  } catch (error) {
    console.log("Erreur lors de la récupération des données :", error);
    res
      .status(500)
      .send("Une erreur s'est produite lors du chargement des joueurs.");
  }
});

app.get("/players/:fullName", async (req, res) => {
  try {
    const { fullName } = req.params;
    const data = await fetchDataFromMongoDB();

    const player = data.players.find(
      (player: any) =>
        player.name.toLowerCase().replace(/\s/g, "") === fullName.toLowerCase()
    );

    if (!player) {
      return res.status(404).send("Joueur non trouvé");
    }

    const [firstName, lastName] = player.name.split(" ");
    res.render("player", {
      title: `${firstName} ${lastName}`,
      message: `${firstName} ${lastName}`,
      currentPage: "players",
      player: player,
    });
  } catch (error) {
    console.log("Erreur lors de la récupération des données :", error);
    res
      .status(500)
      .send("Une erreur s'est produite lors du chargement du joueur.");
  }
});

app.get("/leagues", async (req, res) => {
  try {
    const data = await fetchDataFromMongoDB();
    res.render("leagues", {
      title: "Titre de la page des ligues",
      message: "Message de la page des ligues",
      currentPage: "leagues",
      leagues: data.leagues,
    });
  } catch (error) {
    console.log(`error : ${error}`, error);
    res.status(500).send(`error : ${error}`);
  }
});

app.get("/settings", (req, res) => {
  res.render("settings", {
    title: "Hello World",
    message: "Hello World",
    currentPage: "settings",
  });
});

app.get("/logout", (req, res) => {
  res.redirect("/");
});

app.use((req, res, next) => {
  res.status(404).render("badpage", { message: "Page not found" });
});

app.listen(app.get("port"), async () => {
  try {
    await connect();
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1); // Exit process with failure
  }
});

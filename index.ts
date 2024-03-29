import express, { Express } from "express";
import dotenv from "dotenv";
import path from "path";

dotenv.config();

const app: Express = express();
const pages = ["home", "players", "leagues", "settings", "logout"];

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.set("views", path.join(__dirname, "views"));

app.set("port", process.env.PORT || 3000);

// Fonction pour trier les joueurs
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
  // Vérifier les informations de connexion ici

  // Rediriger vers la page d'accueil après la connexion réussie
  res.redirect("/home");
});

app.get("/home", (req, res) => {
  res.render("index", {
    title: "Hello World",
    message: "Hello World",
    currentPage: "home",
  });
});

app.get("/players", async (req, res) => {
  try {
    const response = await fetch(
      "https://hamzachl.github.io/milestone1-json/soccerplayers.json"
    );
    const data = await response.json();
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
    let searchCategory: string =
      typeof req.query.searchCategory === "string"
        ? req.query.searchCategory
        : "player-name";
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
    const response = await fetch(
      "https://hamzachl.github.io/milestone1-json/soccerplayers.json"
    );
    const data = await response.json();
    const player = data.players.find(
      (player: any) =>
        player.name.toLowerCase().replace(/\s/g, "") === fullName.toLowerCase()
    );

    if (!player) {
      return res.status(404).send("Joueur non trouvé");
    }

    const [firstName, lastName] = player.name.split(" "); // Sépare le prénom et le nom de famille
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
    const response = await fetch(
      "https://hamzachl.github.io/milestone1-json/leagues.json"
    );
    const data = await response.json();
    res.render("leagues", {
      title: "Titre de la page des ligues",
      message: "Message de la page des ligues",
      currentPage: "leagues",
      leagues: data,
    });
  } catch (error) {
    console.log(
      "Erreur lors de la récupération des données des ligues :",
      error
    );
    res
      .status(500)
      .send("Une erreur s'est produite lors du chargement des ligues.");
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
  // Code pour gérer la déconnexion de l'utilisateur
  // Par exemple, déconnexion de la session, suppression des cookies, etc.

  // Redirection vers la page d'accueil après la déconnexion
  res.redirect("/");
});

app.listen(app.get("port"), () => {
  console.log("Server started on http://localhost:" + app.get("port"));
});

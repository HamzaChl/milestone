import express, { Express } from "express";
import { filterPlayers } from "../search";
import {
  fetchDataFromMongoDB,
  sortPlayers,
  sortLeagues,
  updatePlayerNameByFullName,
  updatePlayerNameById,
} from "../functions";

export default function milestoneRouter() {
  const router = express.Router();

  router.get("/home", async (req, res) => {
    try {
      const data = await fetchDataFromMongoDB();
      const numberOfPlayers = data.players.length;
      const numberOfLeagues = data.leagues.length;
      const percentage = 75;
      res.render("index", {
        title: "Hello World",
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

  router.get("/players", async (req, res) => {
    try {
      const data = await fetchDataFromMongoDB();

      const sortedPlayers = sortPlayers(data.players, "name", "ASC");

      res.render("players", {
        title: "Hello World",
        message: "Hello World",
        currentPage: "players",
        players: sortedPlayers,
      });
    } catch (error) {
      console.log("Error :", error);
      res
        .status(500)
        .send("Er is een fout opgetreden tijdens het laden van de spelers.");
    }
  });

  router.post("/players", async (req, res) => {
    try {
      const searchTerm: string = req.body.searchTerm || "";
      const filters = {
        name: searchTerm,
        league: req.body.league || "",
        club: req.body.club || "",
        country: req.body.country || "",
      };
      let country: string = req.body.sortOrder;

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

  router.get("/players/:fullName", async (req, res) => {
    try {
      const data = await fetchDataFromMongoDB();
      const { fullName } = req.params;

      const player = data.players.find(
        (player: any) =>
          player.name.toLowerCase().replace(/\s/g, "") ===
          fullName.toLowerCase()
      );

      if (!player) {
        return res
          .status(404)
          .send("Er is een fout opgetreden tijdens het laden van de speler.");
      }

      const [firstName, lastName] = player.name.split(" ");

      let league = null;
      if (player.league) {
        league = data.leagues.find(
          (league: any) =>
            league.League.toLowerCase().replace(/\s/g, "") ===
            player.league.toLowerCase()
        );
      }

      res.render("player", {
        title: `${firstName} ${lastName}`,
        message: `${firstName} ${lastName}`,
        currentPage: "players",
        player: player,
        league: league,
        fullName: fullName,
      });
    } catch (error) {
      console.log("Error fetching data:", error);
      res
        .status(500)
        .send("Er is een fout opgetreden tijdens het laden van de speler.");
    }
  });

  router.get("/leagues/:fullName", async (req, res) => {
    try {
      const data = await fetchDataFromMongoDB();
      const { fullName } = req.params;

      const league = data.leagues.find(
        (league: any) =>
          league.League.toLowerCase().replace(/\s/g, "") ===
          fullName.toLowerCase()
      );

      if (!league) {
        return res
          .status(404)
          .send("Er is een fout opgetreden tijdens het laden van de league.");
      }

      res.render("league", {
        lname: league.League,
        lcountry: league.Country,
        lactive: league.Active,
        lupdated: league["Last Updated"],
        lvalue: league["Total Market Value"],
        currentPage: "leagues",
        league: league,
      });
    } catch (error) {
      console.log("Error fetching data:", error);
      res
        .status(500)
        .send("Er is een fout opgetreden tijdens het laden van de league.");
    }
  });

  router.get("/players/:fullName/edit", async (req, res) => {
    try {
      const fullName = req.params.fullName;
      const data = await fetchDataFromMongoDB();
      const player = data.players.find(
        (p: any) =>
          p.name.toLowerCase().replace(/\s/g, "") === fullName.toLowerCase()
      );

      if (!player) {
        return res.status(404).send("Speler niet gevonden.");
      }

      res.render("editPlayer", {
        title: "Speler bewerken",
        player: player,
        currentPage: "players",
      });
    } catch (error) {
      console.error("Fout bij het laden van de speler:", error);
      res
        .status(500)
        .send("Er is een fout opgetreden bij het laden van de speler.");
    }
  });

  router.post("/players/:fullName/edit", async (req, res) => {
    try {
      const fullName = req.params.fullName;
      const newName = req.body.name;

      // Je moet de speler-id vinden op basis van de volledige naam
      const data = await fetchDataFromMongoDB();
      const player = data.players.find(
        (p: any) =>
          p.name.toLowerCase().replace(/\s/g, "") === fullName.toLowerCase()
      );

      if (!player) {
        return res.status(404).send("Speler niet gevonden.");
      }

      // Roep de update-functie aan met de speler-id
      await updatePlayerNameById(player.id, newName);
      res.redirect(`/milestone/players/${newName}`); // Redirect naar de nieuwe naam
      console.log(newName);
    } catch (error) {
      console.error("Fout bij het bewerken van de speler:", error);
      res
        .status(500)
        .send("Er is een fout opgetreden bij het bewerken van de speler.");
    }
  });

  router.get("/leagues", async (req, res) => {
    try {
      const data = await fetchDataFromMongoDB();

      let sortedLeagues = data.leagues;
      const sortOrder = req.query.sortOrder as string;
      if (sortOrder) {
        sortedLeagues = sortLeagues(data.leagues, "League", sortOrder);
      }

      res.render("leagues", {
        title: "Leagues",
        currentPage: "leagues",
        leagues: sortedLeagues,
      });
    } catch (error) {
      console.log(`error : ${error}`, error);
      res.status(500).send(`error : ${error}`);
    }
  });

  router.get("/settings", (req, res) => {
    res.render("settings", {
      title: "Hello World",
      message: "Hello World",
      currentPage: "settings",
    });
  });

  router.get("/logout", (req, res) => {
    res.redirect("/");
  });

  return router;
}

import express, { Express, Request, Response } from 'express';
import { filterPlayers } from "../search";
import {
  fetchDataFromMongoDB,
  sortPlayers,
  sortLeagues,
  updatePlayerById,
} from "../functions";
import { requireAdmin, secureMiddleware } from '../middleware/secureMiddleware';
import session from "../middleware/session";

const pages = ["home", "players", "leagues", "favorites", "logout"];

export default function milestoneRouter() {
  const router = express.Router();

  router.get("/home",secureMiddleware, async (req, res) => {
    try {
      const data = await fetchDataFromMongoDB();
      const numberOfPlayers = data.players.length;
      const numberOfLeagues = data.leagues.length;
      const percentage = 96;

      res.render("index", {
        currentPage: "home",
        numberOfPlayers: numberOfPlayers,
        numberOfLeagues: numberOfLeagues,
        percentage: percentage,
        userRole:req.session.user,

      });
    } catch (error) {
      console.log("Error fetching data:", error);
      res.status(500).redirect("badpage");
    }
  });

  router.get('/players',secureMiddleware, async (req: Request, res: Response) => {
    try {
      const data = await fetchDataFromMongoDB();
      const searchTerm = (req.query.searchTerm as string) || '';
      const sortOrder = (req.query.sortOrder as string) || 'ASC';
      const sortField = 'name';

      let players = data.players;

      if (searchTerm) {
        players = filterPlayers(players, { name: searchTerm });
      }

      const sortedPlayers = sortPlayers(players, sortField, sortOrder);

      res.render('players', {
        currentPage: 'players',
        players: sortedPlayers,
        searchTerm: searchTerm,
        sortOrder: sortOrder
      });
    } catch (error) {
      console.log('Error :', error);
      res.status(500).redirect('badpage');
    }
  });

  router.post("/players",secureMiddleware, async (req, res) => {
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
      res.status(500).redirect("badpage");
    }
  });

  router.get("/players/:fullName",secureMiddleware, async (req, res) => {
    try {
      const data = await fetchDataFromMongoDB();
      const { fullName } = req.params;

      const player = data.players.find(
        (player: any) =>
          player.name.toLowerCase().replace(/\s/g, "") ===
          fullName.toLowerCase()
      );

      if (!player) {
        return res.status(404).redirect("badpage");
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
        userRole:req.session.user,
      });
    } catch (error) {
      console.log("Error fetching data:", error);
      res.status(500).redirect("badpage");
    }
  });

  router.get("/leagues/:fullName",secureMiddleware, async (req, res) => {
    try {
      const data = await fetchDataFromMongoDB();
      const { fullName } = req.params;

      const league = data.leagues.find(
        (league: any) =>
          league.League.toLowerCase().replace(/\s/g, "") ===
          fullName.toLowerCase()
      );

      if (!league) {
        return res.status(404).redirect("badpage");
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
      res.status(500).redirect("badpage");
    }
  });

  router.get("/players/:fullName/edit", secureMiddleware,requireAdmin, async (req, res) => {
    try {
      const fullName = req.params.fullName;
      const data = await fetchDataFromMongoDB();
      const player = data.players.find(
        (p: any) =>
          p.name.toLowerCase().replace(/\s/g, "") === fullName.toLowerCase()
      );

      if (!player) {
        return res.status(404).redirect("badpage");
      }

      res.render("editPlayer", {
        title: "Speler bewerken",
        player: player,
        currentPage: "players",
      });
    } catch (error) {
      console.error("Fout bij het laden van de speler:", error);
      res.status(500).redirect("badpage");
    }
  });

  router.post("/players/:fullName/edit",secureMiddleware, async (req, res) => {
    try {
      const fullName = req.params.fullName;
      const newData = {
        name: req.body.name,
        age: req.body.age,
        birthdate: req.body.birthdate,
        "club-infos.league": req.body.league,
        "club-infos.club": req.body.club,
      };

      const data = await fetchDataFromMongoDB();
      const player = data.players.find(
        (p: any) =>
          p.name.toLowerCase().replace(/\s/g, "") === fullName.toLowerCase()
      );

      if (!player) {
        return res.status(404).redirect("badpage");
      }

      await updatePlayerById(player.id, newData);

      const redirectName = newData.name.replace(/\s/g, "").toLowerCase();
      res.redirect(`/milestone/players/${redirectName}`);
    } catch (error) {
      console.error("Fout bij het bewerken van de speler:", error);
      res.status(500).redirect("badpage");
    }
  });

  router.get("/leagues", secureMiddleware, async (req, res) => {
    try {
      const data = await fetchDataFromMongoDB();
      const searchTerm = (req.query.searchTerm as string) || '';
      const sortOrder = (req.query.sortOrder as string) || 'ASC';
      const sortField = 'League'; // Assuming we are sorting by league name
  
      let leagues = data.leagues;
  
      // Filter leagues by search term
      if (searchTerm) {
        leagues = leagues.filter(league =>
          league.League.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
  
      // Sort leagues
      const sortedLeagues = sortLeagues(leagues, sortField, sortOrder);
  
      res.render("leagues", {
        title: "Leagues",
        currentPage: "leagues",
        leagues: sortedLeagues,
        searchTerm: searchTerm,
        sortOrder: sortOrder
      });
    } catch (error) {
      console.log(`Error: ${error}`, error);
      res.status(500).redirect("badpage");
    }
  });
  

  router.post("/leagues",secureMiddleware, async (req, res) => {
    try {
      const searchTerm = req.body.searchTerm || "";
      // console.log("Search term for leagues:", searchTerm);
  
      const data = await fetchDataFromMongoDB();
      // console.log("Data fetched from MongoDB for leagues:", data);
  
      const filteredLeagues = data.leagues.filter(league =>
        league.League.toLowerCase().includes(searchTerm.toLowerCase())
      );
      // console.log("Filtered leagues:", filteredLeagues);
  
      res.render("leagues", {
        title: "Search Results",
        message: "Search Results",
        currentPage: "leagues",
        leagues: filteredLeagues,
        searchTerm, 
      });
    } catch (error) {
      console.log("Error fetching data:", error);
      res.status(500).redirect("badpage");
    }
  });
  
  
  router.get("/leagues/:fullName",secureMiddleware, async (req, res) => {
    try {
      const data = await fetchDataFromMongoDB();
      const { fullName } = req.params;
  
      const league = data.leagues.find(
        (league: any) =>
          league.League.toLowerCase().replace(/\s/g, "") ===
          fullName.toLowerCase()
      );
  
      if (!league) {
        return res.status(404).redirect("badpage");
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
      res.status(500).redirect("badpage");
    }
  });
  

  router.get("/favorites",secureMiddleware, (req, res) => {
    res.render("favorites", {
      title: "Hello World",
      message: "Hello World",
      currentPage: "favorites",
    });
  });

  router.post("/logout", secureMiddleware, async (req, res) => {
    req.session.destroy((err) => {
        res.redirect("/login");
    });
});
  
  

  return router;
}

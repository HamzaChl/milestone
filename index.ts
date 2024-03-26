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

app.get("/", (req, res) => {
  res.render("index", {
    title: "Hello World",
    message: "Hello World",
    currentPage: "home",
  });
});

app.get("/players",async (req, res) => {
  try{
    console.log("Route '/players' atteinte");
    const response = await fetch('https://hamzachl.github.io/milestone1-json/soccerplayers.json');
    const data = await response.json();
    console.log("Données récupérées avec succès :", data);
    res.render("players", {
      title: "Hello World",
      message: "Hello World",
      currentPage: "players",
      players: data.players,
    });
  }catch(error){
    console.log("Erreur lors de la récupération des données :", error);
    res.status(500).send("Une erreur s'est produite lors du chargement des joueurs.");
  }
});

app.post("/players",async(req,res)=>{
  try{
    let searchCategory : string = typeof req.query.searchCategory === "string" ? req.query.searchCategory : "player-name";
  }catch(error){
    console.log("Erreur lors de la récupération des données :", error);
    res.status(500).send("Une erreur s'est produite lors du chargement des joueurs.");
  }
})



app.get("/leagues",(req,res)=>{
  res.render("leagues",{
    title: "Hello World",
    message: "Hello World",
    currentPage: "leagues", 
  })
})

app.get("/settings",(req,res)=>{
  res.render("settings",{
    title: "Hello World",
    message: "Hello World",
    currentPage: "settings", 
  })
})

app.listen(app.get("port"), () => {
  console.log("Server started on http://localhost:" + app.get("port"));
});

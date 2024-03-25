import express, { Express } from "express";
import dotenv from "dotenv";
import path from "path";

dotenv.config();

const app: Express = express();
const pages = ["players", "leagues", "settings", "logout"];

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.set("views", path.join(__dirname, "views"));

app.set("port", process.env.PORT || 3000);

app.get("/", (req, res) => {
  res.render("index.ejs");
});

app.get("/players", (req, res) => {
  res.render("index", {
    title: "Hello World",
    message: "Hello World",
    currentPage: "players", 
  });
});

app.get("/leagues",(req,res)=>{
  res.render("index",{
    title: "Hello World",
    message: "Hello World",
    currentPage: "leagues", 
  })
})

app.get("/settings",(req,res)=>{
  res.render("index",{
    title: "Hello World",
    message: "Hello World",
    currentPage: "settings", 
  })
})

app.listen(app.get("port"), () => {
  console.log("Server started on http://localhost:" + app.get("port"));
});

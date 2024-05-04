import express, { Express } from "express";
import dotenv from "dotenv";
import path from "path";
import { connect } from "./database";
import milestoneRouter from "./routers/milestone";

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
  res.render("login");
});

app.post("/", (req, res) => {
  res.redirect("/milestone/home");
});

app.use("/milestone", milestoneRouter());

app.use((req, res, next) => {
  res.status(404).render("badpage", { message: "Page not found" });
});

app.listen(app.get("port"), async () => {
  try {
    await connect();
    console.log("Connected to MongoDB");
    console.log("Server started on http://localhost:" + app.get("port"));
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  }
});

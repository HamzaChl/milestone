import express, { Express } from "express";
import dotenv from "dotenv";
import path from "path";
import { connect, login } from "../database";
import milestoneRouter from "../routers/milestone";
import session from "../middleware/session";
import { User } from "../types";
import { secureMiddleware } from "../middleware/secureMiddleware";

export function loginRouter() {
    const router = express.Router();

    router.get("/login", async (req, res) => {
        res.render("login");
    });

    router.post("/login", async (req, res) => {
        const email: string = req.body.email;
        const password: string = req.body.password;
        try {
            let user: User = await login(email, password);
            delete user.password;
            req.session.user = user;
            req.session.message = {type: "success", message: "Login successful"};
            res.redirect("/milestone/home");
        } catch (e: any) {
            req.session.message = {type: "error", message: e.message};
            res.redirect("/login");

        }
    });

    router.post("/logout", secureMiddleware, async (req, res) => {
        req.session.destroy((err) => {
            res.redirect("/login");
        });
    });

    return router;
}
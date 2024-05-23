import express, { Express } from "express";
import dotenv from "dotenv";
import path from "path";
import { connect, login, userCollection } from "../database";
import milestoneRouter from "../routers/milestone";
import session from "../middleware/session";
import { User } from "../types";
import { secureMiddleware } from "../middleware/secureMiddleware";
import bcrypt from "bcrypt";

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

//REGISTER

router.get("/register", (req, res) => {
    res.render("register");
});

router.post("/register", async (req, res) => {
    const { email, password, passwordConfirm } = req.body;

    if (password !== passwordConfirm) {
        req.session.message = { type: "error", message: "Passwords do not match" };
        return res.redirect("/register");
    }

    try {
        const existingUser = await userCollection.findOne<User>({ email: email });

        if (existingUser) {
            req.session.message = { type: "error", message: "Email already in use" };
            return res.redirect("/register");
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await userCollection.insertOne({
            email: email,
            password: hashedPassword,
            role: "USER"
        });

        req.session.message = { type: "success", message: "Registration successful. Please log in." };
        res.redirect("/login");

    } catch (e: any) {
        req.session.message = { type: "error", message: "Registration failed" };
        res.redirect("/register");
    }
});

    return router;
}
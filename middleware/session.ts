import dotenv from "dotenv";
import mongoDbSession from "connect-mongodb-session";
import session, { MemoryStore } from "express-session";

dotenv.config();



const MongoDBStore = mongoDbSession(session);


const mongoStore = new MongoDBStore({
    uri: process.env.URI ?? "mongodb://localhost:27017",
    collection: "sessions",
    databaseName: "tijdelijk",
});

declare module 'express-session' {
    export interface SessionData {
        username?: string;

    }
}

export default session({
    secret: process.env.SESSION_SECRET ?? "my-super-secret-secret",
    store: new MemoryStore(),
    resave: true,
    saveUninitialized: true,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
    }
});
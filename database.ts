// IMPORTS
import { fetchDataAndWriteToMongoDB } from "./functions";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import { User } from "./types";
import bcrypt from "bcrypt";


dotenv.config();
export const uri: string = process.env.MONGO_URI ?? "mongodb://localhost:27017";
const client = new MongoClient(uri);
export const userCollection = client.db("milestone").collection<User>("users");
export const collection = client.db("milestone").collection("players");
const saltRounds : number = 10;


//EXIT FUNCTIE VOOR CONNECT
async function exit() {
  try {
    await client.close();
    console.log("Disconnected from database");
  } catch (error) {
    console.error(error);
  }
  process.exit(0);
}

//LOGIN 
async function createInitialUser() {
  if (await userCollection.countDocuments() > 0) {
      return;
  }
  let email : string | undefined = process.env.ADMIN_EMAIL;
  let password : string | undefined = process.env.ADMIN_PASSWORD;
  if (email === undefined || password === undefined) {
      throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD must be set in environment");
  }
  await userCollection.insertOne({
      email: email,
      password: await bcrypt.hash(password, saltRounds),
      role: "ADMIN"
  });
  console.log("Admin user created.");

  let emailUser: string | undefined = process.env.USER_EMAIL;
  let passwordUser: string | undefined = process.env.USER_PASSWORD;
  if (emailUser && passwordUser) {
    await userCollection.insertOne({
      email: emailUser,
      password: await bcrypt.hash(passwordUser, saltRounds),
      role: "USER"
    });
    console.log("User created.");

  }
}

export async function login(email: string, password: string) {
  if (email === "" || password === "") {
    throw new Error("Email and password required");
  }
  console.log(`Attempting login for email: ${email}`);
  let user: User | null = await userCollection.findOne<User>({ email: email });
  if (user) {
    console.log("User found:", user);
    if (await bcrypt.compare(password, user.password!)) {
      console.log("Password correct");
      return user;
    } else {
      console.log("Password incorrect");
      throw new Error("User/Password incorrect");
    }
  } else {
    console.log("User not found");
    throw new Error("User/Password incorrect");
  }
}


//CONNECT FUNCTIE
export async function connect() {
  try {
    await createInitialUser();
    await client.connect();
    console.log("Connected to database");
    const count = await collection.countDocuments();

    if (count === 0) {
      console.log(
        "No data in database. Fetching data and writing to database..."
      );
      await fetchDataAndWriteToMongoDB();
    } else {
      console.log("Data found in database. Using existing data.");
    }

    process.on("SIGINT", exit);
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  }
}

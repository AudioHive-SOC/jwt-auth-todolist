import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import jsonwebtoken from "jsonwebtoken";
import cookies from "cookie-parser";
import dotenv from "dotenv";
dotenv.config();

import { corsOptions } from "./config/cors.js";
import routes from "./routes/index.js";
import credentials from "./middlewares/credentials.js";
import errorHandler from "./middlewares/errorHandler.js";

// ------------------------------- CONNECT TO MONGODB -------------------------------

mongoose.set("strictQuery", false); // got a warning when mongoose package was updated, so added this line from stackoverflow

const connect = async () => {
	try {
		const DB = await mongoose.connect(process.env.MONGO_URI, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
			dbName: process.env.DB_NAME,
		});
		console.log(`MongoDB connected at ${DB.connection.host}`);
	} catch (error) {
		console.log(error);
		process.exit(1);
	}
};

connect();

// ------------------------------- CREATE EXPRESS APP -------------------------------

const app = express();

app.use(cookies());
app.use(express.json());
app.use(credentials); // Handle options credentials check - before CORS!, and fetch cookies credentials requirement
app.use(cors(corsOptions)); // CORS (Cross Origin Resource Sharing) policy configuration
app.use(errorHandler);

// ------------------------------- ROUTES -------------------------------

app.use("/api", routes);

// ------------------------------- END -------------------------------

const port = process.env.PORT || 5001;
app.listen(port, () => console.log(`SERVER: ${port}`));

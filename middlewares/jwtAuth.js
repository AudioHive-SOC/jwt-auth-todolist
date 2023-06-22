import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export default async function jwtAuth(req, res, next) {
	const authHeader = req.headers["authorization"];
	if (!authHeader) {
		return res.status(400).send();
	}
	const token = authHeader.split(" ")[1];

	const decoded = await jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
	req.user = decoded;
	next();
}

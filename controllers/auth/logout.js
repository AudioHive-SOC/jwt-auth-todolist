import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

import USER from "../../models/user.js";

// refresh the accessToken once expired
export default async function logout(req, res) {
	try {
		const refreshToken = req.cookies?.jwt;
		if (!refreshToken) {
			return res.status(400).json({ msg: "REFRESH_TOKEN_NOT_FOUND" }); // refreshToken not in request cookies, return error
		}

		const user = await USER.find({ refreshToken });
		// just an extra measure
		// if user found, remove the refreshToken from the user document in the database
		if (user) {
			await USER.findOneAndUpdate(
				{ refreshToken },
				{ $unset: { refreshToken: "" } } // unset command removes the refreshToken field from that user
			);
		}

		// clear the jwt cookie
		res.clearCookie("jwt", {
			httpOnly: true,
			sameSite: "None",
			secure: true,
		});
		return res.status(200).send();
	} catch (error) {
		// catch any errors and send them back to user
		return res.status(400).json({ error });
	}
}

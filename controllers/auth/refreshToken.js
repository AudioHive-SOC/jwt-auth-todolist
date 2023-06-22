import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

import USER from "../../models/user.js";

// refresh the accessToken once expired
export default async function refreshToken(req, res) {
	try {
		console.log("refreshed", req.cookies);
		const refreshToken = req.cookies?.jwt;
		if (!refreshToken) {
			return res.status(400).json({ msg: "REFRESH_TOKEN_NOT_FOUND" }); // refreshToken not in request cookies, return error
		}

		const user = await USER.find({ refreshToken });
		if (!user) {
			return res
				.status(400)
				.json({ msg: "USER_NOT_FOUND_OR_NO_REFRESH_TOKEN_EXISTS" });
		}

		// decode the refreshToken's payload to get emailId of user
		const decoded = await jwt.verify(
			refreshToken,
			process.env.REFRESH_TOKEN_SECRET
		);

		if (!decoded || user.email != decoded.email) {
			// if jwt.verify throws an error,
			//    or even if it works correctly but the email in the payload
			//        does not match with the email of the user in the database using this refreshToken, return error
			return res.status(400).json({ msg: "JWT_VERIFICATION_FAILED" });
		}

		const accessToken = jwt.sign(
			{ email: decoded.email },
			process.env.ACCESS_TOKEN_SECRET,
			{ expiresIn: "30s" }
		);
		return res.status(200).json({ accessToken });
	} catch (error) {
		// catch any errors and send them back to user
		return res.status(400).json({ error });
	}
}

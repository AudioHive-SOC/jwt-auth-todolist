import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Joi from "joi-oid";
import dotenv from "dotenv";
dotenv.config();

import USER from "../../models/user.js";

// get todos
export default async function getTodos(req, res) {
	try {
		// since the user is authenticated, the email is already present in the accessToken.
		// also, in jwtAuth function, we added this line `req.user = decoded;`, which essentially puts the information decoded from token into req.user
		const email = req.user.email;

		const schema = Joi.object({
			email: Joi.string()
				.email({
					minDomainSegments: 2,
					tlds: { allow: ["com", "net", "in"] },
				})
				.required(),
		});
		const { error } = schema.validate({ email });

		// if error, the email in the token payload is not valid.
		// Since we are already checking email formats while making users, such a token is surely not generated from our server.
		if (error) {
			return res.status(400).json({ msg: "INVALID_TOKEN", error });
		}

		const user = await USER.find({ email });
		return res.status(200).json(user.todos);
	} catch (error) {
		// catch any errors and send them back to user
		return res.status(400).json({ error });
	}
}

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Joi from "joi-oid";
import dotenv from "dotenv";
dotenv.config();

import USER from "../../models/user.js";

// update todos
export default async function updateTodos(req, res) {
	try {
		// since the user is authenticated, the email is already present in the accessToken.
		// also, in jwtAuth function, we added this line `req.user = decoded;`, which essentially puts the information decoded from token into req.user
		const email = req.user.email;
		const data = req.body;

		const schema = Joi.object({
			todos: Joi.array()
				.items(
					Joi.object({
						text: Joi.string().required(),
						timeStamp: Joi.string().required(),
					})
				)
				.required(),
			email: Joi.string()
				.email({
					minDomainSegments: 2,
					tlds: { allow: ["com", "net", "in"] },
				})
				.required(),
		});
		const { error } = schema.validate({ todos: data, email });

		// if error, the email in the token payload is not valid.
		// Since we are already checking email formats while making users, such a token is surely not generated from our server.
		if (error) {
			return res.status(400).json({ msg: "INVALID_TOKEN_OR_REQ_BODY", error });
		}

		// finding the user by email, then updating the todos
		await USER.findOneAndUpdate({ email }, { todos: data });
		return res.status(200).send();
	} catch (error) {
		// catch any errors and send them back to user
		return res.status(400).json({ error });
	}
}

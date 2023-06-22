import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Joi from "joi-oid";
import dotenv from "dotenv";
dotenv.config();

import USER from "../../models/user.js";

// register the user, and then automatically login also
export default async function register(req, res) {
	try {
		const { email, password } = req.body;

		const schema = Joi.object({
			email: Joi.string()
				.email({
					minDomainSegments: 2,
					tlds: { allow: ["com", "net", "in"] },
				})
				.required(),
			password: Joi.string().min(6).required(),
		});
		const { error } = schema.validate({ email, password });

		// if error, the request body did not follow the correct format
		if (error) {
			return res.status(400).json({ msg: "VALIDATION_FAILED", error });
		}

		// check for pre-existing user by finding a user having email equal to the email we sent in the request body.
		let user = await USER.findOne({
			email: email, // we can also simply write 'email', since our variable name is also 'email'
		});

		// if user with same email is found in database, return error
		if (user) {
			return res.status(400).json({ msg: "USER_ALREADY_EXISTS" });
		}

		// create user
		user = await USER.create({
			email, // adhering to the comment when checking for pre-existing user, using short notation this time
			password: await bcrypt.hash(
				password,
				await bcrypt.genSalt(parseInt(process.env.HASH_SALT))
			),
			// we never store passwords directly, we store their hashed versions
			// HASH_SALT is a optional parameter indicating how many times we hashed the password
			// since process.env.HASH_SALT may return a string instead of an integer, I am converting the string to an integer
			// references:
			//    1. https://www.npmjs.com/package/bcrypt
			//    2. https://stackoverflow.com/questions/48799894/trying-to-hash-a-password-using-bcrypt-inside-an-async-function
		});

		// sign json web tokens
		const accessToken = jwt.sign(
			{ email }, // first parameter is payload, you can store any non-sensitive user-related info here. Also, we simply wrote email instead of email: email
			process.env.ACCESS_TOKEN_SECRET, // use the ACCESS_TOKEN_SECRET to use the payload and header to create the token signature
			{ expiresIn: "30s" } // set token expiry time, after which the user interface will have to generate a new accessToken using the refreshToken.
		);
		const refreshToken = jwt.sign(
			{ email }, // first parameter is payload, you can store any non-sensitive user-related info here
			process.env.REFRESH_TOKEN_SECRET, // use the REFRESH_TOKEN_SECRET to use the payload and header to create the token signature
			{ expiresIn: "1d" } // set token expiry time, after which the user will be logged out.
		);

		// refreshToken should be an httpOnly cookie, because httpOnly cookies are not accessible via Javascript on the frontend interface
		res.cookie("jwt", refreshToken, {
			httpOnly: true,
			sameSite: "None",
			secure: true,
			maxAge: 24 * 60 * 60 * 1000, // set httpOnly cookie expiry time to 1 day (unit is milliseconds)
		});
		return res.status(200).json({ accessToken });
	} catch (error) {
		// catch any errors and send them back to user
		return res.status(400).json({ error });
	}
}

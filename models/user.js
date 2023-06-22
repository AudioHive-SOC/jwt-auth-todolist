import mongoose from "mongoose";

const USER = mongoose.model(
	"User", // this is used when cross-referencing models using ObjectId
	mongoose.Schema({
		email: {
			type: String,
			required: true,
		},
		password: {
			type: String,
			required: true,
		},
		refreshToken: String,
		todos: {
			type: [
				{
					text: String,
					timeStamp: String,
				},
			],
			default: [],
			required: true,
		},
	}),
	"Users" // this is the name of the collection made in the database
);

export default USER;

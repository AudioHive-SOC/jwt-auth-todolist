const allowedOrigins = ["http://127.0.0.1:5173", "http://localhost:5173"];

const corsOptions = {
	origin: (origin, callback) => {
		if (allowedOrigins.includes(origin)) {
			callback(null, true);
		} else {
			callback(new Error("Not allowed by CORS"));
		}
	},
	optionsSuccessStatus: 200,
	credentials: true,
	withCredentials: true,
};

export { corsOptions, allowedOrigins };

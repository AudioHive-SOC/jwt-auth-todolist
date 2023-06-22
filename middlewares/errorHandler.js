export default function errorHandler(error, req, res, next) {
	return res.status(res.statusCode ? res.statusCode : 500).json({
		message: error.message,
		stack: process.env.NODE_ENV === "production" ? null : error.stack,
	});
}

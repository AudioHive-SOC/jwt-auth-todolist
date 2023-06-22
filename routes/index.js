import { Router } from "express";
const router = Router();
import jwtAuth from "../middlewares/jwtAuth.js";

// NON-AUTH routes
import login from "../controllers/auth/login.js";
import register from "../controllers/auth/register.js";
import refreshToken from "../controllers/auth/refreshToken.js";
import logout from "../controllers/auth/logout.js";

router.post("/auth/login", login);
router.post("/auth/register", register);
// the below 2 APIs do not require sending any data through the request body, so we can use the GET method
router.get("/auth/refresh-token", refreshToken);
router.get("/auth/logout", logout);

// AUTH routes
import getTodos from "../controllers/todos/getTodos.js";
import updateTodos from "../controllers/todos/updateTodos.js";

router.get("/todos", jwtAuth, getTodos);
router.put("/todos", jwtAuth, updateTodos);

export default router;

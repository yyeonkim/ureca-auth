require("dotenv").config();

const { postUser, login, getUser, logout } = require("@/controllers/userController.js");
const cors = require("cors");
const express = require("express");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const path = require("path");

const app = express();
const port = 3000;

const ENV = app.get("env");

const apiRouter = express.Router();
const protectedRouter = express.Router();

app.use(cookieParser());
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:3000"],
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.static(path.join(__dirname, "../client/dist")));
app.use(express.static(path.join(__dirname, "../client/public")));

// API Routers
app.use("/api", apiRouter);
apiRouter.use("/protected", protectedRouter);

// 사용자 API
apiRouter.post("/signup", postUser);
apiRouter.post("/login", login);
apiRouter.get("/logout", logout);

//  Needs authentication
protectedRouter.use((req, res, next) => {
  if (req.session.auth) next();
  else res.sendStatus(401);
});

// 사용자 API
protectedRouter.get("/users/me", getUser);

app.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile(path.join(__dirname, "../client/dist/index.html"));
});

// Listening
app.listen(port, () => {
  console.log(`App listening on port ${port}`);
  console.log("Environment:", ENV, ENV === "production");
});

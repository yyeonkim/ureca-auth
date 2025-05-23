require("dotenv").config();

const {
  signup,
  login,
  getUser,
  logout,
  postSomething,
} = require("@/controllers/userController.js");
const cors = require("cors");
const express = require("express");
const cookieParser = require("cookie-parser");

const path = require("path");
const connectDB = require("@/config/db.js");

const app = express();
const port = 3000;

const ENV = app.get("env");

const apiRouter = express.Router();
const protectedRouter = express.Router();

connectDB();

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
apiRouter.post("/signup", signup);
apiRouter.post("/login", login);
apiRouter.get("/logout", logout);

//  Needs authentication
protectedRouter.use((req, res, next) => {
  const token = req.cookies.tkn;
  if (token) next();
  else res.sendStatus(401);
});

// 사용자 API
protectedRouter.get("/users/me", getUser);
protectedRouter.post("/something", postSomething);

app.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile(path.join(__dirname, "../client/dist/index.html"));
});

// Listening
app.listen(port, () => {
  console.log(`App listening on port ${port}`);
  console.log("Environment:", ENV);
});

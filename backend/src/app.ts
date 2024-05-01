import express from "express";
import morgan from "morgan";
import helmet from "helmet";
import cors from "cors";
import session from "express-session";

import * as middlewares from "./middlewares";
import api from "./api";
import MessageResponse from "./types/MessageResponse";
import cookieParser from "cookie-parser";

require("dotenv").config();

const app = express();

const MemoryStore = session.MemoryStore;

app.use(morgan("dev"));
app.use(helmet());
app.use(cookieParser());
app.use(
  session({
    secret: "supersecret",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24, secure: false },
    store: new MemoryStore(),
  })
);

app.use(cors({ origin: true, credentials: true }));

app.use(express.json());

app.get<{}, MessageResponse>("/", (req, res) => {
  res.json({
    message: "Welcome to InstaLite API!",
  });
});

app.use("/api", api);

app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

export default app;

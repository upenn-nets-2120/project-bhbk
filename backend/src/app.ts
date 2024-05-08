import express from "express";
import morgan from "morgan";
import helmet from "helmet";
import cors from "cors";
import session from "express-session";

import * as middlewares from "./middlewares";
import api from "./api";
import MessageResponse from "./types/MessageResponse";
import cookieParser from "cookie-parser";
import expressWs from "express-ws";
import { checkAuthentication, checkWSAuthentication } from "./middlewares";
import {
  createNewChat,
  getChatBetweenTwoUsers,
  getMessagesByChatId,
} from "./views/chat";
import { ChatMessage } from "./types/chat";
import { createNewMessage } from "./views/friends";

require("dotenv").config();

const app = expressWs(express()).app;

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

app.post("/chat/create", checkAuthentication, async (req, res, next) => {
  const friendId: number = req.body.friendId;

  const userId: number = req.session.user.id;

  try {
    const chatId = await createNewChat(userId, friendId);

    return res.status(200).json(chatId);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

app.post("/chat/get", checkAuthentication, async (req, res, next) => {
  const friendId: number = req.body.friendId;

  const userId: number = req.session.user.id;

  try {
    const chat = await getChatBetweenTwoUsers(userId, friendId);

    if (!chat) {
      return res.status(200).json(null);
    }

    return res.status(200).json(chat);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

app.post("/chat/create", checkAuthentication, async (req, res, next) => {
  const friendId: number = req.body.friendId;

  const userId: number = req.session.user.id;

  try {
    const chatId = await createNewChat(userId, friendId);

    return res.status(200).json(chatId);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

app.post("/chat/groups/create", checkAuthentication, async (req, res, next) => {
  const friendId: number = req.body.friendIds;

  const userId: number = req.session.user.id;

  try {
    
    const chatId = await createNewChat(userId, friendId);

    return res.status(200).json(chatId);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

app.get(
  "/api/chat/:chatId/messages",
  checkAuthentication,
  async (req, res, next) => {
    try {
      const chatId: number = parseInt(req.params.chatId);

      const messages = await getMessagesByChatId(chatId);

      return res.status(200).json(messages);
    } catch (error) {
      console.error(error);
      next(error);
    }
  }
);

app.ws(
  "/chat/:chatId/message",
  checkWSAuthentication,
  async (ws, req, next) => {
    const chatId: number = parseInt(req.params.chatId);

    const userId: number = req.session.user.id;

    try {
      ws.on("message", async (message) => {
        const chatMessage = JSON.parse(message.toString());

        const newMessage: ChatMessage = {
          senderId: userId,
          chatId,
          content: chatMessage.content,
        };

        await createNewMessage(newMessage);

        const chatMessages = await getMessagesByChatId(chatId);

        ws.send(JSON.stringify(chatMessages));
      });
    } catch (error) {
      console.error(error);
      next(error);
    }
  }
);

app.use("/api", api);

app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

export default app;

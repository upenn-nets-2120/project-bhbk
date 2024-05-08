import { NextFunction, Request } from "express";
import app from "../app";
import { checkAuthentication } from "../middlewares";
import * as ws from "ws";
import { createNewChat, getChatBetweenTwoUsers } from "../views/chat";

app.post('/chat/create', checkAuthentication, async (req, res, next) => {
    const friendId: number = req.body.friendId;

    const userId: number = req.session.user.id;
    
    try {
      const chatId = await createNewChat(userId, friendId);

      return res.status(200).json(chatId);
    } catch (error) {
        console.error(error);
        next(error);
    }
})

const checkWSAuthentication = async (ws: ws, req: Request, next: NextFunction) => {
    if (req.session.isLoggedIn && req.session.user) {
        next();
    } else {
        ws.close(401, 'Unauthorized')
    }
}

app.ws('/chat/:chatId/message', checkWSAuthentication, async (ws, req, next) => {
    const chatId: number = parseInt(req.params.chatId);

    try {

    } catch (error) {
        console.error(error);
        next(error);
    }
})
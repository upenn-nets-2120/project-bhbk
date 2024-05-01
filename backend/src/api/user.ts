import express from "express";
import { checkAuthentication } from "../middlewares";
import { NewUser } from "../types/user";
import { encryptPassword } from "../utils/encrypt";
import { createPost } from "../views/posts";
import { updateUser } from "../views/user";

const router = express.Router();

router.put("/update-user", checkAuthentication, async (req, res, next) => {
  try {
    const user = req.body;

    const { password, ...extractedUser } = user;

    const updatedUser = extractedUser satisfies NewUser;

    if (password) {
      updatedUser.hashedPassword = await encryptPassword(password);
    }

    if (updatedUser.dob) {
      const newDob = new Date(updatedUser.dob);
      newDob.setDate(newDob.getDate() + 1);
      updatedUser.dob = newDob;
    }

    const userId = req.session.user.id satisfies number;

    const newlyUpdatedUser = await updateUser(userId, updatedUser);

    if (
      newlyUpdatedUser.linkedActor &&
      newlyUpdatedUser.linkedActor !== req.session.user.linkedActor
    ) {
      await createPost(
        { text: `I am now linked to ${newlyUpdatedUser.linkedActor}` },
        userId
      );
    }

    req.session.user = newlyUpdatedUser;

    return res.status(200).json(newlyUpdatedUser);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

export default router;

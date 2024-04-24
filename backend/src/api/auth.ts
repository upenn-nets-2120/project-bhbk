import express from 'express';
import { SignUpUser } from '../types/user';
import { createUser } from '../views/auth';

const router = express.Router();

router.get('/sign-up', async (req, res) => {
  try { 
    const { user } = req.body;

    const newUser = user satisfies SignUpUser;

    const createdUser = await createUser(newUser);

    req.session.save(() => {
      req.session.loggedIn = true;
      req.session.user = newUser;
    })

  } catch (error) {
    console.log(error);
    res.status(500).json({ "message": error })
  }
});

export default router;

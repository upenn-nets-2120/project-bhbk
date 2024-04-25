import express from 'express';
import { checkAuthentication } from '../middlewares';
import { LogInUser, SignUpUser } from '../types/user';
import { createUser, logInUser } from '../views/auth';

const router = express.Router();

router.get('/', checkAuthentication, async (req, res) => {
  return res.status(200).json({ ...req.session.user })
})

router.post('/sign-up', async (req, res, next) => {
  try { 
    const user = req.body;

    const newUser = user satisfies SignUpUser;

    const createdUser = await createUser(newUser);

    return res.status(200).json(createdUser);

  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.post('/log-in', async (req, res, next) => {
  try {
    const user = req.body;

    const loggingInUser = user satisfies LogInUser;

    const foundUser = await logInUser(loggingInUser);

    req.session.isLoggedIn = true;
    req.session.user = foundUser;

    req.session.save();

    return res.status(200).json(foundUser);

  } catch (error) {
    console.error(error);
    next(error);
  }
})

router.post('/log-out', async (req, res, next) => {
  try {
    req.session.isLoggedIn = false;
    req.session.user = null;

    return res.status(200).json({ message: "Logged out sucessfully!" })
  } catch (error) {
    console.error(error);
    next(error)
  }
})

export default router;

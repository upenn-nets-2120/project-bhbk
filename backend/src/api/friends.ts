import express from 'express';
import { checkAuthentication } from '../middlewares';


const router = express.Router();

router.post("/add", checkAuthentication, async (req, res, next) => {

})

export default router;
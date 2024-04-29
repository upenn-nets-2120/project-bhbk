import express from 'express';
import multer from 'multer';
import { checkAuthentication } from '../middlewares';
import { uploadFile } from '../views/image';

const router = express.Router();

const multerStorage = multer.memoryStorage();
const upload = multer({ storage: multerStorage });

router.post('/upload/profile-pic', checkAuthentication, upload.single('file'), async (req, res, next) => {
    try {
        const file = req.file;

        if (!file) {
            return res.status(400).json("No file uploaded")
        }

        const fileUrl = await uploadFile(file)

        return res.status(200).json(fileUrl);
    } catch (error) {
        console.error(error);
        next(error);
    }
})

export default router;
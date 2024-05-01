import express from 'express';
import multer from 'multer';
import { checkAuthentication } from '../middlewares';
import { uploadFile } from '../views/image';
import { updatePostById } from '../views/posts';

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

router.post('/upload/:postId/graphic', checkAuthentication, upload.single('file'), async (req, res, next) => {
    try {
        const file = req.file;

        const postId = parseInt(req.params.postId);

        if (!file) {
            return res.status(400).json("No file uploaded");
        }

        if (!postId) {
            return res.status(500).json("Invalid post id");
        }

        const fileUrl = await uploadFile(file);

        await updatePostById(postId, { imageUrl: fileUrl  });

        return res.status(200).json(fileUrl)
    } catch (error) {
        console.error(error);
        next(error)
    }
})

export default router;
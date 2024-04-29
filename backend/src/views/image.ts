import { PutObjectCommand, PutObjectCommandInput } from "@aws-sdk/client-s3";
import { bucketName, storage } from "../storage";

export const sanitizeFilename = (filename: string) => {
    return filename.replaceAll(' ', '_');
}

export const uploadFile = async (file: Express.Multer.File) => {
    const uploadParams: PutObjectCommandInput = {
        Bucket: bucketName,
        Key: sanitizeFilename(file.originalname),
        Body: file.buffer,
        ContentType: file.mimetype
    };

    await storage.send(new PutObjectCommand(uploadParams));

    const fileUrl = `https://${uploadParams.Bucket}.s3.amazonaws.com/${uploadParams.Key}`;

    return fileUrl;
}
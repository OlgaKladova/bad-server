import { Request, Response, Express, NextFunction } from 'express'
import multer, { FileFilterCallback } from 'multer'
import path, { join } from 'path'
import { v4 as uuidv4 } from 'uuid'
import { fileTypeFromFile } from 'file-type'
import BadRequestError from '../errors/bad-request-error'


type DestinationCallback = (error: Error | null, destination: string) => void
type FileNameCallback = (error: Error | null, filename: string) => void

const storage = multer.diskStorage({
    destination: (
        _req: Request,
        _file: Express.Multer.File,
        cb: DestinationCallback
    ) => {
        cb(
            null,
            join(
                __dirname,
                process.env.UPLOAD_PATH_TEMP
                    ? `../public/${process.env.UPLOAD_PATH_TEMP}`
                    : '../public'
            )
        )
    },

    filename: (
        _req: Request,
        file: Express.Multer.File,
        cb: FileNameCallback
    ) => {
        cb(null, uuidv4() + path.extname(file.originalname));
    },
})

const types = [
    'image/png',
    'image/jpg',
    'image/jpeg',
    'image/gif',
    'image/svg+xml',
]

const fileFilter = (
    _req: Request,
    file: Express.Multer.File,
    cb: FileFilterCallback
) => {
    if (!types.includes(file.mimetype)) {
        return cb(null, false)
    }

    return cb(null, true)
}

const upload = multer({ storage, fileFilter, limits: { fileSize: 10 * 1024 * 1024 }, })

export const uploadValidation = (req: Request, res: Response, next: NextFunction) => {
    upload.single('file')(req, res, async (err) => {
        if (err) {
            return next(err);
        }
        if (req.file && req.file.size < 2 * 1024) {
            return next(new BadRequestError('Файл слишком маленький'));
        }
        if (req.file){
            const type = await fileTypeFromFile(req.file.path);
            if (!type || !type.mime.startsWith('image/')) {
                return next(new BadRequestError('Некорректное содержимое файла'));
            }
        }
        next();
    });
}

export default upload;
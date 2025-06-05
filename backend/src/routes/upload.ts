import { Router } from 'express'
import { uploadFile } from '../controllers/upload'
import { uploadWithMinSize } from '../middlewares/file'

const uploadRouter = Router()
uploadRouter.post('/', uploadWithMinSize, uploadFile)

export default uploadRouter

import { Router } from 'express'
import { uploadFile } from '../controllers/upload'
import { uploadValidation } from '../middlewares/file'

const uploadRouter = Router()
uploadRouter.post('/', uploadValidation, uploadFile)

export default uploadRouter

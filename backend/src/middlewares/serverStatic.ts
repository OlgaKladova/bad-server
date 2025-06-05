import { NextFunction, Request, Response } from 'express'
import fs from 'fs'
import path from 'path'
import ForbiddenError from '../errors/forbidden-error'

export default function serveStatic(baseDir: string) {
    return (req: Request, res: Response, next: NextFunction) => {
        // Определяем полный путь к запрашиваемому файлу
        const filePath = path.join(baseDir, req.path)
        const resolvedPath = path.resolve(filePath)
        const resolvedBase = path.resolve(baseDir)

         if (!resolvedPath.startsWith(resolvedBase)) {
            return next(new ForbiddenError('Доступ запрещен'))
        }
        // Проверяем, существует ли файл
        fs.access(resolvedPath, fs.constants.F_OK, (err) => {
            if (err) {
                // Файл не существует отдаем дальше мидлварам
                return next()
            }
            // Файл существует, отправляем его клиенту
            res.setHeader('Cache-Control', 'public, max-age=86400') // 1 день
            return res.sendFile(resolvedPath, (err) => {
                if (err) {
                    next(err)
                }
            })
        })
    }
}

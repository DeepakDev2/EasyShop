import { Request, Response, NextFunction } from 'express'

export interface AppError extends Error {
  statusCode?: number
  code?: string
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void => {
  const statusCode = err.statusCode || 500
  const message = err.message || 'Internal Server Error'

  console.error(`[ERROR] ${req.method} ${req.path} — ${statusCode}: ${message}`)
  if (err.stack && process.env.NODE_ENV === 'development') {
    console.error(err.stack)
  }

  res.status(statusCode).json({
    success: false,
    error: message,
    code: err.code || 'INTERNAL_ERROR',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  })
}

export const createError = (message: string, statusCode: number, code?: string): AppError => {
  const err: AppError = new Error(message)
  err.statusCode = statusCode
  err.code = code
  return err
}

export const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) =>
  (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }

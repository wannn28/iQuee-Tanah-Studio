import type { NextFunction, Request, Response, RequestHandler } from 'express'
import { ZodError, type ZodTypeAny, type z } from 'zod'

export class HttpError extends Error {
  constructor(public status: number, message: string, public details?: unknown) {
    super(message)
  }
}

/** wrap async handlers so rejections reach the error middleware */
export const ah = (fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>): RequestHandler =>
  (req, res, next) => { fn(req, res, next).catch(next) }

export function parse<S extends ZodTypeAny>(schema: S, data: unknown): z.infer<S> {
  const r = schema.safeParse(data)
  if (!r.success) throw new HttpError(400, 'Validation failed', r.error.flatten())
  return r.data
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof HttpError) {
    res.status(err.status).json({ error: err.message, details: err.details })
    return
  }
  if (err instanceof ZodError) {
    res.status(400).json({ error: 'Validation failed', details: err.flatten() })
    return
  }
  // body-parser errors (malformed JSON / too large)
  const e = err as { type?: string; status?: number }
  if (e && e.type === 'entity.parse.failed') { res.status(400).json({ error: 'Malformed JSON body' }); return }
  if (e && e.type === 'entity.too.large') { res.status(413).json({ error: 'Request body too large' }); return }
  console.error(err)
  res.status(500).json({ error: 'Internal server error' })
}

export const cents = (c: number) => Math.round(c) / 100

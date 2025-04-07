import { Router, Request, Response, NextFunction } from 'express'
import { listLinks, redirectUrl, shortenUrl } from '../controllers'

const router = Router()

router.get(
  '/:shortUrl',
  (req: Request, res: Response, next: NextFunction) => redirectUrl,
)
router.get(
  '/links',
  (req: Request, res: Response, next: NextFunction) => listLinks,
)

router.post(
  '/shorten',
  (req: Request, res: Response, next: NextFunction) => shortenUrl,
)

export default router

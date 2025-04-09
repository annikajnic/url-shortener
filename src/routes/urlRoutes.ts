import { Router, Request, Response, NextFunction } from 'express'
import { listLinks, redirectUrl, shortenUrl } from '../controllers'

const router = Router()

router.get('/:shortUrl', (req: Request, res: Response) => redirectUrl)
router.get('/links', (req: Request, res: Response) => listLinks)
router.post('/shorten', (req: Request, res: Response) => shortenUrl)

export default router

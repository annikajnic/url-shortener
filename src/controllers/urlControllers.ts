import { Request, RequestHandler, Response } from 'express'
import validUrl from 'valid-url'
import { URL } from '../models/URL'
import dayjs from 'dayjs'

export const shortenUrl: RequestHandler = async (
  req: Request,
  res: Response,
) => {
  const { longUrl, expiresInDays = 7 } = JSON.parse(req.body.data)

  if (!longUrl || !validUrl.isUri(longUrl)) {
    res.status(400).json({ error: 'Invalid URL provided.' })
    return
  }

  const shortUrl = (Math.random() + 1).toString(36).substring(7)

  try {
    const existing = await URL.findOne({ where: { longUrl } })

    if (existing) {
      res.status(200).json({ shortUrl: existing.shortUrl })
      return
    }

    const expiresAt = dayjs().add(expiresInDays, 'day').toDate()

    const url = await URL.create({ longUrl, shortUrl, expiresAt })
    res.status(201).json(url)
    return
  } catch (error) {
    console.error('Error shortening URL:', error)
    res.status(500).json({ error: 'Database error' })
  }
}

export const redirectUrl: RequestHandler = async (
  req: Request,
  res: Response,
) => {
  const { shortUrl } = req.params

  try {
    const url = await URL.findOne({ where: { shortUrl } })

    if (!url) {
      res.status(404).json({ error: 'URL not found' })
      return
    }
    if (url.expiresAt && url.expiresAt < new Date()) {
      res.status(410).json({ error: 'URL has expired' })
      return
    }

    url.accessCount += 1
    await url.save()

    res.redirect(url.longUrl)
  } catch (error) {
    console.error('Error redirecting URL:', error)
    res.status(500).json({ error: 'Database error' })
  }
}

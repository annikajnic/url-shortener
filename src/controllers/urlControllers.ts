import { NextFunction, Request, RequestHandler, Response } from 'express'

import { URL } from '../models/URL'
import * as dayjs from 'dayjs'
import * as validUrl from 'valid-url'
import { sanitizedUrl } from '../helpers/sanitizeUrl'

export const shortenUrl: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.log('🔍 [POST] /api/shorten endpoint hit')
  const { longUrl, expiresInDays = 7 } = req.body.data
  const sanitizedLongUrl = sanitizedUrl(longUrl)

  if (!sanitizedLongUrl || !validUrl.isUri(longUrl)) {
    return res.status(400).json({ error: 'Invalid URL provided.' })
  }

  if (sanitizedLongUrl.length > 2048) {
    return res.status(400).json({ error: 'URL too long' })
  }

  const shortUrl = (Math.random() + 1).toString(36).substring(7)

  try {
    const existing = await URL.findOne({ where: { sanitizedLongUrl } })

    if (existing) {
      return res.status(200).json({ shortUrl: existing.shortUrl })
    }

    const expiresAt = dayjs().add(expiresInDays, 'day').toDate()

    const url = await URL.create({ longUrl, shortUrl, expiresAt })
    return res.status(201).json(url)
    // return
  } catch (error) {
    console.error('Error shortening URL:', error)
    res.status(500).json({ error: 'Database error' })
  }
  next()
}

export const redirectUrl: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { shortUrl } = req.params

  try {
    const url = await URL.findOne({ where: { shortUrl } })

    if (!url) {
      return res.status(404).json({ error: 'URL not found' })
    }

    if (!url.longUrl.startsWith('https://')) {
      return res
        .status(400)
        .json({ error: 'Only HTTPS URLs are allowed for redirection.' })
    }

    if (url.expiresAt && url.expiresAt < new Date()) {
      return res.status(410).json({ error: 'URL has expired' })
    }

    url.accessCount += 1
    await url.save()

    return res.redirect(url.longUrl)
    next()
  } catch (error) {
    console.error('Error redirecting URL:', error)
    return res.status(500).json({ error: 'Database error' })
  }
}

export const listLinks: RequestHandler = async (
  req: Request,
  res: Response,
) => {
  console.log('🔍 [GET] /api/links endpoint hit')

  try {
    const links = await URL.findAll()
    console.log('✅ DB query finished, found:', links.length)

    return res.status(200).json(links)
  } catch (err) {
    console.error('❌ Error during DB query:', err)
    return res.status(500).json({ error: 'Internal Server Error' })
  }
}

export const editLinkExpiration = async (req: Request, res: Response) => {
  const { shortUrl, expiresAt } = req.params

  if (!shortUrl) {
    return res.status(400).json({ error: 'Short URL is required.' })
  }

  if (!expiresAt) {
    return res.status(400).json({ error: 'Expires at is required.' })
  }
  try {
    const url = await URL.findOne({ where: { shortUrl } })

    if (!url) {
      return res.status(404).json({ error: 'URL not found.' })
    }

    url.expiresAt = new Date(expiresAt)
    await url.save()

    return res
      .status(200)
      .json({ message: 'URL expiration updated successfully.' })
  } catch (error) {
    console.error('Error updating URL expiration:', error)
    return res.status(500).json({ error: 'Internal Server Error' })
  }
}

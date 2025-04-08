import * as sanitizeHtml from 'sanitize-html'

export function sanitizedUrl(url: string) {
  return sanitizeHtml(url, {
    allowedTags: [],
    allowedAttributes: {},
  })
}

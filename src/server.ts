import 'reflect-metadata'
import * as express from 'express'
import * as cors from 'cors'
import * as dotenv from 'dotenv'
dotenv.config()
import * as path from 'path'

import { sequelize } from './config/db'
import urlRoutes from './routes/urlRoutes'
import { listLinks, shortenUrl } from './controllers'

const app = express()
app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.url}`)
  next()
})

app.use(cors())

app.use(express.json())
// app.use('/api', (req, res, next: NextFunction) => listLinks(req, res, next))

app.get('/api/links', listLinks)
app.post('/api/shorten', shortenUrl)
app.get('/api/:shortUrl', urlRoutes)

// Serve static frontend files
app.use(express.static(path.join(__dirname, '../client/build')))

app.get('*', (_, res) => {
  res.sendFile(path.join(__dirname, '../client/build', 'index.html'))
})

const PORT = process.env.PORT_DB || 2000
sequelize
  .sync({ alter: true })
  .then(() => {
    console.log('Database synced.')
    app.listen(PORT, async () => {
      await sequelize.sync()
      console.log(`Server running on http://localhost:${PORT}`)
    })
  })
  .catch(err => {
    console.error('Failed to sync DB:', err)
  })

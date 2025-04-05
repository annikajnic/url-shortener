import 'reflect-metadata'
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
dotenv.config()
import { sequelize } from './config/db'
import urlRoutes from './routes/urlRoutes'

import path from 'path'

const app = express()

app.use(
  cors({
    origin: 'http://localhost:3000', // React dev server
  }),
)

app.use('/api', urlRoutes)

// Serve static frontend files
app.use(express.static(path.join(__dirname, '../client/build')))
app.use(express.json())

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build', 'index.html'))
})

sequelize
  .sync({ alter: true })
  .then(() => {
    console.log('Database synced.')
  })
  .catch(err => {
    console.error('Failed to sync DB:', err)
  })

const PORT = process.env.PORT || 2000
app.listen(PORT, async () => {
  await sequelize.sync()
  console.log(`Server running on http://localhost:${PORT}`)
})

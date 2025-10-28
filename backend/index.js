const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const emailRoutes = require('./routes/emails')

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors({
  origin: ['http://localhost:3000',
    // Add common Render deployment patterns
      "https://*.onrender.com",
      "https://*.netlify.app",
      "https://*.vercel.app"
  ],
  credentials: true
}))
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ limit: '50mb', extended: true }))

// Routes
app.use('/api/emails', emailRoutes)

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Email classifier backend is running' })
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Something went wrong!', message: err.message })
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})

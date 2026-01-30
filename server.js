import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import cron from 'node-cron'
import rateLimit from 'express-rate-limit'
import config from './config/index.js'

// Routes
import aliexpressRoutes from './routes/aliexpress.js'
import productRoutes from './routes/products.js'
import orderRoutes from './routes/orders.js'
import settingsRoutes from './routes/settings.js'
import webhookRoutes from './routes/webhooks.js'

// Services
import { syncAllInventory, syncAllShipping } from './services/syncService.js'

const app = express()

// Middleware
app.use(cors({
    origin: config.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json())

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
})
app.use('/api/', limiter)

// Routes
app.use('/api/aliexpress', aliexpressRoutes)
app.use('/api/products', productRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/settings', settingsRoutes)
app.use('/webhooks', webhookRoutes)

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() })
})

// Error handling
app.use((err, req, res, next) => {
    console.error('Error:', err)
    res.status(err.status || 500).json({
        error: err.message || 'Internal server error'
    })
})

// Database connection
mongoose.connect(config.MONGODB_URI)
    .then(() => {
        console.log('✅ Connected to MongoDB')

        // Start server
        app.listen(config.PORT, () => {
            console.log(`🚀 Server running on port ${config.PORT}`)
            console.log(`📍 API: http://localhost:${config.PORT}/api`)
            console.log(`🔗 Webhooks: http://localhost:${config.PORT}/webhooks`)
        })

        // Schedule sync jobs
        setupCronJobs()
    })
    .catch(err => {
        console.error('❌ MongoDB connection error:', err)
        process.exit(1)
    })

// Cron jobs for automatic synchronization
function setupCronJobs() {
    // Inventory sync every 6 hours
    cron.schedule('0 */6 * * *', async () => {
        console.log('🔄 Running scheduled inventory sync...')
        try {
            await syncAllInventory()
            console.log('✅ Inventory sync completed')
        } catch (error) {
            console.error('❌ Inventory sync failed:', error)
        }
    })

    // Shipping sync every hour
    cron.schedule('0 * * * *', async () => {
        console.log('🚚 Running scheduled shipping sync...')
        try {
            await syncAllShipping()
            console.log('✅ Shipping sync completed')
        } catch (error) {
            console.error('❌ Shipping sync failed:', error)
        }
    })

    console.log('⏰ Cron jobs scheduled')
}

export default app

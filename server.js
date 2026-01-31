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

// Trust proxy for Railway (Required for rate limiting)
app.set('trust proxy', 1)

// Middleware
const whitelist = [
    'https://webflow.com',
    'https://design.webflow.com',
    config.CORS_ORIGIN
];

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        // Allow Webflow extensions (dynamic subdomains)
        if (origin.endsWith('.webflow-ext.com')) {
            return callback(null, true);
        }

        if (whitelist.indexOf(origin) !== -1 || origin.includes('localhost')) {
            callback(null, true);
        } else {
            console.log('Blocked by CORS:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}))

app.use(express.json())

// Global Auth Middleware for Single User Mode
app.use((req, res, next) => {
    if (!req.headers['x-user-id']) {
        console.log('⚠️ No x-user-id header, defaulting to default-admin')
        req.headers['x-user-id'] = 'default-admin'
    }
    next()
})

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

app.get('/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() })
})

// Middleware removed (redundant)

// Error handling
app.use((err, req, res, next) => {
    console.error('Error:', err)
    res.status(err.status || 500).json({
        error: err.message || 'Internal server error'
    })
})

// Database connection
console.log('🏁 Starting FULL application...')

// Start server IMMEDIATELY to satisfy Railway health checks
const server = app.listen(config.PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${config.PORT}`)
})

// Database connection
mongoose.connect(config.MONGODB_URI)
    .then(() => {
        console.log('✅ Connected to MongoDB')
        setupCronJobs()
    })
    .catch(err => {
        console.error('❌ MongoDB connection error:', err)
        console.error('💡 Check your MONGODB_URI in Railway variables')
    })

// Cron jobs for automatic synchronization
function setupCronJobs() {
    // Inventory sync every 6 hours
    cron.schedule('0 */6 * * *', async () => { // Fixed syntax: Removed faulty comment terminator
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

import express from 'express'

console.log('🏁 Starting SUPER MINIMAL application...')

const app = express()

// Trust Railway Proxy
app.enable('trust proxy')

// Log all requests
app.use((req, res, next) => {
    console.log(`📥 ${req.method} ${req.url}`)
    next()
})

app.get('/', (req, res) => {
    console.log('✅ Handling root request')
    res.send('Hello World!')
})

app.get('/health', (req, res) => {
    console.log('✅ Handling health request')
    res.json({ status: 'healthy', timestamp: new Date().toISOString() })
})

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
    console.log(`🚀 SUPER MINIMAL Server running on port ${PORT}`)
})

export default app

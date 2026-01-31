import express from 'express'

console.log('🏁 Starting SUPER MINIMAL application...')

const app = express()

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.get('/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() })
})

const PORT = process.env.PORT || 3000

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 SUPER MINIMAL Server running on port ${PORT}`)
})

export default app

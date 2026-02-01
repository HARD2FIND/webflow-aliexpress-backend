import express from 'express'
import User from '../models/User.js'
import AliExpressService from '../services/aliexpressService.js'

const router = express.Router()

// Search products
router.post('/search', async (req, res, next) => {
    try {
        const { keywords, minPrice, maxPrice, sortBy, deliveryDays } = req.body
        const userId = req.headers['x-user-id'] // In production, get from OAuth session

        const user = await User.findById(userId)
        if (!user || !user.aliexpressAppKey) {
            return res.status(400).json({ error: 'AliExpress API not configured' })
        }

        const aliexpress = new AliExpressService(
            user.aliexpressAppKey,
            user.aliexpressAppSecret,
            user.aliexpressSessionKey
        )

        const results = await aliexpress.searchProducts(keywords, {
            minPrice,
            maxPrice,
            sortBy,
            deliveryDays
        })

        res.json({ success: true, results })
    } catch (error) {
        next(error)
    }
})

// Get product details
router.get('/product/:id', async (req, res, next) => {
    try {
        const { id } = req.params
        const userId = req.headers['x-user-id']

        const user = await User.findById(userId)
        if (!user || !user.aliexpressAppKey) {
            return res.status(400).json({ error: 'AliExpress API not configured' })
        }

        const aliexpress = new AliExpressService(
            user.aliexpressAppKey,
            user.aliexpressAppSecret,
            user.aliexpressSessionKey
        )

        const product = await aliexpress.getProductDetails(id)

        res.json({ success: true, product })
    } catch (error) {
        next(error)
    }
})

export default router

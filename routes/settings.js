import express from 'express'
import User from '../models/User.js'

const router = express.Router()

// Get settings
router.get('/', async (req, res, next) => {
    try {
        const userId = req.headers['x-user-id']

        const user = await User.findById(userId)
        if (!user) {
            return res.status(404).json({ error: 'User not found' })
        }

        res.json({
            aliexpress_app_key: user.aliexpressAppKey || '',
            aliexpress_app_secret: user.aliexpressAppSecret ? '***' : '',
            price_multiplier: user.settings.priceMultiplier,
            auto_order_placement: user.settings.autoOrderPlacement,
            inventory_sync_hours: user.settings.inventorySyncHours
        })
    } catch (error) {
        next(error)
    }
})

// Save settings
router.post('/', async (req, res, next) => {
    try {
        const userId = req.headers['x-user-id']
        const {
            aliexpress_app_key,
            aliexpress_app_secret,
            price_multiplier,
            auto_order_placement,
            inventory_sync_hours
        } = req.body

        const user = await User.findById(userId)
        if (!user) {
            return res.status(404).json({ error: 'User not found' })
        }

        // Update AliExpress credentials
        if (aliexpress_app_key) {
            user.aliexpressAppKey = aliexpress_app_key
        }
        if (aliexpress_app_secret && aliexpress_app_secret !== '***') {
            user.aliexpressAppSecret = aliexpress_app_secret
        }

        // Update settings
        user.settings.priceMultiplier = price_multiplier || user.settings.priceMultiplier
        user.settings.autoOrderPlacement = auto_order_placement !== undefined
            ? auto_order_placement
            : user.settings.autoOrderPlacement
        user.settings.inventorySyncHours = inventory_sync_hours || user.settings.inventorySyncHours

        await user.save()

        res.json({ success: true, message: 'Settings saved' })
    } catch (error) {
        next(error)
    }
})

export default router

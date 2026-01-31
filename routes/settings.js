import express from 'express'
import User from '../models/User.js'

const router = express.Router()

// Get settings
router.get('/', async (req, res, next) => {
    try {
        const userId = req.headers['x-user-id'] || 'default-admin' // Fallback for single-user mode

        let user = await User.findById(userId) || await User.findOne({ _id: userId })

        // If default user doesn't exist, return default empty settings without error
        if (!user && userId === 'default-admin') {
            return res.json({
                aliexpress_app_key: '',
                aliexpress_app_secret: '',
                price_multiplier: 1.5,
                auto_order_placement: false,
                inventory_sync_hours: 6
            })
        }

        if (!user) {
            return res.status(404).json({ error: 'User not found' })
        }

        res.json({
            aliexpress_app_key: user.aliexpressAppKey || '',
            aliexpress_app_secret: user.aliexpressAppSecret ? '***' : '',
            price_multiplier: user.settings?.priceMultiplier || 1.5,
            auto_order_placement: user.settings?.autoOrderPlacement || false,
            inventory_sync_hours: user.settings?.inventorySyncHours || 6
        })
    } catch (error) {
        next(error)
    }
})

// Save settings
router.post('/', async (req, res, next) => {
    try {
        const userId = req.headers['x-user-id'] || 'default-admin' // Fallback
        console.log(`💾 SAVING SETTINGS FOR USER: ${userId}`)
        console.log('📦 Body:', req.body)

        const {
            aliexpress_app_key,
            aliexpress_app_secret,
            price_multiplier,
            auto_order_placement,
            inventory_sync_hours
        } = req.body

        let user = await User.findById(userId)

        // Auto-create default user if missing
        if (!user) {
            if (userId === 'default-admin') {
                user = new User({
                    _id: 'default-admin',
                    webflowUserId: 'default-admin', // REQUIRED by Schema
                    webflowAccessToken: 'dummy_token', // REQUIRED by Schema
                    email: 'admin@local',
                    settings: {}
                })
            } else {
                return res.status(404).json({ error: 'User not found' })
            }
        }

        // Initialize settings object if missing
        if (!user.settings) user.settings = {}

        // Update AliExpress credentials
        if (aliexpress_app_key) {
            user.aliexpressAppKey = aliexpress_app_key
        }
        if (aliexpress_app_secret && aliexpress_app_secret !== '***') {
            user.aliexpressAppSecret = aliexpress_app_secret
        }

        // Update settings
        user.settings.priceMultiplier = price_multiplier || user.settings.priceMultiplier || 1.5
        user.settings.autoOrderPlacement = auto_order_placement !== undefined
            ? auto_order_placement
            : (user.settings.autoOrderPlacement || false)
        user.settings.inventorySyncHours = inventory_sync_hours || user.settings.inventorySyncHours || 6

        await user.save()

        res.json({ success: true, message: 'Settings saved' })
    } catch (error) {
        next(error)
    }
})

export default router

import express from 'express'
import User from '../models/User.js'
import Order from '../models/Order.js'
import ProductMapping from '../models/ProductMapping.js'
import AliExpressService from '../services/aliexpressService.js'
import WebflowService from '../services/webflowService.js'
import { syncUserShipping } from '../services/syncService.js'

const router = express.Router()

// List orders
router.get('/list', async (req, res, next) => {
    try {
        const userId = req.headers['x-user-id']

        const orders = await Order.find({ userId }).sort({ createdAt: -1 })

        res.json({ success: true, orders })
    } catch (error) {
        next(error)
    }
})

// Place order on AliExpress
router.post('/place', async (req, res, next) => {
    try {
        const { order_id } = req.body
        const userId = req.headers['x-user-id']

        const user = await User.findById(userId)
        if (!user) {
            return res.status(404).json({ error: 'User not found' })
        }

        const order = await Order.findOne({ userId, webflowOrderId: order_id })
        if (!order) {
            return res.status(404).json({ error: 'Order not found' })
        }

        if (order.aliexpressOrderId) {
            return res.status(400).json({ error: 'Order already placed on AliExpress' })
        }

        const aliexpress = new AliExpressService(
            user.aliexpressAppKey,
            user.aliexpressAppSecret,
            user.aliexpressSessionKey
        )

        const webflow = new WebflowService(user.webflowAccessToken)

        // Get full order details from Webflow
        const wfOrder = await webflow.getOrder(order.webflowSiteId, order.webflowOrderId)

        // Place order for each item
        for (const item of order.items) {
            const mapping = await ProductMapping.findOne({
                userId,
                webflowProductId: item.webflowProductId
            })

            if (mapping) {
                const aeOrder = await aliexpress.createOrder(
                    mapping.aliexpressProductId,
                    item.quantity,
                    wfOrder.shippingAddress
                )

                if (aeOrder?.order_id) {
                    order.aliexpressOrderId = aeOrder.order_id
                    order.status = 'placed'
                    order.orderPlacedAt = new Date()
                }
            }
        }

        await order.save()

        res.json({ success: true, message: 'Order placed on AliExpress', order })
    } catch (error) {
        next(error)
    }
})

// Sync shipping
router.post('/shipping/sync', async (req, res, next) => {
    try {
        const userId = req.headers['x-user-id']

        await syncUserShipping(userId)

        res.json({ success: true, message: 'Shipping synchronized' })
    } catch (error) {
        next(error)
    }
})

export default router

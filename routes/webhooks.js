import express from 'express'
import Order from '../models/Order.js'
import ProductMapping from '../models/ProductMapping.js'
import User from '../models/User.js'

const router = express.Router()

// Webflow order webhook
router.post('/order', async (req, res) => {
    try {
        const orderData = req.body

        // Extract order information
        const webflowOrderId = orderData._id || orderData.orderId
        const siteId = orderData.siteId
        const customerEmail = orderData.customerInfo?.email
        const totalAmount = orderData.totals?.total / 100 // Convert from cents

        // Find user by site (in production, use proper user mapping)
        // For now, we'll need to implement user-site mapping
        const user = await User.findOne({ /* site mapping logic */ })

        if (!user) {
            console.error('User not found for site:', siteId)
            return res.status(200).json({ received: true }) // Still return 200 to Webflow
        }

        // Check if order already exists
        const existingOrder = await Order.findOne({ webflowOrderId })
        if (existingOrder) {
            return res.status(200).json({ received: true, message: 'Order already processed' })
        }

        // Extract items
        const items = []
        for (const item of orderData.purchasedItems || []) {
            const mapping = await ProductMapping.findOne({
                userId: user._id,
                webflowProductId: item.productId
            })

            if (mapping) {
                items.push({
                    aliexpressProductId: mapping.aliexpressProductId,
                    webflowProductId: item.productId,
                    quantity: item.count,
                    price: item.price / 100
                })
            }
        }

        // Create order
        const order = new Order({
            userId: user._id,
            webflowOrderId,
            webflowSiteId: siteId,
            customerEmail,
            totalAmount,
            items,
            status: 'pending'
        })

        await order.save()

        // If auto-placement is enabled, place order immediately
        if (user.settings.autoOrderPlacement) {
            // TODO: Trigger order placement
            console.log('Auto-placement enabled, would place order now')
        }

        res.status(200).json({ received: true, orderId: order._id })
    } catch (error) {
        console.error('Webhook error:', error)
        res.status(200).json({ received: true, error: error.message })
    }
})

export default router

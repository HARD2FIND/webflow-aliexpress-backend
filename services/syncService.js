import ProductMapping from '../models/ProductMapping.js'
import Order from '../models/Order.js'
import User from '../models/User.js'
import AliExpressService from './aliexpressService.js'
import WebflowService from './webflowService.js'

// Sync inventory for all users
export async function syncAllInventory() {
    const users = await User.find({ aliexpressAppKey: { $exists: true, $ne: '' } })

    for (const user of users) {
        try {
            await syncUserInventory(user._id)
        } catch (error) {
            console.error(`Error syncing inventory for user ${user._id}:`, error)
        }
    }
}

// Sync inventory for a specific user
export async function syncUserInventory(userId) {
    const user = await User.findById(userId)
    if (!user || !user.aliexpressAppKey) {
        throw new Error('User not found or AliExpress not configured')
    }

    const aliexpress = new AliExpressService(
        user.aliexpressAppKey,
        user.aliexpressAppSecret,
        user.aliexpressSessionKey
    )

    const webflow = new WebflowService(user.webflowAccessToken)

    const products = await ProductMapping.find({ userId, isActive: true })

    for (const product of products) {
        try {
            // Get inventory from AliExpress
            const inventory = await aliexpress.getProductInventory(product.aliexpressProductId)
            const stock = inventory?.available_stock || 0

            // Update in Webflow
            await webflow.updateInventory(product.webflowProductId, product.webflowSkuId, stock)

            // Update sync timestamp
            product.lastInventorySync = new Date()
            await product.save()

            console.log(`✅ Synced inventory for product ${product.productName}: ${stock} units`)
        } catch (error) {
            console.error(`Error syncing product ${product.productName}:`, error)
        }
    }
}

// Sync shipping for all users
export async function syncAllShipping() {
    const users = await User.find({ aliexpressAppKey: { $exists: true, $ne: '' } })

    for (const user of users) {
        try {
            await syncUserShipping(user._id)
        } catch (error) {
            console.error(`Error syncing shipping for user ${user._id}:`, error)
        }
    }
}

// Sync shipping for a specific user
export async function syncUserShipping(userId) {
    const user = await User.findById(userId)
    if (!user || !user.aliexpressAppKey) {
        throw new Error('User not found or AliExpress not configured')
    }

    const aliexpress = new AliExpressService(
        user.aliexpressAppKey,
        user.aliexpressAppSecret,
        user.aliexpressSessionKey
    )

    const webflow = new WebflowService(user.webflowAccessToken)

    const orders = await Order.find({
        userId,
        status: { $in: ['placed', 'shipped'] },
        aliexpressOrderId: { $exists: true, $ne: null }
    })

    for (const order of orders) {
        try {
            // Get shipping info from AliExpress
            const shipping = await aliexpress.getShippingInfo(order.aliexpressOrderId)

            if (shipping?.tracking_number) {
                // Update order in database
                order.trackingNumber = shipping.tracking_number
                order.shippingCarrier = shipping.logistics_service || 'AliExpress'
                order.status = 'shipped'
                order.lastTrackingSync = new Date()
                await order.save()

                // Update Webflow order
                await webflow.fulfillOrder(
                    order.webflowSiteId,
                    order.webflowOrderId,
                    shipping.tracking_number,
                    shipping.logistics_service
                )

                console.log(`✅ Updated tracking for order ${order.webflowOrderId}`)
            }
        } catch (error) {
            console.error(`Error syncing order ${order.webflowOrderId}:`, error)
        }
    }
}

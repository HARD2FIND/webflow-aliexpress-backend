import express from 'express'
import User from '../models/User.js'
import ProductMapping from '../models/ProductMapping.js'
import AliExpressService from '../services/aliexpressService.js'
import WebflowService from '../services/webflowService.js'
import { syncUserInventory } from '../services/syncService.js'

const router = express.Router()

// Import product from AliExpress
router.post('/import', async (req, res, next) => {
    try {
        const { product_id, site_id } = req.body
        const userId = req.headers['x-user-id']

        const user = await User.findById(userId)
        if (!user) {
            return res.status(404).json({ error: 'User not found' })
        }

        // Check if already imported
        const existing = await ProductMapping.findOne({ userId, aliexpressProductId: product_id })
        if (existing) {
            return res.status(400).json({ error: 'Product already imported' })
        }

        // Get product from AliExpress
        const aliexpress = new AliExpressService(
            user.aliexpressAppKey,
            user.aliexpressAppSecret,
            user.aliexpressSessionKey
        )

        const aeProduct = await aliexpress.getProductDetails(product_id)
        if (!aeProduct) {
            return res.status(404).json({ error: 'Product not found on AliExpress' })
        }

        // Calculate selling price
        const aePrice = parseFloat(aeProduct.target_sale_price || 0)
        const sellingPrice = aePrice * user.settings.priceMultiplier

        // Create product in Webflow
        const webflow = new WebflowService(user.webflowAccessToken)

        const wfProduct = await webflow.createProduct(site_id, {
            name: aeProduct.subject,
            slug: aeProduct.subject.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            description: aeProduct.product_description
        })

        // Create SKU
        const wfSku = await webflow.createSku(wfProduct.id, {
            name: 'Default',
            price: {
                value: Math.round(sellingPrice * 100), // Convert to cents
                unit: 'USD'
            }
        })

        // Get inventory
        const inventory = await aliexpress.getProductInventory(product_id)
        const stock = inventory?.available_stock || 100

        // Update inventory
        await webflow.updateInventory(wfProduct.id, wfSku.id, stock)

        // Save mapping
        const mapping = new ProductMapping({
            userId,
            aliexpressProductId: product_id,
            webflowProductId: wfProduct.id,
            webflowSiteId: site_id,
            webflowSkuId: wfSku.id,
            productName: aeProduct.subject,
            priceAliexpress: aePrice,
            priceWebflow: sellingPrice,
            lastInventorySync: new Date()
        })

        await mapping.save()

        res.json({
            success: true,
            message: 'Product imported successfully',
            product: mapping
        })
    } catch (error) {
        next(error)
    }
})

// List imported products
router.get('/list', async (req, res, next) => {
    try {
        const userId = req.headers['x-user-id']

        const products = await ProductMapping.find({ userId }).sort({ createdAt: -1 })

        res.json({ success: true, products })
    } catch (error) {
        next(error)
    }
})

// Sync inventory
router.post('/sync', async (req, res, next) => {
    try {
        const userId = req.headers['x-user-id']

        await syncUserInventory(userId)

        res.json({ success: true, message: 'Inventory synchronized' })
    } catch (error) {
        next(error)
    }
})

export default router

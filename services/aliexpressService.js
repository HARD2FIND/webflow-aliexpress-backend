import crypto from 'crypto-js'
import axios from 'axios'
import config from '../config/index.js'

class AliExpressService {
    constructor(appKey, appSecret, sessionKey = null) {
        this.appKey = appKey
        this.appSecret = appSecret
        this.sessionKey = sessionKey
        this.apiUrl = config.ALIEXPRESS_API_URL
    }

    // Generate API signature
    generateSign(params) {
        const sortedParams = Object.keys(params)
            .sort()
            .map(key => `${key}${params[key]}`)
            .join('')

        return crypto.HmacMD5(sortedParams, this.appSecret).toString().toUpperCase()
    }

    // Make API request
    async makeRequest(method, params = {}) {
        const baseParams = {
            method,
            app_key: this.appKey,
            timestamp: Date.now().toString(),
            format: 'json',
            v: '2.0',
            sign_method: 'md5'
        }

        if (this.sessionKey) {
            baseParams.session = this.sessionKey
        }

        const allParams = { ...baseParams, ...params }
        allParams.sign = this.generateSign(allParams)

        console.log(`📡 Calling AliExpress: ${method}`)
        // console.log('Params:', JSON.stringify(allParams)) // Don't log full params (security)

        try {
            const response = await axios.post(this.apiUrl, null, { params: allParams })
            console.log(`✅ AliExpress Response (${method}):`, JSON.stringify(response.data).substring(0, 500) + '...')

            if (response.data.error_response) {
                console.error('❌ AliExpress API Error:', response.data.error_response)
            }

            return response.data
        } catch (error) {
            console.error('❌ AliExpress HTTP Error:', error.response?.data || error.message)
            throw new Error(`AliExpress API Error: ${error.message}`)
        }
    }

    // Search products
    async searchProducts(keywords, options = {}) {
        const params = {
            keywords,
            page_size: options.pageSize || 20,
            page_no: options.pageNo || 1
        }

        if (options.minPrice) params.min_price = options.minPrice
        if (options.maxPrice) params.max_price = options.maxPrice
        if (options.categoryId) params.category_id = options.categoryId

        const result = await this.makeRequest('aliexpress.affiliate.product.query', params)
        return result?.result?.products || []
    }

    // Get product details
    async getProductDetails(productId) {
        const params = {
            product_ids: productId,
            target_currency: 'USD',
            target_language: 'EN'
        }

        const result = await this.makeRequest('aliexpress.ds.product.get', params)
        return result?.result
    }

    // Get product inventory
    async getProductInventory(productId) {
        const params = {
            product_id: productId
        }

        const result = await this.makeRequest('aliexpress.ds.product.inventory.query', params)
        return result?.result
    }

    // Create order
    async createOrder(productId, quantity, shippingAddress) {
        const params = {
            product_id: productId,
            product_count: quantity,
            address_dto: shippingAddress
        }

        const result = await this.makeRequest('aliexpress.trade.buy.placeorder', params)
        return result?.result
    }

    // Get shipping info
    async getShippingInfo(orderId) {
        const params = {
            order_id: orderId
        }

        const result = await this.makeRequest('aliexpress.logistics.ds.trackinginfo.query', params)
        return result?.result
    }
}

export default AliExpressService

import axios from 'axios'

class WebflowService {
    constructor(accessToken) {
        this.accessToken = accessToken
        this.baseUrl = 'https://api.webflow.com/v2'
    }

    async makeRequest(method, endpoint, data = null) {
        try {
            const response = await axios({
                method,
                url: `${this.baseUrl}${endpoint}`,
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`,
                    'accept': 'application/json',
                    'content-type': 'application/json'
                },
                data
            })
            return response.data
        } catch (error) {
            console.error('Webflow API Error:', error.response?.data || error.message)
            throw new Error(`Webflow API Error: ${error.message}`)
        }
    }

    // Products
    async createProduct(siteId, productData) {
        return this.makeRequest('POST', `/sites/${siteId}/products`, productData)
    }

    async getProduct(siteId, productId) {
        return this.makeRequest('GET', `/sites/${siteId}/products/${productId}`)
    }

    async updateProduct(siteId, productId, productData) {
        return this.makeRequest('PATCH', `/sites/${siteId}/products/${productId}`, productData)
    }

    async listProducts(siteId, limit = 100, offset = 0) {
        return this.makeRequest('GET', `/sites/${siteId}/products?limit=${limit}&offset=${offset}`)
    }

    // SKUs
    async createSku(productId, skuData) {
        return this.makeRequest('POST', `/products/${productId}/skus`, skuData)
    }

    async updateSku(productId, skuId, skuData) {
        return this.makeRequest('PATCH', `/products/${productId}/skus/${skuId}`, skuData)
    }

    // Inventory
    async updateInventory(productId, skuId, quantity) {
        return this.makeRequest('PATCH', `/products/${productId}/skus/${skuId}/inventory`, {
            quantity,
            updateQuantity: quantity
        })
    }

    // Orders
    async listOrders(siteId, status = null, limit = 100, offset = 0) {
        let url = `/sites/${siteId}/orders?limit=${limit}&offset=${offset}`
        if (status) url += `&status=${status}`
        return this.makeRequest('GET', url)
    }

    async getOrder(siteId, orderId) {
        return this.makeRequest('GET', `/sites/${siteId}/orders/${orderId}`)
    }

    async updateOrder(siteId, orderId, orderData) {
        return this.makeRequest('PATCH', `/sites/${siteId}/orders/${orderId}`, orderData)
    }

    async fulfillOrder(siteId, orderId, trackingNumber, carrier) {
        return this.updateOrder(siteId, orderId, {
            status: 'fulfilled',
            shippingTracking: {
                trackingNumber,
                carrier: carrier || 'AliExpress Standard Shipping'
            }
        })
    }
}

export default WebflowService

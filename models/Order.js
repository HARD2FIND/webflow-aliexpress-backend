import mongoose from 'mongoose'

const orderSchema = new mongoose.Schema({
    userId: {
        type: String, // Changed from ObjectId to String to support 'default-admin'
        ref: 'User',
        required: true
    },
    webflowOrderId: {
        type: String,
        required: true
    },
    webflowSiteId: {
        type: String,
        required: true
    },
    aliexpressOrderId: String,
    customerEmail: String,
    totalAmount: Number,
    status: {
        type: String,
        enum: ['pending', 'placed', 'shipped', 'delivered', 'cancelled'],
        default: 'pending'
    },
    trackingNumber: String,
    shippingCarrier: String,
    lastTrackingSync: Date,
    orderPlacedAt: Date,
    items: [{
        aliexpressProductId: String,
        webflowProductId: String,
        quantity: Number,
        price: Number
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
})

orderSchema.index({ userId: 1, webflowOrderId: 1 }, { unique: true })

export default mongoose.model('Order', orderSchema)

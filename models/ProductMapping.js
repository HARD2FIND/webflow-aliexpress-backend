import mongoose from 'mongoose'

const productMappingSchema = new mongoose.Schema({
    userId: {
        type: String, // Changed from ObjectId to String to support 'default-admin'
        ref: 'User',
        required: true
    },
    aliexpressProductId: {
        type: String,
        required: true
    },
    webflowProductId: {
        type: String,
        required: true
    },
    webflowSiteId: {
        type: String,
        required: true
    },
    webflowSkuId: String,
    productName: String,
    priceAliexpress: Number,
    priceWebflow: Number,
    lastInventorySync: Date,
    lastPriceSync: Date,
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
})

productMappingSchema.index({ userId: 1, aliexpressProductId: 1 }, { unique: true })
productMappingSchema.index({ userId: 1, webflowProductId: 1 })

export default mongoose.model('ProductMapping', productMappingSchema)

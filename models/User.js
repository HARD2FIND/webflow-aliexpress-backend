import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
    webflowUserId: {
        type: String,
        required: true,
        unique: true
    },
    webflowAccessToken: {
        type: String,
        required: true
    },
    webflowRefreshToken: String,
    aliexpressAppKey: String,
    aliexpressAppSecret: String,
    aliexpressSessionKey: String,
    settings: {
        priceMultiplier: {
            type: Number,
            default: 2.5
        },
        autoOrderPlacement: {
            type: Boolean,
            default: false
        },
        inventorySyncHours: {
            type: Number,
            default: 6
        }
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

userSchema.pre('save', function (next) {
    this.updatedAt = Date.now()
    next()
})

export default mongoose.model('User', userSchema)

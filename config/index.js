import dotenv from 'dotenv'
dotenv.config()

export default {
    // Server
    PORT: process.env.PORT || 3000,
    NODE_ENV: process.env.NODE_ENV || 'development',

    // Database
    MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/webflow-aliexpress',

    // Webflow OAuth
    WEBFLOW_CLIENT_ID: process.env.WEBFLOW_CLIENT_ID,
    WEBFLOW_CLIENT_SECRET: process.env.WEBFLOW_CLIENT_SECRET,
    WEBFLOW_REDIRECT_URI: process.env.WEBFLOW_REDIRECT_URI,

    // AliExpress API (default values, can be overridden per user)
    ALIEXPRESS_API_URL: 'https://api-sg.aliexpress.com/sync',

    // Encryption
    ENCRYPTION_KEY: process.env.ENCRYPTION_KEY || 'change-this-in-production',

    // Session
    SESSION_SECRET: process.env.SESSION_SECRET || 'change-this-in-production',

    // CORS
    CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:1337',

    // Sync intervals (in hours)
    INVENTORY_SYNC_INTERVAL: 6,
    TRACKING_SYNC_INTERVAL: 1
}

# Backend API for Webflow AliExpress Extension

Node.js/Express backend API for the Webflow AliExpress Dropshipping Extension.

## Features

- AliExpress API integration
- Webflow API integration
- MongoDB database
- Automatic inventory synchronization
- Automatic shipping tracking
- Webhook handling for new orders

## Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and configure:

```env
MONGODB_URI=mongodb://localhost:27017/webflow-aliexpress
WEBFLOW_CLIENT_ID=your_client_id
WEBFLOW_CLIENT_SECRET=your_client_secret
```

### 3. Start MongoDB

```bash
# Using Docker
docker run -d -p 27017:27017 --name mongodb mongo

# Or install MongoDB locally
brew install mongodb-community
brew services start mongodb-community
```

### 4. Run Development Server

```bash
npm run dev
```

The API will be available at `http://localhost:3000`

## API Endpoints

### AliExpress
- `POST /api/aliexpress/search` - Search products
- `GET /api/aliexpress/product/:id` - Get product details

### Products
- `POST /api/products/import` - Import product from AliExpress
- `GET /api/products/list` - List imported products
- `POST /api/products/sync` - Sync inventory

### Orders
- `GET /api/orders/list` - List orders
- `POST /api/orders/place` - Place order on AliExpress
- `POST /api/orders/shipping/sync` - Sync shipping status

### Settings
- `GET /api/settings` - Get user settings
- `POST /api/settings` - Save user settings

### Webhooks
- `POST /webhooks/order` - Webflow order webhook

## Deployment

### Railway

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Deploy
railway up
```

### Render

1. Connect your GitHub repo
2. Create a new Web Service
3. Set environment variables
4. Deploy

## Production Checklist

- [ ] Set strong `ENCRYPTION_KEY` and `SESSION_SECRET`
- [ ] Configure production MongoDB (MongoDB Atlas)
- [ ] Set up proper OAuth flow
- [ ] Configure CORS for production domain
- [ ] Set up monitoring and logging
- [ ] Configure rate limiting
- [ ] Set up SSL/HTTPS

## License

MIT

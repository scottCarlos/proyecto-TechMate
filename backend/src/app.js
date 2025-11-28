import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'

import productRoutes from './routes/product.routes.js'
import authRoutes from './routes/auth.routes.js'
import categoryRoutes from './routes/category.routes.js'
import userRoutes from './routes/user.routes.js'
import addressRoutes from './routes/address.routes.js'
import cartRoutes from './routes/cart.routes.js'
import wishlistRoutes from './routes/wishlist.routes.js'
import orderRoutes from './routes/order.routes.js'
import adminRoutes from './routes/admin.routes.js'
import faqRoutes from './routes/faq.routes.js'
import supportRoutes from './routes/support.routes.js'
import reviewsRoutes from './routes/reviews.routes.js'

const app = express()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
}))

app.use(express.json())

// Archivos estáticos (avatars, etc.)
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')))

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok' })
})

// Rutas API
app.use('/api/products', productRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/categories', categoryRoutes)
app.use('/api/users', userRoutes)
app.use('/api/addresses', addressRoutes)
app.use('/api/cart', cartRoutes)
app.use('/api/wishlist', wishlistRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/faqs', faqRoutes)
app.use('/api/support', supportRoutes)
app.use('/api/reviews', reviewsRoutes)

export default app

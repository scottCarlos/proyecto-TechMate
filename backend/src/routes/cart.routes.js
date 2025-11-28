import { Router } from 'express'
import { authMiddleware } from '../middlewares/auth.js'
import { getMyCart, addToCart, updateCartItem, removeFromCart, clearCart } from '../controllers/cart.controller.js'

const router = Router()

router.use(authMiddleware)

router.get('/', getMyCart)
router.post('/', addToCart)
router.put('/:productId', updateCartItem)
router.delete('/:productId', removeFromCart)
router.delete('/', clearCart)

export default router

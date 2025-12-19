import { Router } from 'express'
import { authMiddleware } from '../middlewares/auth.js'
import { getMyAddress, getMyAddresses, upsertMyAddress, setDefaultAddress } from '../controllers/address.controller.js'

const router = Router()

// Get all addresses for the current user
router.get('/', authMiddleware, getMyAddresses)

// Get the user's default address (kept for backward compatibility)
router.get('/me', authMiddleware, getMyAddress)

// Create or update an address
router.post('/me', authMiddleware, upsertMyAddress)

router.patch('/:id/set-default', authMiddleware, setDefaultAddress)

export default router

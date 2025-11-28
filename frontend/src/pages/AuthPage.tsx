import { useLocation, useNavigate } from 'react-router-dom'
import { useCart } from '../contexts/CartContext'
import type { AuthUser } from '../services/auth'
import AuthForm from '../components/AuthForm'

function AuthPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { syncCartWithBackend } = useCart()

  const handleAuthSuccess = async (authUser: AuthUser, authToken: string) => {
    // Save auth data to localStorage
    localStorage.setItem('auth', JSON.stringify({ user: authUser, token: authToken }))
    
    // Sync cart with backend if user has items in localStorage
    if (syncCartWithBackend) {
      try {
        await syncCartWithBackend()
      } catch (error) {
        console.error('Error syncing cart:', error)
        // Continue with login even if cart sync fails
      }
    }
    
    const state = location.state as { from?: string } | null
    const from = state?.from || '/'
    navigate(from, { replace: true })
  }

  return (
    <div className="font-display">
      <div className="relative flex h-auto min-h-screen w-full flex-col bg-background-light dark:bg-background-dark overflow-x-hidden">
        <div className="layout-container flex h-full grow flex-col">
          <div className="flex flex-1 justify-center items-center p-4 sm:p-6 md:p-8">
            <div className="layout-content-container flex flex-col w-full max-w-md">
              <div className="bg-white dark:bg-[#1C1F27] rounded-xl shadow-lg p-6 sm:p-8 w-full">
                <AuthForm onAuthSuccess={handleAuthSuccess} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AuthPage

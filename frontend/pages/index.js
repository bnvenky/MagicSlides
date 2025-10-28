import { useState, useEffect } from 'react'
import { signIn, useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { LogIn, Key } from 'lucide-react'

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [openAIKey, setOpenAIKey] = useState('')
  const [showAPIKeyInput, setShowAPIKeyInput] = useState(false)

  useEffect(() => {
    if (session && localStorage.getItem('openai_api_key')) {
      router.push('/emails')
    }
  }, [session, router])

  const handleGoogleSignIn = () => {
    setShowAPIKeyInput(true)
  }

  const handleAPIKeySubmit = async () => {
    if (!openAIKey.trim()) {
      alert('Please enter your OpenAI API key')
      return
    }
    
    localStorage.setItem('openai_api_key', openAIKey)
    await signIn('google', { callbackUrl: '/emails' })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Email Classifier</h1>
            <p className="text-gray-600">Organize your Gmail with AI</p>
          </div>

          {!showAPIKeyInput ? (
            <div className="space-y-4">
              <button
                onClick={handleGoogleSignIn}
                className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-300 rounded-lg px-6 py-3 text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-400 transition-colors"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Login with Google
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-2">
                  Enter OpenAI API Key
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Key className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="apiKey"
                    type="password"
                    value={openAIKey}
                    onChange={(e) => setOpenAIKey(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="sk-..."
                  />
                </div>
                <p className="mt-2 text-sm text-gray-600">
                  Your API key will be stored locally in your browser
                </p>
              </div>
              
              <button
                onClick={handleAPIKeySubmit}
                disabled={!openAIKey.trim()}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white rounded-lg px-6 py-3 font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <LogIn className="h-5 w-5" />
                Continue with Google
              </button>
              
              <button
                onClick={() => {
                  setShowAPIKeyInput(false)
                  setOpenAIKey('')
                }}
                className="w-full text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                Back
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

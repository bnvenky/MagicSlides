import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/router'
import { Mail, LogOut, RefreshCw, ChevronDown, Sparkles } from 'lucide-react'
import EmailCard from '../components/EmailCard'
import LoadingSpinner from '../components/LoadingSpinner'

export default function Emails() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [emails, setEmails] = useState([])
  const [classifiedEmails, setClassifiedEmails] = useState({})
  const [loading, setLoading] = useState(false)
  const [classifying, setClassifying] = useState(false)
  const [emailCount, setEmailCount] = useState(15)
  const [showDropdown, setShowDropdown] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('all')

  const categories = {
    all: 'All Emails',
    important: 'Important',
    promotions: 'Promotions',
    social: 'Social',
    marketing: 'Marketing',
    spam: 'Spam',
    general: 'General'
  }

  const categoryColors = {
    important: 'bg-red-100 text-red-800 border-red-200',
    promotions: 'bg-purple-100 text-purple-800 border-purple-200',
    social: 'bg-blue-100 text-blue-800 border-blue-200',
    marketing: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    spam: 'bg-gray-100 text-gray-800 border-gray-200',
    general: 'bg-green-100 text-green-800 border-green-200'
  }

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session) {
      router.push('/')
      return
    }
    
    const apiKey = localStorage.getItem('openai_api_key')
    if (!apiKey) {
      alert('OpenAI API key not found. Please login again.')
      router.push('/')
      return
    }

    // Load emails from localStorage if available
    const savedEmails = localStorage.getItem('gmail_emails')
    const savedClassifications = localStorage.getItem('email_classifications')
    
    if (savedEmails) {
      setEmails(JSON.parse(savedEmails))
    }
    
    if (savedClassifications) {
      setClassifiedEmails(JSON.parse(savedClassifications))
    }
  }, [session, status, router])

  const fetchEmails = async () => {
    setLoading(true)
    try {
      const response = await fetch('http://localhost:5000/api/emails/fetch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accessToken: session.accessToken,
          maxResults: emailCount
        })
      })

      if (!response.ok) {
        throw new Error('Failed to fetch emails')
      }

      const data = await response.json()
      setEmails(data.emails)
      localStorage.setItem('gmail_emails', JSON.stringify(data.emails))
    } catch (error) {
      console.error('Error fetching emails:', error)
      alert('Failed to fetch emails. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const classifyEmails = async () => {
    if (emails.length === 0) {
      alert('Please fetch emails first')
      return
    }

    setClassifying(true)
    const apiKey = localStorage.getItem('openai_api_key')

    try {
      const response = await fetch('http://localhost:5000/api/emails/classify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          emails: emails,
          openAIKey: apiKey
        })
      })

      if (!response.ok) {
        throw new Error('Failed to classify emails')
      }

      const data = await response.json()
      setClassifiedEmails(data.classifications)
      localStorage.setItem('email_classifications', JSON.stringify(data.classifications))
    } catch (error) {
      console.error('Error classifying emails:', error)
      alert('Failed to classify emails. Please check your OpenAI API key and try again.')
    } finally {
      setClassifying(false)
    }
  }

  const handleSignOut = () => {
    localStorage.removeItem('openai_api_key')
    localStorage.removeItem('gmail_emails')
    localStorage.removeItem('email_classifications')
    signOut({ callbackUrl: '/' })
  }

  const getFilteredEmails = () => {
    if (selectedCategory === 'all') {
      return emails
    }
    return emails.filter(email => 
      classifiedEmails[email.id]?.category === selectedCategory
    )
  }

  const filteredEmails = getFilteredEmails()

  if (status === 'loading') {
    return <LoadingSpinner />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Mail className="h-8 w-8 text-blue-600" />
              <h1 className="text-xl font-semibold text-gray-900">Email Classifier</h1>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <img 
                  src={session?.user?.image || ''} 
                  alt={session?.user?.name || ''} 
                  className="w-8 h-8 rounded-full"
                />
                <span className="text-sm font-medium text-gray-700">
                  {session?.user?.email}
                </span>
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Controls */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <span className="font-medium">Fetch {emailCount} emails</span>
                <ChevronDown className="h-4 w-4" />
              </button>
              
              {showDropdown && (
                <div className="absolute top-full mt-2 left-0 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                  {[10, 15, 20, 25, 30].map(count => (
                    <button
                      key={count}
                      onClick={() => {
                        setEmailCount(count)
                        setShowDropdown(false)
                      }}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100 first:rounded-t-lg last:rounded-b-lg"
                    >
                      {count} emails
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={fetchEmails}
                disabled={loading}
                className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                {loading ? 'Fetching...' : 'Fetch Emails'}
              </button>

              <button
                onClick={classifyEmails}
                disabled={classifying || emails.length === 0}
                className="flex items-center gap-2 px-5 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Sparkles className={`h-4 w-4 ${classifying ? 'animate-pulse' : ''}`} />
                {classifying ? 'Classifying...' : 'Classify'}
              </button>
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            {Object.entries(categories).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setSelectedCategory(key)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedCategory === key
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {label}
                {key !== 'all' && emails.length > 0 && (
                  <span className="ml-2 text-sm opacity-75">
                    ({emails.filter(e => classifiedEmails[e.id]?.category === key).length})
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Emails List */}
        <div className="space-y-4">
          {loading && <LoadingSpinner />}
          
          {!loading && filteredEmails.length === 0 && (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <Mail className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-700 mb-2">
                {emails.length === 0 ? 'No emails yet' : 'No emails in this category'}
              </h2>
              <p className="text-gray-500">
                {emails.length === 0 
                  ? 'Click "Fetch Emails" to load your emails'
                  : 'Try selecting a different category or classifying your emails'}
              </p>
            </div>
          )}

          {!loading && filteredEmails.map((email) => (
            <EmailCard
              key={email.id}
              email={email}
              classification={classifiedEmails[email.id]}
              categoryColors={categoryColors}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

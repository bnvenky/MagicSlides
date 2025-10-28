import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import LoadingSpinner from '../../components/LoadingSpinner'
import EmailContent from '../../components/EmailContent'

const categoryColors = {
  important: 'bg-red-100 text-red-800 border-red-200',
  promotions: 'bg-purple-100 text-purple-800 border-purple-200',
  social: 'bg-blue-100 text-blue-800 border-blue-200',
  marketing: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  spam: 'bg-gray-100 text-gray-800 border-gray-200',
  general: 'bg-green-100 text-green-800 border-green-200'
}

export default function EmailDetail() {
  const router = useRouter()
  const { id } = router.query
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState(null)
  const [classification, setClassification] = useState(null)

  useEffect(() => {
    if (!id) return

    setLoading(true)

    try {
      const savedEmails = localStorage.getItem('gmail_emails')
      const savedClassifications = localStorage.getItem('email_classifications')

      const emails = savedEmails ? JSON.parse(savedEmails) : []
      const classifications = savedClassifications ? JSON.parse(savedClassifications) : {}

      const decodedId = decodeURIComponent(id)
      const found = emails.find(e => e.id === decodedId)
      setEmail(found || null)
      setClassification(classifications[decodedId] || null)
    } catch (err) {
      console.error('Error loading email detail', err)
    } finally {
      setLoading(false)
    }
  }, [id])

  if (loading) return <LoadingSpinner />

  if (!email) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <h2 className="text-xl font-semibold mb-4">Email not found</h2>
          <p className="text-gray-600 mb-6">The selected email could not be found in local storage.</p>
          <Link href="/emails" className="px-4 py-2 bg-blue-600 text-white rounded-lg">Back to list</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">{email.subject || 'No Subject'}</h1>
            <p className="text-sm text-gray-500">From: {email.from || 'Unknown Sender'}</p>
          </div>
          <div className="flex items-center gap-3">
            {classification && classification.category && (
              <div className={`px-3 py-1 rounded-full border ${categoryColors[classification.category]}`}>
                <span className="text-sm font-medium capitalize">{classification.category}</span>
              </div>
            )}
            <Link href="/emails" className="text-sm text-blue-600 underline">Back to list</Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="prose max-w-none">
            {/* Render email content using EmailContent component */}
            <div className="mb-6">
              <EmailContent 
                htmlContent={email.body && email.body.includes('<') ? email.body : null}
                plainContent={email.body || email.snippet}
              />
            </div>

            <div className="mt-8 border-t pt-4 text-sm text-gray-600">
              <p><strong>Date:</strong> {email.date ? new Date(email.date).toLocaleString() : 'Unknown'}</p>
              {classification && classification.reason && (
                <p className="mt-2"><strong>Classification reason:</strong> {classification.reason}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

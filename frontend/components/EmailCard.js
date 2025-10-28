import Link from 'next/link'
import { Mail, User, Calendar, Tag } from 'lucide-react'

export default function EmailCard({ email, classification, categoryColors }) {
  const formatDate = (date) => {
    const d = new Date(date)
    return d.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const truncateText = (text, maxLength = 150) => {
    if (text.length <= maxLength) return text
    return text.substr(0, maxLength) + '...'
  }

  return (
    <Link href={`/emails/${encodeURIComponent(email.id)}`} className="block">
      <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3 flex-1">
          <div className="bg-blue-100 rounded-full p-2">
            <Mail className="h-5 w-5 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <User className="h-4 w-4 text-gray-400" />
              <h3 className="font-semibold text-gray-900 truncate">
                {email.from || 'Unknown Sender'}
              </h3>
            </div>
            <h4 className="text-lg font-medium text-gray-800 mb-2">
              {email.subject || 'No Subject'}
            </h4>
            <p className="text-gray-600 text-sm leading-relaxed">
              {truncateText(email.snippet || email.body || 'No content available')}
            </p>
          </div>
        </div>
        
        <div className="flex flex-col items-end gap-2 ml-4">
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Calendar className="h-3 w-3" />
            <span>{formatDate(email.date)}</span>
          </div>
          
          {classification && (
            <div className={`flex items-center gap-1 px-3 py-1 rounded-full border ${categoryColors[classification.category]}`}>
              <Tag className="h-3 w-3" />
              <span className="text-xs font-medium capitalize">
                {classification.category}
              </span>
            </div>
          )}
        </div>
      </div>

      {classification && classification.reason && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-sm text-gray-600">
            <span className="font-medium">Classification reason:</span> {classification.reason}
          </p>
        </div>
      )}
        </div>
    </Link>
  )
}

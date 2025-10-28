import { useEffect, useRef } from 'react'

export default function EmailContent({ htmlContent, plainContent }) {
  const iframeRef = useRef(null)

  useEffect(() => {
    if (htmlContent && iframeRef.current) {
      const iframe = iframeRef.current
      const iframeDoc = iframe.contentDocument || iframe.contentWindow.document

      // Create a complete HTML document with styles
      const htmlDoc = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              padding: 20px;
              margin: 0;
              max-width: 100%;
              overflow-x: auto;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 16px 0;
            }
            td, th {
              padding: 8px 12px;
              text-align: left;
              
            }
            img {
              max-width: 100%;
              height: auto;
            }
            a {
              color: #2563eb;
            }
            .button, a[role="button"], a[style*="background-color"] {
              display: inline-block;
              padding: 10px 20px;
              margin: 8px 4px;
              border-radius: 4px;
              text-decoration: none !important;
            }
            blockquote {
              border-left: 4px solid #ddd;
              padding-left: 16px;
              margin: 16px 0;
              color: #666;
            }
            pre {
              background: #f5f5f5;
              padding: 12px;
              
              overflow-x: auto;
            }
          </style>
        </head>
        <body>
          ${htmlContent}
        </body>
        </html>
      `

      iframeDoc.open()
      iframeDoc.write(htmlDoc)
      iframeDoc.close()

      // Adjust iframe height to content
      const adjustHeight = () => {
        const contentHeight = iframeDoc.body.scrollHeight
        iframe.style.height = `${contentHeight + 40}px`
      }

      // Adjust height initially and when images load
      adjustHeight()
      iframe.onload = adjustHeight
      
      // Listen for image loads
      const images = iframeDoc.getElementsByTagName('img')
      for (let img of images) {
        img.onload = adjustHeight
      }
    }
  }, [htmlContent])

  if (htmlContent) {
    return (
      <iframe
        ref={iframeRef}
        className="w-full border-0"
        style={{ minHeight: '200px' }}
        sandbox="allow-same-origin"
        title="Email Content"
      />
    )
  }

  // Fallback to plain text
  return (
    <div className="whitespace-pre-wrap text-gray-800">
      {plainContent || 'No content available.'}
    </div>
  )
}

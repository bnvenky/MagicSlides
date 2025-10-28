const express = require('express')
const router = express.Router()
const { google } = require('googleapis')
const { classifyEmailsWithOpenAI } = require('../services/openai')

// Fetch emails from Gmail
router.post('/fetch', async (req, res) => {
  try {
    const { accessToken, maxResults = 15 } = req.body

    if (!accessToken) {
      return res.status(400).json({ error: 'Access token is required' })
    }

    // Create OAuth2 client with the access token
    const oauth2Client = new google.auth.OAuth2()
    oauth2Client.setCredentials({ access_token: accessToken })

    // Initialize Gmail API
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client })

    // Get list of messages
    const messagesResponse = await gmail.users.messages.list({
      userId: 'me',
      maxResults: maxResults,
      q: 'is:unread OR is:important OR is:starred' // Get relevant emails
    })

    if (!messagesResponse.data.messages || messagesResponse.data.messages.length === 0) {
      // If no emails match the query, get recent emails
      const allMessagesResponse = await gmail.users.messages.list({
        userId: 'me',
        maxResults: maxResults
      })
      
      if (!allMessagesResponse.data.messages) {
        return res.json({ emails: [] })
      }
      
      messagesResponse.data.messages = allMessagesResponse.data.messages
    }

    // Fetch full details for each message
    const emails = await Promise.all(
      messagesResponse.data.messages.map(async (message) => {
        try {
          const fullMessage = await gmail.users.messages.get({
            userId: 'me',
            id: message.id
          })

          const headers = fullMessage.data.payload.headers
          const fromHeader = headers.find(h => h.name === 'From')
          const subjectHeader = headers.find(h => h.name === 'Subject')
          const dateHeader = headers.find(h => h.name === 'Date')

          // Extract body (prefer HTML, fall back to plain text)
          let body = ''
          let bodyHtml = ''
          let bodyText = ''

          const extractBodies = (parts) => {
            if (!parts) return
            for (const part of parts) {
              if (part.mimeType === 'text/html' && part.body && part.body.data) {
                try {
                  bodyHtml = Buffer.from(part.body.data, 'base64').toString('utf-8')
                } catch (e) {
                  // ignore
                }
              }
              if (part.mimeType === 'text/plain' && part.body && part.body.data) {
                try {
                  bodyText = Buffer.from(part.body.data, 'base64').toString('utf-8')
                } catch (e) {
                  // ignore
                }
              }
              if (part.parts) {
                extractBodies(part.parts)
              }
            }
          }

          if (fullMessage.data.payload.body && fullMessage.data.payload.body.data) {
            // top-level body; it can be plain text or html
            try {
              const decoded = Buffer.from(fullMessage.data.payload.body.data, 'base64').toString('utf-8')
              // Heuristic: if it contains HTML tags, treat as html
              if (/\<[^>]+\>/.test(decoded)) {
                bodyHtml = decoded
              } else {
                bodyText = decoded
              }
            } catch (e) {
              // ignore
            }
          }

          if (fullMessage.data.payload.parts) {
            extractBodies(fullMessage.data.payload.parts)
          }

          body = bodyHtml || bodyText || ''

          return {
            id: message.id,
            threadId: fullMessage.data.threadId,
            from: fromHeader ? fromHeader.value : '',
            subject: subjectHeader ? subjectHeader.value : '',
            date: dateHeader ? dateHeader.value : '',
            snippet: fullMessage.data.snippet,
            // return the full body (no short arbitrary truncation)
            body
          }
        } catch (error) {
          console.error(`Error fetching message ${message.id}:`, error)
          return null
        }
      })
    )

    // Filter out any null results
    const validEmails = emails.filter(email => email !== null)

    res.json({ 
      emails: validEmails,
      count: validEmails.length
    })
  } catch (error) {
    console.error('Error fetching emails:', error)
    res.status(500).json({ 
      error: 'Failed to fetch emails', 
      message: error.message 
    })
  }
})

// Classify emails using OpenAI
router.post('/classify', async (req, res) => {
  try {
    const { emails, openAIKey } = req.body

    if (!emails || emails.length === 0) {
      return res.status(400).json({ error: 'No emails to classify' })
    }

    if (!openAIKey) {
      return res.status(400).json({ error: 'OpenAI API key is required' })
    }

    const classifications = await classifyEmailsWithOpenAI(emails, openAIKey)
    
    res.json({ classifications })
  } catch (error) {
    console.error('Error classifying emails:', error)
    res.status(500).json({ 
      error: 'Failed to classify emails', 
      message: error.message 
    })
  }
})

module.exports = router

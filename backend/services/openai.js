const { OpenAI } = require('openai')

async function classifyEmailsWithOpenAI(emails, apiKey) {
  try {
    // Check if API key is provided
    if (!apiKey) {
      throw new Error('OpenAI API key is missing')
    }
    
    console.log('Initializing OpenAI with API key:', apiKey.substring(0, 10) + '...')
    
    const openai = new OpenAI({
      apiKey: apiKey
    })

    const classifications = {}

    // Process emails in batches to avoid rate limits
    const batchSize = 5
    for (let i = 0; i < emails.length; i += batchSize) {
      const batch = emails.slice(i, i + batchSize)
      
      const batchPromises = batch.map(async (email) => {
        try {
          // Limit email content to prevent token limit issues
          let emailContent = email.snippet || email.body || ''
          if (emailContent.length > 1000) {
            emailContent = emailContent.substring(0, 1000) + '...'
          }
          
          const prompt = `Classify the following email into one of these categories: important, promotions, social, marketing, spam, or general.

Email Details:
From: ${email.from}
Subject: ${email.subject}
Content: ${emailContent}

Please respond with a JSON object containing:
1. "category": one of the categories mentioned above
2. "reason": a brief explanation for the classification (max 50 words)

Email categories explained:
- important: Personal or work-related emails requiring immediate attention
- promotions: Sales, discounts, and promotional campaigns
- social: Messages from social networks, friends, and family
- marketing: Marketing communications, newsletters, and notifications
- spam: Unwanted or unsolicited emails
- general: Emails that don't fit other categories

Respond only with valid JSON format.`

          const completion = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo', // Using gpt-3.5-turbo for better availability
            messages: [
              {
                role: 'system',
                content: 'You are an email classification assistant. Classify emails accurately into the given categories and provide brief reasoning.'
              },
              {
                role: 'user',
                content: prompt
              }
            ],
            temperature: 0.3,
            max_tokens: 150,
            response_format: { type: "json_object" }
          })

          let classification
          try {
            classification = JSON.parse(completion.choices[0].message.content)
          } catch (parseError) {
            console.error('Error parsing OpenAI response:', parseError)
            classification = {
              category: 'general',
              reason: 'Could not parse classification'
            }
          }

          // Validate category
          const validCategories = ['important', 'promotions', 'social', 'marketing', 'spam', 'general']
          if (!validCategories.includes(classification.category)) {
            classification.category = 'general'
          }

          classifications[email.id] = classification
        } catch (error) {
          console.error(`Error classifying email ${email.id}:`, error.message)
          console.error('Full error:', error)
          
          // Provide more specific error reasons
          let errorReason = 'Classification failed'
          
          if (error.code === 'invalid_api_key') {
            errorReason = 'Invalid OpenAI API key'
          } else if (error.code === 'model_not_found') {
            errorReason = 'Model not available'
          } else if (error.code === 'rate_limit_exceeded') {
            errorReason = 'Rate limit exceeded'
          } else if (error.code === 'insufficient_quota') {
            errorReason = 'OpenAI quota exceeded'
          } else if (error.message && error.message.includes('401')) {
            errorReason = 'Authentication failed - check API key'
          } else if (error.message && error.message.includes('429')) {
            errorReason = 'Too many requests - please wait'
          } else if (error.message && error.message.includes('timeout')) {
            errorReason = 'Request timeout'
          } else if (error.message) {
            errorReason = `Error: ${error.message.substring(0, 50)}`
          }
          
          classifications[email.id] = {
            category: 'general',
            reason: errorReason
          }
        }
      })

      await Promise.all(batchPromises)

      // Add a small delay between batches to avoid rate limits
      if (i + batchSize < emails.length) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }

    return classifications
  } catch (error) {
    console.error('OpenAI classification error:', error.message)
    console.error('Full error details:', error)
    throw new Error(`Failed to classify emails with OpenAI: ${error.message}`)
  }
}

module.exports = {
  classifyEmailsWithOpenAI
}

# Email Classifier - Full Stack Application

A web application that allows users to log in using Google OAuth, fetch their Gmail emails, and classify them into different categories using OpenAI GPT-4o.

## 📁 Project Structure

```
IndianAppGuy-intern/
├── frontend/          # Next.js frontend application
│   ├── pages/        # Next.js pages
│   ├── components/   # React components
│   ├── styles/       # CSS files
│   └── package.json  # Frontend dependencies
│
├── backend/          # Express.js backend server
│   ├── routes/       # API routes
│   ├── services/     # Business logic services
│   ├── index.js      # Server entry point
│   └── package.json  # Backend dependencies
│
└── HOW_TO_GET_API_KEYS.md  # Detailed guide for getting API keys
```

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Google Cloud account
- OpenAI account

### Step 1: Get API Keys

**📖 Read the [HOW_TO_GET_API_KEYS.md](./HOW_TO_GET_API_KEYS.md) file for detailed instructions on obtaining:**
- Google OAuth credentials
- OpenAI API key
- NextAuth secret

### Step 2: Clone the Repository

```bash
git clone https://github.com/yourusername/email-classifier.git
cd IndianAppGuy-intern
```

### Step 3: Set Up Frontend

1. Navigate to frontend folder:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env.local` file:
```bash
cp .env.local.example .env.local
```

4. Edit `.env.local` and add your credentials:
```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-generated-secret-here
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
BACKEND_URL=http://localhost:5000
```

### Step 4: Set Up Backend

1. Open a new terminal and navigate to backend folder:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file (optional):
```bash
cp .env.example .env
```

### Step 5: Run the Application

You need to run both frontend and backend servers:

**Terminal 1 - Backend Server:**
```bash
cd backend
npm run dev
```
The backend will run on `http://localhost:5000`

**Terminal 2 - Frontend Server:**
```bash
cd frontend
npm run dev
```
The frontend will run on `http://localhost:3000`

### Step 6: Use the Application

1. Open `http://localhost:3000` in your browser
2. Click "Login with Google"
3. Enter your OpenAI API key (stored in browser localStorage)
4. Authorize Gmail access
5. Fetch and classify your emails!

## 🎯 Features

- **Google OAuth Authentication** - Secure login with Google
- **Gmail Integration** - Fetch emails directly from Gmail
- **AI Classification** - Categorize emails using GPT-4o:
  - Important
  - Promotions
  - Social
  - Marketing
  - Spam
  - General
- **Local Storage** - Emails and API keys stored in browser
- **Beautiful UI** - Modern interface with Tailwind CSS

## 🛠️ Tech Stack

### Frontend
- **Next.js** - React framework
- **NextAuth.js** - Authentication
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **Axios** - HTTP client

### Backend
- **Express.js** - Node.js framework
- **Google APIs** - Gmail integration
- **OpenAI** - Email classification
- **CORS** - Cross-origin support

## 📝 Available Scripts

### Frontend Scripts
```bash
npm run dev    # Start development server
npm run build  # Build for production
npm run start  # Start production server
```

### Backend Scripts
```bash
npm run dev    # Start development server with nodemon
npm start      # Start production server
```

## 🔧 API Endpoints

### Backend API

- `POST /api/emails/fetch`
  - Fetch emails from Gmail
  - Body: `{ accessToken, maxResults }`

- `POST /api/emails/classify`
  - Classify emails using OpenAI
  - Body: `{ emails, openAIKey }`

- `GET /health`
  - Health check endpoint

## ⚠️ Important Notes

1. **For MagicSlides Team**: Add `theindianappguy@gmail.com` as a test user in your Google Cloud Console

2. **Security**: 
   - Never commit `.env` files
   - OpenAI key is stored in browser localStorage (client-side only)
   - Use different API keys for production

3. **Rate Limits**:
   - OpenAI has rate limits, emails are processed in batches
   - Gmail API has quotas, be mindful of fetch frequency

## 🐛 Troubleshooting

### Frontend won't start
- Check if port 3000 is available
- Verify all dependencies are installed
- Check `.env.local` file exists with correct values

### Backend won't start
- Check if port 5000 is available
- Verify all dependencies are installed
- Check Node.js version (v16+)

### Can't login with Google
- Verify Google OAuth credentials
- Check redirect URIs match exactly
- Ensure you're added as a test user

### Emails not fetching
- Check Gmail API is enabled
- Verify access token is valid
- Check browser console for errors

### Classification fails
- Verify OpenAI API key is valid
- Check if you have credits in OpenAI account
- Look at backend console for error details

## 📄 License

Created for MagicSlides.app Full-Stack Engineer Intern Assignment

## 📞 Contact

For questions about this assignment:
- Email: jobs@magicslides.app
- Twitter: [@theindianappguy](https://twitter.com/theindianappguy)

---

**Built with ❤️ for MagicSlides.app**

# ScriptSmith AI Craft

A powerful AI-powered code analysis and improvement tool built with React, TypeScript, and Gemini AI.

## Features

- **Code Analysis**: Get comprehensive code analysis with quality metrics
- **Code Improvement**: Automatically refactor and improve your code
- **Docstring Generation**: Generate professional documentation
- **Code Rating**: Get quality ratings for complexity, readability, and maintainability

## Tech Stack

- **Frontend**: React, TypeScript, Vite
- **UI**: shadcn-ui, Tailwind CSS
- **Backend**: Supabase Edge Functions
- **AI**: Google Gemini API

## Getting Started

### Prerequisites

- Node.js & npm - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)
- Supabase account
- Google Gemini API key

### Installation

```sh
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to the project directory
cd scriptsmith-ai-craft

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY
```

### Environment Variables

Create a `.env` file with the following:

```env
VITE_SUPABASE_PROJECT_ID=your_project_id
VITE_SUPABASE_PUBLISHABLE_KEY=your_publishable_key
VITE_SUPABASE_URL=your_supabase_url
```

For Supabase Edge Functions, set `GEMINI_API_KEY` in your Supabase project secrets.

### Development

```sh
# Start the development server
npm run dev
```

### Deployment

Deploy to any static hosting service (Vercel, Netlify, etc.) or use Supabase hosting.

## Supabase Edge Functions

The project includes 4 edge functions:
- `analyze-code` - Comprehensive code analysis
- `fix-code` - Code improvement and refactoring
- `generate-docstring` - Documentation generation
- `rate-code` - Code quality rating

Deploy functions:
```sh
supabase functions deploy
```

## License

MIT

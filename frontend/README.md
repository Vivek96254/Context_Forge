# Enterprise Knowledge Assistant - Frontend

A modern Next.js frontend for the Enterprise Knowledge Assistant RAG system.

## Features

- **Document Upload**: Upload PDF documents for processing and indexing
- **Intelligent Query**: Ask questions and get AI-powered answers with citations
- **Source Citations**: View relevant document chunks with confidence scores
- **Performance Metrics**: Monitor system performance and query statistics
- **Responsive Design**: Clean, modern UI built with Tailwind CSS

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Axios

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Backend API running (see `../backend/README.md`)

### Installation

1. Install dependencies:

```bash
npm install
```

2. Configure environment:

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

3. Run the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
frontend/
├── app/                  # Next.js app router pages
│   ├── layout.tsx       # Root layout with navbar
│   ├── page.tsx         # Home page
│   ├── upload/          # Upload page
│   ├── query/           # Query page
│   └── metrics/         # Metrics page
├── components/          # React components
│   ├── Navbar.tsx
│   ├── FileUpload.tsx
│   ├── QueryBox.tsx
│   ├── AnswerCard.tsx
│   ├── SourcesList.tsx
│   └── MetricsDashboard.tsx
├── lib/                 # Utility libraries
│   ├── api.ts          # API client
│   └── config.ts       # Configuration
├── hooks/              # Custom React hooks
│   ├── useQuery.ts
│   └── useUpload.ts
├── types/              # TypeScript types
│   └── api.ts
└── styles/             # Global styles
    └── globals.css
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## API Integration

The frontend communicates with the backend API at the URL specified in `NEXT_PUBLIC_API_BASE_URL`.

### Endpoints Used

- `POST /documents/upload` - Upload PDF documents
- `GET /documents/` - List all documents
- `GET /documents/{id}` - Get document details
- `POST /query/` - Query documents
- `GET /metrics/` - Get system metrics

## Security

- API keys (OpenAI, Cerebras) are never exposed to the frontend
- Only `NEXT_PUBLIC_API_BASE_URL` is used client-side
- All sensitive operations happen on the backend

## Development

The application uses:

- **React Server Components** where possible for better performance
- **Client Components** (marked with `'use client'`) for interactivity
- **TypeScript** for type safety
- **Tailwind CSS** for styling with dark mode support

## Production Build

To create a production build:

```bash
npm run build
npm start
```

The optimized build will be created in `.next/` directory.

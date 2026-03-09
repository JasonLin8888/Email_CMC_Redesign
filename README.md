# Email CMC Redesign

A Gmail-like email web application built with Next.js 14 (App Router), TypeScript, Tailwind CSS, and the [Nylas](https://nylas.com) API.

## Features

- 📥 Inbox, Sent, All Mail, Trash folder navigation
- 🔍 Full-text search with keyboard shortcut (`/`)
- ✍️ Compose emails via Gmail-style modal (`Compose` button)
- 🗂️ Thread view — view entire email conversations
- ✅ Bulk select, delete, archive, and mark-read actions
- 🏷️ Labels sidebar with create support
- 📄 Unread-only filter
- ⚡ Optimistic UI updates with react-hot-toast notifications
- 🔒 HTML email body sanitization via DOMPurify

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Email API**: Nylas v3
- **Icons**: Lucide React
- **Notifications**: React Hot Toast
- **Sanitization**: isomorphic-dompurify

## Getting Started

### 1. Clone & Install

```bash
git clone <repo-url>
cd Email_CMC_Redesign
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env.local` and fill in your Nylas credentials:

```bash
cp .env.example .env.local
```

```env
NYLAS_API_KEY=your_nylas_api_key_here
NYLAS_GRANT_ID=your_nylas_grant_id_here
NYLAS_API_BASE_URL=https://api.nylas.com
```

Get these from your [Nylas Dashboard](https://dashboard.nylas.com).

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — it will redirect to `/mail/all`.

## Project Structure

```
├── app/
│   ├── api/
│   │   ├── messages/          # GET list, GET/DELETE/PATCH by id
│   │   ├── threads/[id]/      # GET thread + messages
│   │   ├── send/              # POST send email
│   │   └── labels/            # GET list, POST create
│   ├── mail/
│   │   ├── [folder]/          # Inbox, Sent, All, Trash
│   │   └── thread/[id]/       # Thread view
│   ├── layout.tsx
│   ├── page.tsx               # Redirects to /mail/all
│   └── globals.css
├── components/
│   ├── MailLayout.tsx          # Root layout with sidebar
│   ├── Sidebar.tsx             # Navigation sidebar
│   ├── NavItem.tsx             # Sidebar nav item
│   ├── LabelsSection.tsx       # Labels list with add
│   ├── SearchBar.tsx           # Search with "/" shortcut
│   ├── MailToolbar.tsx         # Toolbar with pagination
│   ├── MailListContainer.tsx   # Data fetching + state
│   ├── MailList.tsx            # Message list
│   ├── MailRow.tsx             # Individual message row
│   ├── MailListSkeleton.tsx    # Loading skeleton
│   ├── ThreadViewContainer.tsx # Thread data fetching
│   ├── ThreadView.tsx          # Thread message cards
│   └── ComposeModal.tsx        # Compose email modal
└── lib/
    ├── email/
    │   ├── types.ts            # TypeScript interfaces
    │   └── nylasClient.ts      # Nylas API wrapper
    └── utils.ts                # Date formatting helpers
```

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `/` | Focus search bar |
| `Escape` | Close compose modal |

## API Routes

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/messages` | List messages (`folder`, `limit`, `offset`, `query`) |
| GET | `/api/messages/[id]` | Get single message |
| DELETE | `/api/messages/[id]` | Delete message |
| PATCH | `/api/messages/[id]` | Mark read / Archive |
| GET | `/api/threads/[id]` | Get thread + all messages |
| POST | `/api/send` | Send email |
| GET | `/api/labels` | List labels/folders |
| POST | `/api/labels` | Create label |

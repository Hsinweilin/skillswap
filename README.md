# ⚡ SkillSwap Market

A time-bank marketplace where freelancers trade services using time-credits. One hour of work earns you credits — experienced professionals can charge 1-10x per skill.

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)
![React Native](https://img.shields.io/badge/React_Native-20232A?style=flat&logo=react&logoColor=61DAFB)
![Expo](https://img.shields.io/badge/Expo-000020?style=flat&logo=expo&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=flat&logo=express&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=flat&logo=prisma&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-003B57?style=flat&logo=sqlite&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=flat&logo=socket.io&logoColor=white)

## ✨ Features

- **Skill Marketplace** — Browse and discover freelancers by skill, credit rate, and verification status
- **Time Credits** — Earn credits by providing services; spend credits to receive services (1 hour = credits × skill rate)
- **Variable Pricing** — Experienced pros set their own credit rate (1-10x) per skill
- **Credit Escrow** — Credits are held in escrow during active swaps for safe transactions
- **Certificate Verification** — Upload certificates for trust verification and higher trust scores
- **Trust & Reputation** — Trust scores based on verified certificates + review ratings
- **Reputation Badges** — Gold (4.5+), Silver (3.5+), Bronze (2.5+) based on average rating
- **Real-time Messaging** — Socket.io powered instant messaging between users
- **Reviews & Ratings** — 1-5 star reviews after completed swaps
- **5 Free Starter Credits** — New users get 5 credits to start trading immediately

## 🏗️ Architecture

```
skillswap/
├── backend/              # Node.js + Express + TypeScript
│   ├── prisma/           # Prisma schema + migrations + seed
│   ├── src/
│   │   ├── routes/       # Auth, Profile, Skills, Certificates,
│   │   │                 # Discovery, Swaps, Credits, Messages, Reviews
│   │   ├── middleware/   # JWT auth middleware
│   │   └── utils/        # Socket.io handlers
│   └── uploads/          # Certificate file uploads
├── frontend/             # React Native + Expo + TypeScript
│   ├── app/
│   │   ├── (auth)/       # Login & Register screens
│   │   └── (tabs)/       # Discovery, Swaps, Credits, Messages, Profile
│   └── lib/              # API client, Auth context, Theme
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)

### Backend Setup

```bash
cd backend
npm install
npx prisma migrate dev --name init
npx prisma generate
npm run seed          # Seeds sample data (3 users, skills, reviews)
npm run dev           # Starts server on http://localhost:3001
```

### Frontend Setup

```bash
cd frontend
npm install
npx expo start        # Starts Expo dev server
```

Press `i` for iOS simulator, `a` for Android emulator, or `w` for web.

### Test Accounts (from seed data)

| Email | Password | Name |
|---|---|---|
| alice@example.com | password123 | Alice Chen |
| bob@example.com | password123 | Bob Martinez |
| carol@example.com | password123 | Carol Williams |

## 📡 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | ❌ | Register new user (gets 5 free credits) |
| POST | `/api/auth/login` | ❌ | Login, returns JWT |
| GET | `/api/profile/me` | ✅ | Get current user profile |
| PUT | `/api/profile/me` | ✅ | Update profile |
| GET | `/api/profile/:id` | ❌ | Get user by ID |
| GET | `/api/skills` | ✅ | List my skills |
| POST | `/api/skills` | ✅ | Add skill (creditRate 1-10) |
| PUT | `/api/skills/:id` | ✅ | Update skill |
| DELETE | `/api/skills/:id` | ✅ | Delete skill |
| GET | `/api/certificates` | ✅ | List my certificates |
| POST | `/api/certificates` | ✅ | Upload certificate (multipart) |
| PATCH | `/api/certificates/:id/verify` | ❌ | Verify certificate |
| GET | `/api/discovery` | ❌ | Search users (query: skill, minRate, maxRate, verified) |
| GET | `/api/swaps` | ✅ | List my swap requests |
| POST | `/api/swaps` | ✅ | Create swap (escrows credits) |
| PATCH | `/api/swaps/:id/accept` | ✅ | Accept swap request |
| PATCH | `/api/swaps/:id/decline` | ✅ | Decline (refunds escrow) |
| PATCH | `/api/swaps/:id/complete` | ✅ | Complete (releases escrow to provider) |
| GET | `/api/credits/balance` | ✅ | Get credit balance |
| GET | `/api/credits/transactions` | ✅ | Transaction history |
| GET | `/api/messages/conversations` | ✅ | List conversations |
| GET | `/api/messages/:userId` | ✅ | Get messages with user |
| POST | `/api/messages/:userId` | ✅ | Send message |
| GET | `/api/reviews/:userId` | ❌ | Get reviews + badge |
| POST | `/api/reviews` | ✅ | Create review (1-5 stars) |

## 🔌 WebSocket Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `register` | Client → Server | Register socket with userId |
| `sendMessage` | Client → Server | Send message `{ senderId, receiverId, content }` |
| `newMessage` | Server → Client | New message received |
| `messageSent` | Server → Client | Message send confirmation |

## 🎨 Design

- **Primary Color:** Teal `#0D9488`
- **Typography:** System fonts with bold headings
- **Cards:** Rounded corners (16px), subtle borders
- **Icons:** Emoji-based for cross-platform consistency

## 📄 License

MIT

# TrekConnect 🏔️

<div align="center">

[![Next.js](https://img.shields.io/badge/Next.js-15.3-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue?style=for-the-badge&logo=typescript)](https://typescriptlang.org/)
[![Firebase](https://img.shields.io/badge/Firebase-10.12-orange?style=for-the-badge&logo=firebase)](https://firebase.google.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-06B6D4?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)

_A modern, AI-powered travel application connecting trekkers worldwide_

[Demo](#) • [Documentation](./docs/) • [API Reference](#) • [Contributing](#)

</div>

## ✨ Features

### 🗺️ **Explore Destinations**

- Discover breathtaking trekking destinations with rich details
- View high-quality photos from Pexels API integration
- Get real-time weather information for each location
- AI-powered custom route planning with Genkit
- Interactive maps and detailed travel information
- User ratings and reviews for each destination
- Integrated YouTube videos showcasing treks

### 💫 **ConnectSphere**

- Tinder-style swiping interface for finding travel companions
- Match with like-minded travelers based on preferences
- Smooth animations and haptic feedback
- Instant chat access after successful matches

### 💬 **Real-time Chat**

- WebSocket-powered real-time messaging
- Modern chat interface with emoji picker support
- Responsive design optimized for all screen sizes
- Message status indicators and typing notifications
- Media sharing capabilities

### 🤖 **AI-Powered Features**

- Personalized trek recommendations using Google Gemma 3 4B
- AI-driven destination filtering and search
- Custom route generation for unique adventures
- Smart travel suggestions based on your profile

### 📸 **Photo & Story Feed**

- Share your travel experiences with the community
- Upload and organize your trek photos
- Write inspiring stories from your journeys
- Interactive feed with likes and comments

### 👤 **User Profiles**

- Comprehensive profile customization
- Showcase your trekking experience and skills
- Manage your travel wishlist and history
- Privacy controls and account management

## 🛠️ Tech Stack

### **Frontend**

- **Framework**: [Next.js 15.3](https://nextjs.org/) with App Router
- **Language**: [TypeScript 5.8](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS 3.4](https://tailwindcss.com/) + [ShadCN UI](https://ui.shadcn.com/)
- **Animations**: [Framer Motion 12.18](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)

### **Backend & Services**

- **Authentication**: [Firebase Auth](https://firebase.google.com/docs/auth)
- **Database**: [Firebase Realtime Database](https://firebase.google.com/docs/database) + MongoDB
- **AI/ML**: [Google Genkit](https://firebase.google.com/docs/genkit) with Gemma 3 4B
- **External APIs**: Pexels, YouTube Data API v3

### **Development**

- **Build Tool**: [Turbopack](https://turbo.build/)
- **Linting**: ESLint with Next.js config
- **Type Checking**: TypeScript strict mode
- **Package Manager**: npm/yarn

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18.0.0 or later
- **npm** 9.0.0 or later (or **yarn** 1.22.0+)
- **Git** for version control

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/XploitMonk0x01/TrekConnect.git
   cd TrekConnect
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment Setup**

   ```bash
   # Copy the example environment file
   cp .env.example .env.local

   # Edit the .env.local file with your API keys
   ```

4. **Start the development servers**

   **Option A: Automatic (Recommended)**

   - Open the project in VS Code
   - Development and AI servers will start automatically

   **Option B: Manual**

   ```bash
   # Terminal 1: Next.js development server
   npm run dev

   # Terminal 2: Genkit AI server (new terminal)
   npm run genkit:dev
   ```

5. **Access the application**
   - Main app: [http://localhost:9002](http://localhost:9002)
   - Genkit UI: Check terminal output for Genkit URL

## 📁 Project Structure

```
TrekConnect/
├── 📂 src/
│   ├── 📂 app/                 # Next.js App Router pages
│   │   ├── 📂 admin/           # Admin dashboard for destinations
│   │   ├── 📂 auth/            # Authentication pages
│   │   ├── 📂 chat/            # Real-time chat interface
│   │   ├── 📂 connect/         # User matching (ConnectSphere)
│   │   ├── 📂 explore/         # Destination discovery
│   │   ├── 📂 feed/            # Social feed
│   │   ├── 📂 profile/         # User profiles
│   │   └── 📂 api/             # API routes
│   ├── 📂 components/          # Reusable React components
│   │   ├── 📂 ui/              # ShadCN UI components
│   │   └── 📂 layout/          # Layout components
│   ├── 📂 contexts/            # React Context providers
│   ├── 📂 ai/                  # Genkit AI flows and functions
│   ├── 📂 lib/                 # Core utilities and configuration
│   ├── 📂 services/            # External API integrations
│   └── 📂 hooks/               # Custom React hooks
├── 📂 public/                  # Static assets
└── 📂 .vscode/                 # VS Code configuration
```

## 🔧 Available Scripts

| Command                | Description                             |
| ---------------------- | --------------------------------------- |
| `npm run dev`          | Start development server with Turbopack |
| `npm run genkit:dev`   | Start Genkit AI development server      |
| `npm run genkit:watch` | Start Genkit with file watching         |
| `npm run build`        | Build production application            |
| `npm run start`        | Start production server                 |
| `npm run lint`         | Run ESLint                              |
| `npm run typecheck`    | Run TypeScript type checking            |

## 🔑 Environment Variables

Create a `.env.local` file in the root directory:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_DATABASE_URL=your_database_url

# MongoDB
MONGODB_URI=your_mongodb_connection_string

# Google AI API (Gemma 3 4B)
GEMINI_API_KEY=your_google_api_key
GOOGLE_API_KEY=your_google_api_key

# Admin Authentication
ADMIN_USERNAME=your_admin_username
ADMIN_PASSWORD=your_admin_password
ADMIN_JWT_SECRET=your_jwt_secret

# External APIs
PEXELS_API_KEY=your_pexels_key
YOUTUBE_API_KEY=your_youtube_key
```

## 🤖 AI Features

TrekConnect leverages Google's Genkit framework with Gemma 3 4B for powerful AI capabilities:

- **Destination Recommendations**: Personalized trek suggestions based on preferences
- **Route Planning**: Custom trek routes generated using AI
- **Content Filtering**: AI-powered search and destination filtering
- **Travel Suggestions**: Smart recommendations based on user history and preferences

## 📱 Responsive Design

- **Mobile First**: Optimized for mobile devices
- **Tablet Support**: Enhanced experience on tablets
- **Desktop**: Full-featured desktop interface
- **Large Screens**: Specialized layouts for large displays

## 🔒 Security Features

- **Firebase Authentication**: Secure user authentication
- **Protected Routes**: Route-level access control
- **Input Validation**: Comprehensive form validation
- **XSS Protection**: Built-in security measures

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Configure environment variables
4. Deploy automatically

### Firebase Hosting

```bash
npm run build
firebase deploy
```

## 📝 Contributing

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run tests: `npm run typecheck && npm run lint`
5. Commit: `git commit -m 'Add amazing feature'`
6. Push: `git push origin feature/amazing-feature`
7. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js Team](https://nextjs.org/) for the amazing framework
- [Firebase](https://firebase.google.com/) for backend services
- [Google Genkit](https://firebase.google.com/docs/genkit) for AI capabilities
- [ShadCN UI](https://ui.shadcn.com/) for beautiful components
- [Pexels](https://pexels.com/) for high-quality images

## 📞 Support

- 📧 Email: support@trekconnect.com
- 💬 Discord: [Join our community](https://discord.gg/trekconnect)
- 🐛 Issues: [GitHub Issues](https://github.com/XploitMonk0x01/TrekConnect/issues)

---

<div align="center">
  <p>Made with ❤️ by the TrekConnect Team</p>
  <p>Happy Trekking! 🏔️</p>
</div>

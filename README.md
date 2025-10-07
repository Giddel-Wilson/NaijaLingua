# NaijaLingua 🇳🇬

**Preserving Nigerian Heritage Through Language**

NaijaLingua is a comprehensive e-learning platform dedicated to teaching and preserving indigenous Nigerian languages. Built with modern web technologies, it offers structured multimedia lessons, interactive assessments, and official certifications for languages like Yoruba, Igbo, Hausa, Efik, Tiv, and more.

## 🌟 Features

### 👥 Multi-Role System
- **Students**: Register, enroll in courses, track progress, earn certificates
- **Tutors**: Create and manage courses, lessons, and assessments
- **Admins**: User management, content moderation, platform oversight

### 📚 Rich Learning Experience
- **Interactive Lessons**: Text, audio, and visual content
- **Native Pronunciation**: Authentic audio from native speakers
- **Cultural Context**: Learn language with cultural insights
- **Progressive Assessments**: Quizzes and practical exercises
- **Official Certificates**: Downloadable completion certificates

### 🎯 Language Support
- Yoruba
- Igbo
- Hausa
- Efik
- Tiv
- Fulfulde
- Kanuri
- Ibibio
- Edo
- Ijaw

## Tech Stack

- **SvelteKit** - Modern framework with SSR and optimized builds
- **TypeScript** - Type safety and better DX
- **Prisma** - Type-safe database ORM
- **MongoDB Atlas** - Cloud-hosted NoSQL database

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- npm or pnpm or bun

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/naijalingua.git
   cd naijalingua
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your database URL and secrets:
   ```env
   DATABASE_URL="your-mongodb-connection-string"
   JWT_SECRET="your-super-secret-jwt-key"
   AUTH_SECRET="your-auth-secret"
   ```

4. **Set up the database**
   ```bash
   # Generate Prisma client
   npm run db:generate
   
   # Push schema to database
   npm run db:push
   
   # Optional: Seed with sample data
   npm run db:seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

Visit `http://localhost:5173` to see the application.

## 📁 Project Structure

```
src/
├── routes/
│   ├── auth/              # Authentication routes
│   │   ├── login/
│   │   ├── register/
│   │   └── logout/
│   ├── courses/           # Course browsing and details
│   ├── dashboard/         # User dashboard
│   │   ├── courses/       # User's enrolled courses
│   │   ├── certificates/  # User's certificates
│   │   └── settings/      # Account settings
│   ├── admin/             # Admin panel (role-restricted)
│   └── api/               # API endpoints
├── lib/
│   ├── components/        # Reusable Svelte components
│   │   ├── Header.svelte
│   │   ├── Footer.svelte
│   │   └── ...
│   ├── db.ts             # Prisma client
│   ├── auth.ts           # Authentication utilities
│   ├── validators.ts     # Zod schemas
│   └── utils.ts          # Helper functions
├── app.css               # Global styles
├── app.html              # App shell
└── app.d.ts              # Type definitions

prisma/
├── schema.prisma         # Database schema
└── seed.ts              # Database seeding script
```

## 🎨 Design System

### Color Palette
- **Primary**: `#006400` (Deep Green)
- **Accent**: `#ff8c00` (Burnt Orange)
- **Light**: `#f5f5dc` (Cream)
- **Neutral**: `#fef6f0` (Light Earth)
- **Gold**: `#c5a76d` (Gold highlights)

### Typography
- **Headings**: DM Serif Display
- **Body**: Inter / Poppins

### Components
Pre-built components with Nigerian cultural elements and mobile-first responsive design.

## 📊 Database Schema

### Key Models
- **Users**: Authentication and role management
- **Courses**: Language courses with metadata
- **Lessons**: Individual learning units
- **Quizzes**: Assessments and exercises
- **Enrollments**: User-course relationships
- **Certificates**: Achievement tracking

## 🔐 Authentication & Authorization

### User Roles
- **Student**: Basic learning access
- **Tutor**: Content creation capabilities (requires admin approval)
- **Admin**: Full platform management (cannot self-register)

### Security Features
- JWT-based authentication
- Secure HTTP-only cookies
- Password hashing with bcrypt
- Role-based access control
- Input validation with Zod

## 🚀 Deployment

### Environment Setup
The application is designed for deployment on Vercel with MongoDB Atlas:

1. **Database**: Set up a MongoDB Atlas database
2. **Environment Variables**: Configure in your deployment platform
3. **Build**: The app builds automatically for production

### Deployment Steps
1. Push your code to GitHub
2. Connect repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy automatically on push to main branch

## 🧪 Testing

```bash
# Run unit tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run type checking
npm run check
```

## 🤝 Contributing

We welcome contributions to NaijaLingua! Here's how to get started:

### Development Workflow
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and test thoroughly
4. Commit with descriptive messages: `git commit -m 'Add amazing feature'`
5. Push to your branch: `git push origin feature/amazing-feature`
6. Open a Pull Request

### Contribution Guidelines
- Follow the existing code style and conventions
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting
- Respect the cultural sensitivity of the content

### Areas for Contribution
- Additional Nigerian languages
- Audio content and pronunciation guides
- Cultural context and learning materials
- UI/UX improvements
- Mobile app development
- API integrations

## 📚 Documentation

### For Developers
- [API Documentation](./docs/api.md)
- [Component Guide](./docs/components.md)
- [Database Schema](./docs/database.md)

### For Content Creators
- [Course Creation Guide](./docs/course-creation.md)
- [Audio Guidelines](./docs/audio-guidelines.md)
- [Cultural Content Standards](./docs/cultural-standards.md)

## 🌍 Community

### Get Involved
- Join our Discord community
- Follow us on social media
- Participate in language exchange sessions
- Share your learning journey

### Support
- 📧 Email: support@naijalingua.com
- 💬 Discord: [NaijaLingua Community](discord-link)
- 🐛 Issues: [GitHub Issues](github-issues-link)

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Nigerian language communities and native speakers
- Cultural institutions preserving Nigerian heritage
- Open source contributors and maintainers
- Beta testers and early adopters

## 🔮 Roadmap

### Phase 1 (Current)
- ✅ Core platform functionality
- ✅ User authentication and roles
- ✅ Course creation and management
- ✅ Basic assessment system

### Phase 2 (Next)
- 🔄 Mobile applications (iOS/Android)
- 🔄 Advanced pronunciation analysis
- 🔄 Community forums and chat
- 🔄 Live tutoring sessions

### Phase 3 (Future)
- 📋 Gamification and achievements
- 📋 AI-powered learning recommendations
- 📋 Augmented reality language practice
- 📋 Integration with Nigerian educational institutions

---

**NaijaLingua** - *Preserving Nigerian Heritage Through Language* 🇳🇬

Made with ❤️ for the Nigerian diaspora and language enthusiasts worldwide.

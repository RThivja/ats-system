# 🎯 Applicant Tracking System (ATS)

A modern, full-stack Applicant Tracking System built with React, TypeScript, Node.js, and PostgreSQL.

## ✨ Features

### For Recruiters:
- 📊 **Dashboard** - View statistics and pending applications
- 📝 **Post Jobs** - Create job listings with detailed requirements
- 👥 **Manage Applications** - Review, filter, and update application statuses
- 🔍 **Advanced Filtering** - Filter by status, match score, experience, skills
- 📄 **View CVs** - Access applicant resumes directly
- 🎯 **Smart Matching** - AI-powered candidate matching based on skills and experience

### For Applicants:
- 🔍 **Browse Jobs** - Search and filter available positions
- 📝 **Easy Apply** - Quick application with auto-filled profile data
- 📄 **Profile Management** - Upload CV, manage skills and experience
- 📊 **Track Applications** - Monitor application status in real-time
- 🎯 **Match Scores** - See how well you match job requirements

## 🚀 Tech Stack

### Frontend:
- **React 18** with TypeScript
- **Vite** for fast development
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Axios** for API calls

### Backend:
- **Node.js** with Express
- **TypeScript** for type safety
- **Prisma ORM** for database management
- **PostgreSQL** database
- **JWT** authentication
- **Multer** for file uploads

## 📦 Installation

### Prerequisites:
- Node.js 18+ 
- PostgreSQL database
- npm or yarn

### Backend Setup:

```bash
cd backend
npm install
```

Create `.env` file:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/ats_db"
JWT_SECRET="your-secret-key"
FRONTEND_URL="http://localhost:5173"
PORT=5000
```

Run migrations:
```bash
npx prisma generate
npx prisma db push
```

Start server:
```bash
npm run dev
```

### Frontend Setup:

```bash
cd frontend
npm install
```

Create `.env` file:
```env
VITE_API_URL=http://localhost:5000/api
```

Start development server:
```bash
npm run dev
```

## 🌐 Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.

## 📝 Usage

### As a Recruiter:
1. Register with role "Recruiter"
2. Complete your company profile
3. Post job listings
4. Review applications
5. Update candidate statuses

### As an Applicant:
1. Register with role "Applicant"
2. Complete your profile and upload CV
3. Browse available jobs
4. Apply with one click
5. Track your applications

## 🔐 Security

- JWT-based authentication
- Password hashing with bcrypt
- CORS protection
- Input validation
- SQL injection prevention via Prisma

## 📊 Database Schema

- **Users** - Authentication and basic info
- **ApplicantProfile** - Skills, experience, education, CV
- **RecruiterProfile** - Company information
- **Jobs** - Job listings with requirements
- **Applications** - Job applications with status tracking

## 🎨 UI/UX Features

- Responsive design for all screen sizes
- Active navigation indicators
- Toast notifications instead of alerts
- Loading states and animations
- Beautiful gradient themes
- Smooth transitions

## 🤝 Contributing

This is an assignment project. Not accepting contributions.

## 📄 License

MIT License

## 👨‍💻 Author

Built as part of a web development assignment.

---

**Live Demo:** [Coming Soon]

**Documentation:** See [DEPLOYMENT.md](DEPLOYMENT.md) for deployment guide.

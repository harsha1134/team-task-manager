🚀 Team Task Manager - Full Stack Project Management Platform

•	[Version](https://img.shields.io/badge/version-1.0.0-blue)
•	[React](https://img.shields.io/badge/React-18.2.0-61dafb)
•	[Supabase](https://img.shields.io/badge/Supabase-Latest-3ecf8e)
•	[Status](https://img.shields.io/badge/status-Production_Ready-brightgreen)

📌 Project Overview
"Team Task Manager" is a comprehensive, enterprise-grade project management platform built for modern teams. It enables efficient task allocation, real-time progress tracking, role-based access control, and collaborative project management.
🎯 Key Features
1.	Authentication - Secure email/password authentication with email verification 
2.	Role-Based Access - Admin and Member roles with granular permissions 
3.	Dashboard Analytics - Real-time charts, task distribution, and progress tracking 
4.	Project Management - Create, edit, delete projects with team member assignment 
5.	Task Management - Assign tasks, track status, priority levels, due dates 
6.	Team Leaders - Assign admin members as project leaders 
7.	Email Notifications - Verification emails and password reset functionality 
8.	Responsive Design - Fully responsive across all devices 
🏗️ Technical Architecture

1. Frontend
-React 18 - Modern UI library with hooks
- React Router v6 - Client-side routing
- Framer Motion - Smooth animations
- Recharts - Data visualization
- Tailwind CSS - Styling (cinematic theme)
- React Icons - Icon library

2. Backend & Database
- Supabase - Backend-as-a-Service
- PostgreSQL - Relational database
- Row Level Security (RLS) - Data protection
- Supabase Auth - Authentication & email verification

3. Deployment
- Railway - Cloud hosting (auto-deploys from GitHub)

💻 Installation & Setup
1. Prerequisites
-	Node.js (v18 or higher)
-	npm or yarn
-	Supabase account (free tier)

2. Local Development Setup
1.	Clone the repository
git clone https://github.com/harsha1134/team-task-manager.git
cd team-task-manager/frontend
2.	Install dependencies
npm install

3. Create .env file
echo "REACT_APP_SUPABASE_URL=your_supabase_url" >> .env
echo "REACT_APP_SUPABASE_ANON_KEY=your_anon_key" >> .env

4. Start development server
npm start

# Sunday School Dashboard

A comprehensive web application for managing Sunday School attendance, member information, and assignment tracking for LDS Church Sunday School classes.

## Features

### 📊 Beautiful Dashboard
- Real-time statistics and analytics
- Interactive charts showing:
  - Men vs Women attendance rates
  - Overall attendance distribution
  - Assignment reading completion rates
  - Temple Prep and Mission Prep attendance
- Customizable date ranges (last month, 3 months, 6 months, year)

### 👥 Member Management
- Add, edit, and delete members
- Upload PDF files to bulk import members
- Categorize members (Regular, Temple Prep, Mission Prep)
- Track gender, email, and phone information
- Delete all members option for new term setup

### ✅ Attendance Tracking
- Track attendance for first and third Sundays
- Record assignment reading completion
- Separate views for Regular, Temple Prep, and Mission Prep classes
- Quick date selection for past and upcoming Sundays
- Bulk save functionality
- **Export to Google Sheets** - Share reports instantly!

### 🔐 Simple Authentication
- Secure login system
- JWT-based authentication
- Password hashing with bcrypt

## Tech Stack

### Frontend
- **React** - UI framework
- **Vite** - Build tool and dev server
- **Recharts** - Beautiful, responsive charts
- **Axios** - HTTP client
- **date-fns** - Date manipulation

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **PostgreSQL** - Database
- **Prisma** - Modern ORM for PostgreSQL
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **Multer** - File upload handling
- **pdf-parse** - PDF parsing
- **googleapis** - Google Sheets integration

## Prerequisites

Before you begin, ensure you have installed:
- [Node.js](https://nodejs.org/) (v18 or higher)
- [PostgreSQL](https://www.postgresql.org/download/) (v14 or higher)

## Installation

### 1. Clone the repository or navigate to the project directory

```bash
cd sunday-school-dashboard
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

### 4. Configure Environment Variables

Create a `.env` file in the `backend` directory:

```bash
cd ../backend
cp .env.example .env
```

Edit the `.env` file with your settings:

```env
PORT=5000
DATABASE_URL="postgresql://username:password@localhost:5432/sunday_school?schema=public"
JWT_SECRET=your_secure_random_secret_key_change_this
GEMINI_API_KEY=your_gemini_api_key
```

**PostgreSQL Connection String Format:**
```
postgresql://PostgreSQL

Make sure PostgreSQL is running on your system:

**Windows:**
```bash
# PostgreSQL should be running as a service
# Or check services: services.msc -> PostgreSQL
```

**macOS (with Homebrew):**
```bash
brew services start postgresql@14
```

**Linux:**
```bash
sudo systemctl start postgresqlabase
- Run migrations to create all tables
- Generate Prisma Client

## Running the Application

### 1. Start MongoDB

Make sure MongoDB is running on your system:

**Windows:**
```bash
# MongoDB should be running as a service
# Or start manually:
mongod
```

**macOS (with Homebrew):**
```bash
brew services start mongodb-community
```

**Linux:**
```bash
sudo systemctl start mongod
```

### 2. Start the Backend Server

In the `backend` directory:

```bash
npm run dev
```

The backend will run on `http://localhost:5000`

### 3. Start the Frontend Development Server

Open a new terminal and navigate to the `frontend` directory:

```bash
cd frontend
npm run dev
```

The frontend will run on `http://localhost:3000`

### 4. Create Your First User

Open your browser and navigate to `http://localhost:3000`

You'll need to register a user first. You can do this by making a POST request to the registration endpoint:

**Using curl:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"bestorganizationever"}'
```

**Or using a tool like Postman:**
- URL: `http://localhost:5000/api/auth/register`
- Method: POST
- Body (JSON):
```json
{
  "username": "admin",
  "password": "bestorganizationever"
}
```

Then login with these credentials at `http://localhost:3000`

## Usage Guide

### Adding Members

1. Navigate to the **Members** tab
2. Click **+ Add Member** button
3. Fill in member details (name, gender, category)
4. Click **Add Member**

### Importing Members from PDF

1. Navigate to the **Members** tab
2. Click **📄 Upload PDF**
3. Select a PDF file with member information

**Expected PDF Format:**
```
Name, Gender, Category
John Smith, Male, Regular
Jane Doe, Female, Temple Prep
Bob Johnson, Male, Mission Prep
```

Each line should contain: Name, Gender (Male/Female), Category (Regular/Temple Prep/Mission Prep)

### Recording Attendance

1. Navigate to the **Attendance** tab
2. Select the Sunday date from the dropdown
3. Check boxes for:
   - **Present** - Member attended class
   - **Read Assignment** - Member completed the reading
4. Click **💾 Save Attendance** to save all records

### Viewing Analytics

1. Navigate to the **Dashboard** tab
2. Select a time period (Last Month, 3 Months, 6 Months, Year)
3. View statistics and charts:
   - Total members breakdown
   - Attendance rates by gender
   - Assignment completion rates
4. Click **Export to Google Sheets** to share reports (if configured)

### Exporting to Google Sheets

1. Set up Google Sheets integration (see [GOOGLE_SHEETS_SETUP.md](GOOGLE_SHEETS_SETUP.md))
2. From **Dashboard** or **Attendance** tab, click **📊 Export to Google Sheets**
3. A new spreadsheet opens with formatted data and summary statistics
4. Share the link with your team!
   - Temple Prep and Mission Prep attendance

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Members (Authenticated)
- `GET /api/members` - Get all members
- `GET /api/members/:id` - Get single member
- `POST /api/members` - Create member
- `PUT /api/members/:id` - Update member
- `DELETE /api/members/:id` - Delete member
- `DELETE /api/members` - Delete all members
- `POST /api/members/upload-pdf` - Upload PDF with member

### Export (Authenticated)
- `GET /api/export/status` - Check if Google Sheets is configured
- `POST /api/export/export-date` - Export specific date to Google Sheets
- `POST /api/export/export-all` - Export date range to Google Sheetss

### Attendance (Authenticated)
- `GET /api/attendance` - Get all attendance records
- `GET /api/attendance/date/:date` - Get attendance by date
- `POST /api/attendance` - Create/update attendance record
- `POST /api/attendance/bulk` - Bulk create/update attendance
- `GET /api/attendance/stats` - Get statistics
- `DELETE /api/attendance/:id` - Delete attendance record

## Project Structure

```
sunday-school-dashboard/
├── backend/
│   ├── models/
│   │   ├── User.js
│   │   ├── Member.js
│   │   └── Attendance.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── members.js
│   │   └── attendance.js
│   ├── middleware/
│   │   └── auth.js
│   ├── uploads/
│   ├── server.js
│   ├── package.json
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Login.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── MemberManagement.jsx
│   │   │   └── AttendanceTracking.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
└── README.md
```

## Database Schema

### User
- `id` - Integer, primary key, auto-increment
- `username` - String, unique
- `password` - String, hashed
- `createdAt`, `updatedAt` - Timestamps

### Member
- `id` - Integer, primary key, auto-increment
- `name` - String, required
- `gender` - Enum: 'MALE', 'FEMALE'
- `category` - Enum: 'REGULAR', 'TEMPLE_PREP', 'MISSION_PREP'
- `email` - String, optional
- `phone` - String, optional
- `createdAt`, `updatedAt` - Timestamps

### Attendance
- `id` - Integer, primary key, auto-increment
- `memberId` - Foreign key to Member (CASCADE delete)
- `date` - Date, required
- `present` - Boolean, default false
- `readAssignment` - Boolean, default false
- `createdAt`, `updatedAt` - Timestamps
- Unique constraint on (memberId, date)

## Troubleshooting

### PostgreSQL Connection Issues
- Ensure PostgreSQL is running
- Check the `DATABASE_URL` in your `.env` file
- Verify PostgreSQL is accessible on the specified port (default: 5432)
- Check username and password are correct
- Ensure the database exists (Prisma will create tables, not the database itself)

### Creating PostgreSQL Database Manually
If the database doesn't exist:
```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE sunday_school;

# Exit
\q
```

### Port Already in Use
- Change the `PORT` in backend `.env` file
- Or kill the process using the port:
  ```bash
  # Windows
  netstat -ano | findstr :5000
  taskkill /PID <PID> /F
  
  # macOS/Linux
  lsof -ti:5000 | xargs kill
  ```

### PDF Upload Not Working
- Ensure the `uploads/` directory exists in the backend folder
- Check file permissions
- Verify PDF format matches expected structure

## Building for Production

### Backend
```bash
cd backend
npm start
```

### Frontend
```bash
cd frontend
npm run build
npm run preview
```

The build will be in `frontend/dist/` directory. You can serve this with any static file server.

## Deploying to Vercel

### Prerequisites
1. Create a [Vercel account](https://vercel.com/signup)
2. Create a Vercel Postgres database (or use [Neon](https://neon.tech/), [Supabase](https://supabase.com/), or [Railway](https://railway.app/))
3. Install Vercel CLI: `npm install -g vercel`

### Step 1: Setup PostgreSQL Database

**Option A: Vercel Postgres (Recommended for Vercel deployments)**

1. Go to your [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Storage" → "Create Database" → "Postgres"
3. Name your database (e.g., "sunday-school-db")
4. Select a region close to your users
5. Copy the `DATABASE_URL` connection string

**Option B: Neon (Free Tier Available)**

1. Go to [Neon](https://neon.tech/) and create account
2. Create a new project
3. Copy the connection string (should look like: `postgresql://user:pass@ep-xxx.region.aws.neon.tech/dbname`)

**Option C: Supabase (Free Tier Available)**

1. Go to [Supabase](https://supabase.com/) and create account
2. Create a new project
3. Go to Settings → Database → Connection string → URI
4. Copy the connection string

### Step 2: Prepare Your Project

1. Make sure all changes are committed to Git:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. Push to GitHub (optional but recommended):
   ```bash
   git remote add origin https://github.com/yourusername/sunday-school-dashboard.git
   git push -u origin main
   ```

### Step 3: Deploy to Vercel

**Option A: Using Vercel Dashboard (Easiest)**

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New" → "Project"
3. Import your Git repository (or drag & drop your folder)
4. Configure your project:
   - **Framework Preset**: Other
   - **Root Directory**: ./
   - **Build Command**: Leave default
   - **Output Directory**: Leave default
5. Add Environment Variables:
   - Click "Environment Variables"
   - Add these variables:
     ```
     DATABASE_URL=postgresql://user:pass@host:5432/dbname
     JWT_SECRET=your_super_secure_random_string_here_change_this
     ```
6. Click "Deploy"

**Important**: After deployment, you need to run migrations:
```bash
# Connect to your deployed project
vercel env pull

# Run migrations on your production database
npm run prisma:migrate
```

**Option B: Using Vercel CLI**

1. Login to Vercel:
   ```bash
   vercel login
   ```

2. Deploy from the project root:
   ```bash
   vercel
   ```

3. Follow the promDATABASE_URL
   # Paste your PostgreSQL connection string
   
   vercel env add JWT_SECRET
   # Enter a secure random string
   ```

5. Deploy to production:
   ```bash
   vercel --prod
   ```

6. Run database migrations:
   ```bash
   # Pull environment variables
   vercel env pull .env.production
   
   # Run migrations against production database
   DATABASE_URL="your_production_database_url" npm run prisma:migrated MONGODB_URI
   # Paste your MongoDB Atlas connection string
   
   vercel env add JWT_SECRET
   # Enter a secure random string
   ```

5. Deploy to production:
   ```bash
   vercel --prod
   ```

### Step 4: Create Your First User

Once deployed, create an admin user using the API:

```bash
curl -X POST https://your-app-name.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"yourpassword"}'
```

Or using PowerShell:
```powershell
Invoke-RestMethod -Uri "https://your-app-name.vercel.app/api/auth/register" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"username":"admin","password":"yourpassword"}'
```

### Step 5: Access Your App

Visit your deployed app at: `https://your-app-name.vercel.app`
Database Connection Pooling**: Serverless functions can create many database connections. Use Prisma's connection pooling:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  directUrl = env("DIRECT_URL") // Optional: for migrations
}
```

For Vercel Postgres or Neon, they handle connection pooling automatically
### Important Notes for Vercel Deployment

⚠️ **File Uploads Limitation**: Vercel's serverless functions have a 4.5MB request limit. For PDF uploads:
- Keep PDF files under 4MB
- For larger files, consider using a service like AWS S3 or Cloudinary

⚠️ **Serverless Function Timeout**: Free tier has 10-second timeout. Upgrade to Pro if you need longer execution times.

⚠️ **MongoDB Atlas**: Ensure your IP whitelist includes `0.0.0.0/0` for Vercel's dynamic IPs.

### Updating Your Deployment

After making changes:

```bash
git add .
git commit -m "Your changes"
git push origin main
```

VePostgreSQL Connection Errors:**
- Verify connection string is correct and includes SSL parameters
- For Neon/Supabase: ensure SSL mode is set (`?sslmode=require`)
- Check database allows external connections
- Verify database user has proper permissions

**Build Failures:**
- Check build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Verify Node.js version compatibility
- Make sure Prisma generates client during build (`postinstall` script)

**API Routes Not Working:**
- Check `vercel.json` configuration
- Ensure environment variables are set
- Check function logs in Vercel dashboard

**Database Migration Issues:**
- Run migrations locally first to test
- Use `prisma db push` for quick prototyping (skips migration history)
- For production, always use `prisma migrate`
Or manage them in the Vercel Dashboard under Project Settings → Environment Variables.

### Troubleshooting Vercel Deployment

**MongoDB Connection Errors:**
- Verify connection string is correct
- Check IP whitelist includes 0.0.0.0/0
- Ensure database user has read/write permissions

**Build Failures:**
- Check build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Verify Node.js version compatibility
Add PostgreSQL addon or use external PostgreSQL (Neon/Supabase)
- Add CORS configuration for your frontend domain
- Run Prisma migrations after deployment

### Deploy Everything on Railway (Recommended Alternative)

1. Create account at [Railway.app](https://railway.app)
2. Create new project
3. Add PostgreSQL database service
4. Deploy backend service:
   - Connect to GitHub repo
   - Set root directory to `backend`
   - Railway will auto-detect and deploy
5. Deploy frontend service:
   - Add new service from same repo
   - Set root directory to `frontend`
   - Set build command: `npm run build`
   - Set start command: `npx serve dist`
6. Connect services using environment variables
7. Railway automatically runs Prisma migrations!
**Frontend (Vercel):**
- Deploy only the `frontend` folder
- Set `VITE_API_URL` to your backend URL

**Backend (Railway, Render, or Heroku):**
- Deploy the `backend` folder separately
- Use their MongoDB addon or connect to MongoDB Atlas
- Add CORS configuration for your frontend domain

### Deploy Everything on Railway

1. Create account at [Railway.app](https://railway.app)
2. Create new project
3. Add MongoDB service
4.✅ Export to Google Sheets (DONE!)
- Email notifications for low attendance
- Export reports to PDF/Excel
- Multiple user roles (Admin, Teacher, Viewer)
- Lesson planning integration
- Automatic reminder system
- Mobile app (React Native)
- Progressive Web App (PWA) support
- Offline modelways use HTTPS
3. **Environment Variables** - Never commit `.env` files to version control
4. **Password Policy** - Consider implementing password strength requirements
5. **Rate Limiting** - Add rate limiting to prevent brute force attacks

## Future Enhancements

- Email notifications for low attendance
- Export reports to PDF/Excel
- Multiple user roles (Admin, Teacher, Viewer)
- Lesson planning integration
- Automatic reminder system
- Mobile responsive improvements
- Progressive Web App (PWA) support

## Support

For issues or questions, please create an issue in the project repository.

## License

MIT License - feel free to use this project for your Sunday School needs!

---

**Made with ❤️ for LDS Sunday School teachers and administrators**

# Authentication & Features Guide

## Authentication

The Sunday School Dashboard now includes authentication to protect sensitive data while keeping the dashboard publicly viewable.

### Public Access
- **Dashboard Tab** - Publicly accessible without login
  - View statistics, charts, and resources
  - See missing classes table with filters
  - No login required

### Protected Access (Login Required)
- **Members Tab** 🔒 - Manage member information
- **Temple/Mission Tab** 🔒 - Manage preparation classes
- **Attendance Tab** 🔒 - Record and track attendance

### Admin Credentials

**Username:** `sundayschool`  
**Password:** `bestorgever`

### How to Use

1. **Public Viewing**
   - Open the dashboard - no login needed
   - View all statistics and charts
   - Use the missing classes table and filters

2. **Protected Actions**
   - Click on Members, Temple/Mission, or Attendance tabs
   - You'll be prompted to log in
   - Enter the admin credentials above
   - Access all management features

3. **Logging Out**
   - Click the "Logout" button in the header (top right)
   - You'll return to public view mode

## Missing Classes Table - Filter Features

The "Members Missing Regular Classes" table now includes powerful filtering options:

### Gender Filter
- **All** - Show all members
- **Male** - Show only male members
- **Female** - Show only female members

### Risk Level Filter
- **All** - Show all members who missed classes
- **⚠️ Yellow (Half)** - Show only members who missed exactly half of classes
- **🔴 Red (More than half)** - Show only members who missed more than half of classes

### Table Features
- Displays only regular Sunday School members (excludes Temple/Mission Prep)
- Automatically calculates based on classes held up to today
- Independent of the "Time Period" dropdown
- Color-coded rows for easy visual identification:
  - **Yellow background** - Missed exactly 50% of classes
  - **Red background** - Missed more than 50% of classes
- Shows detailed statistics:
  - Number of classes missed
  - Number of classes attended
  - Percentage of missed classes

### Example Use Cases

1. **Check high-risk members**
   - Set Risk Level to "Red"
   - See all members who missed most classes

2. **Follow up with women who missed classes**
   - Set Gender to "Female"
   - Set Risk Level to "All"
   - See all women who need attention

3. **Review members at exactly 50%**
   - Set Risk Level to "Yellow"
   - Identify members on the edge who need encouragement

## Security Notes

- Admin password is hashed in the database using bcrypt
- JWT tokens expire after 24 hours
- Protected routes require valid authentication token
- Dashboard remains publicly accessible for sharing statistics

## Initial Setup

The admin user is automatically created when you run the seed script:

```bash
cd backend
npm run seed
```

If the user already exists, the script will skip creation.

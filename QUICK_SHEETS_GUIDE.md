# 📊 Google Sheets Export - Quick Start

## What's New?

Your Sunday School Dashboard can now export attendance data directly to Google Sheets with one click!

## Quick Setup (5 minutes)

### 1. Enable Google Sheets API
- Go to [Google Cloud Console](https://console.cloud.google.com/)
- Create new project: "Sunday School Dashboard"
- Enable "Google Sheets API"

### 2. Create Service Account
- Go to **Credentials** → **Create Credentials** → **Service Account**
- Name: `sunday-school-exporter`
- Download JSON key file

### 3. Add to Your App
Open `backend/.env` and add:
```env
GOOGLE_SERVICE_ACCOUNT_JSON={"type":"service_account",...paste entire JSON...}
```

### 4. Restart Backend
```bash
# Stop the server (Ctrl+C)
npm run dev
```

### 5. Export!
- Go to **Attendance** or **Dashboard** tab
- Click **📊 Export to Google Sheets**
- Spreadsheet opens automatically! ✨

## Features

✅ One-click export  
✅ Auto-formatted spreadsheets  
✅ Summary statistics included  
✅ Share with your team instantly  
✅ Works from Dashboard and Attendance tabs

## What Gets Exported

**From Attendance Tab:**
- Current date's attendance
- All members with Present/Read Assignment status
- Summary stats

**From Dashboard:**
- All attendance data for selected date range
- Grouped by date
- Complete member details
- Attendance and reading rates

## Buttons Location

### Attendance Page
Select date → Click **📊 Export to Google Sheets**

### Dashboard Page  
Select date range → Click **📊 Export to Google Sheets**

## Troubleshooting

**Button not showing?**
- Google Sheets not configured yet
- Add credentials to `.env`
- Restart backend server

**Export fails?**
- Check credentials are correct
- Make sure JSON is on one line
- Check backend logs for errors

## Full Documentation

See [GOOGLE_SHEETS_SETUP.md](GOOGLE_SHEETS_SETUP.md) for complete setup instructions including:
- Detailed walkthrough with screenshots
- Security best practices
- Advanced configuration
- Troubleshooting guide

## Example Export

Your exported sheet will look like:

```
| Date          | Name         | Gender | Category | Present | Read Assignment |
|---------------|--------------|--------|----------|---------|-----------------|
| Jan 12, 2026  | John Smith   | MALE   | REGULAR  | Yes     | Yes             |
| Jan 12, 2026  | Jane Doe     | FEMALE | REGULAR  | Yes     | No              |

SUMMARY
Total Records: 25
Present Count: 20
Attendance Rate: 80.0%
Read Assignment: 15
Reading Rate: 60.0%
```

---

**Ready to share your attendance reports!** 📊

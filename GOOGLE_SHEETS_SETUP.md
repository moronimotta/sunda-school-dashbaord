# Google Sheets Integration Guide

## Overview

Your Sunday School Dashboard can now export attendance and reading data directly to Google Sheets! This makes it easy to share reports, create backups, and analyze data in spreadsheets.

## Features

✅ **Export Current Attendance** - Export a specific date's attendance  
✅ **Export All Data** - Export attendance history with date ranges  
✅ **Auto-formatted Sheets** - Headers, colors, and summary statistics  
✅ **Direct Link** - Opens the spreadsheet automatically after export  
✅ **Summary Stats** - Includes attendance rates and reading completion

## Setup Instructions

### Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Name it something like "Sunday School Dashboard"

### Step 2: Enable Google Sheets API

1. In your Google Cloud project, go to **APIs & Services** → **Library**
2. Search for "Google Sheets API"
3. Click on it and press **Enable**

### Step 3: Create a Service Account

1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **Service Account**
3. Fill in the details:
   - **Service account name**: `sunday-school-exporter`
   - **Service account ID**: (auto-generated)
   - **Description**: "Service account for exporting attendance data"
4. Click **Create and Continue**
5. Skip the optional steps (role and user access)
6. Click **Done**

### Step 4: Create and Download Credentials

1. In the Credentials page, find your new service account
2. Click on it to open details
3. Go to the **Keys** tab
4. Click **Add Key** → **Create new key**
5. Choose **JSON** format
6. Click **Create** - a JSON file will download automatically
7. **Keep this file safe!** It contains your credentials

### Step 5: Add Credentials to Your Application

**Option A: Full JSON (Recommended)**

1. Open the downloaded JSON file
2. Copy the entire contents
3. Add to your `backend/.env` file:
   ```env
   GOOGLE_SERVICE_ACCOUNT_JSON={"type":"service_account","project_id":"your-project",...}
   ```
   ⚠️ Put the entire JSON on one line!

**Option B: Individual Fields**

Extract from the JSON file:
```env
GOOGLE_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour\nPrivate\nKey\nHere\n-----END PRIVATE KEY-----\n"
```

⚠️ **Important**: Keep the `\n` characters in the private key!

### Step 6: Share Spreadsheet with Service Account

When you export for the first time, the app creates a new spreadsheet. To edit an existing spreadsheet:

1. Open your Google Spreadsheet
2. Click **Share**
3. Add the service account email (from the JSON file, looks like: `xxx@xxx.iam.gserviceaccount.com`)
4. Give it **Editor** access
5. Click **Send**

## Usage

### Export Current Date Attendance

1. Go to **Attendance** tab
2. Select the date you want to export
3. Click **📊 Export to Google Sheets**
4. A new spreadsheet opens automatically!

### Export All Attendance Data (Dashboard)

1. Go to **Dashboard** tab
2. Select your date range (Last Month, 3 Months, etc.)
3. Click **📊 Export to Google Sheets**
4. All attendance data for that period exports!

### What Gets Exported

**Attendance Export includes:**
- Date
- Member Name
- Gender
- Category (Regular/Temple Prep/Mission Prep)
- Present (Yes/No)
- Read Assignment (Yes/No)
- Email
- Phone
- Summary statistics

**Formatting:**
- Blue header row
- Auto-sized columns
- Summary section at bottom
- Professional layout

## Configuration Examples

### Local Development

`backend/.env`:
```env
GOOGLE_SERVICE_ACCOUNT_JSON={"type":"service_account","project_id":"sunday-school-123",...entire JSON...}
```

### Production (Vercel/Railway)

Add environment variable:
```
Name: GOOGLE_SERVICE_ACCOUNT_JSON
Value: {entire JSON contents}
```

Or split into two variables:
```
GOOGLE_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

## Troubleshooting

### "Google Sheets credentials not configured"
- Check that environment variables are set correctly
- Verify the JSON is valid (no extra quotes or formatting)
- Restart your backend server after adding credentials

### "Permission denied"
- Share the spreadsheet with the service account email
- Make sure you gave Editor access, not Viewer

### "API not enabled"
- Go to Google Cloud Console
- Enable Google Sheets API for your project

### "Invalid credentials"
- Download a new JSON key file
- Make sure private key includes ALL `\n` characters
- Check for any extra quotes or spaces

### Private Key Format Issues

If using separate fields, ensure the private key looks like:
```env
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhki...(many lines)...==\n-----END PRIVATE KEY-----\n"
```

The `\n` characters are important! Don't remove them.

## Security Best Practices

🔒 **Never commit credentials to Git**
- Add `.env` to `.gitignore`
- Use environment variables in production

🔒 **Limit permissions**
- Service account only needs Sheets access
- Don't give it unnecessary permissions

🔒 **Rotate keys periodically**
- Create new service account keys every 90 days
- Delete old keys after rotation

## Advanced: Using Existing Spreadsheet

You can export to an existing spreadsheet by passing the spreadsheet ID:

```javascript
// In your API call (for custom implementations)
{
  "spreadsheetId": "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms",
  "date": "2026-01-12"
}
```

The spreadsheet ID is in the URL:
```
https://docs.google.com/spreadsheets/d/SPREADSHEET_ID_HERE/edit
```

## API Endpoints

### Check Configuration Status
```
GET /api/export/status
```

Returns whether Google Sheets is configured.

### Export Date
```
POST /api/export/export-date
Body: { date: "2026-01-12", spreadsheetId?: "optional" }
```

### Export All Data
```
POST /api/export/export-all
Body: { 
  startDate: "2025-10-01", 
  endDate: "2026-01-12",
  spreadsheetId?: "optional",
  sheetName?: "optional"
}
```

## Example Service Account JSON

```json
{
  "type": "service_account",
  "project_id": "sunday-school-dashboard",
  "private_key_id": "abc123...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "sunday-school-exporter@sunday-school-dashboard.iam.gserviceaccount.com",
  "client_id": "123456789",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "..."
}
```

## Need Help?

- [Google Sheets API Documentation](https://developers.google.com/sheets/api)
- [Service Account Guide](https://cloud.google.com/iam/docs/service-accounts)
- Check the main [README.md](README.md) for general setup

---

**Ready to export!** Set up your credentials and start sharing attendance data with your team! 📊

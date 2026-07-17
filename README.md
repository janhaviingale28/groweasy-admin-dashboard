# GrowEasy Admin Dashboard

## Overview

GrowEasy Admin Dashboard is an AI-powered CSV Importer designed to simplify lead management through intelligent field mapping and an intuitive administrative interface. The application enables users to upload CSV files, preview imported records, automatically map columns using AI, and manage lead data efficiently.

## Features

- AI-powered CSV field mapping
- CSV upload and data preview
- Four-step import wizard
- Lead management dashboard
- Import analytics and reporting
- Responsive admin interface
- User management
- Import history
- Manual field mapping support

## Technology Stack

**Frontend**
- Next.js
- React
- TypeScript
- Tailwind CSS

**Backend**
- FastAPI
- Python
- Pandas
- OpenAI API

## Project Structure

```text
groweasy-admin-dashboard/
│
├── frontend/
│   ├── app/
│   ├── components/
│   ├── lib/
│   └── public/
│
├── backend/
│   ├── app/
│   ├── services/
│   ├── routes/
│   ├── models/
│   └── requirements.txt
│
└── README.md
```

## Installation

### Clone the Repository

```bash
git clone https://github.com/janhaviingale28/groweasy-admin-dashboard.git
```

### Install Frontend Dependencies

```bash
cd frontend
npm install
npm run dev
```

### Run Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

The frontend will be available at:

```
http://localhost:3000
```

The backend API will be available at:

```
http://localhost:8000
```

## Sample CSV Format

| Name | Email | Mobile | Company | Source | Status |
|------|-------|--------|---------|--------|--------|
| Janhavi Ingale | janhavi@gmail.com | 9876543210 | ABC Pvt Ltd | Website | New |

## Future Enhancements

- Authentication and Authorization
- Role-Based Access Control
- Bulk Import Validation
- Excel File Support
- Export Functionality
- Audit Logs
- Email Notifications

## License

This project is licensed under the MIT License.

## Author

**Janhavi Ingale**

Software Engineer

GitHub: https://github.com/janhaviingale28

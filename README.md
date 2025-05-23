# Across

A full-stack web application built with React (Frontend) and Node.js/Express (Backend).

## 🚀 Features

- Modern React frontend with TypeScript
- Express.js backend with TypeScript
- SQLite database with Sequelize ORM
- Authentication system with JWT
- RESTful API architecture
- Unified build process

## 🛠️ Tech Stack

### Frontend
- React 18
- TypeScript
- Vite
- React Router DOM
- Axios
- React Icons

### Backend
- Node.js
- Express.js
- TypeScript
- Sequelize ORM
- SQLite3
- JWT Authentication
- Express Session
- CORS

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm (v7 or higher)

## 🔧 Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/across.git
cd across
```

2. Install all dependencies (frontend, backend, and root):
```bash
npm run install:all
npm install concurrently --save-dev
```

## 🚀 Development

To start the development servers (both frontend and backend):

```bash
npm run dev
```

This will start:
- Frontend development server (Vite) on `http://localhost:5173`
- Backend server on `http://localhost:3000`

## 🏗️ Building for Production

To build both frontend and backend for production:

```bash
npm run build
```

This will:
1. Build the frontend (output in `frontend/dist`)
2. Compile the backend TypeScript code (output in `backend/dist`)

## 🚀 Running in Production

To start the application in production mode:

```bash
npm start
```

## 📁 Project Structure

```
across/
├── frontend/           # React frontend application
│   ├── src/           # Source files
│   ├── public/        # Static files
│   └── package.json   # Frontend dependencies
├── backend/           # Express backend application
│   ├── controllers/   # Route controllers
│   ├── models/        # Database models
│   ├── routes/        # API routes
│   ├── middleware/    # Custom middleware
│   ├── utils/         # Utility functions
│   └── package.json   # Backend dependencies
└── package.json       # Root package.json for unified commands
```

## 🔐 Environment Variables

### Backend
Create a `.env` file in the backend directory with the following variables:
```
PORT=3000
JWT_SECRET=your_jwt_secret
```


## 📄 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

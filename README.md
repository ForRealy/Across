# Across

A full-stack web application built with React (Frontend) and Node.js/Express (Backend).

## 📚 Documentation

- [Backend Documentation](#backend) - Overview of the backend implementation
- [Frontend Overview](#frontend) - Overview of the frontend implementation

## 🚀 Features

- Modern React frontend with TypeScript
- Express.js backend with TypeScript
- SQLite database with Sequelize ORM
- Authentication system with JWT
- RESTful API architecture
- Unified build process
- Comprehensive error handling
- Secure authentication and authorization
- Real-time data updates
- Responsive design

## 🛠️ Tech Stack

### Frontend
- React 18
- TypeScript
- Vite
- React Router DOM
- Axios
- React Icons
- Context API for state management
- Custom hooks for reusable logic
- Form validation with Zod
- Styled components for styling

### Backend
- Node.js
- Express.js
- TypeScript
- Sequelize ORM
- SQLite3
- JWT Authentication
- Express Session
- CORS
- Input validation
- Error handling middleware
- Rate limiting
- Security best practices

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm (v7 or higher)
- SQLite3

## 🔧 Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/across.git
cd across
```

2. Install all dependencies (frontend, backend, and root):
```bash
npm run install:all
```

3. Set up environment variables:
```bash
# Backend
cd backend
cp .env.example .env
# Edit .env with your configuration

# Frontend
cd ../frontend
cp .env.example .env
# Edit .env with your configuration
```

4. Initialize the database:
```bash
cd ../backend
npm run db:init
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
│   │   ├── components/# Reusable components
│   │   ├── pages/     # Page components
│   │   ├── hooks/     # Custom hooks
│   │   ├── context/   # Context providers
│   │   ├── utils/     # Utility functions
│   │   └── types/     # TypeScript types
│   ├── public/        # Static files
│   └── package.json   # Frontend dependencies
├── backend/           # Express backend application
│   ├── controllers/   # Route controllers
│   ├── models/        # Database models
│   ├── routes/        # API routes
│   ├── middleware/    # Custom middleware
│   ├── utils/         # Utility functions
│   ├── types/         # TypeScript types
│   ├── config/        # Configuration files
│   └── package.json   # Backend dependencies
└── package.json       # Root package.json for unified commands
```

## 🔐 Environment Variables

### Backend
Create a `.env` file in the backend directory with the following variables:
```
PORT=3000
JWT_SECRET=your_jwt_secret
NODE_ENV=development
```

### Frontend
Create a `.env` file in the frontend directory with the following variables:
```
VITE_API_URL=http://localhost:3000/api
VITE_APP_ENV=development
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

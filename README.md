# LinkClub

A modern, full-stack real-time chat application built with the MERN stack, featuring instant messaging and comprehensive user management.

🔗 **[Live Demo](https://linkclub.social/)**

![LinkClub Demo](/frontend/public/HomePage.png)

## 🚀 Features

- **Real-time Messaging**: Instant message delivery powered by Socket.io
- **User Authentication**: Secure JWT-based authentication and authorization
- **Friend System**: Add, manage, and chat with friends
- **Online Status**: Real-time user presence indicators
- **Image Sharing**: Upload and share images in conversations
- **Notifications System**: Real-time friend request notifications with sound alerts
- **Message Status**: Read receipts and delivery status indicators
- **Responsive Design**: Mobile-first design with TailwindCSS and DaisyUI
- **Modern UI**: Clean, intuitive interface with emoji support
- **Global State Management**: Efficient state handling with Zustand

## 🛠️ Technology Stack

### Frontend
- **React 18** - Modern React with hooks
- **Vite** - Fast build tool and development server
- **TailwindCSS** - Utility-first CSS framework
- **DaisyUI** - Component library for TailwindCSS
- **Socket.io Client** - Real-time communication
- **Zustand** - Lightweight state management
- **React Router** - Client-side routing
- **Lucide React** - Beautiful icons

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **Socket.io** - Real-time bidirectional communication
- **JWT** - JSON Web Tokens for authentication
- **Cloudinary** - Image upload and management
- **bcryptjs** - Password hashing

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **MongoDB** (local installation or MongoDB Atlas)
- **Cloudinary Account** (for image uploads)

## ⚙️ Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/linkclub.git
cd linkclub
```

### 2. Install Dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 3. Environment Configuration

Create `.env` files in both backend and frontend directories:

#### Backend (.env)
```env
MONGODB_URI=mongodb://localhost:27017/linkclub
# or for MongoDB Atlas: 

PORT=5001
JWT_SECRET=your-super-secret-jwt-key

CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

#### Frontend (.env)
```env
VITE_BACKEND_URL=http://localhost:5001
```

### 4. Database Setup

Ensure MongoDB is running on your system or configure MongoDB Atlas connection in your backend `.env` file.

## 🚀 Running the Application

### Development Mode

1. **Start the Backend Server**
```bash
cd backend
npm run dev
```

2. **Start the Frontend Development Server**
```bash
cd frontend
npm run dev
```

The application will be available at:
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5001`

### Production Build

1. **Build the Frontend**
```bash
cd frontend
npm run build
```

2. **Start the Production Server**
```bash
cd backend
npm start
```

## 📁 Project Structure

```
linkclub/
├── backend/
│   ├── src/
│   │   ├── controllers/     # Route controllers
│   │   ├── middleware/      # Custom middleware
│   │   ├── models/          # MongoDB models
│   │   ├── routes/          # API routes
│   │   ├── lib/             # Utility functions
│   │   └── index.js         # Server entry point
│   ├── package.json
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   ├── store/           # Zustand stores
│   │   ├── lib/             # Utility functions
│   │   └── App.jsx          # Main App component
│   ├── public/
│   ├── package.json
│   └── .env
├── README.md
└── package.json
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/check` - Check authentication status

### Messages
- `GET /api/messages/:userId` - Get messages with a user
- `POST /api/messages/send/:userId` - Send a message

### Friends
- `GET /api/friends` - Get user's friends list
- `POST /api/friends/add` - Send friend request
- `POST /api/friends/accept/:requestId` - Accept friend request
- `DELETE /api/friends/remove/:friendId` - Remove friend

## 🌐 Deployment

### Backend (Railway)
1. Connect your repository to Railway
2. Set environment variables in Railway dashboard
3. Deploy automatically on push to main branch

### Frontend (Vercel)
1. Import repository on Vercel
2. Ensure framework preset is Vite and root directory is `frontend`
3. Configure environment variables in Vercel dashboard

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Socket.io for real-time communication
- MongoDB for database solutions
- Cloudinary for image management
- TailwindCSS and DaisyUI for beautiful UI components

## 📞 Support

If you have any questions or need help, please open an issue or contact the development team.

---

**Developed by Phyo Min Thein**

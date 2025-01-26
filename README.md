# Task Management API

This project is a task management API built with Node.js, Express.js, and MongoDB. It supports user authentication, secure task management, and includes rate limiting to prevent abuse.

---

## Features
- User registration and login.
- Secure JWT-based authentication.
- Task CRUD operations (Create, Read, Update, Delete).
- Task sharing between users
- Rate limiting to mitigate abuse.

---

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables in a `.env` file:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   PORT=3000
   ```

4. Start the server:
   ```bash
   npm start
   ```

---

## File Structure

```
.
├── models
│   ├── Task.js        # Task schema definition
│   └── User.js        # User schema with password hashing
├── router
│   ├── auth.js        # Authentication routes (register/login)
│   └── tasks.js       # Task management routes (CRUD operations)
├── .env               # Environment variables (not included in the repository)
├── .gitignore         # Files and folders to ignore in Git
├── package.json       # Dependencies and scripts
├── server.js          # Main server file
└── README.md          # Documentation
```

---

## Libraries Used

### Core Libraries
- **express**: Fast, unopinionated web framework for building APIs.
- **mongoose**: MongoDB object modeling for Node.js.
- **dotenv**: Loads environment variables from a `.env` file.

### Security Libraries
- **bcrypt**: Library for hashing passwords securely.
- **jsonwebtoken (JWT)**: Implements JSON Web Tokens for secure authentication.
- **express-rate-limit**: Middleware to limit repeated API requests.

### Utility Libraries
- **body-parser**: Parses incoming request bodies (used for JSON payloads).
- **morgan**: HTTP request logger middleware for logging API requests.

---

## API Endpoints

### Authentication
- **POST** `/auth/register` - Register a new user.
- **POST** `/auth/login` - Log in and get a JWT token.

### Tasks
- **POST** `/tasks` - Create a new task (requires JWT).
- **GET** `/tasks` - Retrieve all tasks (requires JWT).
- **PUT** `/tasks/:id` - Update a task (requires JWT).
- **DELETE** `/tasks/:id` - Delete a task (requires JWT).
- **POST** `/tasks/:id/share` - Share task (requires JWT).



---

## Security
- Passwords are hashed with **bcrypt**.
- Routes are protected using **JWT-based authentication**.
- API usage is limited with **express-rate-limit**.



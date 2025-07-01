~# AlumNET Frontend

A modern alumni networking platform built with React and Vite.

## Features

### Chat System
- **Real-time messaging** with Socket.IO
- **File sharing support**:
  - Images (JPEG, JPG, PNG, GIF) - displayed inline
  - Documents (PDF, DOC, DOCX, TXT) - with download links
  - File size limit: 10MB
  - Automatic file type validation
- **Message status indicators** (sending, sent, delivered, read)
- **Typing indicators**
- **Online/offline status**
- **Chat history**

### User Management
- **Multi-role authentication** (Student, Alumni, College, Admin)
- **Email verification** with OTP
- **Profile management**
- **Secure authentication** with JWT tokens

### Notification System
- **Modern popup notifications** for errors and success messages
- **Auto-dismiss** with progress bar
- **Multiple notification types** (error, success, warning, info)
- **Responsive design**

## File Sharing in Chat

### Supported File Types
- **Images**: JPEG, JPG, PNG, GIF (displayed inline)
- **Documents**: PDF, DOC, DOCX, TXT (with download links)
- **File Size**: Maximum 10MB per file

### How to Use
1. Click the paperclip icon in the chat input area
2. Choose from three options:
   - **Image**: For photos and graphics
   - **Document**: For PDFs and text files
   - **File**: For any supported file type
3. Select your file
4. The file will be uploaded to Cloudinary and shared in the chat

### Features
- **Real-time sharing**: Files appear instantly for both users
- **Preview support**: Images show thumbnails, documents show icons
- **Download links**: Non-image files have download buttons
- **File information**: Shows file name and size
- **Error handling**: User-friendly error messages for invalid files

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Make sure the backend server is running on port 5000

## Environment Variables

Create a `.env` file in the Frontend directory:
```env
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5001
```

## Technologies Used

- **React 18** with Hooks
- **Vite** for fast development
- **Socket.IO** for real-time communication
- **Axios** for HTTP requests
- **React Router** for navigation
- **React Icons** for UI icons
- **CSS3** with modern features (Grid, Flexbox, Animations)

## Project Structure

```
Frontend/
├── src/
│   ├── components/          # Reusable components
│   │   ├── NotificationPopup.jsx
│   │   └── ...
│   ├── context/            # React Context providers
│   │   ├── NotificationContext.jsx
│   │   └── AppContext.jsx
│   ├── pages/              # Page components
│   │   ├── Chat.jsx        # Main chat with file sharing
│   │   └── ...
│   └── ...
└── ...
```

# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

# Deployment (Docker)

## Build and Run with Docker

1. Build the Docker image:
   ```bash
   docker build -t alumnet-frontend .
   ```
2. Run the container:
   ```bash
   docker run -d -p 80:80 alumnet-frontend
   ```

## Environment Variables
- Copy `.env.example` to `.env` and fill in your values before running.

## Notes
- Set `VITE_API_URL` and `VITE_SOCKET_URL` to your backend/socket endpoints.
- For production, use your deployed backend/socket URLs.

// src/socket.js
import { io } from 'socket.io-client';

const backendUrl = import.meta.env.VITE_BACKEND_URL || "https://alumnet-backend-fndz.onrender.com";
const socket = io(backendUrl, {
  withCredentials: true,
});

export default socket;

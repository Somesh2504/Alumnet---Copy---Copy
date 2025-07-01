// src/socket.js
import { io } from 'socket.io-client';

const backendUrl = import.meta.env.VITE_BACKEND_URL.replace(/\/?$/, '');
const socket = io(`${backendUrl.replace('5000', '5001')}`, {
  withCredentials: true,
});

export default socket;

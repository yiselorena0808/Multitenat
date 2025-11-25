import { defineConfig } from '@adonisjs/cors'

const corsConfig = defineConfig({
  enabled: true,
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:3000',
    'http://localhost:3333',
    'https://backsst.onrender.com',
    'https://unreproaching-rancorously-evelina.ngrok-free.dev',
    'https://unreproaching-rancorously-evelina.ngrok-free.dev',
    'https://terminadofrontend.onrender.com',
  ],
  methods: ['GET', 'HEAD', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  headers: true,
  exposeHeaders: [],
  credentials: true,
  maxAge: 90,
})

export default corsConfig
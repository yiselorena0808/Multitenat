import { Server } from "socket.io"
import type { Server as HttpServer } from 'node:http'

let io: Server

// 🔥 MOVER usuariosPorRol FUERA de la función para que sea accesible
const usuariosPorRol: Record<string, Set<string>> = {
  "SG-SST": new Set(),
  "empleado": new Set(),
  "admin": new Set()
}

export function initializeWebsocket(server: HttpServer) {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  })

  console.log("🔥 WebSocket inicializado")

  io.on("connection", (socket) => {
    console.log("🟢 Cliente conectado:", socket.id)

    // Cuando el cliente manda su rol
    socket.on("registrar_rol", (rol: string) => {
      if (!rol || !usuariosPorRol[rol]) {
        console.log(`❌ Rol inválido: ${rol}`)
        return
      }

      // Agregar socket al rol
      usuariosPorRol[rol].add(socket.id)
      console.log(`📌 Cliente ${socket.id} registrado como ${rol}`)
      
      // Confirmar
      socket.emit("rol_registrado", { rol, ok: true })
    })

    socket.on("disconnect", () => {
      console.log("🔴 Cliente desconectado:", socket.id)
      
      // Remover de todos los roles
      Object.keys(usuariosPorRol).forEach(rol => {
        usuariosPorRol[rol].delete(socket.id)
      })
    })
  })
}

// 🔔 FUNCIÓN SIMPLE: Notificar solo al rol SG-SST
export function notificarSG_SST(empresaId: number, mensaje: string, datos?: any) {
  if (!io) {
    console.error("❌ Socket.io no está inicializado")
    return
  }

  console.log(`🔔 Enviando a SG-SST: ${mensaje}`)
  
  // Enviar solo a sockets del rol SG-SST
  const socketsSG_SST = Array.from(usuariosPorRol["SG-SST"])
  
  if (socketsSG_SST.length === 0) {
    console.log("⚠ No hay usuarios SG-SST conectados")
    return
  }

  console.log(`👥 Enviando a ${socketsSG_SST.length} usuarios SG-SST`)
  
  const datosNotificacion = {
    tipo: "nuevo_reporte",
    mensaje,
    fecha: new Date().toISOString(),
    empresaId,
    ...datos
  }

  // Enviar a cada socket SG-SST
  socketsSG_SST.forEach(socketId => {
    io.to(socketId).emit("notificacion_sg_sst", datosNotificacion)
  })
}

export function getIO() {
  if (!io) {
    throw new Error("Socket.io no ha sido inicializado")
  }
  return io
}
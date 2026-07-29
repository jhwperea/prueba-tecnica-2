import { Server } from "socket.io";
import { setIO } from "./src/common/configs/socket.manager.js";

let io;

const init = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: [
        "http://localhost:3000",
      ],
      methods: ["GET", "POST", "PUT", "DELETE"],
      credentials: true,
    },
  });

  setIO(io);

  io.on("connection", (socket) => {
    const userId = socket.handshake.auth?.userId;
    if (userId) {
      socket.join(`user:${userId}`);
      console.log(`Socket conectado: ${socket.id} | Usuario: ${userId}`);
    } else {
      console.log("Socket conectado (sin autenticar):", socket.id);
    }

    socket.on("register", (registerUserId) => {
      if (registerUserId) {
        socket.join(`user:${registerUserId}`);
        console.log(`Socket ${socket.id} registrado en sala user:${registerUserId}`);
      }
    });

    socket.on("disconnect", (reason) => {
      console.log(`Cliente desconectado, ID: ${socket.id}, Razón: ${reason}`);
    });
  });

  return io;
};

export { init };

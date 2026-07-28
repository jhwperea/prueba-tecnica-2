import { createContext, useContext, useEffect, useMemo } from "react";
import { io } from "socket.io-client";
import { urlSocket, pathSocket } from "utils/constants";

const SocketContext = createContext(null);

export const SocketProvider = ({ children, userId }) => {
  const socket = useMemo(() => {
    if (!userId) return null;

    return io(urlSocket, {
      transports: ["polling", "websocket"],
      upgrade: true,
      withCredentials: true,
      path: pathSocket,
      auth: { userId },
      reconnection: true,
      reconnectionAttempts: 15,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
      timeout: 30000,
      forceNew: true,
      multiplex: false,
    });
  }, [userId]);

  useEffect(() => {
    if (!socket) return;

    const onConnect = () => {
      console.log(`Socket conectado: ${socket.id} | Usuario: ${userId}`);
    };

    const onDisconnect = (reason) => {
      if (reason === "io server disconnect") {
        socket.connect();
      }
    };

    const onError = (err) => {
      console.error("Socket connect_error:", err.message || err);
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("connect_error", onError);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("connect_error", onError);
      socket.disconnect();
    };
  }, [socket, userId]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);

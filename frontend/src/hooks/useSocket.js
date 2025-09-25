// src/hooks/useSocket.js
import { useContext } from "react";
import { SocketContext } from "../context/SocketContext";

/**
 * useSocket returns the context object: { socket, connected }
 * Keep usage consistent: destructure as needed:
 * const { socket, connected } = useSocket();
 */
const useSocket = () => {
  return useContext(SocketContext);
};

export default useSocket;

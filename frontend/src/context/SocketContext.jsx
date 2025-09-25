// src/context/SocketContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useDispatch, useSelector } from "react-redux";
import {
  setCurrentPoll,
  updateResults,
  setTimeRemaining,
  addPoll,
  updateConnectedUsers,
  clearPoll,
} from "../store/slices/pollSlice";

export const SocketContext = createContext(null);

/**
 * SocketProvider automatically reads auth info (user, role) from Redux.
 * Value provided: { socket, connected } where socket is the socket.io client instance.
 */
export const SocketProvider = ({ children }) => {
  const dispatch = useDispatch();
  const { user, role } = useSelector((state) => state.auth);
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // Wait until we know the user & role. If not available, we don't connect.
    // This prevents premature join attempts.
    if (!user || !role) {
      // If previously connected, disconnect
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setConnected(false);
      }
      return;
    }

    const backendURL = import.meta.env.VITE_API_URL || "http://localhost:5000";
    const newSocket = io(backendURL, {
      transports: ["websocket"],
      autoConnect: true,
    });

    // Connection lifecycle
    newSocket.on("connect", () => {
      console.log("✅ Socket connected:", newSocket.id);
      setConnected(true);
      // Join lobby (server expects join_poll)
      newSocket.emit("join_poll", { pollId: "lobby", role, name: user });
    });

    newSocket.on("disconnect", (reason) => {
      console.log("⚠️ Socket disconnected:", reason);
      setConnected(false);
    });

    // Server events
    newSocket.on("poll_started", (poll) => {
      console.log("📥 poll_started:", poll);
      dispatch(setCurrentPoll(poll));
      dispatch(addPoll(poll));
      dispatch(setTimeRemaining(poll.timeRemaining ?? poll.duration ?? 60));
    });

    newSocket.on("time_tick", ({ timeRemaining }) => {
      dispatch(setTimeRemaining(timeRemaining ?? 0));
    });

    newSocket.on("poll_update", ({ results }) => {
      dispatch(updateResults(results || {}));
    });

    newSocket.on("poll_ended", ({ results }) => {
      console.log("📥 poll_ended:", results);
      dispatch(updateResults(results || {}));
      dispatch(setTimeRemaining(0));
      // Do not immediately erase results from UI — clearPoll is available when you want to reset.
      dispatch(clearPoll()); // clears currentPoll so teacher can create new poll if UI wants that behavior
    });

    /** update_users: server sends an array of user objects for the room.
     * We pass the array through to the reducer which will set connectedUsers/allUsers.
     */
    newSocket.on("update_users", (usersArray) => {
      console.log("📥 update_users:", usersArray);
      // reducer expects array - handled there
      dispatch(updateConnectedUsers(usersArray || []));
    });

    newSocket.on("student_removed", ({ name }) => {
      console.log("📥 student_removed:", name);
      if (name === user) {
        alert("You were removed by the teacher.");
        dispatch(clearPoll());
        // disconnect and refresh to force re-entry
        newSocket.disconnect();
        window.location.reload();
      }
    });

    newSocket.on("poll_error", ({ message }) => {
      console.warn("poll_error:", message);
    });

    // Save instance
    setSocket(newSocket);

    // cleanup on unmount or when user/role changes
    return () => {
      try {
        if (newSocket) {
          newSocket.removeAllListeners();
          newSocket.disconnect();
        }
      } catch (err) {
        /* ignore */
      }
      setSocket(null);
      setConnected(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, role, dispatch]);

  return (
    <SocketContext.Provider value={{ socket, connected }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);

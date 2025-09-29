// socket.js
const { Server } = require("socket.io");
const Poll = require("./models/Poll");

let io;
const pollTimers = new Map();
const kickedStudents = new Set();
const activeUsers = new Map(); // track normalized usernames -> socket.id

function normalizeName(name) {
  return name?.toLowerCase().replace(/[^a-z0-9]/g, "") || null;
}

function sanitizePollForClient(poll) {
  const opts = (poll.options || []).map((o) => ({
    id: o._id ? o._id.toString() : o.id || null,
    text: o.text,
    votes: o.votes || 0,
  }));

  const resultsObj = {};
  opts.forEach((o) => (resultsObj[o.text] = o.votes || 0));

  let timeRemaining = 0;
  if (poll.isActive && poll.startedAt && poll.duration) {
    const elapsed = Math.floor(
      (Date.now() - new Date(poll.startedAt).getTime()) / 1000
    );
    timeRemaining = Math.max(0, poll.duration - elapsed);
  }

  return {
    _id: poll._id.toString(),
    question: poll.question,
    options: opts,
    correctOptionIndex: poll.correctOptionIndex,
    isActive: !!poll.isActive,
    createdAt: poll.createdAt,
    duration: poll.duration || 60,
    results: resultsObj,
    startedAt: poll.startedAt || null,
    timeRemaining,
  };
}

async function buildUsersForRoom(room) {
  const clients = Array.from(io.sockets.adapter.rooms.get(room) || []).map(
    (id) => {
      const sock = io.sockets.sockets.get(id);
      return {
        id,
        name: sock?.data?.name || "anonymous",
        role: sock?.data?.role || "student",
      };
    }
  );

  const activePoll = await Poll.findOne({ isActive: true }).sort({
    createdAt: -1,
  });

  return clients.map((c) => {
    const hasVoted = activePoll
      ? !!activePoll.submissions.find((s) => s.key === (c.name || c.id))
      : false;
    return { ...c, hasVoted };
  });
}

function broadcastUsers(room) {
  buildUsersForRoom(room)
    .then((clients) => io.to(room).emit("update_users", clients))
    .catch((err) => console.error("broadcastUsers error:", err));
}

function startPollTimer(poll) {
  if (pollTimers.has(poll._id.toString())) {
    clearInterval(pollTimers.get(poll._id.toString()));
    pollTimers.delete(poll._id.toString());
  }

  const pollId = poll._id.toString();

  const tickAndBroadcast = async () => {
    const fresh = await Poll.findById(pollId);
    if (!fresh) {
      clearInterval(pollTimers.get(pollId));
      pollTimers.delete(pollId);
      return;
    }
    const sanitized = sanitizePollForClient(fresh);
    io.to("lobby").emit("time_tick", {
      pollId: sanitized._id,
      timeRemaining: sanitized.timeRemaining,
    });
    if (!fresh.isActive || sanitized.timeRemaining <= 0) {
      clearInterval(pollTimers.get(pollId));
      pollTimers.delete(pollId);
      fresh.isActive = false;
      await fresh.save();
      io.to("lobby").emit("poll_ended", {
        pollId: fresh._id.toString(),
        results: fresh.results,
      });
    }
  };

  tickAndBroadcast();
  const interval = setInterval(tickAndBroadcast, 1000);
  pollTimers.set(pollId, interval);
}

function initSocket(server) {
  io = new Server(server, {
    cors: {
      origin: process.env.CORS_ORIGIN || "http://localhost:5173",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("✅ socket connected", socket.id);

    socket.on("join_poll", async ({ pollId, role, name } = {}) => {
      try {
        const room = pollId || "lobby";
        const normalized = normalizeName(name);

        if (!normalized) return;

        // prevent duplicate login
        if (activeUsers.has(normalized)) {
          io.to(socket.id).emit("duplicate_login", {
            message: "Username already in use",
          });
          return socket.disconnect(true);
        }

        // prevent rejoining after kick
        if (kickedStudents.has(normalized)) {
          io.to(socket.id).emit("student_removed", { name: normalized });
          return socket.disconnect(true);
        }

        socket.data.name = normalized;
        socket.data.role = role || "student";
        activeUsers.set(normalized, socket.id);

        socket.join(room);
        broadcastUsers(room);

        const activePoll = await Poll.findOne({ isActive: true }).sort({
          createdAt: -1,
        });
        if (activePoll) {
          socket.emit("poll_started", sanitizePollForClient(activePoll));
          startPollTimer(activePoll);
        }
      } catch (e) {
        console.error("join_poll error:", e);
      }
    });

    socket.on("teacher_start_poll", async ({ question, options, duration, correctOptionIndex }) => {
      try {
        if (!question || !options || options.length < 2) {
          return socket.emit("poll_error", { message: "Invalid poll data" });
        }

        const existingActive = await Poll.findOne({ isActive: true }).sort({
          createdAt: -1,
        });
        if (existingActive) {
          return socket.emit("poll_error", {
            message: "An active poll is already running.",
          });
        }

        const poll = new Poll({
          question,
          options: options.map((text) => ({ text, votes: 0 })),
          correctOptionIndex,
          duration: duration || 60,
          isActive: true,
          startedAt: new Date(),
          submissions: [],
        });

        await poll.save();
        io.to("lobby").emit("poll_started", sanitizePollForClient(poll));
        broadcastUsers("lobby");
        startPollTimer(poll);
      } catch (e) {
        console.error("teacher_start_poll error:", e);
        socket.emit("poll_error", { message: "Server error starting poll" });
      }
    });

    socket.on("end_poll", async ({ pollId }) => {
      try {
        if (!pollId) return;
        const poll = await Poll.findById(pollId);
        if (!poll) return;
        poll.isActive = false;
        await poll.save();

        if (pollTimers.has(pollId)) {
          clearInterval(pollTimers.get(pollId));
          pollTimers.delete(pollId);
        }

        io.to("lobby").emit("poll_ended", {
          pollId,
          results: poll.results,
        });
        broadcastUsers("lobby");
      } catch (e) {
        console.error("end_poll error:", e);
      }
    });

    socket.on("submit_answer", async ({ pollId, optionId, studentName }) => {
      try {
        const poll = await Poll.findById(pollId);
        if (!poll || !poll.isActive) return;

        const normalized = normalizeName(studentName);
        const key = normalized || socket.id;

        if (poll.submissions.find((s) => s.key === key)) {
          return socket.emit("submit_error", { message: "Already answered" });
        }

        const optIndex = poll.options.findIndex(
          (o) =>
            (o._id && o._id.toString() === optionId) || o.text === optionId
        );
        if (optIndex === -1) return;

        poll.options[optIndex].votes = (poll.options[optIndex].votes || 0) + 1;
        poll.submissions.push({
          key,
          optionId,
          name: normalized,
          at: new Date(),
        });

        await poll.save();
        io.to("lobby").emit("poll_update", {
          pollId: poll._id.toString(),
          results: poll.results,
        });
      } catch (e) {
        console.error("submit_answer error:", e);
      }
    });

    socket.on("remove_student", (studentName) => {
      try {
        const normalized = normalizeName(studentName);
        if (!normalized) return;
        kickedStudents.add(normalized);

        for (let [id, s] of io.sockets.sockets) {
          if (s.data?.name === normalized) {
            io.to(id).emit("student_removed", { name: normalized });
            setTimeout(() => {
              if (s.connected) s.disconnect(true);
            }, 500);
            break;
          }
        }

        broadcastUsers("lobby");
      } catch (e) {
        console.error("remove_student error:", e);
      }
    });

    socket.on("disconnect", () => {
      if (socket.data?.name) {
        activeUsers.delete(socket.data.name);
      }
      broadcastUsers("lobby");
    });
  });
}

module.exports = { initSocket, getIo: () => io };

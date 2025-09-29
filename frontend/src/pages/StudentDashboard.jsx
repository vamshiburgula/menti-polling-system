// src/pages/StudentDashboard.jsx
import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { motion } from "framer-motion";
import { Clock, History } from "lucide-react";
import useSocket from "../hooks/useSocket";
import { decrementTime, setHasVoted, clearPoll } from "../store/slices/pollSlice";
import PastPollsModal from "../components/PastPollsModal";

const StudentDashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { currentPoll, timeRemaining, hasVoted } = useSelector((state) => state.poll);

  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [kickedOut, setKickedOut] = useState(false);
  const [duplicate, setDuplicate] = useState(false);
  const [showPastPolls, setShowPastPolls] = useState(false);
  const { socket, connected } = useSocket() || {};

  // countdown
  useEffect(() => {
    if (currentPoll && timeRemaining > 0) {
      const interval = setInterval(() => dispatch(decrementTime()), 1000);
      return () => clearInterval(interval);
    }
  }, [currentPoll, timeRemaining, dispatch]);

  // kicked out listener
  useEffect(() => {
    if (!socket) return;

    socket.on("student_removed", (data) => {
      const removedName = typeof data === "string" ? data : data?.name;
      if (removedName === user) {
        setKickedOut(true);
        dispatch(clearPoll());
      }
    });

    socket.on("duplicate_login", () => {
      setDuplicate(true);
      dispatch(clearPoll());
    });

    return () => {
      socket.off("student_removed");
      socket.off("duplicate_login");
    };
  }, [socket, user, dispatch]);

  const handleSubmitAnswer = () => {
    if (!selectedAnswer) return;
    if (!socket || !connected || !currentPoll) return;
    socket.emit("submit_answer", {
      pollId: currentPoll._id,
      optionId: selectedAnswer,
      studentName: user,
    });
    setSelectedAnswer("");
    dispatch(setHasVoted(true));
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  // 🚫 Duplicate login screen
  if (duplicate) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-center">
        <h2 className="text-2xl font-bold text-red-600">This username is already logged in!</h2>
        <p className="mt-2 text-gray-600">Try using a different username.</p>
      </div>
    );
  }

  // 🚫 kicked out
  if (kickedOut) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
        <div className="bg-[#7451B6] text-white text-sm font-medium rounded-full flex items-center justify-center mb-6 w-[134px] h-[31px]">
          ✦ Intervue Poll
        </div>
        <h2 className="font-sora font-semibold text-black mb-3 text-center text-[28px]">
          You’ve been Kicked out !
        </h2>
        <p className="text-neutral-500 text-center text-[16px]">
          Looks like the teacher removed you from the poll system. <br />
          Please try again sometime.
        </p>
      </div>
    );
  }

  // 💤 no poll
  if (!currentPoll) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
        <div className="flex justify-between items-center w-full max-w-3xl mb-6">
          <div className="bg-[#7451B6] text-white text-sm font-medium rounded-full flex items-center justify-center w-[134px] h-[31px]">
            ✦ Intervue Poll
          </div>
          <button
            onClick={() => setShowPastPolls(true)}
            className="flex items-center gap-2 px-6 py-3 bg-[#8F64E1] text-white rounded-full"
          >
            <History size={18} /> View Past Polls
          </button>
        </div>
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-sora font-semibold text-black text-center text-[28px]"
        >
          Wait for the teacher to ask questions..
        </motion.h2>

        <PastPollsModal isOpen={showPastPolls} onClose={() => setShowPastPolls(false)} />
      </div>
    );
  }

  // 📝 active poll
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
      <div className="flex items-center gap-4 mb-4 w-full max-w-3xl">
        <h2 className="text-[22px] font-sora font-semibold text-black">Question</h2>
        <Clock className="w-5 h-5 text-black" />
        <span className="text-red-500 font-semibold">{formatTime(timeRemaining)}</span>
      </div>
      <div className="w-[727px] min-h-[353px] border border-[#AF8FF1] rounded-[9px] p-6 bg-white space-y-4">
        <h3 className="text-lg font-semibold text-neutral-900 mb-3">
          {currentPoll?.question}
        </h3>
        <div className="space-y-3">
          {currentPoll?.options?.map((option, index) => (
            <div
              key={option.id || index}
              onClick={() => setSelectedAnswer(option.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                selectedAnswer === option.id
                  ? "border-[#8F64E1] bg-primary-50"
                  : "bg-gray-50 border-gray-200 hover:border-primary-300"
              }`}
            >
              <span className="w-6 h-6 flex items-center justify-center rounded-full border text-sm font-medium bg-white text-primary-600">
                {index + 1}
              </span>
              <span className="font-medium">{option.text}</span>
            </div>
          ))}
        </div>
      </div>
      {!hasVoted ? (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSubmitAnswer}
          disabled={!selectedAnswer}
          className="mt-8 w-[234px] h-[58px] rounded-[34px] text-white font-medium text-lg bg-gradient-to-r from-[#8F64E1] to-[#1D68BD] disabled:opacity-50"
        >
          Submit
        </motion.button>
      ) : (
        <h3 className="mt-8 text-[20px] font-sora font-medium text-black">
          Wait for the teacher to ask a new question..
        </h3>
      )}
    </div>
  );
};

export default StudentDashboard;

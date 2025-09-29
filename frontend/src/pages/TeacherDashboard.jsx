import React, { useState } from "react";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import { Trash2, History, Clock } from "lucide-react";
import PollResults from "../components/PollResults";
import PastPollsModal from "../components/PastPollsModal";
import useSocket from "../hooks/useSocket";
import CreatePollSection from "../components/CreatePollSection"; // ✅ Figma-style poll creator

const TeacherDashboard = () => {
  const {
    currentPoll,
    connectedUsers = [],
    allUsers = [],
    results = {},
    timeRemaining = 60,
  } = useSelector((state) => state.poll);

  const [showPastPolls, setShowPastPolls] = useState(false);
  const [timeLimit] = useState(60);
  const { socket } = useSocket() || {};

  const handleEndPoll = () => {
    if (socket && currentPoll) socket.emit("end_poll", { pollId: currentPoll._id });
  };

  const handleRemoveStudent = (studentName) => {
    if (socket) socket.emit("remove_student", studentName);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-neutral-100">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header Row */}
        <div className="flex justify-between items-center mb-8">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowPastPolls(true)}
            className="flex items-center gap-2 px-6 py-3 border border-primary-500 text-primary-500 rounded-full"
          >
            <History size={18} />
            View Past Polls
          </motion.button>
        </div>

        {/* If poll active → show it, else → show Figma-style create poll section */}
        {currentPoll ? (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Active Poll Section */}
            <div className="lg:col-span-2 space-y-6 bg-white rounded-2xl p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-neutral-800">Active Poll</h2>
                <div className="flex items-center gap-2 text-primary-500">
                  <Clock size={20} />
                  <span className="font-semibold text-lg">{formatTime(timeRemaining)}</span>
                </div>
              </div>

              {/* Question + Options */}
              <div className="w-[507px] min-h-[167px] border border-[#AF8FF1] rounded-[9px] p-6 bg-white space-y-4">
                <h3 className="text-lg font-semibold text-neutral-900 mb-3">
                  {currentPoll?.question}
                </h3>
                {currentPoll?.options?.map((o, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 px-4 py-3 rounded-lg border"
                  >
                    <span className="w-7 h-7 flex items-center justify-center rounded-full bg-primary-600 text-white">
                      {i + 1}
                    </span>
                    <span>{o.text}</span>
                  </div>
                ))}
              </div>

              {/* End Poll */}
              <div className="flex justify-end mt-8">
                <button
                  onClick={handleEndPoll}
                  className="bg-red-500 text-white px-6 py-2 rounded-lg"
                >
                  End Poll
                </button>
              </div>

              {/* Results */}
              {results && Object.keys(results).length > 0 && (
                <div className="mt-6">
                  <PollResults results={results} />
                </div>
              )}
            </div>

            {/* Students List */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6">
                <h3 className="text-lg font-bold text-neutral-800 mb-4">
                  Students ({connectedUsers.length}/{allUsers.length})
                </h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {allUsers.map((s) => (
                    <div
                      key={s.id || s.name}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <span>{s.name}</span>
                      <button
                        onClick={() => handleRemoveStudent(s.name)}
                        className="text-red-500"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <CreatePollSection timeLimit={timeLimit} />
        )}
      </div>

      {/* Past Polls Modal */}
      <PastPollsModal
        isOpen={showPastPolls}
        onClose={() => setShowPastPolls(false)}
      />
    </div>
  );
};

export default TeacherDashboard;

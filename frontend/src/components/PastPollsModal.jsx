import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useSelector } from "react-redux";

const PastPollsModal = ({ isOpen, onClose }) => {
  const { user, role } = useSelector((state) => state.auth); // role = "teacher" or "student"
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(false);

  // ✅ Fetch past polls
  useEffect(() => {
    if (isOpen) {
      const fetchPolls = async () => {
        setLoading(true);
        try {
          let url = `${import.meta.env.VITE_API_URL}/api/polls`;

          // students only see their own
          if (role === "student") {
            url += `?student=${user}`;
          }

          const res = await fetch(url, {
            headers: {
              "Content-Type": "application/json",
              ...(role === "teacher" && {
                "x-teacher-secret": import.meta.env.VITE_TEACHER_SECRET,
              }),
            },
          });

          const data = await res.json();
          if (res.ok) {
            setPolls(data.polls || []);
          } else {
            console.error("❌ Error fetching polls:", data.message);
          }
        } catch (err) {
          console.error("❌ Failed to fetch past polls:", err);
        } finally {
          setLoading(false);
        }
      };
      fetchPolls();
    }
  }, [isOpen, role, user]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-white z-50 flex flex-col"
        >
          {/* Header Bar */}
          <div className="flex justify-between items-center px-8 py-4 border-b border-gray-200">
            <h2 className="text-[24px] font-bold text-neutral-800">
              {role === "teacher" ? "All Poll History" : "My Poll History"}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={22} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-8 py-6">
            {loading && (
              <p className="text-center text-neutral-600">
                Loading past polls...
              </p>
            )}

            {!loading && polls.length > 0 ? (
              <div className="space-y-10">
                {polls.map((poll, idx) => {
                  const totalVotes = poll.options.reduce(
                    (sum, o) => sum + (o.votes || 0),
                    0
                  );

                  return (
                    <motion.div
                      key={poll._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-4"
                    >
                      {/* Question label */}
                      <h3 className="text-lg font-semibold text-neutral-900">
                        Question {idx + 1}
                      </h3>

                      {/* Poll Card */}
                      <div className="rounded-md overflow-hidden border border-[#AF8FF1]">
                        <div className="bg-gradient-to-r from-gray-700 to-gray-600 text-white px-4 py-3 font-medium">
                          {poll.question}
                        </div>
                        <div className="p-4 space-y-3">
                          {poll.options.map((o, i) => {
                            const percentage =
                              totalVotes > 0
                                ? Math.round((o.votes / totalVotes) * 100)
                                : 0;
                            return (
                              <div
                                key={o._id || i}
                                className="relative bg-gray-100 border border-[#AF8FF1] rounded-md flex items-center justify-between px-4 py-3"
                              >
                                {/* Progress bar */}
                                <div
                                  className="absolute left-0 top-0 h-full bg-[#7765DA] rounded-md"
                                  style={{ width: `${percentage}%` }}
                                />
                                <div className="relative flex items-center gap-3 z-10">
                                  <span className="w-7 h-7 flex items-center justify-center rounded-full bg-[#7765DA] text-white text-sm font-semibold">
                                    {i + 1}
                                  </span>
                                  <span className="font-medium">{o.text}</span>
                                </div>
                                <span className="relative z-10 font-semibold text-neutral-800">
                                  {percentage}%
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              !loading && (
                <div className="text-center py-12 text-neutral-600">
                  No past polls available.
                </div>
              )
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
//updated
export default PastPollsModal;

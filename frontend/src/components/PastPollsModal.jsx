import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, Users } from "lucide-react";
import PollResults from "./PollResults";

const PastPollsModal = ({ isOpen, onClose }) => {
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(false);

  // ✅ Fetch past polls from backend
  useEffect(() => {
    if (isOpen) {
      const fetchPolls = async () => {
        setLoading(true);
        try {
          const res = await fetch("http://localhost:5000/api/polls", {
            headers: {
              "Content-Type": "application/json",
              "x-teacher-secret": import.meta.env.VITE_TEACHER_SECRET || "secret123"
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
  }, [isOpen]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-2xl p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-neutral-800">
                Past Poll Results
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            {loading ? (
              <p className="text-center text-neutral-600">Loading polls...</p>
            ) : polls.length > 0 ? (
              <div className="space-y-8">
                {polls.map((poll) => (
                  <motion.div
                    key={poll._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gray-50 rounded-xl p-6"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-neutral-800 mb-2">
                          {poll.question}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-neutral-600">
                          <div className="flex items-center gap-1">
                            <Calendar size={14} />
                            <span>{formatDate(poll.createdAt)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users size={14} />
                            <span>{poll.submissions?.length || 0} responses</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <PollResults
                      results={
                        poll.options.reduce((acc, o) => {
                          acc[o.text] = o.votes;
                          return acc;
                        }, {})
                      }
                    />
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="text-gray-400" size={32} />
                </div>
                <h3 className="text-xl font-semibold text-neutral-800 mb-2">
                  No Past Polls
                </h3>
                <p className="text-neutral-600">
                  Create your first poll to see results here.
                </p>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default PastPollsModal;

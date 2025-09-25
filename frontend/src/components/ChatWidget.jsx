import React, { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Bot } from "lucide-react";
import { toggleChat, addMessage, setTyping } from "../store/slices/chatSlice";
import useSocket from "../hooks/useSocket";

const ChatWidget = () => {
  const { isOpen, messages, isTyping } = useSelector((state) => state.chat);
  const { user, role } = useSelector((state) => state.auth);
  const { allUsers = [] } = useSelector((state) => state.poll);

  const dispatch = useDispatch();
  const [inputMessage, setInputMessage] = useState("");
  const [activeTab, setActiveTab] = useState("chat"); // "chat" | "participants"
  const messagesEndRef = useRef(null);
  const { socket } = useSocket() || {};

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: user || "User",
      isAI: false,
      timestamp: new Date().toISOString(),
    };

    dispatch(addMessage(userMessage));
    setInputMessage("");

    // Simulate AI typing
    dispatch(setTyping(true));
    setTimeout(() => {
      const aiResponses = [
        "I'm here to help! What questions do you have about the polling system?",
        "That's a great question! Let me assist you with that.",
        "If you're having trouble with polls, make sure you're connected to the session.",
      ];
      const aiMessage = {
        id: Date.now() + 1,
        text: aiResponses[Math.floor(Math.random() * aiResponses.length)],
        sender: "AI Assistant",
        isAI: true,
        timestamp: new Date().toISOString(),
      };
      dispatch(addMessage(aiMessage));
      dispatch(setTyping(false));
    }, 1500);
  };

  const handleKickOut = (studentName) => {
    if (role === "teacher" && socket) {
      socket.emit("remove_student", studentName);
    }
  };

  return (
    <>
      {/* Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => dispatch(toggleChat())}
        className="fixed bottom-10 right-6 bg-gradient-to-r from-[#8F64E1] to-[#1D68BD] text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-40"
      >
        <MessageCircle size={24} />
      </motion.button>

      {/* Chat Widget */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-28 right-6 w-[430px] h-[480px] bg-white border border-[#DFCCCC] rounded-md shadow-xl z-50 flex flex-col"
            style={{
              boxShadow:
                "4px 4px 20px 0px #0000000A, -4px -4px 20px 0px #0000000A",
            }}
          >
            {/* Header Tabs */}
            <div className="flex border-b relative">
              <button
                onClick={() => setActiveTab("chat")}
                className={`flex-1 py-3 text-center text-sm font-medium ${
                  activeTab === "chat"
                    ? "text-primary-600 border-b-2 border-primary-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Chat
              </button>
              <button
                onClick={() => setActiveTab("participants")}
                className={`flex-1 py-3 text-center text-sm font-medium ${
                  activeTab === "participants"
                    ? "text-primary-600 border-b-2 border-primary-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Participants
              </button>
              <button
                onClick={() => dispatch(toggleChat())}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {activeTab === "chat" ? (
                <>
                  {messages.length === 0 && (
                    <div className="text-center text-neutral-500 text-sm">
                      <Bot className="w-8 h-8 mx-auto mb-2 text-neutral-400" />
                      <p>Hi! I'm here to help with any issues you might have.</p>
                    </div>
                  )}

                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex mb-2 ${
                        msg.isAI ? "justify-start" : "justify-end"
                      }`}
                    >
                      <div
                        className={`max-w-[70%] px-3 py-2 rounded-lg text-sm ${
                          msg.isAI
                            ? "bg-gray-100 text-black"
                            : "bg-gradient-to-r from-[#8F64E1] to-[#1D68BD] text-white"
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  ))}

                  {isTyping && (
                    <div className="flex justify-start text-sm text-gray-500">
                      Typing...
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-gray-500 border-b">
                      <th className="text-left py-2">Name</th>
                      {role === "teacher" && (
                        <th className="text-right py-2">Action</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {allUsers.map((student) => (
                      <tr key={student.id || student.name} className="border-b">
                        <td className="py-2">{student.name}</td>
                        {role === "teacher" && (
                          <td className="py-2 text-right">
                            <button
                              onClick={() => handleKickOut(student.name)}
                              className="text-blue-600 hover:underline"
                            >
                              Kick out
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Input (only in chat mode) */}
            {activeTab === "chat" && (
              <div className="p-3 border-t flex gap-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-primary-500"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim()}
                  className="px-3 py-2 bg-gradient-to-r from-[#8F64E1] to-[#1D68BD] text-white rounded-lg disabled:opacity-50"
                >
                  <Send size={16} />
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatWidget;

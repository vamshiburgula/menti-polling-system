// src/components/CreatePollSection.jsx
import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { motion } from "framer-motion";
import useSocket from "../hooks/useSocket";

const CreatePollSection = ({ timeLimit = 60 }) => {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [selectedTimeLimit, setSelectedTimeLimit] = useState(timeLimit);
  const [showTimeDropdown, setShowTimeDropdown] = useState(false);
  const [correctOption, setCorrectOption] = useState(null);

  const { socket, connected } = useSocket() || {};

  const timeOptions = [10, 30, 60, 90, 120, 180, 300];

  const addOption = () => {
    if (options.length < 6) setOptions([...options, ""]);
  };

  const updateOption = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = () => {
    if (!socket || !connected) {
      alert("Socket connection not ready. Try again.");
      return;
    }

    const trimmedQuestion = question.trim();
    const validOptions = options.map((o) => o.trim());
    const nonEmptyOptions = validOptions.filter(Boolean);

    if (!trimmedQuestion || nonEmptyOptions.length < 2) {
      alert("Please provide a question and at least 2 options.");
      return;
    }

    if (correctOption === null || !validOptions[correctOption]) {
      alert("Please select a valid correct option.");
      return;
    }

    const poll = {
      question: trimmedQuestion,
      options: nonEmptyOptions,
      duration: selectedTimeLimit,
      correctOptionIndex: correctOption,
    };

    socket.emit("teacher_start_poll", poll);

    setQuestion("");
    setOptions(["", ""]);
    setCorrectOption(null);
    setSelectedTimeLimit(timeLimit);
  };

  return (
    <div className="w-full max-w-6xl mx-auto py-12 px-8 font-sora">
      {/* Intervue Poll button */}
      <div className="mb-6">
        <button
          className="px-3 py-1 text-white text-sm font-medium"
          style={{
            background: "linear-gradient(90deg, #7565D9 0%, #4D0ACD 100%)",
            borderRadius: "24px",
          }}
        >
          ✦ Intervue Poll
        </button>
      </div>

      {/* Header */}
      <h1 className="text-[36px] font-semibold text-black mb-2">
        Let’s <span className="font-bold">Get Started</span>
      </h1>
      <p className="text-neutral-500 text-[18px] leading-[25px] mb-10">
        you’ll have the ability to create and manage polls, ask questions, and
        monitor your students' responses in real-time.
      </p>

      {/* Question + Timer */}
      <div className="flex justify-between items-start mb-4">
        <label className="text-lg font-semibold text-black">
          Enter your question
        </label>
        <div className="relative">
          <button
            onClick={() => setShowTimeDropdown(!showTimeDropdown)}
            className="flex items-center gap-2 px-3 py-1 bg-neutral-100 rounded-md text-sm border"
          >
            {selectedTimeLimit} seconds
            <ChevronDown size={14} />
          </button>
          {showTimeDropdown && (
            <div className="absolute right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
              {timeOptions.map((time) => (
                <button
                  key={time}
                  onClick={() => {
                    setSelectedTimeLimit(time);
                    setShowTimeDropdown(false);
                  }}
                  className="block px-4 py-2 text-left text-sm hover:bg-gray-100 w-full"
                >
                  {time} seconds
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <textarea
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Type your question here..."
        className="w-full h-[120px] p-4 bg-neutral-100 rounded-lg border border-gray-200 resize-none mb-8"
        maxLength={100}
      />

      {/* Options */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-black">Edit Options</h3>
        <span className="text-lg font-semibold text-black">Is it Correct?</span>
      </div>

      <div className="space-y-4">
        {options.map((option, index) => (
          <div key={index} className="flex items-center justify-between gap-6">
            {/* Number + Option Input */}
            <div className="flex items-center gap-3 flex-1">
              <span
                className="w-7 h-7 flex items-center justify-center rounded-full text-white text-sm font-semibold"
                style={{
                  background:
                    "linear-gradient(243.94deg, #8F64E1 -50.82%, #4E377B 216.33%)",
                }}
              >
                {index + 1}
              </span>
              <input
                type="text"
                value={option}
                onChange={(e) => updateOption(index, e.target.value)}
                placeholder={`Option ${index + 1}`}
                className="flex-1 p-3 bg-neutral-100 rounded-lg border border-gray-200 text-[16px]"
              />
            </div>

            {/* Yes/No Correct Option */}
            <div className="flex items-center gap-4 min-w-[140px]">
              <label className="flex items-center gap-1">
                <input
                  type="radio"
                  name="correctOption"
                  checked={correctOption === index}
                  onChange={() => setCorrectOption(index)}
                  className="accent-[#8F64E1]"
                />
                <span className="text-[15px]">Yes</span>
              </label>
              <label className="flex items-center gap-1">
                <input
                  type="radio"
                  name={`incorrect-${index}`}
                  checked={correctOption !== index}
                  onChange={() => setCorrectOption(index)}
                  className="accent-[#8F64E1]"
                />
                <span className="text-[15px]">No</span>
              </label>
            </div>
          </div>
        ))}
      </div>

      {/* Add More Option */}
      {options.length < 6 && (
        <button
          onClick={addOption}
          className="mt-6 px-5 py-2 rounded-md border text-[#7451B6] border-[#7451B6] text-[15px]"
        >
          + Add More option
        </button>
      )}

      {/* Ask Question */}
      <div className="flex justify-end mt-10">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSubmit}
          disabled={!connected}
          className="px-10 py-3 text-white font-medium rounded-full text-[16px]"
          style={{
            background:
              "linear-gradient(99.18deg, #8F64E1 -46.89%, #1D68BD 223.45%)",
          }}
        >
          Ask Question
        </motion.button>
      </div>
    </div>
  );
};

export default CreatePollSection;

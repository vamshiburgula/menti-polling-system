// src/pages/Welcome.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { motion } from "framer-motion";
import { setUser } from "../store/slices/authSlice";

const Welcome = () => {
  const [step, setStep] = useState("role");
  const [selectedRole, setSelectedRole] = useState("");
  const [name, setName] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    if (role === "teacher") {
      dispatch(setUser({ name: "Teacher", role: "teacher" }));
      navigate("/teacher");
    } else {
      setStep("name");
    }
  };

  const handleNameSubmit = () => {
    if (name.trim()) {
      dispatch(setUser({ name: name.trim(), role: "student" }));
      navigate("/student");
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-5xl"
      >
        {/* ===== Header Badge (Intervue Poll) ===== */}
        <div className="flex justify-center mb-12">
          <div
            className="bg-[linear-gradient(90deg,#7565D9_0%,#4D0ACD_100%)]
                       rounded-[24px] px-[9px] py-[4px] flex items-center justify-center"
            style={{ width: "134px", height: "31px" }}
          >
            <span className="text-white text-sm font-medium">Intervue Poll</span>
          </div>
        </div>

        {step === "role" ? (
          // === Role Selection Step ===
          <div className="text-center">
            <h1
              className="font-bold text-neutral-900 mb-4"
              style={{
                fontSize: "42px",
                lineHeight: "52px",
                width: "981px",
                maxWidth: "100%",
                margin: "0 auto",
              }}
            >
              Welcome to the{" "}
              <span className="text-primary-600">Live Polling System</span>
            </h1>
            <p className="text-neutral-500 text-lg mb-12 max-w-2xl mx-auto">
              Please select the role that best describes you to begin using the
              live polling system
            </p>

            {/* Role Cards */}
            <div className="flex flex-col md:flex-row items-center justify-center gap-8 mb-12">
              {/* Student */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedRole("student")}
                className={`w-[387px] h-[143px] border-[3px] rounded-[10px] 
                            p-[15px] pr-[17px] pl-[25px] cursor-pointer transition-all duration-300 flex flex-col justify-center text-left
                  ${
                    selectedRole === "student"
                      ? "border-primary-500 bg-primary-50 shadow-md"
                      : "border-gray-300 bg-white hover:border-primary-300"
                  }`}
              >
                <h3 className="text-lg font-bold text-neutral-900 mb-2">
                  I’m a Student
                </h3>
                <p className="text-neutral-600 text-sm">
                  Participate in interactive polls and see results instantly.
                </p>
              </motion.div>

              {/* Teacher */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleRoleSelect("teacher")}
                className={`w-[387px] h-[143px] border-[3px] rounded-[10px] 
                            p-[15px] pr-[17px] pl-[25px] cursor-pointer transition-all duration-300 flex flex-col justify-center text-left
                  ${
                    selectedRole === "teacher"
                      ? "border-primary-500 bg-primary-50 shadow-md"
                      : "border-gray-300 bg-white hover:border-primary-300"
                  }`}
              >
                <h3 className="text-lg font-bold text-neutral-900 mb-2">
                  I’m a Teacher
                </h3>
                <p className="text-neutral-600 text-sm">
                  Create polls, manage questions, and view results live.
                </p>
              </motion.div>
            </div>

            {/* Continue Button (for student flow) */}
            {selectedRole && selectedRole !== "teacher" && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleRoleSelect(selectedRole)}
                className="text-white text-lg font-medium hover:shadow-lg transition-all duration-300"
                style={{
                  width: "234px",
                  height: "58px",
                  borderRadius: "34px",
                  background:
                    "linear-gradient(99.18deg,#8F64E1 -46.89%,#1D68BD 223.45%)",
                }}
              >
                Continue
              </motion.button>
            )}
          </div>
        ) : (
          // === Student Name Entry Step ===
          <div className="text-center">
            {/* Title */}
            <h1
              className="font-bold text-neutral-900 mb-4"
              style={{
                fontFamily: "Sora, sans-serif",
                fontSize: "36px",
                lineHeight: "50px",
              }}
            >
              Let’s <span className="font-extrabold">Get Started</span>
            </h1>
            <p
              className="text-neutral-600 mb-12 mx-auto"
              style={{
                fontFamily: "Sora, sans-serif",
                fontSize: "19px",
                lineHeight: "25px",
                width: "762px",
                maxWidth: "100%",
              }}
            >
              If you’re a student, you’ll be able to{" "}
              <span className="font-semibold">submit your answers</span>,
              participate in live polls, and see how your responses compare with
              your classmates
            </p>

            {/* Input Container */}
            <div
              className="mx-auto text-left mb-10"
              style={{ width: "507px", height: "95px" }}
            >
              <label className="block text-neutral-900 font-medium mb-2 text-[16px]">
                Enter your Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Rahul Bajaj"
                onKeyDown={(e) => e.key === "Enter" && handleNameSubmit()}
                className="w-full p-4 rounded-md bg-neutral-100 border border-gray-300 focus:border-primary-500 focus:outline-none transition-colors"
              />
            </div>

            {/* Continue Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleNameSubmit}
              disabled={!name.trim()}
              className="text-white text-lg font-medium hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                width: "234px",
                height: "58px",
                borderRadius: "34px",
                background:
                  "linear-gradient(99.18deg,#8F64E1 -46.89%,#1D68BD 223.45%)",
              }}
            >
              Continue
            </motion.button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Welcome;

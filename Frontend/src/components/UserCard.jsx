// src/components/UserCard.jsx
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

const UserCard = ({ user, onIgnore, onInterested }) => {
  const [direction, setDirection] = useState(null);

  const handleSwipe = (dir) => {
    setDirection(dir);

    setTimeout(() => {
      if (dir === "left") onIgnore();
      if (dir === "right") onInterested();
      setDirection(null);
    }, 300);
  };

  if (!user) return null;

  const { firstName, lastName, photoUrl, age, gender, about } = user;

  return (
    <AnimatePresence>
      <motion.div
        key={user._id}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{
          opacity: 1,
          scale: 1,
          x: direction === "right" ? 500 : direction === "left" ? -500 : 0,
          rotate: direction === "right" ? 15 : direction === "left" ? -15 : 0,
        }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="relative w-96"
      >
        <div className="rounded-2xl p-[2px] bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 shadow-2xl">
          <div className="bg-slate-800 rounded-2xl p-6 text-white">

            {/* Avatar */}
            <div className="flex justify-center">
              <div className="w-44 h-44 rounded-full overflow-hidden border-4 border-pink-500 shadow-lg">
                <img
                  src={photoUrl || "https://i.pravatar.cc/300"}
                  alt="profile"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <h2 className="text-2xl text-center font-bold mt-5">
              {firstName} {lastName}
            </h2>

            {age && gender && (
              <p className="text-center text-gray-400 mt-1">
                {age}, {gender}
              </p>
            )}

            <p className="text-center mt-4 text-gray-300">
              {about}
            </p>

            <div className="flex justify-center gap-6 mt-6">
              <button
                onClick={() => handleSwipe("left")}
                className="px-6 py-2 rounded-xl border border-gray-600 hover:bg-red-500 hover:text-white transition"
              >
                Ignore
              </button>

              <button
                onClick={() => handleSwipe("right")}
                className="px-6 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:scale-105 transition shadow-lg"
              >
                Interested
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default UserCard;
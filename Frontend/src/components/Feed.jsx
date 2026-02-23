// src/components/Feed.jsx

import axios from "axios";
import { BASE_URL } from "../utils/constant";
import { useDispatch, useSelector } from "react-redux";
import { addFeed } from "../utils/feedSlice";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import UserCard from "./UserCard";

const Feed = () => {
  const dispatch = useDispatch();
  const feed = useSelector((store) => store.feed);

  const [loading, setLoading] = useState(false);
  const [index, setIndex] = useState(0);
  const [showMatch, setShowMatch] = useState(false);

  /* ================= FETCH FEED ================= */
  useEffect(() => {
    const fetchFeed = async () => {
      try {
        setLoading(true);

        const res = await axios.get(`${BASE_URL}/feed`, {
          withCredentials: true,
        });

        dispatch(addFeed(res.data || []));
        setIndex(0);

      } catch (error) {
        console.error("Feed fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeed();
  }, [dispatch]);

  /* ================= SWIPE HANDLER ================= */
  const handleNext = () => {
    if (!feed || feed.length === 0) return;

    // Show Match popup
    setShowMatch(true);

    setTimeout(() => {
      setShowMatch(false);
      setIndex((prev) => (prev + 1) % feed.length);
    }, 800);
  };

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <div className="flex justify-center mt-10">
        <span className="loading loading-spinner loading-lg text-white" />
      </div>
    );
  }

  /* ================= NO USERS ================= */
  if (!feed || feed.length === 0) {
    return (
      <h1 className="text-center mt-10 text-gray-400">
        No Users Found
      </h1>
    );
  }

  /* ================= MAIN UI ================= */
  return (
    <>
      {/* MATCH POPUP */}
      {showMatch && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="bg-gradient-to-r from-pink-500 to-purple-600 p-10 rounded-2xl text-white text-center shadow-2xl"
          >
            <h1 className="text-3xl font-bold mb-4">💖 It's a Match!</h1>
            <p>You both liked each other</p>
          </motion.div>
        </div>
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex justify-center items-center h-[75vh] relative"
      >
        {/* BACK CARD (Stack Effect) */}
        {feed[index + 1] && (
          <div className="absolute scale-95 opacity-40 translate-y-6">
            <UserCard user={feed[index + 1]} />
          </div>
        )}

        {/* FRONT CARD */}
        <UserCard
          user={feed[index]}
          onIgnore={handleNext}
          onInterested={handleNext}
        />
      </motion.div>
    </>
  );
};

export default Feed;
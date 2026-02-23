import axios from "axios";
import { BASE_URL } from "../utils/constant";
import { useDispatch, useSelector } from "react-redux";
import { addFeed } from "../utils/feedSlice";
import { useEffect, useState } from "react";
import UserCard from "./UserCard";

const Feed = () => {
  const dispatch = useDispatch();
  const feed = useSelector((store) => store.feed);

  const [loading, setLoading] = useState(false);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        setLoading(true);

        const res = await axios.get(`${BASE_URL}/feed`, {
          withCredentials: true,
        });

        dispatch(addFeed(res.data));
      } catch (error) {
        console.error("Feed fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeed();
  }, [dispatch]); // ✅ no missing dependency warning

  const handleNext = () => {
    if (index < feed.length - 1) {
      setIndex((prev) => prev + 1);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center mt-10">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (!feed || feed.length === 0) {
    return (
      <h1 className="text-center mt-10 text-gray-500">
        No Users Found
      </h1>
    );
  }

  return (
    <div className="flex justify-center my-10">
      <UserCard
        user={feed[index]}
        onIgnore={handleNext}
        onInterested={handleNext}
      />
    </div>
  );
};

export default Feed;
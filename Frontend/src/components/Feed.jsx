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

  /* FETCH FEED */
  useEffect(() => {
    const fetchFeed = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${BASE_URL}/feed`, {
          withCredentials: true,
        });
        dispatch(addFeed(res.data || []));
      } catch (err) {
        console.error("Feed fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFeed();
  }, [dispatch]);

  /* IGNORE */
  const handleIgnore = async () => {
    try {
      await axios.post(
        `${BASE_URL}/request/send/ignore/${feed[index]._id}`,
        {},
        { withCredentials: true }
      );

      setIndex((prev) => prev + 1);
    } catch (err) {
      console.error("Ignore error:", err);
    }
  };

  /* INTERESTED */
  const handleInterested = async () => {
    try {
      await axios.post(
        `${BASE_URL}/request/send/interested/${feed[index]._id}`,
        {},
        { withCredentials: true }
      );

      setIndex((prev) => prev + 1);
    } catch (err) {
      console.error("Interested error:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center mt-10 text-white">
        Loading...
      </div>
    );
  }

  if (!feed || index >= feed.length) {
    return (
      <h1 className="text-center mt-10 text-gray-400">
        No More Users
      </h1>
    );
  }

  return (
    <div className="flex justify-center mt-10">
      <UserCard
        user={feed[index]}
        onIgnore={handleIgnore}
        onInterested={handleInterested}
      />
    </div>
  );
};

export default Feed;
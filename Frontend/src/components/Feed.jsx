import axios from "axios";
import { BASE_URL } from "../utils/constant";
import { useDispatch, useSelector } from "react-redux";
import { addFeed } from "../utils/feedSlice";
import { useEffect, useState } from "react";
import UserCard from "./UserCard";

const Feed = () => {
  const dispatch = useDispatch();
  const feed = useSelector((store) => store.feed);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const fetchFeed = async () => {
      const res = await axios.get(`${BASE_URL}/feed`, {
        withCredentials: true,
      });
      dispatch(addFeed(res.data || []));
    };
    fetchFeed();
  }, [dispatch]);

  const handleIgnore = async () => {
    await axios.post(
      `${BASE_URL}/request/send/ignore/${feed[index]._id}`,
      {},
      { withCredentials: true }
    );
    setIndex(index + 1);
  };

  const handleInterested = async () => {
    await axios.post(
      `${BASE_URL}/request/send/interested/${feed[index]._id}`,
      {},
      { withCredentials: true }
    );
    setIndex(index + 1);
  };

  if (!feed || index >= feed.length) {
    return (
      <h1 className="text-center mt-20 text-gray-400">
        No More Users
      </h1>
    );
  }

  return (
    <UserCard
      user={feed[index]}
      onIgnore={handleIgnore}
      onInterested={handleInterested}
    />
  );
};

export default Feed;
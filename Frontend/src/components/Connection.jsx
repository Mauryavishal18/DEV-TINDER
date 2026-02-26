import { useEffect, useState } from "react";
import axios from "axios";

const Connection = () => {
  const [connections, setConnections] = useState([]);

  useEffect(() => {
    fetchConnections();
  }, []);

  const fetchConnections = async () => {
    try {
      const response = await axios.get(
        "http://localhost:3000/connections",
        { withCredentials: true }
      );

      setConnections(response.data.data || []);
    } catch (error) {
      console.error("Connection fetch error:", error);
      setConnections([]);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f172a] to-[#111827] text-white flex flex-col items-center pt-10">

      <h1 className="text-3xl font-semibold mb-8">Connections</h1>

      <div className="w-full max-w-2xl">

        {connections.length === 0 ? (
          <p>No Connections</p>
        ) : (
          connections.map((user) => (
            <div
              key={user._id}
              className="flex items-center bg-[#1f2937] p-5 rounded-xl mb-5 shadow-lg hover:scale-[1.02] transition"
            >
              {/* Profile Image */}
              <img
                src={user.photoUrl}
                alt="profile"
                className="w-20 h-20 rounded-full object-cover mr-5"
              />

              {/* Info */}
              <div>
                <h2 className="text-xl font-bold">
                  {user.firstName}
                </h2>
                <p className="text-gray-400">
                  {user.age}, {user.gender}
                </p>
                <p className="text-gray-300 mt-1">
                  {user.about}
                </p>
              </div>
            </div>
          ))
        )}

      </div>
    </div>
  );
};

export default Connection;
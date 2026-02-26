import React from "react";

const UserCard = ({ user, onIgnore, onInterested }) => {
  if (!user) return null;

  return (
    <div className="flex justify-center items-center h-[80vh]">
      <div className="w-80 bg-[#1f2937] rounded-2xl shadow-2xl p-6 text-white text-center">

        {/* Profile Image */}
        <div className="flex justify-center">
          <img
            src={user.photoUrl || "https://i.pravatar.cc/300"}
            alt="profile"
            className="w-40 h-40 rounded-full object-cover"
          />
        </div>

        {/* Name */}
        <h2 className="text-xl font-bold mt-4">
          {user.firstName} {user.lastName}
        </h2>

        {/* About */}
        <p className="text-gray-400 text-sm mt-2">
          {user.about || "This is a default about of the user"}
        </p>

        {/* Buttons */}
        <div className="flex justify-center gap-4 mt-6">
          <button
            onClick={onIgnore}
            className="px-4 py-2 bg-indigo-600 rounded-lg hover:bg-indigo-500 transition"
          >
            Ignore
          </button>

          <button
            onClick={onInterested}
            className="px-4 py-2 bg-pink-600 rounded-lg hover:bg-pink-500 transition"
          >
            Interested
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserCard;
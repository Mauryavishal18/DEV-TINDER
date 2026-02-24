import React from "react";

const UserCard = ({ user, onIgnore, onInterested }) => {
  if (!user) return null;

  const { firstName, lastName, photoUrl, age, gender, about } = user;

  return (
    <div className="w-96 bg-slate-800 rounded-2xl p-6 text-white shadow-xl">
      <div className="flex justify-center">
        <img
          src={photoUrl || "https://i.pravatar.cc/300"}
          alt="profile"
          className="w-40 h-40 rounded-full object-cover"
        />
      </div>

      <h2 className="text-2xl font-bold text-center mt-4">
        {firstName} {lastName}
      </h2>

      <p className="text-center text-gray-400">
        {age} {gender && `, ${gender}`}
      </p>

      <p className="text-center mt-3">{about}</p>

      <div className="flex justify-center gap-6 mt-6">
        <button
          onClick={onIgnore}
          className="px-6 py-2 bg-gray-600 rounded-lg hover:bg-gray-500"
        >
          Ignore
        </button>

        <button
          onClick={onInterested}
          className="px-6 py-2 bg-pink-600 rounded-lg hover:bg-pink-500"
        >
          Interested
        </button>
      </div>
    </div>
  );
};

export default UserCard;
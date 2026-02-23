import { useState } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { addUser } from "../utils/userSlice";
import UserCard from "./UserCard";
import { BASE_URL } from "../utils/constant";

const EditProfile = ({ user }) => {
  const dispatch = useDispatch();

  const [firstName, setFirstName] = useState(user.firstName || "");
  const [lastName, setLastName] = useState(user.lastName || "");
  const [photoUrl, setPhotoUrl] = useState(user.photoUrl || "");
  const [age, setAge] = useState(user.age || "");
  const [gender, setGender] = useState(user.gender || "");
  const [about, setAbout] = useState(user.about || "");
  const [showToast, setShowToast] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    try {
      const res = await axios.patch(
        `${BASE_URL}/profile/edit`,
        { firstName, lastName, photoUrl, age, gender, about },
        { withCredentials: true }
      );

      dispatch(addUser(res.data.user)); // updated correctly
      setShowToast(true);
      setError("");

      setTimeout(() => setShowToast(false), 3000);

    } catch (err) {
      setError(err.response?.data?.message || "Profile update failed ❌");
    }
  };

  return (
    <div className="flex gap-10 justify-center items-start px-4">

      {showToast && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 bg-green-600 px-6 py-3 rounded-lg shadow-lg text-white z-50">
          Profile updated successfully ✅
        </div>
      )}

      <div className="w-96 bg-slate-800 rounded-2xl shadow-2xl p-6 text-white">
        <h2 className="text-xl font-bold text-center mb-4">Edit Profile</h2>

        <input
          className="input input-bordered w-full my-2 bg-slate-900 text-white"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          placeholder="First Name"
        />

        <input
          className="input input-bordered w-full my-2 bg-slate-900 text-white"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          placeholder="Last Name"
        />

        <input
          className="input input-bordered w-full my-2 bg-slate-900 text-white"
          value={photoUrl}
          onChange={(e) => setPhotoUrl(e.target.value)}
          placeholder="Photo URL"
        />

        <input
          type="number"
          className="input input-bordered w-full my-2 bg-slate-900 text-white"
          value={age}
          onChange={(e) => setAge(e.target.value)}
          placeholder="Age"
        />

        <input
          className="input input-bordered w-full my-2 bg-slate-900 text-white"
          value={gender}
          onChange={(e) => setGender(e.target.value)}
          placeholder="Gender"
        />

        <textarea
          className="textarea textarea-bordered w-full my-2 bg-slate-900 text-white"
          value={about}
          onChange={(e) => setAbout(e.target.value)}
          placeholder="About"
        />

        {error && <p className="text-red-400 mt-2">{error}</p>}

        <button
          className="btn w-full mt-4 bg-gradient-to-r from-indigo-500 to-purple-600"
          onClick={handleSave}
        >
          Save Profile
        </button>
      </div>

      <UserCard
        user={{ firstName, lastName, photoUrl, age, gender, about }}
      />
    </div>
  );
};

export default EditProfile;
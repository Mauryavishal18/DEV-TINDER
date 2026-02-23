// src/components/Profile.jsx
import { useSelector } from "react-redux";
import EditProfile from "./EditProfile";

const Profile = () => {
  const user = useSelector((store) => store.user);

  if (!user) {
    return <h1 className="text-center mt-10 text-gray-400">User Not Found</h1>;
  }

  return (
    <div className="flex justify-center my-10">
      <EditProfile user={user} />
    </div>
  );
};

export default Profile;
import { useSelector } from "react-redux";

const Feed = () => {
  const user = useSelector((store) => store.user);

  return (
    <div className="flex justify-center mt-10">
      <div className="card w-96 bg-base-200 shadow-xl p-5">
        
        <h2 className="text-2xl font-bold text-center mb-4">
          👋 Welcome to Feed
        </h2>

        {user ? (
          <div className="text-center">
            <img
              src={user.photoUrl || "https://i.pravatar.cc/150"}
              alt="User"
              className="w-24 h-24 rounded-full mx-auto mb-3"
            />
            <h3 className="text-xl font-semibold">
              {user.firstName} {user.lastName}
            </h3>
            <p className="text-gray-500">{user.emailId}</p>
          </div>
        ) : (
          <p className="text-center text-red-500">
            Please login to see your feed.
          </p>
        )}

      </div>
    </div>
  );
};

export default Feed;
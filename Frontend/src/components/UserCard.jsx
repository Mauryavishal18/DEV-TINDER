const UserCard = ({ user, onIgnore, onInterested }) => {
  const { firstName, lastName, photoUrl, age, gender, about } = user;

  return (
    <div className="card bg-base-100 w-96 shadow-xl">
      <figure>
        <img
          src={photoUrl || "https://i.pravatar.cc/300"}
          alt="user"
        />
      </figure>

      <div className="card-body">
        <h2 className="card-title">
          {firstName} {lastName}
        </h2>

        {age && gender && (
          <p className="text-gray-500">
            {age}, {gender}
          </p>
        )}

        <p>{about}</p>

        <div className="card-actions justify-end my-4">
          <button
            className="btn btn-outline"
            onClick={onIgnore}
          >
            Ignore
          </button>

          <button
            className="btn btn-secondary"
            onClick={onInterested}
          >
            Interested
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserCard;
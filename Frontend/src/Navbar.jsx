import { useSelector } from "react-redux";

const Navbar = () => {
  const user = useSelector((store) => store.user);
  console.log(user);

  return (
    <div className="navbar bg-base-100 shadow-sm">
      
      <div className="flex-1">
        <a className="btn btn-ghost text-xl">🔥 DEV-TINDER</a>
      </div>

      {user && (
        <div className="flex gap-2 items-center">
          
          <div className="form-control">
            Welcome, {user.firstName}
          </div>

          <div className="dropdown dropdown-end mx-5">
            
            <div
              tabIndex={0}
              role="button"
              className="btn btn-ghost btn-circle avatar"
            >
              <div className="w-10 rounded-full">
                <img
                  alt="User"
                  src={user.photoUrl || "https://i.pravatar.cc/150"}
                />
              </div>
            </div>

            <ul
              tabIndex={0}
              className="menu menu-sm dropdown-content bg-base-100 rounded-box z-50 mt-3 w-52 p-2 shadow"
            >
              <li><a>Profile</a></li>
              <li><a>Settings</a></li>
              <li><a>Logout</a></li>
            </ul>

          </div>
        </div>
      )}

    </div>
  );
};

export default Navbar;
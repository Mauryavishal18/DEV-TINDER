const Navbar = () => {
  return (
    <div className="navbar bg-base-100 shadow-sm">
      <div className="flex-1">
        <a className="btn btn-ghost text-xl">🔥DEV-TINDER</a>
      </div>

      <div className="flex gap-2">
        <div className="dropdown dropdown-end mx-5">
          <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
            <div className="w-10 rounded-full">
              <img
                alt="User"
                src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
              />
            </div>
          </div>

          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content bg-base-100 rounded-box z-50 mt-3 w-52 p-2 shadow">

            <li><a>Profile</a></li>
            <li><a>Settings</a></li>
            <li><a>Logout</a></li>

          </ul>
        </div>
      </div>
    </div>
  );
};

export default Navbar;

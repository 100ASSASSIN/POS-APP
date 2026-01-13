import { Button, Dropdown } from "flowbite-react";
// import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import api from "../../../utils/services/axios";
import { LogOut } from "lucide-react";

const Profile = () => {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();

  // Logout function
  const handleLogout = async () => {
    try {
      await api.post("/logout", {}, { withCredentials: true });
      refreshUser(); // refresh context
      navigate(user.default_role_route, { replace: true }); // redirect to login
    } catch (err: any) {
      console.error("Logout failed:", err);
      // alert(err.response?.data?.message || "Logout failed. Try again.");
    }
  };

  return (
    <div className="relative group/menu">
      <Dropdown
        label=""
        className="rounded-sm w-56"
        dismissOnClick={false}
        renderTrigger={() => (
          <span className="h-12 w-12 rounded-full overflow-hidden flex justify-center items-center cursor-pointer hover:bg-lightprimary">
            {user?.profile_image ? (
              <img
                src={user.profile_image}
                alt={user.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-white bg-primary h-full w-full flex items-center justify-center rounded-full font-semibold">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            )}
          </span>
        )}
      >
        {/* User Info */}
        <div className="px-3 py-3 border-b border-gray-200 flex flex-col items-start gap-1">
          <p className="font-semibold text-gray-800">{user?.name}</p>
          <p className="text-gray-500 text-sm">{user?.email}</p>
          <div className="flex items-center gap-2 mt-1">
            {/* <span className="relative flex h-3 w-3"> */}
              {/* Ping animation */}
              {/* <span className="absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75 animate-ping"></span> */}
              {/* Solid dot */}
              {/* <span className="relative inline-flex h-3 w-3 rounded-full bg-green-500"></span> */}
            {/* </span> */}
            <p className="text-primary text-xs font-bold">{user?.role?.toUpperCase()}</p>
          </div>

        </div>

        {/* Menu Items */}
        {/* <Dropdown.Item
          as={Link}
          to="#"
          className="px-3 py-3 flex items-center gap-3 text-dark"
        >
          <Icon icon="solar:user-circle-outline" height={20} />
          My Profile
        </Dropdown.Item> */}
        {/* <Dropdown.Item
          as={Link}
          to="#"
          className="px-3 py-3 flex items-center gap-3 text-dark"
        >
          <Icon icon="solar:letter-linear" height={20} />
          My Account
        </Dropdown.Item>
        <Dropdown.Item
          as={Link}
          to="#"
          className="px-3 py-3 flex items-center gap-3 text-dark"
        >
          <Icon icon="solar:checklist-linear" height={20} />
          My Task
        </Dropdown.Item> */}

        {/* Logout */}
        <div className="p-3 pt-0">
          <Button
            onClick={handleLogout}
            size="sm"
            className="mt-2 border border-primary text-primary bg-transparent hover:bg-lightprimary outline-none focus:outline-none w-full flex items-center justify-center gap-2"
          >
            <LogOut size={16} />
            Logout
          </Button>
        </div>
      </Dropdown>
    </div>
  );
};

export default Profile;

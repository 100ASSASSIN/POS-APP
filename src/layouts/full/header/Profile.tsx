
import { Button, Dropdown } from "flowbite-react";
import { Icon } from "@iconify/react";
import user1 from "/src/assets/images/profile/user-1.jpg";
import { Link } from "react-router";

const Profile = () => {
  return (
    <div className="relative group/menu">
      <Dropdown
        label=""
        className="rounded-sm w-44"
        dismissOnClick={false}
        renderTrigger={() => (
   <span className="h-10 w-10 rounded-full overflow-hidden flex justify-center items-center cursor-pointer hover:bg-lightprimary">
  <img
    src="https://images.pexels.com/photos/2116721/pexels-photo-2116721.jpeg"
    alt="profile"
    className="h-full w-full object-cover"
  />
</span>

        )}
      >

        <Dropdown.Item
          as={Link}
          to="#"
          className="px-3 py-3 flex items-center bg-hover group/link w-full gap-3 text-dark"
        >
          <Icon icon="solar:user-circle-outline" height={20} />
          My Profile
        </Dropdown.Item>
        <Dropdown.Item
          as={Link}
          to="#"
          className="px-3 py-3 flex items-center bg-hover group/link w-full gap-3 text-dark"
        >
          <Icon icon="solar:letter-linear" height={20} />
          My Account
        </Dropdown.Item>
        <Dropdown.Item
          as={Link}
          to="#"
          className="px-3 py-3 flex items-center bg-hover group/link w-full gap-3 text-dark"
        >
          <Icon icon="solar:checklist-linear" height={20} />
          My Task
        </Dropdown.Item>
        <div className="p-3 pt-0">
        <Button as={Link}  size={'sm'}  to="/auth/login" className="mt-2 border border-primary text-primary bg-transparent hover:bg-lightprimary outline-none focus:outline-none">Logout</Button>
        </div>
      </Dropdown>
    </div>
  );
};

export default Profile;

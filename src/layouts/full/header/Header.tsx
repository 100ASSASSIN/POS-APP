
import { useState, useEffect } from "react";
// import { Button, Navbar } from "flowbite-react";
import { Navbar } from "flowbite-react";
import { Icon } from "@iconify/react";
import Profile from "./Profile";
// import Notification from "./notification";
import { Drawer } from "flowbite-react";
import MobileSidebar from "../sidebar/MobileSidebar";
// import { Link } from "react-router";
import { useAuth } from "../../../context/AuthContext";


const Header = () => {
  const { user } = useAuth();
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsSticky(true);
      } else {
        setIsSticky(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // mobile-sidebar
  const [isOpen, setIsOpen] = useState(false);
  const handleClose = () => setIsOpen(false);
  return (
    <>
      <header
        className={`sticky top-0 z-[5] ${isSticky
          ? "bg-white dark:bg-dark fixed w-full"
          : "bg-white"
          }`}
      >
        <Navbar
          fluid
          className={`rounded-none bg-transparent dark:bg-transparent py-4 sm:px-30 px-4`}
        >
          {/* Mobile Toggle Icon */}

          <div className="flex gap-3 items-center justify-between w-full ">
            <div className="flex gap-2 items-center">
              <span
                onClick={() => setIsOpen(true)}
                className="h-10 w-10 flex text-black dark:text-white text-opacity-65 xl:hidden hover:text-primary hover:bg-lightprimary rounded-full justify-center items-center cursor-pointer"
              >
                <Icon icon="solar:hamburger-menu-line-duotone" height={21} />
              </span>
              {/* <Notification /> */}
            </div>

            <div className="flex gap-4 items-center">
              {/* <Button as={Link} target="_blank" to="https://adminmart.com/product/matdash-tailwind-react-admin-template/?ref=56#product-demo-section" size={'sm'} color={"primary"} className="rounded-md py-1 px-3">
                {user.role}
              </Button> */}
              {/* User Info */}
              <div className="px-3 py-3  flex flex-col items-start gap-1">
            
                <div className="flex items-center gap-2 mt-1">
                  <span className="relative flex h-3 w-3">
                    {/* Ping animation */}
                    <span className="absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75 animate-ping"></span>
                    {/* Solid dot */}
                    <span className="relative inline-flex h-3 w-3 rounded-full bg-green-500"></span>
                  </span>
                  <p className="text-gray-500 text-xs font-semibold">{user?.role?.toUpperCase()}</p>
                </div>
                    <p className="font-bold text-gray-900">{user?.name}</p>
                {/* <p className="font-semibold text-gray-800">{user?.location}</p> */}
                {/* <p className="font-semibold text-gray-800">{user?.email}</p> */}
                {/* <p className="font-semibold text-gray-800">{user?.phone}</p> */}
              </div>
              <Profile />

            </div>
          </div>
        </Navbar>
      </header>

      {/* Mobile Sidebar */}
      <Drawer open={isOpen} onClose={handleClose} className="w-130">
        <Drawer.Items>
          <MobileSidebar />
        </Drawer.Items>
      </Drawer>
    </>
  );
};

export default Header;

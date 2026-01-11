import { Sidebar } from "flowbite-react";
import NavItems from "./NavItems";
// @ts-ignore
import SimpleBar from "simplebar-react";
import React from "react";
import FullLogo from "../shared/logo/FullLogo";
import NavCollapse from "./NavCollapse";
import { useSidebarMenu } from "../../../context/SidebarMenuContext";
import { Icon } from '@iconify/react';

interface SidebarChild {
  id: number | string;
  heading?: string | null;
  name: string;
  icon?: string | null;
  url?: string | null;
  parent_id?: number | null;
  children?: SidebarChild[];
}

const SidebarLayout = () => {
  const { menu: SidebarContent, loading } = useSidebarMenu();

  if (loading || !SidebarContent) return null;

  return (
    <div className="xl:block hidden h-screen"> {/* Make parent full height */}
      <Sidebar
        className="fixed menu-sidebar bg-white dark:bg-darkgray rtl:pe-4 rtl:ps-0 top-0 bottom-0 h-screen"
        aria-label="Sidebar with multi-level dropdown example"
      >
        <div className="px-6 py-4 flex items-center sidebar-logo">
          <FullLogo />
        </div>

        {/* SimpleBar now takes full height minus logo */}
        <SimpleBar style={{ maxHeight: 'calc(100vh - 64px)' }}> 
          <Sidebar.Items className="px-5 mt-2">
            <Sidebar.ItemGroup className="sidebar-nav hide-menu">
              {SidebarContent.map((item: SidebarChild) => (
                <div className="caption" key={item.id.toString()}>
                  {item.heading && (
                    <h5 className="text-link dark:text-white/70 caption font-semibold leading-6 tracking-widest text-xs pb-2 uppercase">
                      {item.heading}
                    </h5>
                  )}

                  {item.children?.map((child: SidebarChild) => (
                    <React.Fragment key={child.id.toString()}>
                      {child.children && child.children.length > 0 ? (
                        <div className="collapse-items">
                          <NavCollapse item={child} />
                        </div>
                      ) : (
                        <NavItems item={child} />
                      )}
                    </React.Fragment> 
                  ))}
                </div>
              ))}
            </Sidebar.ItemGroup>
          </Sidebar.Items>
        </SimpleBar>
      </Sidebar>
    </div>
  );
};

export default SidebarLayout;

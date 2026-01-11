import { Sidebar } from "flowbite-react";
import NavItems from "./NavItems";
// @ts-ignore
import SimpleBar from "simplebar-react";
import React, { useRef, useEffect, useState } from "react";
import FullLogo from "../shared/logo/FullLogo";
import { useSidebarMenu } from "../../../context/SidebarMenuContext";
import 'simplebar-react/dist/simplebar.min.css';

const MobileSidebar = () => {
  const { menu: SidebarContent, loading } = useSidebarMenu();
  const logoRef = useRef<HTMLDivElement>(null);
  const [scrollHeight, setScrollHeight] = useState<number>(0);

  useEffect(() => {
    const updateHeight = () => {
      const logoHeight = logoRef.current?.offsetHeight || 0;
      setScrollHeight(window.innerHeight - logoHeight);
    };

    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  if (loading || !SidebarContent) return null;

  return (
    <div>
      <Sidebar
        className="fixed menu-sidebar pt-0 bg-white dark:bg-darkgray transition-all"
        aria-label="Sidebar with multi-level dropdown example"
      >
        <div ref={logoRef} className="px-5 py-4 pb-7 flex items-center sidebarlogo">
          <FullLogo />
        </div>

        <SimpleBar style={{ maxHeight: scrollHeight }}>
          <Sidebar.Items className="px-5 mt-2">
            <Sidebar.ItemGroup className="sidebar-nav hide-menu">
              {SidebarContent.map((item, index) => (
                <div className="caption" key={item.id ?? index}>
                  <React.Fragment>
                    {item.heading && (
                      <h5 className="text-link dark:text-white/70 caption font-semibold leading-6 tracking-widest text-xs pb-2 uppercase">
                        {item.heading}
                      </h5>
                    )}
                    {item.children?.map((child) => (
                      <React.Fragment key={child.id}>
                        {child.children && child.children.length > 0 ? (
                          <div className="collapse-items">
                            {/* For nested items, you can reuse NavItems or create NavCollapse */}
                            <NavItems item={child} />
                          </div>
                        ) : (
                          <NavItems item={child} />
                        )}
                      </React.Fragment>
                    ))}
                  </React.Fragment>
                </div>
              ))}
            </Sidebar.ItemGroup>
          </Sidebar.Items>
        </SimpleBar>
      </Sidebar>
    </div>
  );
};

export default MobileSidebar;

import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../utils/services/axios";

export interface SidebarChild {
  id: number;
  name: string;
  icon?: string | null;
  url?: string | null;
  parent_id?: number;
}

export interface SidebarItem {
  id: number;
  heading?: string | null;
  name: string;
  children?: SidebarChild[];
}

interface SidebarMenuContextType {
  menu: SidebarItem[];
  loading: boolean;
  refreshMenu: () => Promise<void>;
}

const SidebarMenuContext = createContext<SidebarMenuContextType | null>(null);

export const SidebarMenuProvider = ({ children }: { children: React.ReactNode }) => {
  const [menu, setMenu] = useState<SidebarItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMenu = async () => {
    setLoading(true);
    try {
      const res = await api.get("/sidebar-menu");
      setMenu(res.data);
    } catch (error) {
      console.error("Failed to load sidebar menu", error);
      setMenu([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  return (
    <SidebarMenuContext.Provider
      value={{
        menu,
        loading,
        refreshMenu: fetchMenu,
      }}
    >
      {children}
    </SidebarMenuContext.Provider>
  );
};

export const useSidebarMenu = () => {
  const context = useContext(SidebarMenuContext);
  if (!context) {
    throw new Error("useSidebarMenu must be used inside SidebarMenuProvider");
  }
  return context;
};

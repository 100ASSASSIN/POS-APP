import { uniqueId } from "lodash";

export interface ChildItem {
  id?: string;
  name?: string;
  icon?: string;
  url?: string;
  color?: string;
  isPro?: boolean;
  children?: ChildItem[];
}

export interface MenuItem {
  heading?: string;
  children?: ChildItem[];
}

const SidebarContent: MenuItem[] = [
  {
    heading: "HOME",
    children: [
      {
        id: uniqueId(),
        name: "POS Dashboard",
        icon: "solar:widget-add-line-duotone",
        url: "/",
        isPro: false,
      },
    ],
  },
];

export default SidebarContent;

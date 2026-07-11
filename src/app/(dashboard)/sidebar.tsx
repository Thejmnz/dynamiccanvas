import { Logo } from "./logo";
import { SidebarRoutes } from "./sidebar-routes";
import { CreditUsage } from "./credit-usage";

export const Sidebar = () => {
  return (
    <aside className="fixed left-0 z-40 hidden h-full w-[280px] shrink-0 flex-col border-r-2 border-[#101426] bg-[#101426] text-white lg:flex">
      <Logo />
      <div className="mx-5 h-px bg-white/10" />
      <SidebarRoutes />
      <CreditUsage />
    </aside>
  );
};

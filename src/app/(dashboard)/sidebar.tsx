import { Logo } from "./logo";
import { SidebarRoutes } from "./sidebar-routes";
import { CreditUsage } from "./credit-usage";

export const Sidebar = () => {
  return (
    <aside className="fixed left-0 z-40 hidden h-full w-[250px] shrink-0 flex-col border-r border-[#101426]/10 bg-white text-[#101426] shadow-[8px_0_40px_rgba(16,20,38,.03)] lg:flex">
      <Logo />
      <div className="mx-5 h-px bg-[#101426]/[0.07]" />
      <SidebarRoutes />
      <CreditUsage />
    </aside>
  );
};

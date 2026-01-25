import { Space_Grotesk } from "next/font/google";
import { cn } from "@/lib/utils";

interface AuthLayoutProps {
  children: React.ReactNode;
};

const font = Space_Grotesk({
  weight: ["700"],
  subsets: ["latin"],
});

const AuthLayout = ({ children }: AuthLayoutProps) => {
  return (
    <div className="bg-[url(https://xsjtlbmaazrhwhoorubk.supabase.co/storage/v1/object/public/media/uploads/colors-hd-backgrounds.jpg)] bg-top bg-cover h-full flex flex-col">
      <div className="z-[4] h-full w-full flex flex-col items-center justify-center">
        <h1 className={cn(font.className, "text-4xl font-bold text-white mb-6")}>Dynamic Canvas</h1>
        <div className="h-full w-full md:h-auto md:w-[420px]">
          {children}
        </div>
      </div>
      <div className="fixed inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.8),rgba(0,0,0,.4),rgba(0,0,0,.8))] z-[1]" />
    </div>
  );
};

export default AuthLayout;

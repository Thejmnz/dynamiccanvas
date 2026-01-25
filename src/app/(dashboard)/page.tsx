// import { protectServer } from "@/features/auth/utils"; // Removed - using client-side auth

import { ProjectsSection } from "./projects-section";
import { TemplatesSection } from "./templates-section";

export default function Home() {
  // await protectServer(); // Removed - protected by layout

  return (
    <div className="flex flex-col space-y-6 max-w-screen-xl mx-auto pb-10 pt-6">
      <TemplatesSection />
      <ProjectsSection />
    </div>
  );
};


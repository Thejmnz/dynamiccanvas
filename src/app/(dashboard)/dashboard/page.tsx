import { ProjectsSection } from "@/app/(dashboard)/projects-section";
import { TemplatesSection } from "@/app/(dashboard)/templates-section";

export default function DashboardPage() {
  return (
    <div className="flex flex-col space-y-6 max-w-screen-xl mx-auto pb-10 pt-6">
      <TemplatesSection />
      <ProjectsSection />
    </div>
  );
};

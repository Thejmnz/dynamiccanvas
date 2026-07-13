"use client";

import Link from "next/link";
import { TriangleAlert } from "lucide-react";

import { useGetProject } from "@/features/projects/api/use-get-project";

import { Editor } from "@/features/editor/components/editor";
import { BrandLoading } from "@/components/brand-loading";
import { Button } from "@/components/ui/button";

interface EditorProjectIdPageProps {
  params: {
    projectId: string;
  };
};

const EditorProjectIdPage = ({
  params,
}: EditorProjectIdPageProps) => {
  const { 
    data, 
    isLoading, 
    isError
  } = useGetProject(params.projectId);

  if (isLoading || !data) {
    return <BrandLoading fullScreen label="" />;
  }

  if (isError) {
    return (
      <div className="h-full flex flex-col gap-y-5 items-center justify-center">
        <TriangleAlert className="size-6 text-muted-foreground" />
        <p className="text-muted-foreground text-sm">
          Failed to fetch project
        </p>
        <Button asChild variant="secondary">
          <Link href="/">
            Back to Home
          </Link>
        </Button>
      </div>
    );
  }

  return <Editor initialData={data} />
};
 
export default EditorProjectIdPage;

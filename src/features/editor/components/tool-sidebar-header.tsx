interface ToolSidebarHeaderProps {
  title: string;
  description?: string;
};

export const ToolSidebarHeader = ({
  title,
  description
}: ToolSidebarHeaderProps) => {
  return (
    <div className="h-[60px] space-y-0.5 border-b px-4 py-2.5">
      <p className="text-sm font-medium">
        {title}
      </p>
      {description && (
        <p className="text-xs text-muted-foreground">
          {description}
        </p>
      )}
    </div>
  );
};

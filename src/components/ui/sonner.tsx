"use client"

import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      toastOptions={{
        style: {
          background: "#ffffff",
          color: "#101426",
          border: "1px solid #dedbea",
          borderRadius: "14px",
          boxShadow: "0 16px 40px rgba(34, 24, 72, 0.14)",
        },
        classNames: {
          toast: "group toast font-semibold",
          title: "text-[#101426]",
          description: "text-[#68647a] font-normal",
          success: "[&_[data-icon]]:text-[#5b35d5]",
          error: "[&_[data-icon]]:text-red-500",
          actionButton:
            "bg-[#5b35d5] text-white",
          cancelButton:
            "bg-[#f1effa] text-[#4c3f86]",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }

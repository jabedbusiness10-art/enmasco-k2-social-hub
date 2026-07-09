"use client";

import { Toaster as SonnerToaster } from "sonner";

type ToasterProps = React.ComponentProps<typeof SonnerToaster>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <SonnerToaster
      theme="dark"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-white/10 group-[.toaster]:text-white group-[.toaster]:border-white/10 group-[.toaster]:shadow-lg",
          title: "text-white/90",
          description: "text-white/60",
          actionButton:
            "group-[.toaster]:bg-sky-500/20 group-[.toaster]:text-sky-200",
          cancelButton:
            "group-[.toaster]:bg-white/10 group-[.toaster]:text-white/70",
        },
      }}
      closeButton
      {...props}
    />
  );
};

export { Toaster };

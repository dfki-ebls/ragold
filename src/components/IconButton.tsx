import type { ComponentProps } from "react";
import { Button } from "@/components/ui/button";

/** Small icon-only button whose label serves as tooltip and accessible name. */
export function IconButton({
  label,
  ...props
}: Omit<ComponentProps<typeof Button>, "title" | "aria-label"> & { label: string }) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      title={label}
      aria-label={label}
      {...props}
    />
  );
}

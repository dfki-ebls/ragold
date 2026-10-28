import { Popover as PopoverPrimitive } from "@base-ui/react/popover";
import { Button } from "@/components/ui/button";
import { Popover, PopoverDescription, PopoverHeader, PopoverTitle } from "@/components/ui/popover";
import type { VirtualAnchor } from "@/lib/selection";

export interface SelectionOption<T extends string> {
  value: T;
  label: string;
  description: string;
}

interface SelectionPopoverProps<T extends string> {
  /** The popover is open while an anchor is set. */
  anchor: VirtualAnchor | null;
  title: string;
  /** Selected content, shown as a short excerpt. */
  excerpt: string;
  options: readonly SelectionOption<T>[];
  onPick: (value: T) => void;
  onClose: () => void;
}

/** Choice popup next to a text or cell selection, shared by passages and key facts. */
export function SelectionPopover<T extends string>({
  anchor,
  title,
  excerpt,
  options,
  onPick,
  onClose,
}: SelectionPopoverProps<T>) {
  return (
    <Popover
      open={anchor !== null}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Positioner
          anchor={anchor}
          side="bottom"
          sideOffset={8}
          collisionPadding={8}
          className="isolate z-50"
        >
          <PopoverPrimitive.Popup className="flex w-72 origin-(--transform-origin) flex-col gap-3 rounded-3xl bg-popover p-3 text-sm text-popover-foreground shadow-lg ring-1 ring-foreground/5 outline-hidden duration-100 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 dark:ring-foreground/10">
            <PopoverHeader className="px-1">
              <PopoverTitle className="text-sm">{title}</PopoverTitle>
              <PopoverDescription className="line-clamp-2 text-xs italic">
                {excerpt}
              </PopoverDescription>
            </PopoverHeader>
            <div className="flex flex-col gap-1">
              {options.map((option) => (
                <Button
                  key={option.value}
                  variant="ghost"
                  className="h-auto flex-col items-start gap-0 rounded-2xl py-2 text-left whitespace-normal"
                  onClick={() => onPick(option.value)}
                >
                  <span className="font-medium">{option.label}</span>
                  <span className="text-xs font-normal text-muted-foreground">
                    {option.description}
                  </span>
                </Button>
              ))}
            </div>
          </PopoverPrimitive.Popup>
        </PopoverPrimitive.Positioner>
      </PopoverPrimitive.Portal>
    </Popover>
  );
}

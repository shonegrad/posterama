import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "./utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 ease-out disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive active:scale-[0.96]",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/85 hover:shadow-xl hover:shadow-primary/30 dark:hover:shadow-primary/50 hover:scale-[1.02] active:scale-[0.98]",
        destructive:
          "bg-destructive text-white hover:bg-destructive/85 hover:shadow-xl hover:shadow-destructive/30 dark:hover:shadow-destructive/50 hover:scale-[1.02] active:scale-[0.98] focus-visible:ring-destructive/30 dark:focus-visible:ring-destructive/50 dark:bg-destructive/70",
        outline:
          "border-2 border-border bg-background text-foreground hover:bg-accent hover:text-accent-foreground hover:border-primary/50 hover:shadow-lg hover:shadow-primary/20 dark:hover:shadow-primary/30 hover:scale-[1.01] active:scale-[0.99] dark:bg-input/30 dark:border-input dark:hover:bg-input/70 dark:hover:border-primary/60",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:shadow-lg hover:shadow-secondary/20 hover:scale-[1.01] active:scale-[0.99]",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50 hover:shadow-md hover:shadow-primary/10 dark:hover:shadow-primary/20 hover:scale-[1.01] active:scale-[0.99]",
        link: "text-primary underline-offset-4 hover:underline hover:text-primary/80 active:text-primary/60",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9 rounded-md",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

const Button = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }
>(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  );
});

Button.displayName = "Button";

export { Button, buttonVariants };

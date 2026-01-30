"use client";

import * as React from "react";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { type VariantProps } from "class-variance-authority";

const RadioButtonGroup = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root> & {
    orientation?: "horizontal" | "vertical";
  }
>(({ className, orientation = "horizontal", ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Root
      className={cn(
        `inline-flex overflow-hidden rounded-lg border border-input bg-background
        shadow-sm shadow-black/5`,
        orientation === "horizontal" ? "flex-row" : "flex-col",
        className,
      )}
      {...props}
      ref={ref}
    />
  );
});
RadioButtonGroup.displayName = "RadioButtonGroup";

const RadioButtonGroupItem = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item> &
    VariantProps<typeof buttonVariants> & {
      orientation?: "horizontal" | "vertical";
    }
>(
  (
    {
      className,
      children,
      variant = "ghost",
      size = "default",
      orientation = "horizontal",
      ...props
    },
    ref,
  ) => {
    return (
      <RadioGroupPrimitive.Item
        ref={ref}
        className={cn(
          buttonVariants({ variant, size }),
          "relative cursor-pointer rounded-none border-0 shadow-none transition-colors",
          "first:rounded-l-md last:rounded-r-md",
          orientation === "vertical" && "",
          "hover:bg-accent hover:text-accent-foreground",
          `focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2
          focus-visible:ring-ring focus-visible:ring-offset-0`,
          "disabled:pointer-events-none disabled:opacity-50",
          "data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
          "data-[state=checked]:hover:bg-primary/90",
          orientation === "horizontal"
            ? "not-last:border-r"
            : "not-last:border-b",
          className,
        )}
        {...props}
      >
        {children}
      </RadioGroupPrimitive.Item>
    );
  },
);
RadioButtonGroupItem.displayName = "RadioButtonGroupItem";

export { RadioButtonGroup, RadioButtonGroupItem };

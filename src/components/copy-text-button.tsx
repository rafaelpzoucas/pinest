"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function CopyTextButton({
  textToCopy,
  buttonText,
  variant = "outline",
}: {
  textToCopy: string;
  buttonText?: string;
  variant?:
    | "link"
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | null;
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopyText() {
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 3000);
    } catch (error) {
      toast.error("Não foi possível copiar.");
      console.error(error);
    }
  }

  return (
    <Button
      onClick={handleCopyText}
      disabled={copied}
      variant={variant}
      size={!buttonText ? "icon" : "sm"}
      className={cn(
        variant === "link" && "px-0 hover:no-underline [&_svg]:size-3 !h-fit",
      )}
    >
      {copied ? (
        <>
          <Check className="w-3 h-3" /> {buttonText}
        </>
      ) : (
        <>
          <Copy className="w-3 h-3" /> {buttonText}
        </>
      )}
    </Button>
  );
}

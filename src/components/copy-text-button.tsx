"use client";

import { Button } from "@/components/ui/button";
import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function CopyTextButton({
  textToCopy,
  buttonText,
}: {
  textToCopy: string;
  buttonText?: string;
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
      variant="outline"
      size={!buttonText ? "icon" : "sm"}
    >
      {copied ? (
        <>
          <Check className="w-3 h-3" /> {buttonText} copiado(a)!
        </>
      ) : (
        <>
          <Copy className="w-3 h-3" /> {buttonText}
        </>
      )}
    </Button>
  );
}

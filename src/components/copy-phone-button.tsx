"use client";

import { Button } from "@/components/ui/button";
import { Check, Copy } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { parsePhoneNumberFromString, CountryCode } from "libphonenumber-js";
import { cn } from "@/lib/utils";

interface CopyPhoneButtonProps {
  phone: string;
  variant?:
    | "link"
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | null;
  /**
   * Se true → copia com DDI (ex: 5518999999999)
   * Se false → copia apenas nacional (ex: 18999999999)
   */
  includeCountryCode?: boolean;
  defaultCountry?: CountryCode;
}

export function CopyPhoneButton({
  phone,
  variant = "outline",
  includeCountryCode = false,
  defaultCountry = "BR",
}: CopyPhoneButtonProps) {
  const [copied, setCopied] = useState(false);

  const parsedPhone = useMemo(() => {
    try {
      return parsePhoneNumberFromString(phone, defaultCountry);
    } catch {
      return null;
    }
  }, [phone, defaultCountry]);

  const displayPhone = useMemo(() => {
    if (!parsedPhone) {
      return phone;
    }

    /**
     * Exibição amigável:
     * Ex: (18) 99999-9999
     */
    return parsedPhone.formatNational();
  }, [parsedPhone]);

  const phoneToCopy = useMemo(() => {
    if (!parsedPhone) {
      return phone.replace(/\D/g, "");
    }

    /**
     * Texto que será copiado
     */
    if (includeCountryCode) {
      // 5518999999999 (sem +)
      return parsedPhone.number.replace("+", "");
    }

    // 18999999999
    return parsedPhone.nationalNumber;
  }, [parsedPhone, includeCountryCode, phone]);

  async function handleCopyPhone() {
    try {
      await navigator.clipboard.writeText(phoneToCopy);
      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 3000);
    } catch (error) {
      toast.error("Não foi possível copiar o telefone.");
      console.error(error);
    }
  }

  return (
    <Button
      onClick={handleCopyPhone}
      disabled={copied}
      variant={variant}
      size="sm"
      className={cn(
        variant === "link" && "!p-0 hover:no-underline [&_svg]:size-3 h-fit",
      )}
    >
      {copied ? (
        <>
          <Check className="w-3 h-3" />
          {displayPhone}
        </>
      ) : (
        <>
          <Copy className="w-3 h-3" />
          {displayPhone}
        </>
      )}
    </Button>
  );
}

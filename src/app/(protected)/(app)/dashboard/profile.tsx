"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createPath, formatAddress } from "@/lib/utils";
import { StoreType } from "@/models/store";
import { Check, Clipboard, MapPin, Phone } from "lucide-react";
import { useState } from "react";

export function ProfileCard({ store }: { store: StoreType }) {
  const [copied, setCopied] = useState(false);

  const domain =
    store.custom_domain ?? `${store.store_subdomain}.pinest.com.br`;
  const fullUrl =
    process.env.NODE_ENV === "production"
      ? domain
      : createPath("/", store.store_subdomain);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Erro ao copiar o link:", error);
    }
  };

  return (
    <Card className="break-inside-avoid">
      <CardHeader>
        <CardTitle className="capitalize">{store?.name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <span className="flex flex-row gap-2 text-sm text-muted-foreground w-full">
          <MapPin className="w-4 h-4 min-w-4" />
          {formatAddress(store?.addresses[0])}
        </span>
        <span className="flex flex-row gap-2 text-sm text-muted-foreground w-full">
          <Phone className="w-4 h-4" />
          {store?.phone}
        </span>
        <Button onClick={handleCopy} className="w-full max-w-sm">
          {copied ? (
            <>
              Copiado!
              <Check className="w-4 h-4 ml-2" />
            </>
          ) : (
            <>
              Copiar link da loja
              <Clipboard className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

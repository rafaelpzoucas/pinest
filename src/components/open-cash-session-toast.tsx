"use client";

import { OpenCashSession } from "@/app/(protected)/(app)/cash-register/open";
import { useReadCashSession } from "@/features/cash-register/hooks";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { Card } from "./ui/card";

export function OpenCashSessionToast() {
  const { data: cashSession, isLoading } = useReadCashSession();
  const isCashSessionOpen = cashSession !== null && cashSession !== undefined;

  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Só mostra o toast se não estiver carregando e o caixa não estiver aberto
    if (!isLoading) {
      setIsOpen(!isCashSessionOpen);
    }
  }, [isCashSessionOpen, isLoading]);

  // Não renderiza nada enquanto está carregando
  if (isLoading) {
    return null;
  }

  return (
    <Card
      className="hidden lg:block fixed bottom-4 right-4 p-4 bg-secondary opacity-0
        translate-y-full data-[visible=true]:opacity-100
        data-[visible=true]:translate-y-0 transition-all duration-200 ease-in-out z-50"
      data-visible={isOpen}
    >
      <section className="space-y-6">
        <header className="flex flex-row gap-4">
          <p className="max-w-md">
            O caixa ainda não foi aberto. Inicie uma sessão para registrar o
            fluxo de entradas e saídas.
          </p>

          <button className="h-fit" onClick={() => setIsOpen(false)}>
            <X />
          </button>
        </header>

        <OpenCashSession />
      </section>
    </Card>
  );
}

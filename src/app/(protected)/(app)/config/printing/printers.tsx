// printers.tsx
"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { Plus } from "lucide-react";
import { useState } from "react";
import { NewPrinterForm } from "./new-printer-form";
import { PrinterCard } from "./printer-card";
import { PrinterType } from "@/features/printers/schemas";

export function Printers({ printers }: { printers?: PrinterType[] }) {
  if (!printers) {
    return null;
  }

  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Card>
        <CardHeader>Configure as impressoras pelo app desktop.</CardHeader>
      </Card>
    );
  }

  return (
    <div>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Minhas impressoras</CardTitle>
              <CardDescription>
                Selecione e configure suas impressoras
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="secondary">
                <Plus /> Adicionar impressora
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Nova impressora</SheetTitle>
              </SheetHeader>

              <NewPrinterForm setSheetState={setIsOpen} />
            </SheetContent>
          </Sheet>

          {printers.length > 0 &&
            printers.map((printer) => (
              <PrinterCard key={printer.id} printer={printer} />
            ))}
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import { Button, buttonVariants } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { openCashSessionSchema } from "./schemas";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useState } from "react";
import { useCreateCashSession } from "@/features/cash-register/hooks";

export function OpenCashSession() {
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const form = useForm<z.infer<typeof openCashSessionSchema>>({
    resolver: zodResolver(openCashSessionSchema),
    defaultValues: {
      opening_balance: "",
    },
  });

  const { mutate, isPending } = useCreateCashSession();

  // 2. Define a submit handler.
  function onSubmit(values: z.infer<typeof openCashSessionSchema>) {
    mutate(values);
  }

  return (
    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
      <SheetTrigger className={buttonVariants()}>Abrir caixa</SheetTrigger>
      <SheetContent className="space-y-8">
        <SheetHeader className="items-start mb-4">
          <div className="flex flex-row items-center gap-2">
            <SheetClose
              className={buttonVariants({ variant: "ghost", size: "icon" })}
            >
              <ArrowLeft />
            </SheetClose>
            <SheetTitle className="!mt-0">Abertura de caixa</SheetTitle>
          </div>
          <SheetDescription className="!mt-0">
            Insira o valor inicial do seu caixa.
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="opening_balance"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor inicial</FormLabel>
                  <FormControl>
                    <Input
                      maskType="currency"
                      placeholder="Insira o valor inicial..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  <span>Abrindo caixa</span>
                </>
              ) : (
                "Abrir caixa"
              )}
            </Button>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}

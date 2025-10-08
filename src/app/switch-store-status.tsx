"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useServerAction } from "zsa-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { createClient } from "@/lib/supabase/client";
import { updateStoreStatus } from "./admin/(protected)/(app)/actions";

const FormSchema = z.object({
  is_open: z.boolean(),
});

export function SwitchStoreStatus({
  isOpen,
  storeId,
}: {
  isOpen?: boolean;
  storeId?: string;
}) {
  const supabase = createClient();
  const router = useRouter();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      is_open: isOpen,
    },
  });

  const { execute, isPending } = useServerAction(updateStoreStatus, {
    onSuccess: () => {
      console.info("Store status updated successfully");
    },
    onError: (error) => {
      console.error("Error updating store status:", error);
    },
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    await execute({ isOpen: data.is_open });
  }

  const isSwitchOpen = form.watch("is_open");

  useEffect(() => {
    const channel = supabase
      .channel(`store-status-${storeId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "stores",
          filter: `id=eq.${storeId}`,
        },
        async () => {
          const { data, error } = await supabase
            .from("stores")
            .select("is_open")
            .eq("id", storeId)
            .single();

          if (!error && data) {
            form.setValue("is_open", data.is_open);
          }
          router.refresh();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [storeId]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="is_open"
          render={({ field }) => (
            <FormItem className="flex flex-row items-end lg:items-center gap-0 lg:gap-2 w-full">
              <div className="space-y-0.5">
                <FormLabel className="text-sm">
                  {isPending ? (
                    <span className="flex flex-row items-center">
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Atualizando...
                    </span>
                  ) : isSwitchOpen ? (
                    "Loja aberta"
                  ) : (
                    "Loja fechada"
                  )}
                </FormLabel>
              </div>
              <FormControl>
                <Switch
                  disabled={isPending}
                  checked={field.value}
                  onCheckedChange={(value) => {
                    field.onChange(value);
                    form.handleSubmit(onSubmit)();
                  }}
                  className="ml-auto data-[state=unchecked]:bg-destructive
                    data-[state=checked]:bg-emerald-600"
                />
              </FormControl>
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}

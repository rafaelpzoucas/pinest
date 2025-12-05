"use client";

import { z } from "zod";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  useCreateAdminAddress,
  useUpdateAdminAddress,
} from "@/features/admin/address/hooks";
import { useReadViaCepAddress } from "@/features/admin/address/viacep/hooks";
import { AddressType } from "@/models/address";
import { Loader2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export const addressSchema = z.object({
  zip_code: z.string().min(8),
  street: z.string(),
  number: z.string(),
  neighborhood: z.string(),
  city: z.string(),
  state: z.string(),
  complement: z.string().optional(),
});

export function AddressForm({ address }: { address: AddressType | null }) {
  const router = useRouter();
  const params = useParams();

  const isOnboarding = !!params.current_step;

  const [hasAddress, setHasAddress] = useState(!!address);

  const zipCode = address?.zip_code ?? undefined;
  const number = address?.number ?? "";
  const complement = address?.complement ?? "";

  const form = useForm<z.infer<typeof addressSchema>>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      zip_code: zipCode ?? "",
      street: address?.street ?? "",
      number: number ?? "",
      neighborhood: address?.neighborhood ?? "",
      city: address?.city ?? "",
      state: address?.state ?? "",
      complement: complement ?? "",
    },
  });

  const cep = form.watch("zip_code") ?? "";

  function goToNextStep() {
    if (isOnboarding) {
      router.push("/onboarding/store/hours");
    } else {
      router.back();
    }
  }

  const { data: viacep, isLoading: isLoadingViacepAddress } =
    useReadViaCepAddress({
      zipCode: zipCode ?? cep,
      enabled: !!zipCode || (!!cep && cep.length === 9),
    });

  const { mutate: createAddress, isPending: isCreatingAddress } =
    useCreateAdminAddress({
      onSuccess: () => {
        goToNextStep();
      },
    });

  const { mutate: updateAddress, isPending: isUpdatingAddress } =
    useUpdateAdminAddress({
      onSuccess: () => {
        goToNextStep();
      },
    });

  const isLoading =
    isLoadingViacepAddress || isCreatingAddress || isUpdatingAddress;

  async function onSubmit(values: z.infer<typeof addressSchema>) {
    if (address) {
      updateAddress(values);
    }

    createAddress(values);
  }

  useEffect(() => {
    if (viacep?.viacepAddress) {
      setHasAddress(true);
      const address = viacep.viacepAddress;

      form.setValue("street", address.logradouro);
      form.setValue("neighborhood", address.bairro);
      form.setValue("city", address.localidade);
      form.setValue("state", address.uf);
    }
  }, [viacep]); // eslint-disable-line

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col space-y-6 pb-6"
      >
        <FormField
          control={form.control}
          name="zip_code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>CEP</FormLabel>
              <FormControl>
                <Input
                  maskType="cep"
                  placeholder="Digite o CEP da sua loja..."
                  {...field}
                />
              </FormControl>
              <FormDescription className="flex">
                {/* <Link href="?step=search-zc" className={cn('text-primary')}>
                  Não sei o CEP
                </Link> */}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="number"
          render={({ field }) => (
            <FormItem hidden={!hasAddress}>
              <FormLabel>Número</FormLabel>
              <FormControl>
                <Input
                  inputMode="numeric"
                  placeholder="Digite o número..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="complement"
          render={({ field }) => (
            <FormItem hidden={!hasAddress}>
              <FormLabel>Complemento (opcional)</FormLabel>
              <FormControl>
                <Input placeholder="Digite o complemento..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="street"
          render={({ field }) => (
            <FormItem hidden={!hasAddress}>
              <FormLabel>Rua</FormLabel>
              <FormControl>
                <Input readOnly {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="neighborhood"
          render={({ field }) => (
            <FormItem hidden={!hasAddress}>
              <FormLabel>Bairro</FormLabel>
              <FormControl>
                <Input readOnly {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="city"
          render={({ field }) => (
            <FormItem hidden={!hasAddress}>
              <FormLabel>Cidade</FormLabel>
              <FormControl>
                <Input readOnly {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="state"
          render={({ field }) => (
            <FormItem hidden={!hasAddress}>
              <FormLabel>Estado</FormLabel>
              <FormControl>
                <Input readOnly {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="ml-auto"
          disabled={
            isLoadingViacepAddress ||
            (hasAddress && !form.formState.isValid) ||
            !cep ||
            cep.length < 9
          }
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              <span>Salvando endereço</span>
            </>
          ) : isLoadingViacepAddress ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              <span>Buscando endereço</span>
            </>
          ) : (
            "Salvar endereço"
          )}
        </Button>
      </form>
    </Form>
  );
}

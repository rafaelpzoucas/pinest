"use client";

import { ChevronRight, Store } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { useReadStoreAddress } from "@/features/store/addresses/hooks";
import { useReadCustomer } from "@/features/store/customers/hooks";
import { useReadStoreShippings } from "@/features/store/shippings/hooks";
import { formatStoreAddress } from "@/utils/format-address";
import { Delivery } from "./delivery-card";
import PickupOptionsLoading from "./loading";

export function PickupStep() {
  const params = useParams();
  const storeSlug = params.store_slug as string;
  const [timeoutReached, setTimeoutReached] = useState(false);

  // Adiciona validação do storeSlug
  const isValidSlug = Boolean(storeSlug && typeof storeSlug === "string");

  const {
    data: customerData,
    isPending: isReadingCustomer,
    isError: isCustomerError,
  } = useReadCustomer({
    subdomain: storeSlug,
  });

  const {
    data: storeAddressData,
    isPending: isReadingStoreAddress,
    isError: isStoreAddressError,
  } = useReadStoreAddress({
    subdomain: storeSlug,
  });

  const {
    data: storeShippingsData,
    isPending: isReadingStoreShippings,
    isError: isStoreShippingsError,
  } = useReadStoreShippings({
    subdomain: storeSlug,
  });

  const customer = customerData?.customer;
  const customerAddress = customer?.address;
  const storeAddress = storeAddressData?.storeAddress;
  const shipping = storeShippingsData?.storeShippings;

  const formattedStoreAddress =
    storeAddress && formatStoreAddress(storeAddress);

  const isPending =
    isReadingCustomer || isReadingStoreAddress || isReadingStoreShippings;
  const hasError =
    isCustomerError || isStoreAddressError || isStoreShippingsError;

  // Timeout para detectar loading infinito
  useEffect(() => {
    if (!isValidSlug) return;

    const timer = setTimeout(() => {
      if (isPending) {
        setTimeoutReached(true);
        console.warn("PickupStep: Loading timeout reached after 10 seconds");
      }
    }, 10000); // 10 segundos

    return () => clearTimeout(timer);
  }, [isPending, isValidSlug]);

  // Reset timeout quando não está mais pending
  useEffect(() => {
    if (!isPending) {
      setTimeoutReached(false);
    }
  }, [isPending]);

  // Se não tem slug válido, retorna loading
  if (!isValidSlug) {
    return <PickupOptionsLoading />;
  }

  // Se atingiu timeout, mostra opção de reload
  if (timeoutReached && isPending) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold">Carregamento demorado</h2>
          <p className="text-muted-foreground text-sm">
            O carregamento está demorando mais que o esperado
          </p>
        </div>
        <Card className="p-4 border-amber-500/50">
          <p className="text-sm text-amber-600 mb-2">
            Parece que há algum problema na conexão. Tente recarregar a página.
          </p>
          <button
            type="button"
            onClick={() => {
              setTimeoutReached(false);
              window.location.reload();
            }}
            className="text-sm text-primary hover:underline"
          >
            Recarregar página
          </button>
        </Card>
      </div>
    );
  }

  // Se está carregando, mostra loading
  if (isPending) {
    return <PickupOptionsLoading />;
  }

  // Se teve erro, mostra uma mensagem e permite retry manual
  if (hasError) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold">Ops, algo deu errado</h2>
          <p className="text-muted-foreground text-sm">
            Não foi possível carregar as opções de entrega
          </p>
        </div>
        <Card className="p-4 border-destructive/50">
          <p className="text-sm text-destructive mb-2">
            Erro ao carregar dados da loja. Tente recarregar a página.
          </p>
          <div className="space-x-2">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="text-sm text-primary hover:underline"
            >
              Recarregar página
            </button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Como você quer receber?</h2>
        <p className="text-muted-foreground text-sm">
          Escolha a forma de entrega que preferir
        </p>
      </div>

      <div className="space-y-4">
        {/* Retirar na loja - Link direto */}
        <Link href="?step=payment&pickup=TAKEOUT">
          <Card className="p-4 hover:bg-accent transition-colors cursor-pointer">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Store className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium">Retirar na loja</p>
                  <p className="text-muted-foreground line-clamp-2 text-sm max-w-[265px]">
                    {formattedStoreAddress}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </div>
          </Card>
        </Link>

        <Delivery shipping={shipping} customerAddress={customerAddress} />
      </div>
    </div>
  );
}

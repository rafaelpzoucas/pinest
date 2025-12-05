import { readStoreByStoreURL } from "@/app/(protected)/(app)/config/(options)/account/actions";
import { RequestSimularType } from "@/models/kangu-shipping";
import { readStoreKanguToken } from "../actions";

export async function POST(request: Request) {
  try {
    const {
      storeURL,
      simulationData,
    }: { storeURL: string; simulationData: RequestSimularType } =
      await request.json();

    const { store, readStoreError } = await readStoreByStoreURL(storeURL);

    if (readStoreError) {
      console.error("Erro ao ler loja:", readStoreError);
      return new Response("Erro ao ler loja", { status: 500 });
    }

    const token = await readStoreKanguToken(store?.id);

    if (!token) {
      console.error("Token não encontrado");
      return new Response("Token não encontrado", { status: 401 });
    }

    const response = await fetch(
      "https://portal.kangu.com.br/tms/transporte/simular",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          token,
        },
        body: JSON.stringify(simulationData),
      },
    );

    if (!response.ok) {
      console.error("Erro na resposta da API Kangu:", await response.text());
      return new Response("Erro ao simular frete", { status: 500 });
    }

    const data = await response.json();
    return new Response(JSON.stringify(data), { status: 200 });
  } catch (error) {
    console.error("Erro ao simular frete:", error);
    return new Response("Erro interno no servidor", { status: 500 });
  }
}

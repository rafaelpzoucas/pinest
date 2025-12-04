import { NavigationConfig } from "./types";

const isDevelopment = process.env.NODE_ENV !== "production";
const storePrefix = isDevelopment ? "/[store_slug]" : "";

export const navigationConfig: Record<string, NavigationConfig> = {
  // Página inicial
  [`${storePrefix}/`]: {
    showBackButton: false,
    variant: "default",
  },

  // Produto
  [`${storePrefix}/[product_slug]`]: {
    showBackButton: true,
    variant: "default",
  },

  // Carrinho
  [`${storePrefix}/cart`]: {
    showBackButton: true,
    variant: "background",
    title: "Carrinho",
  },

  // Conta
  [`${storePrefix}/account`]: {
    showBackButton: true,
    variant: "background",
    title: "Minha conta",
  },

  // Registro
  [`${storePrefix}/account/register`]: {
    showBackButton: true,
    variant: "background",
    title: "Minha conta",
  },

  // Checkout
  [`${storePrefix}/checkout`]: {
    showBackButton: true,
    variant: "background",
    title: "Finalizar pedido",
  },

  // Pedidos
  [`${storePrefix}/orders`]: {
    showBackButton: true,
    variant: "background",
    title: "Meus pedidos",
  },

  // Detalhes do pedido
  [`${storePrefix}/orders/[id]`]: {
    showBackButton: true,
    variant: "background",
    title: "Meus pedidos",
  },

  // Configuração padrão
  "*": {
    showBackButton: true,
    variant: "default",
  },
};

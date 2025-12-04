import type { BottomActionConfig } from "./types";

export const bottomActionConfig: Record<string, BottomActionConfig> = {
  // Páginas de produto - mostra AddToCart e carrinho
  "/[store_slug]/[product_slug]": {
    showCart: true,
    showAddToCart: true,
    showFinishOrder: false,
    variant: "default",
  },
  "/[product_slug]": {
    showCart: true,
    showAddToCart: true,
    showFinishOrder: false,
    variant: "default",
  },

  // Páginas de categoria/busca - só carrinho
  "/[store_slug]": {
    showCart: true,
    showAddToCart: false,
    showFinishOrder: false,
    variant: "default",
  },
  "/": {
    showCart: true,
    showAddToCart: false,
    showFinishOrder: false,
    variant: "default",
  },

  // Só finish order
  "/[store_slug]/cart": {
    showCart: false,
    showAddToCart: false,
    showFinishOrder: true,
  },
  "/cart": {
    showCart: false,
    showAddToCart: false,
    showFinishOrder: true,
  },

  // Páginas onde não queremos mostrar
  "/[store_slug]/account": {
    showCart: false,
    showAddToCart: false,
    showFinishOrder: false,
  },
  "/account": {
    showCart: false,
    showAddToCart: false,
    showFinishOrder: false,
  },
  "/[store_slug]/account/register": {
    showCart: false,
    showAddToCart: false,
    showFinishOrder: false,
  },
  "/account/register": {
    showCart: false,
    showAddToCart: false,
    showFinishOrder: false,
  },

  "/[store_slug]/orders": {
    showCart: true,
    showAddToCart: false,
    showFinishOrder: false,
  },
  "/orders": {
    showCart: true,
    showAddToCart: false,
    showFinishOrder: false,
  },
  "/[store_slug]/orders/[id]": {
    showCart: true,
    showAddToCart: false,
    showFinishOrder: false,
  },
  "/orders/[id]": {
    showCart: true,
    showAddToCart: false,
    showFinishOrder: false,
  },

  // Só mostra finish order test
  "/[store_slug]/checkout": {
    showCart: false,
    showAddToCart: false,
    showFinishOrder: true,
  },
  "/checkout": {
    showCart: false,
    showAddToCart: false,
    showFinishOrder: true,
  },

  // Configuração padrão
  "*": {
    showCart: true,
    showAddToCart: false,
    showFinishOrder: false,
    variant: "default",
  },
};

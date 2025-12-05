import { readAdminProductsServer } from "@/actions/admin/products";
import { createOpenApiServerActionRouter } from "zsa-openapi";

export const adminProductsRouter = createOpenApiServerActionRouter({
  pathPrefix: "/api/v1/admin/products",
  defaults: {
    tags: ["Admin Products"],
  },
}).get("/", readAdminProductsServer);

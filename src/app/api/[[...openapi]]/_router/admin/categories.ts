import { readAdminCategoriesServer } from "@/actions/admin/categories/";
import { createOpenApiServerActionRouter } from "zsa-openapi";

export const adminCategoriesRouter = createOpenApiServerActionRouter({
  pathPrefix: "/api/v1/admin/categories",
  defaults: {
    tags: ["Admin Categories"],
  },
}).get("/", readAdminCategoriesServer);

import { readAdminExtrasServer } from "@/actions/admin/extras";
import { createOpenApiServerActionRouter } from "zsa-openapi";

export const adminExtrasRouter = createOpenApiServerActionRouter({
  pathPrefix: "/api/v1/admin/extras",
  defaults: {
    tags: ["Admin Extras"],
  },
}).get("/", readAdminExtrasServer);

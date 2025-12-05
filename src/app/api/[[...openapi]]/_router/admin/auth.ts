import { adminAuthCallback } from "@/app/(auth)/sign-in/actions";
import { createOpenApiServerActionRouter } from "zsa-openapi";

export const adminAuthRouter = createOpenApiServerActionRouter({
  pathPrefix: "/api/v1/admin/auth",
  defaults: {
    tags: ["Admin Auth"],
  },
}).get("/callback", adminAuthCallback);

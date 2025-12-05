import {
  createAdminCustomerServer,
  readAdminCustomersServer,
} from "@/actions/admin/customers";
import { createOpenApiServerActionRouter } from "zsa-openapi";

export const adminCustomersRouter = createOpenApiServerActionRouter({
  pathPrefix: "/api/v1/admin/customers",
  defaults: {
    tags: ["Admin Customers"],
  },
})
  .get("/", readAdminCustomersServer)
  .post("/create", createAdminCustomerServer);

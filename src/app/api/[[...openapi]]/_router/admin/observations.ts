import {
  createAdminObservationServer,
  readAdminObservationsServer,
} from "@/actions/admin/observations";
import { createOpenApiServerActionRouter } from "zsa-openapi";

export const adminObservationsRouter = createOpenApiServerActionRouter({
  pathPrefix: "/api/v1/admin/observations",
  defaults: {
    tags: ["Admin Observations"],
  },
})
  .get("/", readAdminObservationsServer)
  .post("/create", createAdminObservationServer);

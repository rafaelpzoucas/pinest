import { createOpenApiServerActionRouter } from "zsa-openapi";

import { cartRouter } from "./cart";
import { adminSubscriptionsRouter } from "./admin/subscriptions";
import { adminAuthRouter } from "./admin/auth";
import { adminCategoriesRouter } from "./admin/categories";
import { adminExtrasRouter } from "./admin/extras";
import { adminObservationsRouter } from "./admin/observations";
import { adminProductsRouter } from "./admin/products";
import { adminShippingRouter } from "./admin/shipping";
import { adminCustomersRouter } from "./admin/customers";

export const router = createOpenApiServerActionRouter({
  extend: [
    adminSubscriptionsRouter,
    adminAuthRouter,
    adminCategoriesRouter,
    adminExtrasRouter,
    adminObservationsRouter,
    adminProductsRouter,
    adminShippingRouter,
    adminCustomersRouter,
    cartRouter,
  ],
});

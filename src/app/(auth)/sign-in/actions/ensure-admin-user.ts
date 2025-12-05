"use server";

import { createAdminUser } from "@/features/admin/users/create";
import { readAdminUser } from "@/features/admin/users/read";
import { authenticatedProcedure } from "@/lib/zsa-procedures";

export const ensureAdminUser = authenticatedProcedure
  .createServerAction()
  .handler(async () => {
    const [adminUserData, adminUserError] = await readAdminUser();

    // Erro de banco (não "not found")
    if (adminUserError) {
      throw adminUserError;
    }

    // Usuário existe
    if (adminUserData?.adminUser) {
      return { adminUser: adminUserData.adminUser, isNewUser: false };
    }

    // Usuário não existe, criar
    const [createdData, createError] = await createAdminUser();

    if (createError) {
      throw createError;
    }

    return {
      adminUser: createdData?.createdAdminUser,
      isNewUser: true,
    };
  });

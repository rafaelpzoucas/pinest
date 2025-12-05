import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

import { addMonths, lastDayOfMonth } from "date-fns";

function calculateExpirationDate(months = 1) {
  const expirationDate = addMonths(new Date(), months);

  // Se o dia do mês de expiração for inválido no próximo mês, ajusta para o último dia.
  const isLastDay =
    new Date().getDate() === lastDayOfMonth(new Date()).getDate();

  return isLastDay ? lastDayOfMonth(expirationDate) : expirationDate;
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const origin = requestUrl.origin;

  const supabase = createClient();

  const { data: session, error: sessionError } = await supabase.auth.getUser();

  if (sessionError) {
    console.error(sessionError);

    return NextResponse.redirect(`${origin}/sign-in`);
  }

  const { error: updateSubscriptionStatusError } = await supabase
    .from("users")
    .update({
      subscription_status: "active",
      subscription_expires_at: calculateExpirationDate(),
    })
    .eq("id", session.user.id);

  if (updateSubscriptionStatusError) {
    console.error(updateSubscriptionStatusError);

    return NextResponse.redirect(`${origin}/sign-in`);
  }

  return NextResponse.redirect(`${origin}/sign-in`);
}

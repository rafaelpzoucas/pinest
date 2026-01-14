import { redirect } from "next/navigation";
import { readStoreCached } from "../config/(options)/layout/actions";
import { getSalesReportByDateCached } from "../reports/actions";
import { SalesReport } from "../reports/sales-report";
import { FirstSteps } from "./first-steps";
import { PendingBalances } from "./pending-balances";
import { ProfileCard } from "./profile";
import { TodaySummary } from "./today-summary";
import { RevenueGraphic } from "./revenue-graphic";

export default async function DashboardPage() {
  const [storeData] = await readStoreCached();
  const [reports] = await getSalesReportByDateCached({
    start_date: new Date().toISOString(),
    end_date: new Date().toISOString(),
  });

  const store = storeData?.store;

  if (!store) {
    redirect("/onboarding/store/basic");
  }

  return (
    <div className="p-4 lg:px-0 space-y-6 pb-16">
      <ProfileCard store={store} />

      <section className="flex flex-col gap-4 w-full max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-[4fr_2fr] gap-4 items-start">
          <RevenueGraphic />

          <div className="flex flex-col gap-4">
            <FirstSteps />
            <TodaySummary />
            <SalesReport data={reports?.salesReport} />
            <PendingBalances />
          </div>
        </div>

        {/* <TotalSales /> */}
      </section>
    </div>
  );
}

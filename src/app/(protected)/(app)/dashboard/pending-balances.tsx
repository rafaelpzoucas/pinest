import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrencyBRL } from "@/lib/utils";
import { readPendingBalancesCached } from "./actions";

export async function PendingBalances() {
  const [storeCustomersData] = await readPendingBalancesCached();

  const storeCustomers = storeCustomersData?.storeCustomers;

  if (!storeCustomers || storeCustomers.length === 0) {
    return;
  }

  return (
    <Card className="h-auto max-w-full break-inside-avoid">
      <CardHeader>
        <CardTitle className="text-xl">Saldos pendentes</CardTitle>
      </CardHeader>
      <CardContent>
        <div>
          {storeCustomers.map((customer) => {
            const firstName = customer.customers.name.split(" ")[0];
            const lastName = customer.customers.name.split(" ").slice(-1)[0];
            return (
              <p
                key={customer.id}
                className="flex flex-row items-center justify-between py-2 border-b last:border-0"
              >
                <div>
                  <span>
                    {firstName} {lastName}
                  </span>
                  {customer.customers.phone && (
                    <p className="text-muted-foreground text-sm">
                      {customer.customers.phone}
                    </p>
                  )}
                </div>
                <strong>{formatCurrencyBRL(customer.balance)}</strong>
              </p>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

import { Box } from "lucide-react";

import { readUser } from "../../config/(options)/account/actions";
import { readChoicesByStore } from "./actions";
import { ChoiceCard } from "./choice-card";
import { columns } from "./data-table/columns";
import { DataTable } from "./data-table/table";

export async function Choices() {
  const { data: user } = await readUser();
  const { data: choices, error } = await readChoicesByStore(user?.stores[0].id);

  if (error) {
    console.error(error);
    return <div>Não foi possível buscar as escolhas</div>;
  }

  if (choices && choices.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center gap-4 py-4 w-full max-w-xs text-muted
          mx-auto"
      >
        <Box className="w-20 h-20" />
        <p className="text-muted-foreground">Não há escolhas cadastradas</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="lg:hidden">
        {choices?.map((choice) => (
          <ChoiceCard key={choice.id} choice={choice} />
        ))}
      </div>

      <div className="hidden lg:flex">
        {choices && <DataTable columns={columns} data={choices} />}
      </div>
    </div>
  );
}

import { readTablesCached } from "./actions";
import { Orders } from "./orders";

export default async function WorkspacePage() {
  const [data] = await readTablesCached();

  if (!data) {
    console.error("Error fetching tables");
    return null;
  }

  return (
    <main className="space-y-6 p-4 lg:px-0">
      <Orders tables={data.tables} />
    </main>
  );
}

"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQueryState } from "nuqs";
import { MdSportsMotorsports, MdTableBar } from "react-icons/md";
import { Tables } from "./tables/tables";
import { Deliveries } from "./deliveries/orders";

export function Orders() {
  const [tab, setTab] = useQueryState("tab", {
    defaultValue: "deliveries",
    history: "replace",
  });

  return (
    <Tabs value={tab} onValueChange={setTab}>
      <TabsList className="h-fit">
        <TabsTrigger value="deliveries" className="px-6 py-3">
          <MdSportsMotorsports className="mr-2" />
          Entregas
        </TabsTrigger>
        <TabsTrigger value="tables" className="px-6 py-3">
          <MdTableBar className="mr-2" />
          Mesas
        </TabsTrigger>
      </TabsList>
      <TabsContent value="deliveries">
        <Deliveries />
      </TabsContent>
      <TabsContent value="tables">
        <Tables />
      </TabsContent>
    </Tabs>
  );
}

import { ForkKnife, Pizza, Plus } from "lucide-react";
import Link from "next/link";
import { AdminHeader } from "@/app/admin-header";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { Categories } from "./categories";
import { Choices } from "./choices";
import { Extras } from "./extras";

export default function CatalogPage({
  searchParams,
}: {
  searchParams: { tab: string };
}) {
  return (
    <div className="space-y-4 p-4 lg:px-0">
      <AdminHeader title="Catálogo" />

      <Tabs defaultValue={searchParams.tab ?? "products"}>
        <TabsList>
          <TabsTrigger value="products" asChild>
            <Link href="?tab=products">Produtos</Link>
          </TabsTrigger>
          <TabsTrigger value="extras" asChild>
            <Link href="?tab=extras">Adicionais</Link>
          </TabsTrigger>
          <TabsTrigger value="choices" asChild>
            <Link href="?tab=choices">Escolhas</Link>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="products">
          <div className="flex flex-col gap-6">
            <Sheet>
              <SheetTrigger asChild>
                <Button className="max-w-md">
                  <Plus className="w-4 h-4 mr-2" />
                  Criar categoria
                </Button>
              </SheetTrigger>

              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Nova categoria</SheetTitle>
                  <SheetDescription>
                    Selecione o modelo de categoria{" "}
                  </SheetDescription>
                </SheetHeader>

                <ul className="flex flex-col gap-2 mt-4">
                  <li>
                    <Link href="catalog/categories/register">
                      <Card className="p-4 flex flex-row gap-4">
                        <ForkKnife className="w-8 h-8 text-primary" />

                        <div className="flex flex-col">
                          <CardTitle>Itens gerais</CardTitle>
                          <CardDescription>
                            Comidas, lanches, sobremesas, bebidas, etc.
                          </CardDescription>
                        </div>
                      </Card>
                    </Link>
                  </li>
                  <li>
                    <Link href="catalog/categories/pizza/register">
                      <Card className="p-4 flex flex-row gap-4">
                        <Pizza className="w-8 h-8 text-primary" />

                        <div className="flex flex-col">
                          <CardTitle>Pizza</CardTitle>
                          <CardDescription>
                            Defina o tamanho, tipos de massa, bordas e sabores
                          </CardDescription>
                        </div>
                      </Card>
                    </Link>
                  </li>
                </ul>
              </SheetContent>
            </Sheet>

            <section>
              <Categories />
            </section>
          </div>
        </TabsContent>
        <TabsContent value="extras">
          <div className="flex flex-col gap-6">
            <Link
              href="catalog/extras/register"
              className={cn(buttonVariants(), "max-w-md")}
            >
              <Plus className="w-4 h-4 mr-2" />
              Criar adicional
            </Link>
            <section>
              <Extras />
            </section>
          </div>
        </TabsContent>
        <TabsContent value="choices">
          <div className="flex flex-col gap-6">
            <Link
              href="catalog/choices/register"
              className={cn(buttonVariants(), "max-w-md")}
            >
              <Plus className="w-4 h-4 mr-2" />
              Criar escolha
            </Link>
            <section>
              <Choices />
            </section>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

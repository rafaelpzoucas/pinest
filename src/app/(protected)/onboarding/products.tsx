import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";

export function ProductsStep() {
  return (
    <div>
      <Link href="/dashboard" className={buttonVariants({ variant: "ghost" })}>
        Pular
      </Link>
    </div>
  );
}

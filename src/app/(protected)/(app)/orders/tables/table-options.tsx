import { Button, buttonVariants } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { Table } from "@/features/tables/schemas";
import {
  BadgeDollarSign,
  Edit,
  Loader2,
  Printer,
  XCircle,
  Receipt,
  RotateCcw,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useServerAction } from "zsa-react";
import {
  printTableReceipt,
  printTableBill,
} from "../../config/printing/actions";
import { useCancelTable } from "@/features/tables/hooks";

type TableOptionsProps = {
  table: Table;
  isCashOpen: boolean;
  isCashLoading: boolean;
};

export function TableOptions({
  table,
  isCashOpen,
  isCashLoading,
}: TableOptionsProps) {
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const { execute: executePrintReceipt, isPending: isPrintingReceipt } =
    useServerAction(printTableReceipt);
  const { execute: executePrintBill, isPending: isPrintingBill } =
    useServerAction(printTableBill);
  const { mutate: cancelTable, isPending: isCancelling } = useCancelTable({
    onSuccess: () => {
      setShowCancelDialog(false);
    },
  });

  const isPrinting = isPrintingReceipt || isPrintingBill;

  return (
    <div className="ml-auto space-x-1">
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <Link
            href={
              isCashOpen
                ? `orders/close?table_id=${table.id}&tab=tables`
                : "/cash-register"
            }
            className={cn(
              buttonVariants({ size: "sm" }),
              isCashLoading && "opacity-50 cursor-not-allowed",
            )}
            onClick={(e) => {
              if (isCashLoading) {
                e.preventDefault();
              }
            }}
          >
            {isCashLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <BadgeDollarSign className="w-4 h-4" />
                <span>Fechar venda</span>
              </>
            )}
          </Link>
        </TooltipTrigger>

        {!isCashOpen && (
          <TooltipContent>
            <div>
              <strong>Fechar venda</strong>
              <p>Para fechar a venda, é necessário abrir o caixa.</p>
            </div>
          </TooltipContent>
        )}
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowCancelDialog(true)}
            disabled={isCancelling}
          >
            {isCancelling ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <XCircle className="w-4 h-4" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Cancelar mesa</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            href={`orders/tables/register?id=${table.id}&edit=true`}
            className={cn(
              buttonVariants({
                variant: "outline",
                size: "icon",
              }),
            )}
          >
            <Edit className="w-4 h-4" />
          </Link>
        </TooltipTrigger>
        <TooltipContent>
          <p>Editar mesa</p>
        </TooltipContent>
      </Tooltip>

      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                disabled={isPrinting}
                className="relative"
              >
                {isPrinting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Printer className="w-4 h-4" />
                  </>
                )}
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>Opções de impressão</p>
          </TooltipContent>
        </Tooltip>

        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={() =>
              executePrintReceipt({
                tableId: table.id,
                reprint: true,
              })
            }
            disabled={isPrinting}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reimprimir comanda
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() =>
              executePrintBill({
                tableId: table.id,
              })
            }
            disabled={isPrinting}
          >
            <Receipt className="w-4 h-4 mr-2" />
            Enviar conta
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar mesa #{table.number}?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja cancelar esta mesa? Todos os itens serão
              removidos e esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Voltar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => cancelTable(table.id)}
              className={cn(buttonVariants({ variant: "destructive" }))}
            >
              Cancelar mesa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

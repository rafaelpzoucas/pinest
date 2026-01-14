"use client";

import { TrendingUp, TrendingDown, Calendar } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { useRevenue } from "@/features/reports/revenue/hooks";

type PeriodType = "1" | "3" | "6" | "12" | "custom";

const chartConfig = {
  revenue: {
    label: "Faturamento",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

export function RevenueGraphic() {
  const [period, setPeriod] = useState<PeriodType>("6");
  const [customStartDate, setCustomStartDate] = useState<Date>();
  const [customEndDate, setCustomEndDate] = useState<Date>();
  const [isCustomDateOpen, setIsCustomDateOpen] = useState(false);

  const {
    data: chartData,
    isLoading,
    error,
  } = useRevenue({
    period,
    customStartDate,
    customEndDate,
  });

  const handlePeriodChange = (value: PeriodType) => {
    setPeriod(value);
    if (value !== "custom") {
      setCustomStartDate(undefined);
      setCustomEndDate(undefined);
    }
  };

  const applyCustomDates = () => {
    if (customStartDate && customEndDate) {
      setPeriod("custom");
      setIsCustomDateOpen(false);
    }
  };

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Faturamento do Restaurante</CardTitle>
          <CardDescription>Erro ao carregar dados</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <div className="text-destructive text-sm">
            {error instanceof Error ? error.message : "Erro desconhecido"}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading || !chartData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Faturamento do Restaurante</CardTitle>
          <CardDescription>Carregando dados...</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">
            Carregando gráfico...
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calcular crescimento
  const lastMonth = chartData[chartData.length - 1]?.revenue || 0;
  const previousMonth = chartData[chartData.length - 2]?.revenue || 0;
  const growth =
    previousMonth > 0 ? ((lastMonth - previousMonth) / previousMonth) * 100 : 0;
  const isPositiveGrowth = growth >= 0;

  // Calcular total do período
  const totalRevenue = chartData.reduce((sum, item) => sum + item.revenue, 0);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const getPeriodLabel = () => {
    if (period === "custom" && customStartDate && customEndDate) {
      return `${customStartDate.toLocaleDateString("pt-BR", { month: "short", year: "numeric" })} - ${customEndDate.toLocaleDateString("pt-BR", { month: "short", year: "numeric" })}`;
    }

    const labels = {
      "1": "Este mês",
      "3": "Últimos 3 meses",
      "6": "Últimos 6 meses",
      "12": "Último ano",
    };
    return labels[period as keyof typeof labels] || "";
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Faturamento do Restaurante</CardTitle>
            <CardDescription>
              {getPeriodLabel()} • Total: {formatCurrency(totalRevenue)}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Select value={period} onValueChange={handlePeriodChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Selecione o período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Este mês</SelectItem>
                <SelectItem value="3">Últimos 3 meses</SelectItem>
                <SelectItem value="6">Últimos 6 meses</SelectItem>
                <SelectItem value="12">Último ano</SelectItem>
                <SelectItem value="custom">Período personalizado</SelectItem>
              </SelectContent>
            </Select>

            {period === "custom" && (
              <Popover
                open={isCustomDateOpen}
                onOpenChange={setIsCustomDateOpen}
              >
                <PopoverTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Calendar className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-4" align="end">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Data inicial
                      </label>
                      <CalendarComponent
                        mode="single"
                        selected={customStartDate}
                        onSelect={setCustomStartDate}
                        disabled={(date) =>
                          date > new Date() ||
                          (customEndDate ? date > customEndDate : false)
                        }
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Data final
                      </label>
                      <CalendarComponent
                        mode="single"
                        selected={customEndDate}
                        onSelect={setCustomEndDate}
                        disabled={(date) =>
                          date > new Date() ||
                          (customStartDate ? date < customStartDate : false)
                        }
                      />
                    </div>
                    <Button
                      className="w-full"
                      onClick={applyCustomDates}
                      disabled={!customStartDate || !customEndDate}
                    >
                      Aplicar período
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <AreaChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
              top: 12,
            }}
          >
            <defs>
              <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-revenue)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-revenue)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  indicator="line"
                  formatter={(value) => formatCurrency(Number(value))}
                  labelFormatter={(label) => `Mês: ${label}`}
                />
              }
            />
            <Area
              dataKey="revenue"
              type="monotone"
              fill="url(#fillRevenue)"
              fillOpacity={0.4}
              stroke="var(--color-revenue)"
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 leading-none font-medium">
              {isPositiveGrowth ? (
                <>
                  Crescimento de {Math.abs(growth).toFixed(1)}% este mês
                  <TrendingUp className="h-4 w-4" />
                </>
              ) : (
                <>
                  Queda de {Math.abs(growth).toFixed(1)}% este mês
                  <TrendingDown className="h-4 w-4" />
                </>
              )}
            </div>
            <div className="text-muted-foreground flex items-center gap-2 leading-none">
              {chartData[0]?.month} - {chartData[chartData.length - 1]?.month}
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}

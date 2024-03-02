import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Minus, Plus } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Bar, BarChart, ResponsiveContainer } from 'recharts'
import { useState } from 'react'
import { SalesReport } from './sales-report'

const data = [
  {
    goal: 400,
  },
  {
    goal: 300,
  },
  {
    goal: 200,
  },
  {
    goal: 300,
  },
  {
    goal: 200,
  },
  {
    goal: 278,
  },
  {
    goal: 189,
  },
  {
    goal: 239,
  },
  {
    goal: 300,
  },
  {
    goal: 200,
  },
  {
    goal: 278,
  },
  {
    goal: 189,
  },
  {
    goal: 349,
  },
]

export default function ReportsPage() {
  return (
    <main className="space-y-6 p-4">
      <h1 className="text-lg text-center font-bold">Relatórios</h1>

      <section className="flex flex-col gap-2">
        <Select>
          <SelectTrigger className="w-[100px]">
            <SelectValue placeholder="Período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="light">1 mês</SelectItem>
            <SelectItem value="dark">3 meses</SelectItem>
            <SelectItem value="system">6 meses</SelectItem>
            <SelectItem value="system2">Máximo</SelectItem>
          </SelectContent>
        </Select>

        <SalesReport data={data} />
      </section>
    </main>
  )
}

'use client'

import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { ChevronRight, Minus, Plus } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Bar, BarChart, ResponsiveContainer } from 'recharts'
import { useState } from 'react'
import Link from 'next/link'

type SalesReportPropsType = {
  data: any[]
}

export function SalesReport({ data }: SalesReportPropsType) {
  const [goal, setGoal] = useState(350)

  function onClick(adjustment: number) {
    setGoal(Math.max(200, Math.min(400, goal + adjustment)))
  }

  return (
    <Card>
      <header className="flex flex-row justify-between p-4">
        <CardTitle>Vendas</CardTitle>
        <Link href="#">
          Detalhes <ChevronRight />
        </Link>
      </header>

      <div className="p-4">
        <div className="mt-3 h-[120px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <Bar
                dataKey="goal"
                style={
                  {
                    fill: 'hsl(var(--foreground))',
                    opacity: 0.9,
                  } as React.CSSProperties
                }
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  )
}

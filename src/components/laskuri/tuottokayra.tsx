"use client"

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { muotoileEuro, muotoileTiivisEuro } from "@/lib/muotoilu"
import type { Kaaviopiste } from "@/lib/laskenta/tyypit"

interface TuottokayraProps {
  pisteet: Kaaviopiste[]
  aktiivisetVuodet: number
}

export default function Tuottokayra({
  pisteet,
  aktiivisetVuodet,
}: TuottokayraProps) {
  return (
    <div
      aria-label="Yrityksen ja yksityishenkilön sijoitussalkkujen kehitys"
      className="h-72 w-full sm:h-96"
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={pisteet}
          margin={{ top: 12, right: 8, bottom: 8, left: 4 }}
        >
          <CartesianGrid stroke="#d1fae5" strokeDasharray="3 3" />
          <XAxis
            dataKey="vuosi"
            tickLine={false}
            axisLine={false}
            tick={{ fill: "#3f6212", fontSize: 12 }}
            label={{
              value: "Vuosi",
              position: "insideBottom",
              offset: -4,
              fill: "#3f6212",
              fontSize: 12,
            }}
          />
          <YAxis
            width={68}
            tickLine={false}
            axisLine={false}
            tick={{ fill: "#3f6212", fontSize: 12 }}
            tickFormatter={muotoileTiivisEuro}
          />
          <Tooltip
            contentStyle={{
              border: "1px solid #a7f3d0",
              borderRadius: "12px",
              boxShadow: "0 10px 25px rgba(6, 78, 59, 0.12)",
            }}
            formatter={(arvo) => muotoileEuro(Number(arvo))}
            labelFormatter={(vuosi) => `Vuosi ${vuosi}`}
          />
          <Legend wrapperStyle={{ fontSize: "0.875rem" }} />
          <ReferenceLine
            x={aktiivisetVuodet}
            stroke="#a16207"
            strokeDasharray="4 4"
            label={{
              value: "Eläkeaika alkaa",
              position: "top",
              fill: "#854d0e",
              fontSize: 12,
            }}
          />
          <Line
            type="monotone"
            dataKey="yritys"
            name="Yrityksen salkku"
            stroke="#047857"
            strokeWidth={3}
            dot={false}
            activeDot={{ r: 5 }}
          />
          <Line
            type="monotone"
            dataKey="yksityinen"
            name="Yksityishenkilön salkku"
            stroke="#2563eb"
            strokeWidth={3}
            dot={false}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

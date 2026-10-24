"use client"

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { muotoileEuro, muotoileTiivisEuro } from "@/lib/muotoilu"
import type { Kaaviopiste } from "@/lib/laskenta/tyypit"

interface TuottokayraProps {
  pisteet: Kaaviopiste[]
}

interface Selitekohta {
  teksti: string
  vari: string
  katkoviiva: boolean
}

const KAAVIOSARJOJEN_NIMET = {
  yrityksenSalkku: "Sijoittaminen yrityksenä: salkku",
  yksityisenSalkku: "Sijoittaminen yksityishenkilönä: salkku",
  yrityksenNettotulo:
    "Sijoittaminen yrityksenä: kumulatiivinen nettotulo (eläke yrittäjäsijoittajalle)",
  yksityisenNettotulo:
    "Sijoittaminen yksityishenkilönä: kumulatiivinen nettotulo (eläke yksityishenkilösijoittajalle)",
} as const

const SALKKUSELITTEET: Selitekohta[] = [
  {
    teksti: KAAVIOSARJOJEN_NIMET.yksityisenSalkku,
    vari: "#2563eb",
    katkoviiva: false,
  },
  {
    teksti: KAAVIOSARJOJEN_NIMET.yrityksenSalkku,
    vari: "#047857",
    katkoviiva: false,
  },
]

const NETTOTULOSELITTEET: Selitekohta[] = [
  {
    teksti: KAAVIOSARJOJEN_NIMET.yksityisenNettotulo,
    vari: "#2563eb",
    katkoviiva: true,
  },
  {
    teksti: KAAVIOSARJOJEN_NIMET.yrityksenNettotulo,
    vari: "#047857",
    katkoviiva: true,
  },
]

function Selitekohta({ teksti, vari, katkoviiva }: Selitekohta) {
  return (
    <li className="flex items-start gap-2 text-left text-xs leading-5 text-emerald-950 sm:text-sm">
      <span
        aria-hidden="true"
        className={`mt-2 block w-7 shrink-0 border-t-[3px] ${
          katkoviiva ? "border-dashed" : "border-solid"
        }`}
        style={{ borderColor: vari }}
      />
      <span>{teksti}</span>
    </li>
  )
}

function Kaavioselite() {
  return (
    <div
      data-testid="tuottokayra-selite"
      aria-label="Kaavioselite"
      className="mt-4 grid gap-3 sm:grid-cols-2"
    >
      <div
        data-testid="tuottokayra-selite-salkku"
        role="group"
        aria-label="Salkkuarvon sarjat vasemmalla akselilla"
      >
        <p className="text-xs font-medium text-emerald-950/65">
          Salkkuarvo (vasen akseli)
        </p>
        <ul className="mt-1.5 space-y-1.5">
          {SALKKUSELITTEET.map((kohta) => (
            <Selitekohta key={kohta.teksti} {...kohta} />
          ))}
        </ul>
      </div>
      <div
        data-testid="tuottokayra-selite-nettotulo"
        role="group"
        aria-label="Kumulatiivisen nettotulon sarjat oikealla akselilla"
        className="sm:justify-self-end"
      >
        <p className="text-xs font-medium text-emerald-950/65">
          Kumulatiivinen nettotulo (oikea akseli)
        </p>
        <ul className="mt-1.5 space-y-1.5">
          {NETTOTULOSELITTEET.map((kohta) => (
            <Selitekohta key={kohta.teksti} {...kohta} />
          ))}
        </ul>
      </div>
    </div>
  )
}

export default function Tuottokayra({
  pisteet,
}: TuottokayraProps) {
  return (
    <div
      aria-label="Sijoittaminen yksityishenkilönä ja yrityksenä: salkkujen sekä kumulatiivisten eläkeajan nettotulojen kehitys"
      className="w-full"
    >
      <div className="h-80 w-full sm:h-96">
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
              yAxisId="salkku"
              width={68}
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#3f6212", fontSize: 12 }}
              tickFormatter={muotoileTiivisEuro}
              label={{
                value: "Salkku",
                angle: -90,
                position: "insideLeft",
                fill: "#3f6212",
                fontSize: 12,
              }}
            />
            <YAxis
              yAxisId="nettotulo"
              orientation="right"
              width={68}
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#3f6212", fontSize: 12 }}
              tickFormatter={muotoileTiivisEuro}
              label={{
                value: "Kumul. nettotulo",
                angle: 90,
                position: "insideRight",
                fill: "#3f6212",
                fontSize: 12,
              }}
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
            <Line
              yAxisId="salkku"
              type="monotone"
              dataKey="yritys"
              name={KAAVIOSARJOJEN_NIMET.yrityksenSalkku}
              stroke="#047857"
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 5 }}
            />
            <Line
              yAxisId="salkku"
              type="monotone"
              dataKey="yksityinen"
              name={KAAVIOSARJOJEN_NIMET.yksityisenSalkku}
              stroke="#2563eb"
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 5 }}
            />
            <Line
              yAxisId="nettotulo"
              type="monotone"
              dataKey="yrityksenKumulatiivinenNettotulo"
              name={KAAVIOSARJOJEN_NIMET.yrityksenNettotulo}
              stroke="#047857"
              strokeDasharray="6 4"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 5 }}
              connectNulls={false}
            />
            <Line
              yAxisId="nettotulo"
              type="monotone"
              dataKey="yksityisenKumulatiivinenNettotulo"
              name={KAAVIOSARJOJEN_NIMET.yksityisenNettotulo}
              stroke="#2563eb"
              strokeDasharray="6 4"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 5 }}
              connectNulls={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <Kaavioselite />
    </div>
  )
}

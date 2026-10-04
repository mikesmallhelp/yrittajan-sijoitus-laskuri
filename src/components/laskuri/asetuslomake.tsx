"use client"

import { RotateCcw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Asetukset, Validointivirheet } from "@/lib/laskenta/tyypit"

interface AsetuslomakeProps {
  asetukset: Asetukset
  virheet: Validointivirheet
  onMuuta: (kentta: keyof Asetukset, arvo: number) => void
  onPalautaOletukset: () => void
}

interface KentanTiedot {
  nimi: keyof Asetukset
  otsikko: string
  kuvaus: string
  min: number
  max?: number
  askel: number
  paate: string
}

const KENTAT: KentanTiedot[] = [
  {
    nimi: "aktiivisetVuodet",
    otsikko: "Aktiivisen yrittäjyyden kesto",
    kuvaus: "Kuinka monta vuotta sijoituksia tehdään ennen eläkeaikaa.",
    min: 1,
    max: 100,
    askel: 1,
    paate: "vuotta",
  },
  {
    nimi: "elakevuodet",
    otsikko: "Eläkeajan kesto",
    kuvaus: "Kuinka monelle vuodelle salkkua nostetaan.",
    min: 1,
    max: 100,
    askel: 1,
    paate: "vuotta",
  },
  {
    nimi: "yrityksenVuosittainenSijoitus",
    otsikko: "Yrityksen vuosisijoitus ennen yhteisöveroa",
    kuvaus: "Summa, josta yhteisövero vähennetään ennen sijoitusta.",
    min: 0,
    askel: 100,
    paate: "€/v",
  },
  {
    nimi: "yksityisenVuosittainenPalkka",
    otsikko: "Yksityishenkilön vuosipalkka sijoittamista varten",
    kuvaus: "Bruttopalkka, josta palkkavero vähennetään ennen sijoitusta.",
    min: 0,
    askel: 100,
    paate: "€/v",
  },
  {
    nimi: "listaamattomanYhtionVuosiosinko",
    otsikko: "Listaamattoman yhtiön vuosiosinko",
    kuvaus: "Yritykselle verovapaa osinko, yksityishenkilölle palkkana maksettava.",
    min: 0,
    askel: 100,
    paate: "€/v",
  },
  {
    nimi: "vuosituottoProsentti",
    otsikko: "Sijoituksen vuosituotto ennen veroja ja kuluja",
    kuvaus: "Arvioitu tuotto, joka lisätään salkkuun ennen vuoden sijoitusta tai nostoa.",
    min: -100,
    max: 100,
    askel: 0.1,
    paate: "%",
  },
  {
    nimi: "tilitoimistokulu",
    otsikko: "Tilitoimistokulu eläkeaikana",
    kuvaus: "Yrityksen vuosittainen tilitoimistokulu eläkevuosina.",
    min: 0,
    askel: 100,
    paate: "€/v",
  },
]

export function Asetuslomake({
  asetukset,
  virheet,
  onMuuta,
  onPalautaOletukset,
}: AsetuslomakeProps) {
  return (
    <section
      aria-labelledby="asetukset-otsikko"
      className="rounded-3xl border border-emerald-900/10 bg-white p-5 shadow-sm sm:p-6"
    >
      <div className="flex flex-col gap-3 border-b border-emerald-900/10 pb-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold tracking-wide text-emerald-700 uppercase">
            Muokattavat oletukset
          </p>
          <h2
            id="asetukset-otsikko"
            className="mt-1 text-2xl font-semibold text-emerald-950"
          >
            Asetukset
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-emerald-950/65">
            Tulokset päivittyvät heti. Veroprosentit ja verorajat ovat laskurin
            kiinteitä malliarvoja.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={onPalautaOletukset}
          className="min-h-11 shrink-0 border-emerald-800/20 text-emerald-900 hover:bg-emerald-50"
        >
          <RotateCcw className="size-4" aria-hidden="true" />
          Palauta oletukset
        </Button>
      </div>

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        {KENTAT.map((kentta) => {
          const virhe = virheet[kentta.nimi]
          const tunniste = `asetus-${kentta.nimi}`

          return (
            <div key={kentta.nimi} className="space-y-2">
              <Label
                htmlFor={tunniste}
                className="text-sm font-semibold text-emerald-950"
              >
                {kentta.otsikko}
              </Label>
              <p id={`${tunniste}-kuvaus`} className="text-xs leading-5 text-emerald-950/60">
                {kentta.kuvaus}
              </p>
              <div className="relative">
                <Input
                  id={tunniste}
                  type="number"
                  inputMode="decimal"
                  min={kentta.min}
                  max={kentta.max}
                  step={kentta.askel}
                  value={asetukset[kentta.nimi]}
                  aria-describedby={`${tunniste}-kuvaus${
                    virhe ? ` ${tunniste}-virhe` : ""
                  }`}
                  aria-invalid={Boolean(virhe)}
                  onChange={(tapahtuma) =>
                    onMuuta(kentta.nimi, Number(tapahtuma.currentTarget.value))
                  }
                  className="h-11 border-emerald-900/20 bg-emerald-50/40 pr-14 text-base text-emerald-950 focus-visible:border-emerald-700 focus-visible:ring-emerald-700/20"
                />
                <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-emerald-950/55">
                  {kentta.paate}
                </span>
              </div>
              {virhe ? (
                <p id={`${tunniste}-virhe`} className="text-sm text-red-700">
                  {virhe}
                </p>
              ) : null}
            </div>
          )
        })}
      </div>
    </section>
  )
}

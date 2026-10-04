import { Building2, UserRound } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { muotoileEuro } from "@/lib/muotoilu"
import type { PolunYhteenveto, Vaihtoehto } from "@/lib/laskenta/tyypit"

interface VertailukorttiProps {
  vaihtoehto: Vaihtoehto
  yhteenveto: PolunYhteenveto
}

export function Vertailukortti({
  vaihtoehto,
  yhteenveto,
}: VertailukorttiProps) {
  const onYritys = vaihtoehto === "yritys"
  const OtsikonKuvake = onYritys ? Building2 : UserRound
  const otsikko = onYritys
    ? "Sijoittaminen yrityksenä"
    : "Sijoittaminen yksityishenkilönä"

  return (
    <Card className="border-emerald-900/10 bg-white shadow-sm">
      <CardHeader>
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
            <OtsikonKuvake className="size-5" aria-hidden="true" />
          </span>
          <div>
            <CardTitle className="text-lg text-emerald-950">{otsikko}</CardTitle>
            <CardDescription>Eläkeajan arvioitu lopputulos</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-emerald-950/65">Nettotulo eläkeaikana</p>
        <p className="mt-1 text-3xl font-semibold tracking-tight text-emerald-950">
          {muotoileEuro(yhteenveto.elakeajanNettotuloYhteensa)}
        </p>
        <dl className="mt-6 grid grid-cols-2 gap-x-4 gap-y-5 border-t border-emerald-900/10 pt-5 text-sm">
          <div>
            <dt className="text-emerald-950/60">Nettotulo keskimäärin</dt>
            <dd className="mt-1 font-semibold text-emerald-950">
              {muotoileEuro(yhteenveto.elakeajanNettotuloVuosittain)}/v
            </dd>
          </div>
          <div>
            <dt className="text-emerald-950/60">Aktiivikauden salkku</dt>
            <dd className="mt-1 font-semibold text-emerald-950">
              {muotoileEuro(yhteenveto.aktiivikaudenLoppusaldo)}
            </dd>
          </div>
          <div>
            <dt className="text-emerald-950/60">Eläkeajan lopun salkku</dt>
            <dd className="mt-1 font-semibold text-emerald-950">
              {muotoileEuro(yhteenveto.elakeajanLoppusaldo)}
            </dd>
          </div>
          <div>
            <dt className="text-emerald-950/60">Verot ja kulut</dt>
            <dd className="mt-1 font-semibold text-emerald-950">
              {muotoileEuro(yhteenveto.verotYhteensa + yhteenveto.kulutYhteensa)}
            </dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  )
}

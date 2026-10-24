"use client"

import { Tooltip } from "@base-ui/react/tooltip"
import { useState } from "react"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { muotoileEuro } from "@/lib/muotoilu"
import type { Sijoituspolku, Vuosirivi } from "@/lib/laskenta/tyypit"

interface TarkatLaskelmatProps {
  yritys: Sijoituspolku
  yksityinen: Sijoituspolku
}

type NumeerinenKentta =
  | "vuosi"
  | "alkusaldo"
  | "sijoitukset"
  | "tuotot"
  | "realisoituVoitto"
  | "verot"
  | "kulut"
  | "bruttotulo"
  | "nettotulo"
  | "loppusaldo"

interface NumeerinenSarake {
  avain: NumeerinenKentta
  otsikko: string
  muotoile: (arvo: number) => string
}

interface TooltipSisalto {
  otsikko: string
  arvo: string
}

interface LukuSoluProps {
  rivi: Vuosirivi
  sarake: NumeerinenSarake
  tooltipHandle: Tooltip.Handle<TooltipSisalto>
  korostettu?: boolean
}

const VUOSISARAKE: NumeerinenSarake = {
  avain: "vuosi",
  otsikko: "Vuosi",
  muotoile: String,
}

const RAHASARAKKEET: NumeerinenSarake[] = [
  { avain: "alkusaldo", otsikko: "Alkusaldo", muotoile: muotoileEuro },
  { avain: "sijoitukset", otsikko: "Sijoitukset", muotoile: muotoileEuro },
  { avain: "tuotot", otsikko: "Tuotot", muotoile: muotoileEuro },
  {
    avain: "realisoituVoitto",
    otsikko: "Realisoitu voitto",
    muotoile: muotoileEuro,
  },
  { avain: "verot", otsikko: "Verot", muotoile: muotoileEuro },
  { avain: "kulut", otsikko: "Kulut", muotoile: muotoileEuro },
  { avain: "bruttotulo", otsikko: "Bruttotulo", muotoile: muotoileEuro },
  { avain: "nettotulo", otsikko: "Nettotulo", muotoile: muotoileEuro },
  { avain: "loppusaldo", otsikko: "Loppusaldo", muotoile: muotoileEuro },
]

function VaiheenNimi(vaihe: Vuosirivi["vaihe"]) {
  return vaihe === "aktiivinen" ? "Aktiivinen" : "Eläkeaika"
}

function VaihtoehdonNimi(vaihtoehto: Vuosirivi["vaihtoehto"]) {
  return vaihtoehto === "yritys" ? "Yritys" : "Yksityinen"
}

function LukuSolu({
  rivi,
  sarake,
  tooltipHandle,
  korostettu = false,
}: LukuSoluProps) {
  const arvo = rivi[sarake.avain]
  const muotoiltuArvo = sarake.muotoile(arvo)
  const tooltipTeksti = `${sarake.otsikko}: ${muotoiltuArvo}`

  return (
    <TableCell
      className={`text-right${korostettu ? " font-semibold" : ""}`}
    >
      <Tooltip.Trigger
        handle={tooltipHandle}
        payload={{ otsikko: sarake.otsikko, arvo: muotoiltuArvo }}
        delay={200}
        aria-label={tooltipTeksti}
        data-testid={`laskelman-luku-${rivi.vaihtoehto}-${rivi.vuosi}-${sarake.avain}`}
        className="cursor-help rounded-sm bg-transparent p-0 text-inherit outline-none focus-visible:ring-2 focus-visible:ring-emerald-600/50"
      >
        {muotoiltuArvo}
      </Tooltip.Trigger>
    </TableCell>
  )
}

export function TarkatLaskelmat({
  yritys,
  yksityinen,
}: TarkatLaskelmatProps) {
  const rivit = [...yritys.vuosirivit, ...yksityinen.vuosirivit]
  const [tooltipHandle] = useState(() =>
    Tooltip.createHandle<TooltipSisalto>()
  )

  return (
    <Tooltip.Provider>
      <section
        id="tarkat-laskelmat"
        aria-labelledby="tarkat-laskelmat-otsikko"
        className="scroll-mt-6 rounded-3xl border border-emerald-900/10 bg-white p-5 shadow-sm sm:p-6"
      >
            <div className="mb-5">
              <p className="text-sm font-semibold tracking-wide text-emerald-700 uppercase">
                Vuositaso
              </p>
              <h2
                id="tarkat-laskelmat-otsikko"
                className="mt-1 text-2xl font-semibold text-emerald-950"
              >
                Tarkat laskelmat
              </h2>
              <p className="mt-2 text-sm leading-6 text-emerald-950/65">
                Taulukkoa voi vierittää sivusuunnassa pienellä näytöllä. Kaikki arvot
                ovat laskennan tarkkoja arvoja, jotka esitetään pyöristettyinä euroina.
              </p>
            </div>
            <div
              data-testid="tarkat-laskelmat-vieritys"
              tabIndex={0}
              aria-label="Tarkkojen laskelmien vieritettävä taulukko"
              className="overflow-x-auto rounded-xl border border-emerald-900/10 outline-none focus-visible:ring-3 focus-visible:ring-emerald-600/30"
            >
              <Table className="min-w-[1050px]">
                <caption className="sr-only">
                  Yrityksen ja yksityishenkilön vuosittaiset sijoituslaskelmat
                </caption>
                <TableHeader>
                  <TableRow className="bg-emerald-50 hover:bg-emerald-50">
                    <TableHead scope="col">Vaihtoehto</TableHead>
                    <TableHead scope="col">{VUOSISARAKE.otsikko}</TableHead>
                    <TableHead scope="col">Vaihe</TableHead>
                    {RAHASARAKKEET.map((sarake) => (
                      <TableHead
                        key={sarake.avain}
                        scope="col"
                        className="text-right"
                      >
                        {sarake.otsikko}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rivit.map((rivi) => (
                    <TableRow
                      key={`${rivi.vaihtoehto}-${rivi.vuosi}`}
                      className="[contain-intrinsic-size:auto_52px] [content-visibility:auto]"
                    >
                      <TableCell className="font-medium">
                        {VaihtoehdonNimi(rivi.vaihtoehto)}
                      </TableCell>
                      <LukuSolu
                        rivi={rivi}
                        sarake={VUOSISARAKE}
                        tooltipHandle={tooltipHandle}
                      />
                      <TableCell>{VaiheenNimi(rivi.vaihe)}</TableCell>
                      {RAHASARAKKEET.map((sarake) => (
                        <LukuSolu
                          key={sarake.avain}
                          rivi={rivi}
                          sarake={sarake}
                          tooltipHandle={tooltipHandle}
                          korostettu={sarake.avain === "loppusaldo"}
                        />
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
      </section>
      <Tooltip.Root handle={tooltipHandle}>
        {({ payload }) => (
          <Tooltip.Portal>
            <Tooltip.Positioner side="top" sideOffset={8} className="z-50">
              <Tooltip.Popup
                role="tooltip"
                className="rounded-lg bg-emerald-950 px-3 py-2 text-xs font-medium text-emerald-50 shadow-lg"
              >
                {payload ? `${payload.otsikko}: ${payload.arvo}` : null}
              </Tooltip.Popup>
            </Tooltip.Positioner>
          </Tooltip.Portal>
        )}
      </Tooltip.Root>
    </Tooltip.Provider>
  )
}

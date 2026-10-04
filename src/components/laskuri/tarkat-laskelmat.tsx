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

function VaiheenNimi(vaihe: Vuosirivi["vaihe"]) {
  return vaihe === "aktiivinen" ? "Aktiivinen" : "Eläkeaika"
}

function VaihtoehdonNimi(vaihtoehto: Vuosirivi["vaihtoehto"]) {
  return vaihtoehto === "yritys" ? "Yritys" : "Yksityinen"
}

export function TarkatLaskelmat({
  yritys,
  yksityinen,
}: TarkatLaskelmatProps) {
  const rivit = [...yritys.vuosirivit, ...yksityinen.vuosirivit]

  return (
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
              <TableHead>Vaihtoehto</TableHead>
              <TableHead>Vuosi</TableHead>
              <TableHead>Vaihe</TableHead>
              <TableHead className="text-right">Alkusaldo</TableHead>
              <TableHead className="text-right">Sijoitukset</TableHead>
              <TableHead className="text-right">Tuotot</TableHead>
              <TableHead className="text-right">Realisoitu voitto</TableHead>
              <TableHead className="text-right">Verot</TableHead>
              <TableHead className="text-right">Kulut</TableHead>
              <TableHead className="text-right">Bruttotulo</TableHead>
              <TableHead className="text-right">Nettotulo</TableHead>
              <TableHead className="text-right">Loppusaldo</TableHead>
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
                <TableCell>{rivi.vuosi}</TableCell>
                <TableCell>{VaiheenNimi(rivi.vaihe)}</TableCell>
                <TableCell className="text-right">{muotoileEuro(rivi.alkusaldo)}</TableCell>
                <TableCell className="text-right">{muotoileEuro(rivi.sijoitukset)}</TableCell>
                <TableCell className="text-right">{muotoileEuro(rivi.tuotot)}</TableCell>
                <TableCell className="text-right">
                  {muotoileEuro(rivi.realisoituVoitto)}
                </TableCell>
                <TableCell className="text-right">{muotoileEuro(rivi.verot)}</TableCell>
                <TableCell className="text-right">{muotoileEuro(rivi.kulut)}</TableCell>
                <TableCell className="text-right">
                  {muotoileEuro(rivi.bruttotulo)}
                </TableCell>
                <TableCell className="text-right">{muotoileEuro(rivi.nettotulo)}</TableCell>
                <TableCell className="text-right font-semibold">
                  {muotoileEuro(rivi.loppusaldo)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </section>
  )
}

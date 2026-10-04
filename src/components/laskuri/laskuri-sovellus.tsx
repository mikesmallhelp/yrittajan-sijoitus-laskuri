"use client"

import dynamic from "next/dynamic"
import { useState, useSyncExternalStore } from "react"
import { ArrowDown, TrendingUp } from "lucide-react"

import { Asetuslomake } from "@/components/laskuri/asetuslomake"
import { TarkatLaskelmat } from "@/components/laskuri/tarkat-laskelmat"
import { Vertailukortti } from "@/components/laskuri/vertailukortti"
import { laskeSijoitusvertailu, palautaOletusasetukset, validoiAsetukset } from "@/lib/laskenta/laskuri"
import type { Asetukset } from "@/lib/laskenta/tyypit"
import { muotoileEuro, muotoileProsentti } from "@/lib/muotoilu"

const ASETUSTEN_TALLENNUSAVAIN =
  "yrittajan-sijoituslaskuri:asetukset:v1"

const Tuottokayra = dynamic(
  () => import("@/components/laskuri/tuottokayra"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-72 items-center justify-center rounded-xl bg-emerald-50 text-sm text-emerald-900/65 sm:h-96">
        Ladataan tuottokäyrää…
      </div>
    ),
  }
)

interface TallennuksenLataus {
  asetukset: Asetukset
  virhe: string | null
}

function onTietue(arvo: unknown): arvo is Record<string, unknown> {
  return typeof arvo === "object" && arvo !== null && !Array.isArray(arvo)
}

function lataaAsetukset(): TallennuksenLataus {
  const oletukset = palautaOletusasetukset()

  try {
    const tallennettu = window.localStorage.getItem(ASETUSTEN_TALLENNUSAVAIN)

    if (!tallennettu) {
      return { asetukset: oletukset, virhe: null }
    }

    const jäsennetty = JSON.parse(tallennettu) as unknown

    if (!onTietue(jäsennetty)) {
      return {
        asetukset: oletukset,
        virhe: "Tallennettuja asetuksia ei voitu lukea, joten käytössä ovat oletusarvot.",
      }
    }

    const asetukset = { ...oletukset }

    for (const kentta of Object.keys(oletukset) as Array<keyof Asetukset>) {
      const arvo = jäsennetty[kentta]

      if (typeof arvo === "number" && Number.isFinite(arvo)) {
        asetukset[kentta] = arvo
      }
    }

    if (Object.keys(validoiAsetukset(asetukset)).length > 0) {
      return {
        asetukset: oletukset,
        virhe: "Tallennetut asetukset eivät ole sallituissa rajoissa, joten käytössä ovat oletusarvot.",
      }
    }

    return { asetukset, virhe: null }
  } catch {
    return {
      asetukset: oletukset,
      virhe: "Selaimen asetustallennus ei ole käytettävissä, joten käytössä ovat oletusarvot.",
    }
  }
}

function tallennaAsetukset(asetukset: Asetukset) {
  try {
    window.localStorage.setItem(
      ASETUSTEN_TALLENNUSAVAIN,
      JSON.stringify(asetukset)
    )
    return null
  } catch {
    return "Asetusten tallennus selaimeen epäonnistui. Muutokset ovat käytössä tällä käynnillä."
  }
}

function tilaaHydratoitumista() {
  return () => {}
}

function selaimenHydraatiotila() {
  return true
}

function palvelimenHydraatiotila() {
  return false
}

function Latauskuori() {
  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
      <div className="h-36 animate-pulse rounded-3xl bg-emerald-100/80" />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
        <div className="h-[620px] animate-pulse rounded-3xl bg-emerald-100/60" />
        <div className="h-[620px] animate-pulse rounded-3xl bg-emerald-100/60" />
      </div>
    </main>
  )
}

export function LaskuriSovellus() {
  const onHydratoitu = useSyncExternalStore(
    tilaaHydratoitumista,
    selaimenHydraatiotila,
    palvelimenHydraatiotila
  )
  const [alkutila] = useState<TallennuksenLataus>(() =>
    typeof window === "undefined"
      ? { asetukset: palautaOletusasetukset(), virhe: null }
      : lataaAsetukset()
  )
  const [asetukset, setAsetukset] = useState(alkutila.asetukset)
  const [tallennusvirhe, setTallennusvirhe] = useState(alkutila.virhe)

  if (!onHydratoitu) {
    return <Latauskuori />
  }

  const virheet = validoiAsetukset(asetukset)
  const onKelvollinen = Object.keys(virheet).length === 0
  const tulos = onKelvollinen ? laskeSijoitusvertailu(asetukset) : null

  function muutaAsetusta(kentta: keyof Asetukset, arvo: number) {
    const seuraavatAsetukset = {
      ...asetukset,
      [kentta]: arvo,
    }

    setAsetukset(seuraavatAsetukset)
    setTallennusvirhe(
      Object.keys(validoiAsetukset(seuraavatAsetukset)).length === 0
        ? tallennaAsetukset(seuraavatAsetukset)
        : null
    )
  }

  function palautaOletukset() {
    const seuraavatAsetukset = palautaOletusasetukset()

    setAsetukset(seuraavatAsetukset)
    setTallennusvirhe(tallennaAsetukset(seuraavatAsetukset))
  }

  return (
    <main className="flex-1 bg-[linear-gradient(145deg,#f7fdf9_0%,#ecfdf5_45%,#f8fafc_100%)]">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
        <header className="rounded-3xl bg-emerald-950 px-5 py-8 text-emerald-50 shadow-xl shadow-emerald-950/15 sm:px-8 sm:py-10">
          <div className="flex max-w-3xl flex-col gap-4">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-emerald-400/20 text-emerald-200">
              <TrendingUp className="size-6" aria-hidden="true" />
            </span>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Yrittäjän sijoituslaskuri
              </h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-emerald-50/80">
                Vertaa yrityksen kautta ja yksityishenkilönä sijoittamisen vaikutusta
                varallisuuteen sekä eläkeajan nettotuloihin.
              </p>
            </div>
          </div>
        </header>

        {tallennusvirhe ? (
          <p
            role="status"
            className="mt-6 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-950"
          >
            {tallennusvirhe}
          </p>
        ) : null}

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(18rem,0.85fr)_minmax(0,1.15fr)]">
          <Asetuslomake
            asetukset={asetukset}
            virheet={virheet}
            onMuuta={muutaAsetusta}
            onPalautaOletukset={palautaOletukset}
          />

          {tulos ? (
            <section aria-labelledby="tulokset-otsikko" className="space-y-6">
              <div className="rounded-3xl border border-emerald-900/10 bg-emerald-100/70 p-5 sm:p-6">
                <p className="text-sm font-semibold tracking-wide text-emerald-700 uppercase">
                  Eläkeajan vertailu
                </p>
                <h2
                  id="tulokset-otsikko"
                  className="mt-1 text-2xl font-semibold text-emerald-950"
                >
                  Nettotulojen yhteenveto
                </h2>
                <p className="mt-3 text-base leading-7 text-emerald-950/80">
                  Eläkeajalla yhteensä saatava nettotulo: yrityksenä{" "}
                  <strong>{muotoileEuro(tulos.yritys.yhteenveto.elakeajanNettotuloYhteensa)}</strong>,
                  yksityishenkilönä{" "}
                  <strong>{muotoileEuro(tulos.yksityinen.yhteenveto.elakeajanNettotuloYhteensa)}</strong>.
                </p>
                <div className="mt-5 rounded-2xl bg-white/80 p-4">
                  <p className="text-sm text-emerald-950/65">Vaihtoehtojen erotus</p>
                  <p className="mt-1 text-2xl font-semibold text-emerald-950">
                    {muotoileEuro(tulos.erotusEuroina)}
                    {tulos.erotusProsentteina !== null
                      ? ` (${muotoileProsentti(tulos.erotusProsentteina)})`
                      : ""}
                  </p>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Vertailukortti
                  vaihtoehto="yritys"
                  yhteenveto={tulos.yritys.yhteenveto}
                />
                <Vertailukortti
                  vaihtoehto="yksityinen"
                  yhteenveto={tulos.yksityinen.yhteenveto}
                />
              </div>
            </section>
          ) : (
            <section
              role="alert"
              className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-900"
            >
              <h2 className="text-xl font-semibold">Tarkista asetukset</h2>
              <p className="mt-2 text-sm leading-6">
                Korjaa lomakkeen virheet, jotta laskelma voidaan näyttää.
              </p>
            </section>
          )}
        </div>

        {tulos ? (
          <div className="mt-6 space-y-6">
            <section
              aria-labelledby="tuottokayra-otsikko"
              className="rounded-3xl border border-emerald-900/10 bg-white p-5 shadow-sm sm:p-6"
            >
              <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-sm font-semibold tracking-wide text-emerald-700 uppercase">
                    Varallisuuden kehitys
                  </p>
                  <h2
                    id="tuottokayra-otsikko"
                    className="mt-1 text-2xl font-semibold text-emerald-950"
                  >
                    Tuottokäyrä
                  </h2>
                </div>
                <p className="text-sm text-emerald-950/65">
                  Katkoviiva merkitsee eläkeajan alkua.
                </p>
              </div>
              <Tuottokayra
                pisteet={tulos.kaaviopisteet}
                aktiivisetVuodet={asetukset.aktiivisetVuodet}
              />
            </section>

            <div className="flex justify-center">
              <a
                href="#tarkat-laskelmat"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-emerald-800/20 px-4 text-sm font-medium text-emerald-900 transition-colors hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-emerald-700/30"
              >
                Siirry tarkkoihin laskelmiin
                <ArrowDown className="size-4" aria-hidden="true" />
              </a>
            </div>

            <TarkatLaskelmat
              yritys={tulos.yritys}
              yksityinen={tulos.yksityinen}
            />
          </div>
        ) : null}
      </div>
    </main>
  )
}

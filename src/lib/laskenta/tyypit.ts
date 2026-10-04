export type Vaihe = "aktiivinen" | "elake"
export type Vaihtoehto = "yritys" | "yksityinen"

export interface Asetukset {
  aktiivisetVuodet: number
  elakevuodet: number
  yrityksenVuosittainenSijoitus: number
  yksityisenVuosittainenPalkka: number
  listaamattomanYhtionVuosiosinko: number
  vuosituottoProsentti: number
  tilitoimistokulu: number
}

export const OLETUS_ASETUKSET: Asetukset = {
  aktiivisetVuodet: 15,
  elakevuodet: 15,
  yrityksenVuosittainenSijoitus: 12_000,
  yksityisenVuosittainenPalkka: 12_000,
  listaamattomanYhtionVuosiosinko: 20_000,
  vuosituottoProsentti: 5,
  tilitoimistokulu: 1_000,
}

export const VEROMALLI = {
  yhteisovero: 0.18,
  palkkavero: 0.25,
  elakelaisenVero: 0.15,
  huojennetunOsingonRaja: 0.08,
  huojennetunOsingonAlempiRaja: 150_000,
  huojennetunOsingonAlempiVeronalainenOsuus: 0.25,
  huojennetunOsingonYlempiVeronalainenOsuus: 0.85,
  paomatulonAlempiRaja: 30_000,
  paomatulonAlempiVero: 0.3,
  paomatulonYlempiVero: 0.34,
} as const

export type Validointivirheet = Partial<Record<keyof Asetukset, string>>

export interface Vuosirivi {
  vaihtoehto: Vaihtoehto
  vuosi: number
  vaihe: Vaihe
  alkusaldo: number
  sijoitukset: number
  tuotot: number
  realisoituVoitto: number
  verot: number
  kulut: number
  bruttotulo: number
  nettotulo: number
  loppusaldo: number
}

export interface PolunYhteenveto {
  aktiivikaudenLoppusaldo: number
  elakeajanLoppusaldo: number
  elakeajanNettotuloYhteensa: number
  elakeajanNettotuloVuosittain: number
  verotYhteensa: number
  kulutYhteensa: number
}

export interface Sijoituspolku {
  vuosirivit: Vuosirivi[]
  yhteenveto: PolunYhteenveto
}

export interface Kaaviopiste {
  vuosi: number
  vaihe: Vaihe
  yritys: number
  yksityinen: number
}

export interface Laskentatulos {
  yritys: Sijoituspolku
  yksityinen: Sijoituspolku
  kaaviopisteet: Kaaviopiste[]
  erotusEuroina: number
  erotusProsentteina: number | null
}

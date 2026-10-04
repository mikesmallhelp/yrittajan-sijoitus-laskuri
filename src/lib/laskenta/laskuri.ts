import {
  OLETUS_ASETUKSET,
  VEROMALLI,
  type Asetukset,
  type Kaaviopiste,
  type Laskentatulos,
  type PolunYhteenveto,
  type Sijoituspolku,
  type Validointivirheet,
  type Vuosirivi,
} from "@/lib/laskenta/tyypit"

const VUOSIEN_MINIMI = 1
const VUOSIEN_MAKSIMI = 100
const TUOTON_MINIMI = -100
const TUOTON_MAKSIMI = 100

export function validoiAsetukset(asetukset: Asetukset): Validointivirheet {
  const virheet: Validointivirheet = {}

  if (
    !Number.isInteger(asetukset.aktiivisetVuodet) ||
    asetukset.aktiivisetVuodet < VUOSIEN_MINIMI ||
    asetukset.aktiivisetVuodet > VUOSIEN_MAKSIMI
  ) {
    virheet.aktiivisetVuodet = `Anna kokonaisluku väliltä ${VUOSIEN_MINIMI}–${VUOSIEN_MAKSIMI}.`
  }

  if (
    !Number.isInteger(asetukset.elakevuodet) ||
    asetukset.elakevuodet < VUOSIEN_MINIMI ||
    asetukset.elakevuodet > VUOSIEN_MAKSIMI
  ) {
    virheet.elakevuodet = `Anna kokonaisluku väliltä ${VUOSIEN_MINIMI}–${VUOSIEN_MAKSIMI}.`
  }

  if (
    !Number.isFinite(asetukset.vuosituottoProsentti) ||
    asetukset.vuosituottoProsentti < TUOTON_MINIMI ||
    asetukset.vuosituottoProsentti > TUOTON_MAKSIMI
  ) {
    virheet.vuosituottoProsentti = `Anna tuotto väliltä ${TUOTON_MINIMI}–${TUOTON_MAKSIMI} %.`
  }

  const eiNegatiivisetKentat: Array<keyof Pick<
    Asetukset,
    | "yrityksenVuosittainenSijoitus"
    | "yksityisenVuosittainenPalkka"
    | "listaamattomanYhtionVuosiosinko"
    | "tilitoimistokulu"
  >> = [
    "yrityksenVuosittainenSijoitus",
    "yksityisenVuosittainenPalkka",
    "listaamattomanYhtionVuosiosinko",
    "tilitoimistokulu",
  ]

  for (const kentta of eiNegatiivisetKentat) {
    if (!Number.isFinite(asetukset[kentta]) || asetukset[kentta] < 0) {
      virheet[kentta] = "Anna nolla tai sitä suurempi summa."
    }
  }

  return virheet
}

function varmistaKelvollisetAsetukset(asetukset: Asetukset) {
  const virheet = validoiAsetukset(asetukset)

  if (Object.keys(virheet).length > 0) {
    throw new Error("Asetuksissa on virheitä.")
  }
}

function laskePaomatulovero(veronalainenPaomatulo: number) {
  const verotettavaTulo = Math.max(veronalainenPaomatulo, 0)
  const alempiOsa = Math.min(
    verotettavaTulo,
    VEROMALLI.paomatulonAlempiRaja
  )
  const ylempiOsa = Math.max(
    verotettavaTulo - VEROMALLI.paomatulonAlempiRaja,
    0
  )

  return (
    alempiOsa * VEROMALLI.paomatulonAlempiVero +
    ylempiOsa * VEROMALLI.paomatulonYlempiVero
  )
}

function muodostaYhteenveto(
  vuosirivit: Vuosirivi[],
  aktiivisetVuodet: number,
  elakevuodet: number
): PolunYhteenveto {
  const aktiivikaudenViimeinenRivi = vuosirivit[aktiivisetVuodet - 1]
  const elakeajanRivit = vuosirivit.slice(aktiivisetVuodet)
  const elakeajanNettotuloYhteensa = elakeajanRivit.reduce(
    (summa, rivi) => summa + rivi.nettotulo,
    0
  )

  return {
    aktiivikaudenLoppusaldo: aktiivikaudenViimeinenRivi.loppusaldo,
    elakeajanLoppusaldo: vuosirivit.at(-1)?.loppusaldo ?? 0,
    elakeajanNettotuloYhteensa,
    elakeajanNettotuloVuosittain: elakeajanNettotuloYhteensa / elakevuodet,
    verotYhteensa: vuosirivit.reduce((summa, rivi) => summa + rivi.verot, 0),
    kulutYhteensa: vuosirivit.reduce((summa, rivi) => summa + rivi.kulut, 0),
  }
}

function laskeYrityksenPolku(asetukset: Asetukset): Sijoituspolku {
  const vuosirivit: Vuosirivi[] = []
  const vuosituotto = asetukset.vuosituottoProsentti / 100
  let saldo = 0
  let hankintameno = 0

  for (let vuosi = 1; vuosi <= asetukset.aktiivisetVuodet; vuosi += 1) {
    const alkusaldo = saldo
    const tuotot = alkusaldo * vuosituotto
    const sijoituksenYhteisovero =
      asetukset.yrityksenVuosittainenSijoitus * VEROMALLI.yhteisovero
    const sijoitukset =
      asetukset.yrityksenVuosittainenSijoitus - sijoituksenYhteisovero +
      asetukset.listaamattomanYhtionVuosiosinko

    saldo = alkusaldo + tuotot + sijoitukset
    hankintameno += sijoitukset

    vuosirivit.push({
      vaihtoehto: "yritys",
      vuosi,
      vaihe: "aktiivinen",
      alkusaldo,
      sijoitukset,
      tuotot,
      realisoituVoitto: 0,
      verot: sijoituksenYhteisovero,
      kulut: 0,
      bruttotulo: 0,
      nettotulo: 0,
      loppusaldo: saldo,
    })
  }

  for (let elakevuosi = 1; elakevuosi <= asetukset.elakevuodet; elakevuosi += 1) {
    const alkusaldo = saldo
    const tuotot = alkusaldo * vuosituotto
    const myyntiaEdeltavaSaldo = alkusaldo + tuotot
    const jaljellaOlevatElakevuodet =
      asetukset.elakevuodet - elakevuosi + 1
    const myyntihinta =
      myyntiaEdeltavaSaldo / jaljellaOlevatElakevuodet
    const myynninHankintameno =
      myyntiaEdeltavaSaldo > 0
        ? myyntihinta * (hankintameno / myyntiaEdeltavaSaldo)
        : 0
    const realisoituVoitto = myyntihinta - myynninHankintameno
    const sijoitustuotonVero =
      Math.max(realisoituVoitto, 0) * VEROMALLI.yhteisovero
    const osinkoonKaytettavaMaara = Math.max(
      myyntihinta - asetukset.tilitoimistokulu - sijoitustuotonVero,
      0
    )
    const huojennetunOsingonEnimmaismaara =
      alkusaldo * VEROMALLI.huojennetunOsingonRaja
    const huojennettuPaomatuloOsinko = Math.min(
      osinkoonKaytettavaMaara,
      huojennetunOsingonEnimmaismaara
    )
    const ansiotuloOsinko =
      osinkoonKaytettavaMaara - huojennettuPaomatuloOsinko
    const veronalainenPaomatulo =
      Math.min(
        huojennettuPaomatuloOsinko,
        VEROMALLI.huojennetunOsingonAlempiRaja
      ) * VEROMALLI.huojennetunOsingonAlempiVeronalainenOsuus +
      Math.max(
        huojennettuPaomatuloOsinko -
          VEROMALLI.huojennetunOsingonAlempiRaja,
        0
      ) * VEROMALLI.huojennetunOsingonYlempiVeronalainenOsuus
    const paomatuloOsingonVero = laskePaomatulovero(veronalainenPaomatulo)
    const ansiotuloOsingonVero =
      ansiotuloOsinko *
      VEROMALLI.huojennetunOsingonYlempiVeronalainenOsuus *
      VEROMALLI.elakelaisenVero
    const osingonVero = paomatuloOsingonVero + ansiotuloOsingonVero

    saldo = Math.max(myyntiaEdeltavaSaldo - myyntihinta, 0)
    hankintameno = Math.max(hankintameno - myynninHankintameno, 0)

    vuosirivit.push({
      vaihtoehto: "yritys",
      vuosi: asetukset.aktiivisetVuodet + elakevuosi,
      vaihe: "elake",
      alkusaldo,
      sijoitukset: 0,
      tuotot,
      realisoituVoitto,
      verot: sijoitustuotonVero + osingonVero,
      kulut: asetukset.tilitoimistokulu,
      bruttotulo: osinkoonKaytettavaMaara,
      nettotulo: osinkoonKaytettavaMaara - osingonVero,
      loppusaldo: saldo,
    })
  }

  return {
    vuosirivit,
    yhteenveto: muodostaYhteenveto(
      vuosirivit,
      asetukset.aktiivisetVuodet,
      asetukset.elakevuodet
    ),
  }
}

function laskeYksityisenPolku(asetukset: Asetukset): Sijoituspolku {
  const vuosirivit: Vuosirivi[] = []
  const vuosituotto = asetukset.vuosituottoProsentti / 100
  let saldo = 0
  let hankintameno = 0

  for (let vuosi = 1; vuosi <= asetukset.aktiivisetVuodet; vuosi += 1) {
    const alkusaldo = saldo
    const tuotot = alkusaldo * vuosituotto
    const palkastaSijoitettavaMaara =
      asetukset.yksityisenVuosittainenPalkka * (1 - VEROMALLI.palkkavero)
    const osingostaSijoitettavaMaara =
      asetukset.listaamattomanYhtionVuosiosinko * (1 - VEROMALLI.palkkavero)
    const sijoitukset = palkastaSijoitettavaMaara + osingostaSijoitettavaMaara
    const palkkaverot =
      asetukset.yksityisenVuosittainenPalkka * VEROMALLI.palkkavero +
      asetukset.listaamattomanYhtionVuosiosinko * VEROMALLI.palkkavero

    saldo = alkusaldo + tuotot + sijoitukset
    hankintameno += sijoitukset

    vuosirivit.push({
      vaihtoehto: "yksityinen",
      vuosi,
      vaihe: "aktiivinen",
      alkusaldo,
      sijoitukset,
      tuotot,
      realisoituVoitto: 0,
      verot: palkkaverot,
      kulut: 0,
      bruttotulo: 0,
      nettotulo: 0,
      loppusaldo: saldo,
    })
  }

  for (let elakevuosi = 1; elakevuosi <= asetukset.elakevuodet; elakevuosi += 1) {
    const alkusaldo = saldo
    const tuotot = alkusaldo * vuosituotto
    const nostoaEdeltavaSaldo = alkusaldo + tuotot
    const jaljellaOlevatElakevuodet =
      asetukset.elakevuodet - elakevuosi + 1
    const bruttonosto =
      nostoaEdeltavaSaldo / jaljellaOlevatElakevuodet
    const nostonHankintameno =
      nostoaEdeltavaSaldo > 0
        ? bruttonosto * (hankintameno / nostoaEdeltavaSaldo)
        : 0
    const realisoituVoitto = bruttonosto - nostonHankintameno
    const vero = laskePaomatulovero(realisoituVoitto)

    saldo = Math.max(nostoaEdeltavaSaldo - bruttonosto, 0)
    hankintameno = Math.max(hankintameno - nostonHankintameno, 0)

    vuosirivit.push({
      vaihtoehto: "yksityinen",
      vuosi: asetukset.aktiivisetVuodet + elakevuosi,
      vaihe: "elake",
      alkusaldo,
      sijoitukset: 0,
      tuotot,
      realisoituVoitto,
      verot: vero,
      kulut: 0,
      bruttotulo: bruttonosto,
      nettotulo: bruttonosto - vero,
      loppusaldo: saldo,
    })
  }

  return {
    vuosirivit,
    yhteenveto: muodostaYhteenveto(
      vuosirivit,
      asetukset.aktiivisetVuodet,
      asetukset.elakevuodet
    ),
  }
}

function muodostaKaaviopisteet(
  yritys: Sijoituspolku,
  yksityinen: Sijoituspolku
): Kaaviopiste[] {
  const alku: Kaaviopiste = {
    vuosi: 0,
    vaihe: "aktiivinen",
    yritys: 0,
    yksityinen: 0,
  }

  return [
    alku,
    ...yritys.vuosirivit.map((rivi, indeksi) => ({
      vuosi: rivi.vuosi,
      vaihe: rivi.vaihe,
      yritys: rivi.loppusaldo,
      yksityinen: yksityinen.vuosirivit[indeksi].loppusaldo,
    })),
  ]
}

export function laskeSijoitusvertailu(asetukset: Asetukset): Laskentatulos {
  varmistaKelvollisetAsetukset(asetukset)

  const yritys = laskeYrityksenPolku(asetukset)
  const yksityinen = laskeYksityisenPolku(asetukset)
  const erotusEuroina =
    yritys.yhteenveto.elakeajanNettotuloYhteensa -
    yksityinen.yhteenveto.elakeajanNettotuloYhteensa
  const yksityisenNettotulo =
    yksityinen.yhteenveto.elakeajanNettotuloYhteensa

  return {
    yritys,
    yksityinen,
    kaaviopisteet: muodostaKaaviopisteet(yritys, yksityinen),
    erotusEuroina,
    erotusProsentteina:
      yksityisenNettotulo === 0
        ? null
        : (erotusEuroina / yksityisenNettotulo) * 100,
  }
}

export function palautaOletusasetukset() {
  return { ...OLETUS_ASETUKSET }
}

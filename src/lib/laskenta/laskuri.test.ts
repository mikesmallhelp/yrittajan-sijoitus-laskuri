import { describe, expect, it } from "vitest"

import { laskeSijoitusvertailu } from "@/lib/laskenta/laskuri"
import { OLETUS_ASETUKSET } from "@/lib/laskenta/tyypit"

describe("laskeSijoitusvertailu", () => {
  it("tuottaa oletusasetuksilla molemmille poluille kaikki vuodet ja tyhjät loppusalkut", () => {
    const tulos = laskeSijoitusvertailu(OLETUS_ASETUKSET)

    expect(tulos.yritys.vuosirivit).toHaveLength(30)
    expect(tulos.yksityinen.vuosirivit).toHaveLength(30)
    expect(tulos.yritys.yhteenveto.elakeajanLoppusaldo).toBe(0)
    expect(tulos.yksityinen.yhteenveto.elakeajanLoppusaldo).toBe(0)
    expect(tulos.kaaviopisteet).toHaveLength(31)
  })

  it("vähentää aktiivikauden sijoituksesta yritys- ja palkkaveron ennen sijoittamista", () => {
    const tulos = laskeSijoitusvertailu({
      ...OLETUS_ASETUKSET,
      aktiivisetVuodet: 1,
      elakevuodet: 1,
      yrityksenVuosittainenSijoitus: 100,
      yksityisenVuosittainenPalkka: 100,
      listaamattomanYhtionVuosiosinko: 0,
      vuosituottoProsentti: 0,
      tilitoimistokulu: 0,
    })

    expect(tulos.yritys.vuosirivit[0]).toMatchObject({
      sijoitukset: 82,
      verot: 18,
      loppusaldo: 82,
    })
    expect(tulos.yksityinen.vuosirivit[0]).toMatchObject({
      sijoitukset: 75,
      verot: 25,
      loppusaldo: 75,
    })
  })

  it("kohdistaa yritysmyynnin hankintamenon suhteellisesti", () => {
    const tulos = laskeSijoitusvertailu({
      ...OLETUS_ASETUKSET,
      aktiivisetVuodet: 1,
      elakevuodet: 2,
      yrityksenVuosittainenSijoitus: 100,
      yksityisenVuosittainenPalkka: 0,
      listaamattomanYhtionVuosiosinko: 0,
      vuosituottoProsentti: 100,
      tilitoimistokulu: 0,
    })
    const ensimmainenElakevuosi = tulos.yritys.vuosirivit[1]

    expect(ensimmainenElakevuosi.bruttotulo).toBeCloseTo(37.31, 2)
    expect(ensimmainenElakevuosi.realisoituVoitto).toBeCloseTo(20.5, 5)
  })

  it("verottaa yksityishenkilöä vain myyntivoiton osuudesta", () => {
    const tulos = laskeSijoitusvertailu({
      ...OLETUS_ASETUKSET,
      aktiivisetVuodet: 1,
      elakevuodet: 1,
      yrityksenVuosittainenSijoitus: 0,
      yksityisenVuosittainenPalkka: 100,
      listaamattomanYhtionVuosiosinko: 0,
      vuosituottoProsentti: 100,
      tilitoimistokulu: 0,
    })
    const elakevuosi = tulos.yksityinen.vuosirivit[1]

    expect(elakevuosi.bruttotulo).toBe(150)
    expect(elakevuosi.realisoituVoitto).toBe(75)
    expect(elakevuosi.verot).toBeCloseTo(22.5, 5)
    expect(elakevuosi.nettotulo).toBeCloseTo(127.5, 5)
  })
})

# Yrittäjän sijoituslaskuri

## Tavoite

Sovellus vertaa yhden henkilön yrityksen kautta ja yksityishenkilönä sijoittamisen vaikutusta varallisuuden kertymiseen ja eläkkeen aikaiseen kuukausituloon Suomessa.

Laskenta jakautuu kahteen jaksoon:

1. **Aktiivinen yrittäjyys**, oletuksena 15 vuotta.
2. **Eläkeaika**, oletuksena 15 vuotta.

Päänäyttö näyttää oletusarvoilla heti:

- yrityksen ja yksityishenkilön sijoitussalkkujen kehityksen
- visuaalisen tuottokäyrän
- eläkeajan nettokuukausitulon molemmille vaihtoehdoille
- vaihtoehtojen erotuksen euroina ja prosentteina.

Erillinen **Tarkat laskelmat** -näkymä näyttää vuosi- ja kuukausitasolla panokset, tuotot, verot, kulut, nostot ja jäljellä olevan varallisuuden.

## Oletusarvot

| Parametri | Oletus |
|---|---:|
| Aktiivisen yrittäjyyden kesto | 15 vuotta |
| Eläkeajan kesto | 15 vuotta |
| Yrityksen kuukausisijoitus | 1 000 €/kk |
| Yksityishenkilön kuukausipalkka sijoittamista varten | 1 000 €/kk brutto |
| Listaamattoman yhtiön vuosiosinko | 20 000 €/v |
| Sijoituksen vuosituotto ennen veroja ja kuluja | 5 % |
| Tilitoimistokulu eläkeaikana | 1 000 €/v |
| Yrittäjän palkkaveroprosentti | 25 % |
| Eläkeläisen veroprosentti | 15 % |
| Yhteisövero vuodesta 2027 alkaen | 18 % |
| Alkusalkku | 0 € |

Verotuksessa käytettävät prosentit, rajat ja ehdot ovat sovelluksen kiinteitä malliarvoja. Käyttäjä voi muuttaa laskennan oletuksia, kuten aikoja, sijoitussummaa, tuottoa ja kuluja, mutta ei veroparametreja.

Listaamattoman yhtiön vähintään 10 %:n omistusosuus on kiinteä mallioletus, eikä sitä näytetä käyttäjän muutettavana asetuksena.

## Laskentamalli

Kaikki kuukausisijoitukset tehdään kuukauden lopussa. Vuosituotto muunnetaan kuukausituotoksi:

```text
kuukausituotto = (1 + vuosituotto)^(1/12) - 1
```

Kuukauden salkku:

```text
salkku_uusi = (salkku_edellinen + kuukauden_sijoitus) × (1 + kuukausituotto)
```

### Yrityksen sijoituspolku aktiivisena aikana

Yritys sijoittaa kuukausittain käyttäjän määrittämän summan. Listaamattomasta yhtiöstä saatu vuosiosinko sijoitetaan kuukausittain tämän summan lisäksi:

```text
yrityksen_osinkolisä_kuukaudessa = vuosiosinko / 12
yrityksen_kuukausisijoitus =
  yrityksen_kuukausisijoitus_asetus + yrityksen_osinkolisä_kuukaudessa
```

Kun yritys omistaa listaamattomasta yhtiöstä vähintään 10 %, saatu osinko käsitellään tässä mallissa verovapaana yrityksen tulona. Yrityksen sijoitussalkun realisoitunut tuotto verotetaan yhtiön tulona:

```text
yrityksen_sijoitustuoton_vero = realisoitunut_yrityksen_voitto × 18 %
```

Verottamaton arvonnousu ei aiheuta veroa ennen realisointia.

### Yksityishenkilön sijoituspolku aktiivisena aikana

Yrityksen maksamasta 1 000 euron bruttopalkasta sijoitettavaksi jää:

```text
yksityishenkilön_kuukausisijoitus_palkasta =
  bruttopalkka × (1 - yrittäjän_palkkaveroprosentti)
```

Listaamattoman yhtiön osinko tulee tässä vaihtoehdossa ensin yritykselle verovapaana osinkona, koska yrityksen omistusosuus on vähintään 10 %. Koko osinkomäärä maksetaan omistajalle palkkana, josta vähennetään yrittäjän palkkavero:

```text
netto_osinko_palkkana =
  vuosiosinko × (1 - yrittäjän_palkkaveroprosentti)

netto_osinko_sijoitukseen_kuukaudessa =
  netto_osinko_palkkana / 12
```

Yksityishenkilön kuukausisijoitus on:

```text
yksityishenkilön_kuukausisijoitus =
  yksityishenkilön_kuukausisijoitus_palkasta
  + netto_osinko_sijoitukseen_kuukaudessa
```

### Eläkeajan yrityksen tulot

Eläkeaikana yrityksen vuosittaisesta käytettävissä olevasta rahasta vähennetään tilitoimistokulu:

```text
käytettävissä_ennen_osinkoa =
yrityksen_salkku_eläkevuoden_alussa
+ yrityksen_realisoitu_tuotto
- yrityksen_sijoitustuoton_vero
- tilitoimistokulu
```

Huojennettu osinko lasketaan listaamattoman yhtiön osakkeiden edellisen tilikauden nettovarallisuudesta. Tässä sovelluksessa yrityksellä ei ole velkoja, joten nettovarallisuutena käytetään yrityksen sijoitussalkun arvoa:

```text
matemaattinen_arvo = yrityksen_salkun_arvo
huojennetun_osingon_enimmäismäärä = matemaattinen_arvo × 8 %
```

Vuosittainen jaettava osinko on:

```text
yrityksen_brutto-osinko =
min(huojennetun_osingon_enimmäismäärä,
    käytettävissä_ennen_osinkoa,
    jäljellä_oleva_salkku / jäljellä_olevat_eläkevuodet)
```

Tilitoimistokulu maksetaan ennen osinkoa. Yrityksen jakama huojennettu osinko verotetaan omistajalla seuraavasti:

```text
veronalainen_pääomatulo =
min(yrityksen_brutto-osinko, 150 000 €) × 25 %
+ max(yrityksen_brutto-osinko - 150 000 €, 0) × 85 %
```

```text
osingon_vero = veronalainen_pääomatulo × eläkeläisen_veroprosentti
```

```text
yrityksen_nettokuukausitulo =
(yrityksen_brutto-osinko - osingon_vero) / 12
```

Huojennettua osinkoa käytetään vain 8 %:n rajaan asti. Malli ei jaa 8 %:n ylittävää ansiotulo-osinkoa.

### Eläkeajan yksityishenkilön tulot

Yksityishenkilön sijoitussalkusta nostetaan vuosittain määrä, jolla salkku käytetään suunnitellusti eläkeajan loppuun:

```text
yksityishenkilön_bruttonosto =
min(yksityishenkilön_salkku_eläkevuoden_alussa
    + realisoitunut_tuotto,
    salkku / jäljellä_olevat_eläkevuodet)
```

Nostosta verotetaan vain sijoituksen voitto-osuus. Voitto-osuus lasketaan salkun kustannusperusteen ja arvon suhteessa:

```text
voitto-osuus = bruttonosto ×
  (salkun_arvo - sijoitettu_pääoma) / salkun_arvo
```

Veronalainen voitto-osuus jaetaan pääomatuloveron portaille:

```text
yksityishenkilön_vero =
voitto-osuus × eläkeläisen_veroprosentti
```

```text
yksityishenkilön_nettokuukausitulo =
(yksityishenkilön_bruttonosto - yksityishenkilön_vero) / 12
```

Jos salkun arvo ei ylitä sijoitettua pääomaa, voitto-osuuden ja veron arvo on 0 €. Eläkeajan salkku kasvaa tai pienenee kuukausittain samalla tuotto-oletuksella kuin aktiivisena aikana.

## Käyttöliittymä

### Tulokset

Tulossivulla esitetään ensin kaksi rinnakkaista vertailukorttia:

- **Sijoittaminen yrityksenä**
- **Sijoittaminen yksityishenkilönä**

Korteissa näytetään vähintään:

- eläkeaikainen nettotulo €/kk
- eläkeajan nettotulo yhteensä
- aktiivisen ajan lopun salkku
- eläkeajan lopun salkku
- maksetut verot ja kulut.

Sivun pääkorostus on teksti:

> Eläkeaikana maksettava nettotulo: yrityksenä X €/kk, yksityishenkilönä Y €/kk.

Tuottokäyrä näyttää molempien salkkujen arvon ajan funktiona ja erottaa aktiivisen ajan eläkeajasta.

### Tarkat laskelmat

Näkymässä on vuosittainen taulukko, jonka sarakkeissa ovat vähintään:

- vuosi ja vaihe
- alkusaldo
- sijoitukset
- tuotot
- realisoidut voitot
- verot
- tilitoimistokulut
- brutto- ja nettotulot
- loppusaldo.

### Asetukset

Asetukset sisältävät käyttäjän muokattavat arvot:

- aktiivisen ajan pituus
- eläkeajan pituus
- yrityksen kuukausisijoitus
- yksityishenkilön bruttopalkka sijoittamista varten
- listaamattoman yhtiön vuosiosinko
- vuosituotto
- alkusalkku
- tilitoimistokulu.

Muutokset päivittävät tulokset ilman sivun uudelleenlatausta. Käyttäjän arvot tallennetaan vain selaimen `localStorage`-tallennukseen. Ensimmäisellä käynnistyksellä käytetään oletusarvoja.

## Tekninen toteutus

- Next.js, uusin vakaa versio, App Router
- React, uusin vakaa versio
- Tailwind CSS, uusin vakaa versio
- shadcn/ui
- Pehmeä ja optimistinen vihreä visuaalinen teema
- Suomi käyttöliittymän ja laskennan käsitteissä
- Laskenta suoritetaan selaimessa
- Veroparametrit ovat versionhallittuja kiinteitä arvoja; `.env.local` voi sisältää tarvittaessa ympäristökohtaisia oletusarvoja
- Sovellus ei hae verotietoja tai muita laskentaperusteita vero.fi:stä ajon aikana

## Verolähteet ja laskentaperusteet

Laskentakaavat perustuvat Verohallinnon ohjeisiin:

- Listaamattoman yhtiön osinko, osakkeen matemaattinen arvo, 8 %:n raja, 150 000 €:n raja sekä 25/75- ja 85/15-jaot:  
  https://www.vero.fi/henkiloasiakkaat/omaisuus/sijoitukset/osingot/osingot-listaamattomasta-yhtiosta/
- Pääomatuloveron veronalaisen osuuden muodostuminen ja pääomatuloveron portaat verotuksen vertailukohtana:  
  https://www.vero.fi/henkiloasiakkaat/verokortti-ja-veroilmoitus/tulot-ja-vahennykset/paaomatulot/
- Yhteisön saamien osinkojen verokohtelu ja yhteisöveron laskenta:  
  https://www.vero.fi/syventavat-vero-ohjeet/ohje-hakusivu/48239/yhteisojen-tuloverotus/

Mallissa yhteisöveron vuoden 2027 arvona käytetään käyttäjän määrittämää vaatimusta **18 %** ja eläkeajan efektiivisenä veroprosenttina **15 %**. Verohallinnon ohjeiden mukaiset osingon veronalaiset osuudet säilytetään, mutta eläkeajan veron määrässä käytetään tätä sovelluksen kiinteää 15 %:n vertailuoletusta. Verolähteet ja kiinteät parametrit dokumentoidaan sovelluksen lähdekoodiin, eikä niitä haeta vero.fi:stä sovelluksen käytön aikana.

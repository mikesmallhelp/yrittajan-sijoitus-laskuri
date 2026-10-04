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
| Sijoituksen vuosituotto ennen veroja ja kuluja | 5 % |
| Tilitoimistokulu eläkeaikana | 1 000 €/v |
| Yrittäjän palkkaveroprosentti | 25 % |
| Eläkeläisen veroprosentti | 15 % |
| Yhteisövero vuodesta 2027 alkaen | 18 % |
| Alkusalkku | 0 € |

Verotuksessa käytettävät prosentit, rajat ja ehdot ovat sovelluksen kiinteitä malliarvoja. Käyttäjä voi muuttaa laskennan oletuksia, kuten aikoja, sijoitussummaa, tuottoa ja kuluja, mutta ei veroparametreja.

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

Yritys sijoittaa kuukausittain käyttäjän määrittämän summan:

```text
yrityksen_kuukausisijoitus = yrityksen_kuukausisijoitus_asetus
```

Yrityksen sijoitussalkun realisoitunut tuotto verotetaan yhtiön tulona:

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

Yksityishenkilön kuukausisijoitus muodostuu yrityksen maksamasta bruttopalkasta:

```text
yksityishenkilön_kuukausisijoitus =
  yksityishenkilön_kuukausisijoitus_palkasta
```

### Eläkeajan yrityksen tulot

Eläkeajan alussa yrityksen sijoitussalkku jaetaan eläkevuosien lukumäärällä. Tämä muodostaa vuosittaisen tavoitejaon:

```text
vuosittainen_tavoitejako =
yrityksen_salkku_aktiivisen_ajan_lopussa / eläkeajan_vuosien_määrä
```

Eläkevuosina yrityksen jäljellä oleva salkku kasvaa kuukausittain kuukausituoton verran. Vuosiosinko ja tilitoimistokulu maksetaan vuoden lopussa, jolloin vain jäljelle jäänyt saldo tuottaa seuraavina kuukausina. Tavoitejaosta vähennetään eläkevuoden tilitoimistokulu:

```text
vuoden_osinkoon_käytettävä_määrä =
max(vuosittainen_tavoitejako - tilitoimistokulu, 0)
```

Huojennettu osinko lasketaan listaamattoman yhtiön osakkeiden edellisen tilikauden nettovarallisuudesta. Tässä sovelluksessa yrityksellä ei ole velkoja, joten nettovarallisuutena käytetään yrityksen eläkevuoden alun sijoitussalkun arvoa:

```text
matemaattinen_arvo = yrityksen_salkun_arvo_eläkevuoden_alussa
huojennetun_osingon_enimmäismäärä = matemaattinen_arvo × 8 %
```

Vuoden osinko jaetaan verolajeihin vuoden kokonaisjaon ja 8 %:n rajan perusteella. Ensin käytetään huojennettu pääomatulo-osinko. Sen yli menevä osa on ansiotulo-osinkoa:

```text
huojennettu_pääomatulo-osinko =
min(vuoden_osinkoon_käytettävä_määrä,
    huojennetun_osingon_enimmäismäärä)
```

```text
ansiotulo-osinko =
max(vuoden_osinkoon_käytettävä_määrä
    - huojennettu_pääomatulo-osinko, 0)
```

```text
veronalainen_pääomatulo =
min(huojennettu_pääomatulo-osinko, 150 000 €) × 25 %
+ max(huojennettu_pääomatulo-osinko - 150 000 €, 0) × 85 %
```

```text
veronalainen_ansiotulo =
ansiotulo-osinko × 75 %
```

```text
osingon_vero =
(veronalainen_pääomatulo + veronalainen_ansiotulo)
× eläkeläisen_veroprosentti
```

```text
yrityksen_nettokuukausitulo =
(huojennettu_pääomatulo-osinko
 + ansiotulo-osinko
 - osingon_vero) / 12
```

Tilitoimistokulu maksetaan ennen osinkoa vuoden lopussa. Vuoden osinkoa ei kasvateta yli eläkeajan alussa määritetyn vuosiosan, vaikka sijoitussalkku tuottaisi enemmän. Jos saldo ei riitä tavoitejakoon, jaetaan käytettävissä oleva saldo. Käyttämättä jäävät tuotot säilyvät yrityksen salkussa ja tuottavat seuraavina eläkevuosina.

### Eläkeajan yksityishenkilön tulot

Yksityishenkilön salkku kasvaa eläkeaikana kuukausittain kuukausituoton verran. Vuosinosto tehdään vuoden lopussa tuoton jälkeen, joten vain noston jälkeen jäljelle jäävä saldo tuottaa seuraavina kuukausina. Salkusta nostetaan vuosittain:

```text
vuosittainen_tavoitenosto =
yksityishenkilön_salkku_aktiivisen_ajan_lopussa
/ eläkeajan_vuosien_määrä
```

```text
yksityishenkilön_bruttonosto =
min(yksityishenkilön_salkku_vuoden_lopussa_ennen_nostoa,
    vuosittainen_tavoitenosto)
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

Jos salkun arvo ei ylitä sijoitettua pääomaa, voitto-osuuden ja veron arvo on 0 €. Vuosittainen tavoitenosto määräytyy eläkeajan alun salkun jakamisesta eläkevuosien lukumäärällä. Jos saldo ei riitä tavoitenostoon, nostetaan käytettävissä oleva saldo.

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
- vuosituotto
- alkusalkku
- tilitoimistokulu.

Muutokset päivittävät tulokset ilman sivun uudelleenlatausta. Käyttäjän arvot tallennetaan vain selaimen `localStorage`-tallennukseen. Ensimmäisellä käynnistyksellä käytetään oletusarvoja.

## Tekninen toteutus

- Next.js, uusin vakaa versio, App Router
- generoi projekti komennolla `pnpm create next-app@canary`, jolloin projektiin muodostuu `AGENTS.md`, jonka ohjeita pitää noudattaa
- React, uusin vakaa versio
- Tailwind CSS, uusin vakaa versio
- shadcn/ui
- pnpm pakettien hallinnassa
- Pehmeä ja optimistinen vihreä visuaalinen teema
- Suomi käyttöliittymän ja koodissa laskennan, verotuksen jne. käsitteissä
- Laskenta suoritetaan selaimessa
- Veroparametrit ovat versionhallittuja kiinteitä arvoja; `.env.local` voi sisältää tarvittaessa ympäristökohtaisia oletusarvoja
- Sovellus ei hae verotietoja tai muita laskentaperusteita vero.fi:stä ajon aikana

## Verolähteet ja laskentaperusteet

Laskentakaavat perustuvat Verohallinnon ohjeisiin:

- Huojennetun osingon osakkeen matemaattinen arvo, 8 %:n raja, 150 000 €:n raja sekä 25/75- ja 85/15-jaot:  
  https://www.vero.fi/henkiloasiakkaat/omaisuus/sijoitukset/osingot/osingot-listaamattomasta-yhtiosta/
- Pääomatuloveron veronalaisen osuuden muodostuminen ja pääomatuloveron portaat verotuksen vertailukohtana:  
  https://www.vero.fi/henkiloasiakkaat/verokortti-ja-veroilmoitus/tulot-ja-vahennykset/paaomatulot/

Mallissa yhteisöveron vuoden 2027 arvona käytetään käyttäjän määrittämää vaatimusta **18 %** ja eläkeajan efektiivisenä veroprosenttina **15 %**. Verohallinnon ohjeiden mukaiset osingon veronalaiset osuudet säilytetään, mutta eläkeajan veron määrässä käytetään tätä sovelluksen kiinteää 15 %:n vertailuoletusta. Verolähteet ja kiinteät parametrit dokumentoidaan sovelluksen lähdekoodiin, eikä niitä haeta vero.fi:stä sovelluksen käytön aikana.

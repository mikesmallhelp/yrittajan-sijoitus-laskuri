# Yrittäjän sijoituslaskuri

## Tavoite

Sovellus vertaa yhden henkilön yrityksen kautta ja yksityishenkilönä sijoittamisen vaikutusta varallisuuden kertymiseen ja eläkeajalla saatavaan nettotuloon Suomessa.

Laskenta jakautuu kahteen jaksoon:

1. **Aktiivinen yrittäjyys**, oletuksena 15 vuotta.
2. **Eläkeaika**, oletuksena 15 vuotta.

Päänäyttö näyttää oletusarvoilla heti:

- yrityksen ja yksityishenkilön sijoitussalkkujen kehityksen
- visuaalisen tuottokäyrän
- 15 eläkevuoden nettotulon yhteensä molemmille vaihtoehdoille
- vaihtoehtojen erotuksen euroina ja prosentteina.

Erillinen **Tarkat laskelmat** -näkymä näyttää vuositasolla panokset, tuotot, verot, kulut, nostot ja jäljellä olevan varallisuuden.

## Oletusarvot

| Parametri | Oletus |
|---|---:|
| Aktiivisen yrittäjyyden kesto | 15 vuotta |
| Eläkeajan kesto | 15 vuotta |
| Yrityksen vuosisijoitus ennen yhteisöveroa | 12 000 €/v |
| Yksityishenkilön vuosipalkasta sijoittamista varten | 12 000 €/v brutto |
| Listaamattomasta yhtiöstä saatu vuosiosinko | 20 000 €/v |
| Sijoituksen vuosituotto ennen veroja ja kuluja | 5 % |
| Tilitoimistokulu eläkeaikana | 1 000 €/v |
| Yrittäjän palkkaveroprosentti | 25 % |
| Eläkeläisen veroprosentti | 15 % |
| Yhteisövero (vuodesta 2027 alkaen) | 18 % |

Verotuksessa käytettävät prosentit, rajat ja ehdot ovat sovelluksen kiinteitä malliarvoja. Käyttäjä voi muuttaa laskennan oletuksia, kuten aikoja, sijoitussummaa, tuottoa ja kuluja, mutta ei veroparametreja.

Yritys omistaa listaamattomasta yhtiöstä vähintään 10 %. Tämän vuoksi yrityksen vastaanottama vuosiosinko on mallissa verovapaa. Omistusosuus on kiinteä mallioletus, eikä sitä näytetä asetuksissa. 

## Laskentamalli

Kaikki laskelmat tehdään vuositasolla. Aktiivisena aikana vuosisijoitus tehdään vuoden lopussa, jolloin salkun saldo kasvaa ensin vuoden tuotolla:

```text
salkku_vuoden_lopussa =
salkku_vuoden_alussa × (1 + vuosituotto)
+ vuoden_sijoitus
```

### Yrityksen sijoituspolku aktiivisena aikana

Yrityksen vuosittaisesta sijoitettavaksi tarkoitetusta summasta vähennetään ensin yhteisövero. Veron jälkeen jäävä osuus sijoitetaan kasvurahastoon:

```text
yrityksen_yhteisövero =
yrityksen_vuosisijoitus_ennen_yhteisöveroa × 18 %

yrityksen_vuosisijoitus =
yrityksen_vuosisijoitus_ennen_yhteisöveroa
- yrityksen_yhteisövero
```

Listaamattomasta yhtiöstä saatu verovapaa osinko sijoitetaan kokonaan yrityksen sijoitussalkkuun:

```text
yrityksen_vuosisijoitus_yhteensä =
yrityksen_vuosisijoitus
+ listaamattoman_yhtiön_vuosiosinko
```

### Yksityishenkilön sijoituspolku aktiivisena aikana

Yrityksen maksamasta vuosipalkasta sijoitettavaksi jää:

```text
yksityishenkilön_vuosisijoitus_palkasta_verojen_jälkeen =
yksityishenkilön_vuosisijoitus_palkasta × (1 - yrittäjän_palkkaveroprosentti)
```
Listaamattomasta yhtiöstä saatu verovapaa osinko maksetaan tässä vaihtoehdossa omistajalle palkkana:

```text
netto_osinko_palkkana =
listaamattoman_yhtiön_vuosiosinko
× (1 - yrittäjän_palkkaveroprosentti)
```
Näin saadaan vuosisijoitus yhteensä:

```text
yksityishenkilön_vuosisijoitus_yhteensä =
yksityishenkilön_vuosisijoitus_palkasta_verojen_jälkeen
+ netto_osinko_palkkana
```
### Eläkeajan yrityksen tulot

Eläkeajan alussa yrityksen sijoitussalkku jaetaan eläkevuosien lukumäärällä. Tämä muodostaa vuosittaisen tavoitejaon:

```text
vuosittainen_tavoitejako =
yrityksen_salkku_aktiivisen_ajan_lopussa / eläkeajan_vuosien_määrä
```

Eläkevuosina yrityksen jäljellä oleva salkku kasvaa vuosituoton verran. Tilitoimistokulu ja osinko rahoitetaan myymällä kasvurahasto-osuuksia vuoden lopussa, jolloin vain jäljelle jäänyt saldo tuottaa seuraavana vuonna. Muina kuin viimeisenä eläkevuotena myydään enintään vuosittaista tavoitejakoa vastaava määrä:

```text
myytyjen_rahasto-osuuksien_myyntihinta =
min(yrityksen_salkku_vuoden_lopussa_ennen_myyntiä,
    vuosittainen_tavoitejako)
```

Viimeisenä eläkevuonna myydään koko jäljellä oleva salkku:

```text
myytyjen_rahasto-osuuksien_myyntihinta =
yrityksen_salkku_vuoden_lopussa_ennen_myyntiä
```

Myynnissä realisoitunut voitto on veronalaista yritystuloa:

```text
realisoitunut_yrityksen_voitto =
myytyjen_rahasto-osuuksien_myyntihinta
- myytyjen_rahasto-osuuksien_hankintameno

yrityksen_sijoitustuoton_vero =
realisoitunut_yrityksen_voitto × 18 %
```

Vasta tilitoimistokulun ja yhteisöveron vähentämisen jälkeen jäljelle jäävä määrä voidaan jakaa omistajalle osinkona:

```text
vuoden_osinkoon_käytettävä_määrä =
max(myytyjen_rahasto-osuuksien_myyntihinta
    - tilitoimistokulu
    - yrityksen_sijoitustuoton_vero, 0)
```

Huojennettu osinko lasketaan listaamattoman yhtiön osakkeiden edellisen tilikauden nettovarallisuudesta. Nettovarallisuutena käytetään yrityksen eläkevuoden alun sijoitussalkun arvoa:

```text
matemaattinen_arvo = yrityksen_salkun_arvo_eläkevuoden_alussa
huojennetun_osingon_enimmäismäärä = matemaattinen_arvo × 8 %
```

Vuoden aikana omistajalle jaettava osinko jaetaan kahteen osaan 8 %:n rajan perusteella: 8 %:iin yhtiön matemaattisesta arvosta asti osinko on huojennettua pääomatulo-osinkoa, ja rajan ylittävä osa on ansiotulo-osinkoa:

```text
huojennettu_pääomatulo-osinko =
min(vuoden_osinkoon_käytettävä_määrä,
    huojennetun_osingon_enimmäismäärä)
```

```text
ansiotulo-osinko =
vuoden_osinkoon_käytettävä_määrä - huojennettu_pääomatulo-osinko
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
pääomatulo-osingon_vero =
min(veronalainen_pääomatulo, 30 000 €) × 30 %
+ max(veronalainen_pääomatulo - 30 000 €, 0) × 34 %
```

```text
ansiotulo-osingon_vero =
veronalainen_ansiotulo × eläkeläisen_veroprosentti
```

```text
osingon_vero =
pääomatulo-osingon_vero + ansiotulo-osingon_vero
```

```text
yrityssijoittajan_vuosinettotulo =
huojennettu_pääomatulo-osinko
+ ansiotulo-osinko
- osingon_vero
```

Eläkeajan viimeisenä vuonna yritys myy kaikki jäljellä olevat rahasto-osuudet. Tilitoimistokulun ja realisoituneen sijoitusvoiton yhteisöveron jälkeen kaikki käytettävissä olevat varat jaetaan osinkona. Eläkeajan lopun yrityssalkku on aina 0 €.

### Eläkeajan yksityishenkilön tulot

Yksityishenkilön salkku kasvaa eläkeaikana vuosituoton verran. Vuosinosto tehdään vuoden lopussa tuoton jälkeen, joten vain noston jälkeen jäljelle jäävä saldo tuottaa seuraavana vuonna. Salkusta nostetaan vuosittain:

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

Viimeisenä eläkevuonna koko jäljellä oleva salkku nostetaan:

```text
yksityishenkilön_bruttonosto =
yksityishenkilön_salkku_vuoden_lopussa_ennen_nostoa
```

Nostosta verotetaan vain sijoituksen voitto-osuus. Voitto-osuus lasketaan salkun kustannusperusteen ja arvon suhteessa:

```text
voitto-osuus = bruttonosto ×
  (salkun_arvo - sijoitettu_pääoma) / salkun_arvo
```

Rahasto-osuuksien vuosittaisesta myyntivoitosta maksetaan pääomatuloveroa 30 000 euroon asti 30 % ja sen ylittävältä osalta 34 %. Laskuri huomioi vain tässä sijoitussalkussa syntyvän myyntivoiton:

```text
yksityishenkilön_vero =
min(voitto-osuus, 30 000 €) × 30 %
+ max(voitto-osuus - 30 000 €, 0) × 34 %
```

```text
yksityishenkilön_vuosinettotulo =
yksityishenkilön_bruttonosto - yksityishenkilön_vero
```

Eläkeajan viimeisenä vuonna yksityishenkilö myy kaikki jäljellä olevat rahasto-osuudet. Koko jäljellä oleva saldo käsitellään viimeisen vuoden bruttonostona ja myyntivoitto verotetaan normaalisti. Eläkeajan lopun yksityissalkku on aina 0 €.

## Käyttöliittymä

### Tulokset

Tulossivulla esitetään ensin kaksi rinnakkaista vertailukorttia:

- **Sijoittaminen yrityksenä**
- **Sijoittaminen yksityishenkilönä**

Korteissa näytetään:

- eläkeajan nettotulo yhteensä
- eläkeaikainen nettotulo €/v
- aktiivisen ajan lopun salkku
- eläkeajan lopun salkku (0 €)
- maksetut verot ja kulut.

Sivun pääkorostus on teksti:

> Eläkeajalla yhteensä saatava nettotulo: yrityksenä X €, yksityishenkilönä Y €.

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
- yrityksen vuosisijoitus ennen yhteisöveroa
- yksityishenkilön vuosipalkka sijoittamista varten
- listaamattomasta yhtiöstä saatu vuosiosinko
- vuosituotto
- tilitoimistokulu.

Muutokset päivittävät tulokset ilman sivun uudelleenlatausta. Käyttäjän arvot tallennetaan vain selaimen `localStorage`-tallennukseen. Ensimmäisellä käynnistyksellä käytetään oletusarvoja.

## Tekninen toteutus

- Next.js, uusin vakaa versio, App Router
- generoi projekti komennolla `pnpm create next-app@canary`, jolloin projektiin muodostuu `AGENTS.md`, jonka ohjeita pitää noudattaa
- React, uusin vakaa versio
- Tailwind CSS, uusin vakaa versio
- shadcn/ui
- pnpm pakettien hallinnassa
- pehmeä ja optimistinen vihreä visuaalinen teema
- suomi käyttöliittymässä
- suomi koodissa laskennan, verotuksen jne. käsitteissä
- laskenta suoritetaan selaimessa

## Verolähteet ja laskentaperusteet

Laskentakaavat perustuvat Verohallinnon ohjeisiin:

- https://www.vero.fi/henkiloasiakkaat/omaisuus/sijoitukset/osingot/osingot-listaamattomasta-yhtiosta/
- https://www.vero.fi/syventavat-vero-ohjeet/ohje-hakusivu/47901/osinkotulojen-verotus/
- https://www.vero.fi/henkiloasiakkaat/verokortti-ja-veroilmoitus/tulot-ja-vahennykset/paaomatulot/

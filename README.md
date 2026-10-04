# Yrittäjän sijoituslaskuri

Selainpohjainen laskuri vertailee yrityksen kautta ja yksityishenkilönä
sijoittamisen vaikutusta salkun kehitykseen sekä eläkeajan nettotuloihin Suomessa.

Laskenta noudattaa repositorion [`SPEC.md`](./SPEC.md)-tiedostoa. Veroprosentit,
rajat ja omistusolettamat ovat laskurin kiinteitä malliarvoja; käyttäjä voi
muuttaa sijoitusmääriä, kestoja, tuotto-odotusta ja tilitoimistokulua.

## Käyttö

```bash
pnpm install
pnpm dev
```

Avaa sovellus osoitteessa [http://localhost:3000](http://localhost:3000).
Asetukset tallennetaan vain selaimen `localStorage`-tallennukseen avaimella
`yrittajan-sijoituslaskuri:asetukset:v1`.

## Tarkistukset

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm test:e2e
pnpm build
```

`pnpm test:e2e` tarvitsee Playwright Chromium -selaimen. Asenna se tarvittaessa:

```bash
pnpm exec playwright install chromium
```

## Laskentamallin huomio

Yrityksen rahastomyynneissä hankintameno kohdistetaan suhteellisesti myynnin
osuudelle ennen myyntiä olevasta salkusta. Tällä tavoin myyntivoitto voidaan
laskea vuosittain johdonmukaisesti myös eläkeajan osittaisissa myynneissä.

Eläkeaikana myynti tai bruttonosto lasketaan vuosittain tuoton jälkeisestä
salkusta jaettuna jäljellä olevilla eläkevuosilla. Sääntö tasaa myyntejä
salkun toteutuneen kehityksen mukaan ja myy viimeisenä vuonna automaattisesti
koko jäljellä olevan salkun.

const euroMuotoilija = new Intl.NumberFormat("fi-FI", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
})

const tiivisEuroMuotoilija = new Intl.NumberFormat("fi-FI", {
  style: "currency",
  currency: "EUR",
  notation: "compact",
  maximumFractionDigits: 1,
})

const prosenttiMuotoilija = new Intl.NumberFormat("fi-FI", {
  style: "percent",
  maximumFractionDigits: 1,
})

export function muotoileEuro(arvo: number) {
  return euroMuotoilija.format(arvo)
}

export function muotoileTiivisEuro(arvo: number) {
  return tiivisEuroMuotoilija.format(arvo)
}

export function muotoileProsentti(arvo: number) {
  return prosenttiMuotoilija.format(arvo / 100)
}

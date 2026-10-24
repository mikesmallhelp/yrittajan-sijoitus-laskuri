import { expect, test } from "@playwright/test"

for (const leveys of [320, 390]) {
  test(`laskuri toimii ${leveys} pikselin levyisessä näkymässä`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: leveys, height: 844 })
    await page.goto("/")

    await expect(
      page.getByRole("heading", { name: "Yrittäjän sijoituslaskuri" })
    ).toBeVisible()

    const aktiivisetVuodet = page.getByLabel(
      "Aktiivisen yrittäjyyden kesto"
    )
    await aktiivisetVuodet.fill("10")
    await expect(aktiivisetVuodet).toHaveValue("10")
    const palkkavero = page.getByLabel("Yrittäjän palkkaveroprosentti")
    const elakelaisenVero = page.getByLabel("Eläkeläisen veroprosentti")
    await expect(palkkavero).toBeVisible()
    await expect(elakelaisenVero).toBeVisible()
    await palkkavero.fill("40")
    await expect(palkkavero).toHaveValue("40")
    await expect(
      page.getByRole("heading", { name: "Nettotulojen yhteenveto" })
    ).toBeVisible()
    await expect(
      page.getByRole("heading", { name: "Tuottokäyrä" })
    ).toBeVisible()
    const salkkuSelite = page.getByTestId("tuottokayra-selite-salkku")
    const nettotuloSelite = page.getByTestId("tuottokayra-selite-nettotulo")
    await expect(salkkuSelite.getByRole("listitem")).toHaveText([
      "Sijoittaminen yksityishenkilönä: salkku",
      "Sijoittaminen yrityksenä: salkku",
    ])
    await expect(nettotuloSelite.getByRole("listitem")).toHaveText([
      "Sijoittaminen yksityishenkilönä: kumulatiivinen nettotulo (eläke yksityishenkilösijoittajalle)",
      "Sijoittaminen yrityksenä: kumulatiivinen nettotulo (eläke yrittäjäsijoittajalle)",
    ])

    const sivuYlivuotaa = await page.locator("html").evaluate((elementti) => {
      return elementti.scrollWidth > elementti.clientWidth
    })
    expect(sivuYlivuotaa).toBe(false)

    const vieritysalue = page
      .getByTestId("tarkat-laskelmat-vieritys")
      .locator('[data-slot="table-container"]')
    await expect(vieritysalue).toBeVisible()
    const taulukkoOnLeveampi = await vieritysalue.evaluate((elementti) => {
      return elementti.scrollWidth > elementti.clientWidth
    })
    expect(taulukkoOnLeveampi).toBe(true)
  })
}

test("kaavioselite ryhmittelee akselisarjat työpöydällä", async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 844 })
  await page.goto("/")

  const salkkuSelite = page.getByTestId("tuottokayra-selite-salkku")
  const nettotuloSelite = page.getByTestId("tuottokayra-selite-nettotulo")

  await expect(salkkuSelite).toBeVisible()
  await expect(nettotuloSelite).toBeVisible()

  const salkkuLaatikko = await salkkuSelite.boundingBox()
  const nettotuloLaatikko = await nettotuloSelite.boundingBox()

  if (!salkkuLaatikko || !nettotuloLaatikko) {
    throw new Error("Kaavioselitteen sijaintia ei voitu mitata.")
  }

  expect(nettotuloLaatikko.x).toBeGreaterThan(salkkuLaatikko.x)
})

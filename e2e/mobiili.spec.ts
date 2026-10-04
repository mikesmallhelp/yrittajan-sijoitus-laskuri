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
    await expect(
      page.getByRole("heading", { name: "Nettotulojen yhteenveto" })
    ).toBeVisible()

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

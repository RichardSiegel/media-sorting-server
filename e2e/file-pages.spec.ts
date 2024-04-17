import { test, expect, Page } from "@playwright/test";

const FILE_PAGE = "http://localhost:3000/file";

const PAGE = [
  `${FILE_PAGE}/B%C3%A4ume_1.jpg`,
  `${FILE_PAGE}/b%C3%A4ume_2.jpg`,
  `${FILE_PAGE}/sub%20dir/Bäume_1.jpg`,
  `${FILE_PAGE}/sub%20dir/schöner%20see.jpg`,
  `${FILE_PAGE}/von%20oben.jpg`,
];

test.describe("the /file/ pages", () => {
  test("should allow navigating between files", async ({ page }) => {
    await page.goto(PAGE[1]);
    await page.getByText("<").click();
    await page.waitForURL(PAGE[0]); // with umlaut
    await expectNavigationButtons(page, "only-next");
    await page.getByText(">").click();
    await page.waitForURL(PAGE[1]); // with umlaut
    await expectNavigationButtons(page, "both");
    await page.press("body", "l");
    await page.waitForURL(PAGE[2]); // with umlaut and in sub directory with space in name
    await expectNavigationButtons(page, "both");
    await page.press("body", "ArrowRight");
    await page.waitForURL(PAGE[3]); // with umlaut and in sub directory with space in name
    await expectNavigationButtons(page, "both");
    await page.getByText(">").click();
    await page.waitForURL(PAGE[4]); // with space in name
    await expectNavigationButtons(page, "only-previous");
  });

  test("should only act on keyboard arrow buttons if option available", async ({
    page,
  }) => {
    await page.goto(PAGE[1]);
    await page.press("body", "ArrowLeft");
    await page.waitForURL(PAGE[0]);
    await expectNavigationButtons(page, "only-next");
    await page.press("body", "ArrowLeft");
    expect(page.url()).toEqual(PAGE[0]);
    await page.goto(PAGE[4]);
    await expectNavigationButtons(page, "only-previous");
    await page.press("body", "ArrowRight");
    expect(page.url()).toEqual(PAGE[4]);
  });

  const expectNavigationButtons = async (
    page: Page,
    buttons: "both" | "only-next" | "only-previous"
  ) => {
    const btnSymbols = await page.getByTestId("fullscreenImage").textContent();
    switch (buttons) {
      case "both": {
        expect(btnSymbols).toContain("<>");
        break;
      }
      case "only-next": {
        expect(btnSymbols).not.toContain("<>");
        expect(btnSymbols).toContain(">");
        break;
      }
      case "only-previous": {
        expect(btnSymbols).not.toContain("<>");
        expect(btnSymbols).toContain("<");
        break;
      }
    }
  };
});

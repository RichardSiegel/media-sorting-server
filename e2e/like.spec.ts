import { test, expect } from "@playwright/test";
import fs from "fs";

test("the page should save like states and allow changes", async ({ page }) => {
  // Reset Test Server State
  if (fs.existsSync("public/.media-sorting-server-state.json"))
    fs.unlinkSync("public/.media-sorting-server-state.json");
  if (fs.existsSync("public/sub dir/.media-sorting-server-state.json"))
    fs.unlinkSync("public/sub dir/.media-sorting-server-state.json");

  // Set all pages to like
  await page.goto("http://localhost:3000/");
  await page.getByRole("link").first().click();
  await page.getByText("Like").click();
  await page.getByRole("link", { name: "<" }).click();
  await page.getByText("Like").click();
  await page.getByRole("link", { name: "<" }).click();
  await page.getByText("Like").click();
  await page.getByRole("link", { name: "<" }).click();
  await page.getByText("Like").click();
  await page.getByRole("link", { name: "<" }).click();
  await page.waitForTimeout(500);
  expect(
    JSON.parse(
      fs.readFileSync("public/.media-sorting-server-state.json").toString()
    )["von%20oben.jpg"]["isFavorite"]
  ).toEqual(true);
  expect(
    JSON.parse(
      fs.readFileSync("public/.media-sorting-server-state.json").toString()
    )["b%C3%A4ume_2.jpg"]["isFavorite"]
  ).toEqual(true);

  // Set all pages to unlike
  await page.getByText("Like").click();
  await page.getByRole("link", { name: ">" }).click();
  await page.getByText("Liked <").click();
  await page.getByRole("link", { name: ">" }).click();
  await page.getByText("Liked <").click();
  await page.getByRole("link", { name: ">" }).click();
  await page.getByText("Liked <").click();
  await page.getByRole("link", { name: ">" }).click();
  await page.getByText("Liked <").click();
  expect(await page.getByText("Like")).not.toBeNull();
  await page.waitForTimeout(500);
  expect(
    JSON.parse(
      fs.readFileSync("public/.media-sorting-server-state.json").toString()
    )["von%20oben.jpg"]["isFavorite"]
  ).toEqual(false);
  expect(
    JSON.parse(
      fs.readFileSync("public/.media-sorting-server-state.json").toString()
    )["b%C3%A4ume_2.jpg"]["isFavorite"]
  ).toEqual(false);

  // Reset Test Server State
  fs.unlinkSync("public/.media-sorting-server-state.json");
  fs.unlinkSync("public/sub dir/.media-sorting-server-state.json");
});

import { test, expect } from "@playwright/test";

test("home page renders hero and navigation", async ({ page }) => {
  await page.goto("/");
  await page.waitForSelector("text=Loading bakery goodness...", { state: "detached" });
  await expect(page.getByRole("heading", { name: /sweet treats crafted/i })).toBeVisible();
  await expect(page.getByRole("link", { name: "Shop", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Support" })).toBeVisible();
});

import { test, expect } from "@playwright/test";

test("homepage renders hero copy", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Infrastructure and on-call specialists");
  await expect(page.getByRole("link", { name: "Book a discovery call" })).toBeVisible();
});

test("contact form validates required fields", async ({ page }) => {
  await page.goto("/contact");
  await page.getByRole("button", { name: "Send message" }).click();
  await expect(page.getByText("Tell us who we're speaking with.")).toBeVisible();
  await expect(page.getByText("Use a valid business email address.")).toBeVisible();
});

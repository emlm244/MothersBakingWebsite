import { buildSeedData, summarizeSeed } from "../packages/data";
import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";

async function main() {
  const data = buildSeedData();
  const summary = summarizeSeed(data);
  const output = resolve(process.cwd(), "public", "demo-seed.json");
  await writeFile(output, JSON.stringify(data, null, 2), "utf8");
  console.log("Seed data written to", output);
  console.table(summary);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

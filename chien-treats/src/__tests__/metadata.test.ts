import { createMetadata, socialImage } from "@/lib/metadata";

describe("metadata", () => {
  it("builds metadata with canonical url", () => {
    const metadata = createMetadata({
      title: "Test",
      description: "Testing",
      path: "/testing",
    });
    expect(metadata.alternates?.canonical).toContain("/testing");
  });

  it("falls back to logomark social image", () => {
    expect(socialImage(undefined)).toContain("coral-hosts-logomark.svg");
  });
});

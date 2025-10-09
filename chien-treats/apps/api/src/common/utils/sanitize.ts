import sanitizeHtml from "sanitize-html";

const DEFAULT_ALLOWED_TAGS = ["b", "i", "em", "strong", "a", "p", "ul", "ol", "li", "br", "span"];
const DEFAULT_ALLOWED_ATTR = {
  a: ["href", "title", "target", "rel"],
  span: ["style"],
};

export function sanitizeMarkdown(input: string) {
  return sanitizeHtml(input, {
    allowedTags: DEFAULT_ALLOWED_TAGS,
    allowedAttributes: DEFAULT_ALLOWED_ATTR,
    allowedSchemes: ["http", "https", "mailto"],
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer" }),
    },
  });
}

export function sanitizePlain(input: string) {
  return sanitizeHtml(input, { allowedTags: [], allowedAttributes: {} });
}

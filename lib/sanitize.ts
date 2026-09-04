const ALLOWED_TAGS = new Set(["a", "b", "br", "code", "em", "h1", "h2", "h3", "h4", "h5", "h6", "i", "li", "ol", "p", "pre", "span", "strong", "ul"])

const FORBIDDEN_TAG_RE = /<\s*\/?\s*(script|iframe|object|embed|style|link|meta|form|input|button)\b[^>]*>/gi
const EVENT_HANDLER_RE = /\s+on\w+\s*=\s*("(?:\\.|[^"])*"|'(?:\\.|[^'])*'|[^\s>]+)/gi
const JAVASCRIPT_URI_RE = /(?:href|src)\s*=\s*(?:"|')?\s*javascript:[^'"\s>]*/gi
const HREF_ATTR_RE = /\s+href\s*=\s*("(?:\\.|[^"])*"|'(?:\\.|[^'])*'|[^\s>]+)/i
const CLASS_ATTR_RE = /\s+class\s*=\s*("(?:\\.|[^"])*"|'(?:\\.|[^'])*'|[^\s>]+)/i

function stripQuotes(value: string): string {
  const first = value[0]
  const last = value[value.length - 1]
  if ((first === '"' && last === '"') || (first === "'" && last === "'")) {
    return value.slice(1, -1)
  }
  return value
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

export function sanitizeHtml(input: string | undefined | null): string {
  if (!input) return ""
  if (input.length > 200_000) return ""

  let output = input
  output = output.replace(FORBIDDEN_TAG_RE, " ")
  output = output.replace(EVENT_HANDLER_RE, " ")
  output = output.replace(JAVASCRIPT_URI_RE, " ")

  output = output.replace(/<\s*(\/?)\s*([a-zA-Z][a-zA-Z0-9]*)\b([^>]*)>/g, (full, closeRaw, tagName, attrs) => {
    const tag = tagName.toLowerCase()

    if (closeRaw) {
      return ALLOWED_TAGS.has(tag) ? `</${tag}>` : ""
    }

    if (!ALLOWED_TAGS.has(tag)) return ""

    if (tag === "a") {
      const hrefMatch = attrs.match(HREF_ATTR_RE)
      if (!hrefMatch) return ""
      const href = stripQuotes(hrefMatch[1])
      if (!/^(https?:|mailto:|magnet:)/i.test(href)) return ""
      return `<a href="${escapeHtml(href)}">`
    }

    const classMatch = attrs.match(CLASS_ATTR_RE)
    if (classMatch) {
      const className = stripQuotes(classMatch[1])
      return `<${tag} class="${escapeHtml(className)}">`
    }
    return `<${tag}>`
  })

  return output
}
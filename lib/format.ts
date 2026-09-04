export function parseSizeToGB(sizeStr: string | null | undefined): number | null {
  if (!sizeStr) return null
  const match = sizeStr.match(/([\d.]+)\s*(GB|MB|TB)/i)
  if (!match) return null
  const value = Number.parseFloat(match[1])
  if (Number.isNaN(value)) return null
  const unit = match[2].toUpperCase()
  if (unit === "GB") return value
  if (unit === "MB") return value / 1024
  if (unit === "TB") return value * 1024
  return null
}
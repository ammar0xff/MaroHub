import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Download, FileArchive, Package, Binary } from "lucide-react"
import Link from "next/link"

export default function DownloadPage() {
  const downloads = [
    {
      title: "Debian/Ubuntu Package",
      description: "For Debian, Ubuntu, and derivatives",
      icon: Package,
      file: "/releases/maro_1.0.0.deb",
      extension: ".deb",
    },
    {
      title: "Fedora/RHEL Package",
      description: "For Fedora, RHEL, and derivatives",
      icon: Package,
      file: "/releases/maro-1.0.0.rpm",
      extension: ".rpm",
    },
    {
      title: "Universal AppImage",
      description: "Works on any Linux distribution",
      icon: FileArchive,
      file: "/releases/maro.AppImage",
      extension: ".AppImage",
    },
    {
      title: "Native Executable",
      description: "Portable binary executable",
      icon: Binary,
      file: "/releases/maro.bin",
      extension: ".bin",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="mx-auto max-w-6xl px-6 py-20 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 mb-6">
            <Download className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
            Download Maro CLI
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Get the latest version of the Maro CLI tool for your Linux distribution
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 mb-12">
          {downloads.map((download, index) => (
            <a
              key={index}
              href={download.file}
              download
              className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-8 transition-all hover:border-primary/50 hover:bg-card/80 hover:shadow-lg hover:shadow-primary/10"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <download.icon className="w-7 h-7 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
                    {download.title}
                    <span className="text-xs text-muted-foreground font-mono">{download.extension}</span>
                  </h3>
                  <p className="text-muted-foreground mb-4">{download.description}</p>
                  <div className="flex items-center gap-2 text-sm text-primary font-medium">
                    <Download className="w-4 h-4" />
                    Download
                  </div>
                </div>
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -z-10 group-hover:bg-primary/10 transition-colors" />
            </a>
          ))}
        </div>

        <div className="rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm p-8">
          <h2 className="text-2xl font-bold mb-4">Installation Instructions</h2>
          <div className="prose prose-invert max-w-none">
            <p className="text-muted-foreground mb-4">After downloading, follow these steps to install:</p>
            <ul className="space-y-3 text-muted-foreground">
              <li>
                <strong className="text-foreground">.deb package:</strong>{" "}
                <code className="text-primary">sudo dpkg -i maro_1.0.0.deb</code>
              </li>
              <li>
                <strong className="text-foreground">.rpm package:</strong>{" "}
                <code className="text-primary">sudo rpm -i maro-1.0.0.rpm</code>
              </li>
              <li>
                <strong className="text-foreground">AppImage:</strong>{" "}
                <code className="text-primary">chmod +x maro.AppImage && ./maro.AppImage</code>
              </li>
              <li>
                <strong className="text-foreground">Binary:</strong>{" "}
                <code className="text-primary">chmod +x maro.bin && ./maro.bin</code>
              </li>
            </ul>
            <p className="mt-6 text-muted-foreground">
              See the{" "}
              <Link href="/docs" className="text-primary hover:underline">
                Getting Started guide
              </Link>{" "}
              for detailed installation and usage instructions.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

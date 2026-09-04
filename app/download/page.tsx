import { Download, FileArchive, Package, Binary, SquareTerminal, ExternalLink } from "lucide-react"

const RAW_CLI_URL = "https://raw.githubusercontent.com/ammar0xff/MaroHub/refs/heads/main/CLI/maro"
const REPO_URL = "https://github.com/ammar0xff/MaroHub"

export default function DownloadPage() {
  const steps = [
    {
      title: "1. Grab the script",
      code: "curl -L -o maro -J https://raw.githubusercontent.com/ammar0xff/MaroHub/refs/heads/main/CLI/maro",
      note: "Downloads the single-file Python CLI.",
    },
    {
      title: "2. Make it executable",
      code: "chmod +x maro",
      note: "",
    },
    {
      title: "3. Install dependencies",
      code: "pip install rich prompt_toolkit click libtorrent",
      note: "libtorrent is optional and enables in-terminal torrent previews.",
    },
    {
      title: "4. Run it",
      code: "./maro help",
      note: "",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-5 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 mb-6">
            <Download className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-5xl font-bold mb-4 text-foreground">Download Maro CLI</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            The Maro CLI searches the catalog and hands you ready-to-run magnet links, straight from your terminal.
          </p>
        </div>

        <div className="rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm p-5 sm:p-8 mb-8 sm:mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <SquareTerminal className="h-6 w-6 text-primary" />
            Install from source
          </h2>
          <div className="space-y-8">
            {steps.map((step, index) => (
              <div key={index} className="space-y-2">
                <h3 className="text-lg font-semibold text-foreground">{step.title}</h3>
                <pre className="p-4 rounded-lg bg-background/50 font-mono text-xs sm:text-sm text-primary overflow-x-auto">
                  {step.code}
                </pre>
                {step.note && <p className="text-sm text-muted-foreground">{step.note}</p>}
              </div>
            ))}
          </div>
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <a
              href={RAW_CLI_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground hover:shadow-lg hover:shadow-primary/30 transition-all min-h-11"
            >
              <Binary className="h-5 w-5" />
              Download CLI source
            </a>
            <a
              href={REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-border/50 bg-card/50 px-6 py-3 font-semibold text-foreground hover:border-primary/50 hover:text-primary transition-all min-h-11"
            >
              <ExternalLink className="h-5 w-5" />
              Browse the repository
            </a>
          </div>
        </div>

        <div className="rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm p-5 sm:p-8">
          <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
            <Package className="h-6 w-6 text-primary" />
            Build system packages
          </h2>
          <p className="text-muted-foreground mb-6">
            The bundled build script produces native packages for Debian (deb), Fedora/RHEL (rpm), Arch (zst),
            AppImage, and a standalone executable. Run it from a clone of the repository.
          </p>
          <div className="space-y-2">
            <pre className="p-4 rounded-lg bg-background/50 font-mono text-xs sm:text-sm text-primary overflow-x-auto">
              git clone https://github.com/ammar0xff/MaroHub.git && cd MaroHub/CLI && ./build.sh
            </pre>
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <FileArchive className="h-4 w-4" />
              Requires python3, pip, and makepkg. Output lands in CLI/releases/.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
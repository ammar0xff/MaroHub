import { BookOpen, Terminal, HelpCircle, Users, Mail, FileText, Github } from "lucide-react"

const REPO_URL = "https://github.com/ammar0xff/MaroHub"

export default function DocsPage() {
  const sections = [
    { icon: BookOpen, title: "Introduction", description: "What MaroHub is and how it works", href: "#introduction" },
    { icon: Terminal, title: "CLI Reference", description: "Complete command line reference", href: "#cli" },
    { icon: HelpCircle, title: "FAQ", description: "Common questions about the catalog", href: "#faq" },
    { icon: Users, title: "Contributing", description: "Help grow the game database", href: "#contributing" },
    { icon: Mail, title: "Contact", description: "Get in touch with the maintainers", href: "#contact" },
  ]

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 mb-6">
            <FileText className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-5xl font-bold mb-4 text-foreground">MaroHub Documentation</h1>
          <p className="text-xl text-muted-foreground max-w-3xl">
            Everything you need to use the catalog and the Maro CLI.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-20">
          {sections.map((section) => (
            <a
              key={section.href}
              href={section.href}
              className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6 transition-all hover:border-primary/50 hover:bg-card/80 hover:shadow-lg hover:shadow-primary/10"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <section.icon className="w-6 h-6 text-primary" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2">{section.title}</h3>
              <p className="text-muted-foreground">{section.description}</p>
            </a>
          ))}
        </div>

        <div className="space-y-16">
          <section id="introduction" className="scroll-mt-20">
            <div className="rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm p-5 sm:p-8">
              <h2 className="text-3xl font-bold mb-6 text-foreground">Introduction</h2>
              <div className="space-y-4">
                <p className="text-muted-foreground text-lg">
                  <strong className="text-foreground">MaroHub</strong> indexes ready-to-run Linux games and serves them
                  through magnet links. The web app handles discovery: search, filter by genre or rating, and open a
                  game page. The Maro CLI does the same work from a terminal.
                </p>
                <ul className="space-y-2 text-muted-foreground list-disc pl-5">
                  <li>Search and filter the catalog by genre, year, rating, or download size</li>
                  <li>Every game links to a magnet torrent, no ads and no accounts</li>
                  <li>Native Linux installs and Wine/Proton builds are tagged separately</li>
                  <li>Built for Linux gamers, by Linux gamers</li>
                </ul>
              </div>
            </div>
          </section>

          <section id="cli" className="scroll-mt-20">
            <div className="rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm p-5 sm:p-8">
              <h2 className="text-3xl font-bold mb-6 text-foreground">CLI Reference</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-4">Commands</h3>
                  <div className="space-y-3">
                    {([
                      { cmd: "maro search <query>", desc: "Search for games by name or keyword" },
                      { cmd: "maro list", desc: "List all available games" },
                      { cmd: "maro info <game-id>", desc: "Show detailed info for a game" },
                      { cmd: "maro install <game-id>", desc: "Prepare a game for download" },
                      { cmd: "maro remove <game-id>", desc: "Remove an installed game" },
                      { cmd: "maro update", desc: "Refresh the local game database" },
                      { cmd: "maro help", desc: "Show help and usage info" },
                    ] as const).map((item, i) => (
                      <div key={i} className="flex gap-4 p-4 rounded-lg bg-background/50">
                        <code className="text-primary font-mono text-sm flex-shrink-0">{item.cmd}</code>
                        <span className="text-muted-foreground">{item.desc}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-4">Examples</h3>
                  <div className="space-y-2">
                    <div className="p-4 rounded-lg bg-background/50 font-mono text-xs sm:text-sm text-primary overflow-x-auto">
                      <span className="text-muted-foreground">$</span> maro search doom
                    </div>
                    <div className="p-4 rounded-lg bg-background/50 font-mono text-xs sm:text-sm text-primary overflow-x-auto">
                      <span className="text-muted-foreground">$</span> maro info 42
                    </div>
                    <div className="p-4 rounded-lg bg-background/50 font-mono text-xs sm:text-sm text-primary overflow-x-auto">
                      <span className="text-muted-foreground">$</span> maro install 42
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section id="faq" className="scroll-mt-20">
            <div className="rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm p-5 sm:p-8">
              <h2 className="text-3xl font-bold mb-6 text-foreground">FAQ</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2 text-foreground">What do I need to download a game?</h3>
                  <p className="text-muted-foreground">
                    A torrent client that supports magnet links, such as qBittorrent or Transmission. Open the magnet
                    link on a game page and your client takes it from there.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2 text-foreground">Native Linux or Wine/Proton?</h3>
                  <p className="text-muted-foreground">
                    Games tagged Native Linux run without a compatibility layer. Wine/Proton builds need Wine or Proton
                    installed. The tag is shown as a badge on each game page.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2 text-foreground">Is the site ad-free and private?</h3>
                  <p className="text-muted-foreground">
                    Yes. No ads, no accounts, no tracking. Your wishlist lives in your browser and never leaves it.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2 text-foreground">Why is a game missing?</h3>
                  <p className="text-muted-foreground">
                    The catalog is community-maintained. Every addition goes through the repository, so it updates when
                    someone contributes.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section id="contributing" className="scroll-mt-20">
            <div className="rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm p-5 sm:p-8">
              <h2 className="text-3xl font-bold mb-6 text-foreground">Contributing</h2>
              <p className="text-muted-foreground mb-6">
                The game database lives in <code className="text-primary">data/games.json</code> in the repository.
                Add entries, fix game metadata, or improve the web app and CLI.
              </p>
              <div className="space-y-3">
                <div className="p-4 rounded-lg bg-background/50">
                  <h3 className="text-sm font-semibold text-foreground mb-2">Report a broken game</h3>
                  <p className="text-muted-foreground text-sm">
                    Open an issue with the game name and what fails, such as a dead magnet link or missing metadata.
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-background/50">
                  <h3 className="text-sm font-semibold text-foreground mb-2">Add a new game</h3>
                  <p className="text-muted-foreground text-sm">
                    Insert an entry in <code className="text-primary">data/games.json</code> matching the current schema
                    and open a pull request.
                  </p>
                </div>
                <a
                  href={`${REPO_URL}/issues`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-border/50 bg-card/50 px-5 py-3 font-semibold text-foreground hover:border-primary/50 hover:text-primary transition-all"
                >
                  <Github className="h-5 w-5" />
                  Open the repository
                </a>
              </div>
            </div>
          </section>

          <section id="contact" className="scroll-mt-20">
            <div className="rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm p-5 sm:p-8">
              <h2 className="text-3xl font-bold mb-6 text-foreground">Contact</h2>
              <div className="space-y-4">
                <p className="text-muted-foreground">Get in touch with the maintainers:</p>
                <ul className="space-y-3">
                  {([
                    { label: "WhatsApp", value: "+20 155 869 5202", href: "https://wa.me/201558695202" },
                    { label: "Email", value: "ammar0xf@gmail.com", href: "mailto:ammar0xf@gmail.com" },
                    { label: "GitHub", value: "ammar0xff", href: "https://github.com/ammar0xff" },
                    { label: "LinkedIn", value: "ammar0xf", href: "https://www.linkedin.com/in/ammar0xf" },
                  ] as const).map((contact, i) => (
                    <li
                      key={i}
                      className="flex items-center gap-3 p-4 rounded-lg bg-background/50 hover:bg-background/70 transition-colors"
                    >
                      <span className="font-semibold text-foreground min-w-[100px]">{contact.label}:</span>
                      <a
                        href={contact.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {contact.value}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm p-5 sm:p-8">
            <h2 className="text-2xl font-bold mb-4 text-foreground">MIT License</h2>
            <pre className="text-xs text-muted-foreground overflow-x-auto p-4 rounded-lg bg-background/50">
              {`Copyright (c) 2025 ammar mohamed (ammar0xf)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND...`}
            </pre>
          </section>
        </div>
      </div>
    </div>
  )
}
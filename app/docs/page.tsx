import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { BookOpen, Terminal, HelpCircle, Users, Mail, FileText } from "lucide-react"

export default function DocsPage() {
  const sections = [
    {
      icon: BookOpen,
      title: "Introduction",
      description: "Learn about MaroHub and its features",
      href: "#introduction",
    },
    {
      icon: Terminal,
      title: "CLI Reference",
      description: "Complete command-line interface documentation",
      href: "#cli",
    },
    {
      icon: HelpCircle,
      title: "FAQ",
      description: "Frequently asked questions",
      href: "#faq",
    },
    {
      icon: Users,
      title: "Contributing",
      description: "Help improve MaroHub",
      href: "#contributing",
    },
    {
      icon: Mail,
      title: "Contact",
      description: "Get in touch with the team",
      href: "#contact",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <div className="mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 mb-6">
            <FileText className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
            MaroHub Documentation
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl">
            Everything you need to know about the ultimate Linux gaming platform
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-20">
          {sections.map((section, index) => (
            <a
              key={index}
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
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -z-10 group-hover:bg-primary/10 transition-colors" />
            </a>
          ))}
        </div>

        <div className="space-y-16">
          <section id="introduction" className="scroll-mt-20">
            <div className="rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm p-8">
              <h2 className="text-3xl font-bold mb-6 text-primary">Introduction</h2>
              <div className="prose prose-invert max-w-none space-y-4">
                <p className="text-muted-foreground text-lg">
                  <strong className="text-foreground">MaroHub</strong> is a next-generation, open-source platform
                  designed for Linux gamers and open-source enthusiasts. It provides a beautiful, ad-free,
                  privacy-friendly experience for discovering, filtering, and downloading ready-to-run Linux games via
                  magnet links.
                </p>
                <ul className="space-y-2 text-muted-foreground">
                  <li>Modern web app and powerful CLI tool</li>
                  <li>Instant search, advanced filters, and detailed game info</li>
                  <li>One-click magnet downloads, no ads, no tracking</li>
                  <li>Built for the Linux community, by the Linux community</li>
                </ul>
                <h3 className="text-2xl font-bold mt-8 mb-4 text-foreground">Main Idea</h3>
                <p className="text-muted-foreground">
                  MaroHub was created to solve the pain of finding and downloading Linux games without ads, trackers, or
                  hassle. It's a one-stop shop for Linux gaming, combining a beautiful UI, a fast CLI, and a huge,
                  community-driven game database. <strong className="text-primary">Happy gaming!</strong>
                </p>
              </div>
            </div>
          </section>

          <section id="cli" className="scroll-mt-20">
            <div className="rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm p-8">
              <h2 className="text-3xl font-bold mb-6 text-primary">CLI Reference</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-4">Commands</h3>
                  <div className="space-y-3">
                    {[
                      { cmd: "maro search <query>", desc: "Search for games by name or keyword" },
                      { cmd: "maro list", desc: "List all available games" },
                      { cmd: "maro download <game-id>", desc: "Download a game by its ID (magnet link)" },
                      { cmd: "maro info <game-id>", desc: "Show detailed info for a game" },
                      { cmd: "maro update", desc: "Update the local games database" },
                      { cmd: "maro help", desc: "Show help and usage info" },
                    ].map((item, i) => (
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
                    <div className="p-4 rounded-lg bg-background/50 font-mono text-sm text-primary">
                      <span className="text-muted-foreground">$</span> maro search doom
                    </div>
                    <div className="p-4 rounded-lg bg-background/50 font-mono text-sm text-primary">
                      <span className="text-muted-foreground">$</span> maro download 42
                    </div>
                    <div className="p-4 rounded-lg bg-background/50 font-mono text-sm text-primary">
                      <span className="text-muted-foreground">$</span> maro info 42
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section id="contact" className="scroll-mt-20">
            <div className="rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm p-8">
              <h2 className="text-3xl font-bold mb-6 text-primary">Contact</h2>
              <div className="space-y-4">
                <p className="text-muted-foreground">Get in touch with the MaroHub team:</p>
                <ul className="space-y-3">
                  {[
                    { label: "WhatsApp", value: "+20 155 869 5202", href: "https://wa.me/201558695202" },
                    { label: "Email", value: "ammar0xf@gmail.com", href: "mailto:ammar0xf@gmail.com" },
                    { label: "GitHub", value: "ammar0xff", href: "https://github.com/ammar0xff" },
                    { label: "LinkedIn", value: "ammar0xf", href: "https://www.linkedin.com/in/ammar0xf" },
                  ].map((contact, i) => (
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

          <section className="rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm p-8">
            <h2 className="text-2xl font-bold mb-4">MIT License</h2>
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

      <Footer />
    </div>
  )
}

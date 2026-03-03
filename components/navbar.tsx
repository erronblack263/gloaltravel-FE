"use client"

import { Heart, PenLine } from "lucide-react"
import Image from "next/image"
import { ThemeSwitcher } from "@/components/theme-switcher"

export function Navbar() {
  return (
    <nav className="flex items-center justify-between px-8 py-5">
      <div className="flex items-center gap-10">
        <span className="font-serif text-xl font-bold tracking-tight text-foreground">
          globaltravel.
        </span>
        <div className="hidden items-center gap-8 md:flex">
          <a
            href="#"
            className="text-sm font-medium tracking-wide text-muted-foreground uppercase transition-colors hover:text-foreground"
          >
            Explore
          </a>
          <a
            href="#"
            className="text-sm font-medium tracking-wide text-muted-foreground uppercase transition-colors hover:text-foreground"
          >
            Forums
          </a>
          <a
            href="#"
            className="text-sm font-medium tracking-wide text-muted-foreground uppercase transition-colors hover:text-foreground"
          >
            Guides
          </a>
          <a
            href="#"
            className="text-sm font-medium tracking-wide text-muted-foreground uppercase transition-colors hover:text-foreground"
          >
            Blogs
          </a>
        </div>
      </div>
      <div className="flex items-center gap-5">
        <button className="hidden items-center gap-1.5 text-sm font-medium text-foreground md:flex">
          <Heart className="h-4 w-4" />
          Trips
        </button>
        <button className="hidden items-center gap-1.5 text-sm font-medium text-foreground md:flex">
          <PenLine className="h-4 w-4" />
          Post
        </button>
        <ThemeSwitcher />
        <div className="relative h-9 w-9 overflow-hidden rounded-full bg-muted">
          <Image
            src="/images/amsterdam.jpg"
            alt="User avatar"
            fill
            className="object-cover"
          />
        </div>
      </div>
    </nav>
  )
}

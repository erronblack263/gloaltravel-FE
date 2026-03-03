"use client"

import { Navbar } from "@/components/navbar"
import { SearchBar } from "@/components/search-bar"
import { HeroSidebar } from "@/components/hero-sidebar"
import { BlogCards } from "@/components/blog-cards"
import { ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"

export default function Home() {
  const router = useRouter()

  return (
    <main className="flex h-screen overflow-hidden bg-background">
      {/* Left sidebar - Hero image */}
      <aside className="hidden w-[30%] min-w-[280px] lg:block">
        <HeroSidebar />
      </aside>

      {/* Right content area */}
      <div className="flex flex-1 flex-col overflow-y-auto w-[70%]">
        <Navbar />

        <div className="flex flex-1 flex-col px-8 pb-10 lg:px-12">
          {/* Hero heading */}
          <div className="mb-8 mt-4">
            <h1 className="text-balance font-serif text-4xl font-bold leading-tight text-foreground md:text-5xl lg:text-[3.25rem]">
              {"Travel with us,"}
              <br />
              <em className="font-serif not-italic" style={{ fontStyle: "italic" }}>
                {"we'll open doors for you."}
              </em>
            </h1>
          </div>

          {/* Search bar */}
          <div className="mb-8 max-w-2xl">
            <SearchBar />
          </div>

          {/* Prominent Explore Now Button - Content Area */}
          <div className="mb-10">
            <button
              onClick={() => router.push("/auth")}
              className="flex items-center gap-3 rounded-full bg-primary px-8 py-4 text-lg font-semibold text-primary-foreground shadow-2xl transition-all duration-300 hover:scale-105 hover:bg-primary/90 hover:shadow-3xl"
            >
              <span>Explore Now</span>
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>

          {/* Explore section */}
          <section>
            <h2 className="mb-6 font-serif text-2xl font-bold text-foreground">
              Explore the good out there.
            </h2>
            <BlogCards />
          </section>
        </div>
      </div>
    </main>
  )
}

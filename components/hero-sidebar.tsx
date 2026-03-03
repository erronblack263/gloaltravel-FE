"use client"

import { Play, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react"
import Image from "next/image"
import { useState } from "react"
import { useRouter } from "next/navigation"

const destinations = [
  {
    name: "Phuket",
    image: "/images/phuket-hero.jpg",
    description:
      "Enjoy Phuket's natural beauty from recognizable landmarks like the Portsey Harbour to prime square beaches and world class restaurants.",
  },
  {
    name: "Santorini",
    image: "/images/greece.jpg",
    description:
      "Discover the stunning white-washed buildings and blue domes of Santorini, perched on dramatic cliffs overlooking the Aegean Sea.",
  },
  {
    name: "Singapore",
    image: "/images/singapore.jpg",
    description:
      "Explore the vibrant city-state of Singapore, where futuristic architecture meets lush tropical gardens and world-class cuisine.",
  },
]

export function HeroSidebar() {
  const [current, setCurrent] = useState(0)
  const destination = destinations[current]
  const router = useRouter()

  return (
    <div className="relative hidden h-full w-full overflow-hidden lg:block">
      <Image
        src={destination.image}
        alt={destination.name}
        fill
        className="object-cover transition-all duration-700"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

      {/* Play button */}
      <button
        className="absolute left-6 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-lg transition-transform hover:scale-110"
        aria-label="Play video"
      >
        <Play className="h-5 w-5 fill-current" />
      </button>

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-8">
        <h2 className="mb-3 font-serif text-4xl font-bold text-white">
          {destination.name}
        </h2>
        <p className="mb-6 max-w-xs text-sm leading-relaxed text-white/80">
          {destination.description}
        </p>

        {/* Dots & arrows */}
        <div className="flex items-center gap-2">
          {destinations.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-2.5 w-2.5 rounded-full transition-colors ${
                i === current ? "bg-white" : "bg-white/40"
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
          <div className="ml-auto flex items-center gap-1">
            <button
              onClick={() =>
                setCurrent((p) => (p - 1 + destinations.length) % destinations.length)
              }
              className="flex h-7 w-7 items-center justify-center rounded-full text-white/60 transition-colors hover:text-white"
              aria-label="Previous destination"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() =>
                setCurrent((p) => (p + 1) % destinations.length)
              }
              className="flex h-7 w-7 items-center justify-center rounded-full text-white/60 transition-colors hover:text-white"
              aria-label="Next destination"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

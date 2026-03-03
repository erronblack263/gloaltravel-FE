"use client"

import { Eye, ChevronRight } from "lucide-react"
import Image from "next/image"
import { useRef } from "react"

const blogPosts = [
  {
    title: "Amsterdam, I'm gonna miss you - My favorite hidden gems in Europe",
    image: "/images/amsterdam.jpg",
    views: "199",
    avatar: "/images/greece.jpg",
  },
  {
    title: "The coolest ever things to do in Singapore for a five day trip",
    image: "/images/singapore.jpg",
    views: "2.6K",
    avatar: "/images/japan.jpg",
  },
  {
    title: "A journey inside Japan's most vibrant places and attractions",
    image: "/images/japan.jpg",
    views: "1.3K",
    avatar: "/images/amsterdam.jpg",
  },
  {
    title: "Highlights of my home country, Greece and an amazing weekend trip",
    image: "/images/greece.jpg",
    views: "456",
    avatar: "/images/phuket-hero.jpg",
  },
]

export function BlogCards() {
  const scrollRef = useRef<HTMLDivElement>(null)

  const scrollRight = () => {
    scrollRef.current?.scrollBy({ left: 300, behavior: "smooth" })
  }

  return (
    <div className="relative">
      <div
        ref={scrollRef}
        className="flex gap-5 overflow-x-auto pb-4 scrollbar-hide"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {blogPosts.map((post, i) => (
          <article
            key={i}
            className="group relative min-w-[240px] max-w-[260px] shrink-0 cursor-pointer overflow-hidden rounded-2xl"
          >
            <div className="relative aspect-[3/4] w-full overflow-hidden">
              <Image
                src={post.image}
                alt={post.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

              {/* Blog badge */}
              <span className="absolute left-3 top-3 rounded-full bg-accent px-3 py-1 text-[10px] font-bold text-accent-foreground uppercase">
                Blog
              </span>

              {/* Avatar */}
              <div className="absolute right-3 top-3 h-8 w-8 overflow-hidden rounded-full border-2 border-white/50">
                <Image
                  src={post.avatar}
                  alt="Author"
                  fill
                  className="object-cover"
                />
              </div>

              {/* Content overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="mb-3 text-sm font-semibold leading-snug text-white">
                  {post.title}
                </h3>
                <div className="flex items-center gap-1.5 text-white/70">
                  <Eye className="h-3.5 w-3.5" />
                  <span className="text-xs">{post.views} Views</span>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Scroll button */}
      <button
        onClick={scrollRight}
        className="absolute -right-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-md transition-all hover:bg-secondary"
        aria-label="Scroll right"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  )
}

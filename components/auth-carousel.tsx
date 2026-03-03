"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, MapPin, Star } from "lucide-react"
import Image from "next/image"

const destinations = [
  {
    id: 1,
    name: "Maldives Paradise Resort",
    location: "Indian Ocean",
    image: "/images/greece.jpg",
    rating: 4.9,
    description: "Luxury overwater villas with pristine beaches",
    features: ["Overwater Villas", "Private Beach", "Spa & Wellness"]
  },
  {
    id: 2,
    name: "Santorini Sunset Suites",
    location: "Greece",
    image: "/images/greece.jpg", 
    rating: 4.8,
    description: "Cliffside suites with breathtaking Aegean views",
    features: ["Infinity Pools", "Sunset Views", "Fine Dining"]
  },
  {
    id: 3,
    name: "Bali Jungle Retreat",
    location: "Indonesia",
    image: "/images/phuket-hero.jpg",
    rating: 4.7,
    description: "Tropical paradise surrounded by lush rainforest",
    features: ["Jungle Views", "Yoga Pavilion", "Organic Spa"]
  },
  {
    id: 4,
    name: "Dubai Luxury Hotel",
    location: "United Arab Emirates",
    image: "/images/singapore.jpg",
    rating: 5.0,
    description: "Ultra-luxury in the heart of the desert oasis",
    features: ["Sky Bar", "Desert Safari", "Gold Spa"]
  }
]

export function AuthCarousel() {
  const [current, setCurrent] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  useEffect(() => {
    if (!isAutoPlaying) return

    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % destinations.length)
    }, 4000)

    return () => clearInterval(interval)
  }, [isAutoPlaying])

  const destination = destinations[current]

  const goToPrevious = () => {
    setCurrent((prev) => (prev - 1 + destinations.length) % destinations.length)
    setIsAutoPlaying(false)
  }

  const goToNext = () => {
    setCurrent((prev) => (prev + 1) % destinations.length)
    setIsAutoPlaying(false)
  }

  const goToSlide = (index: number) => {
    setCurrent(index)
    setIsAutoPlaying(false)
  }

  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src={destination.image}
          alt={destination.name}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60" />
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 flex h-full flex-col justify-between p-8">
        {/* Top Content */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-white/90">
            <MapPin className="h-4 w-4" />
            <span className="text-sm font-medium">{destination.location}</span>
          </div>
          
          <h1 className="text-3xl font-bold text-white md:text-4xl lg:text-5xl">
            {destination.name}
          </h1>
          
          <p className="max-w-sm text-sm leading-relaxed text-white/80 md:text-base">
            {destination.description}
          </p>

          {/* Rating */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < Math.floor(destination.rating)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-white/40"
                  }`}
                />
              ))}
            </div>
            <span className="text-sm font-medium text-white">
              {destination.rating}
            </span>
          </div>

          {/* Features */}
          <div className="flex flex-wrap gap-2">
            {destination.features.map((feature, index) => (
              <span
                key={index}
                className="rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm"
              >
                {feature}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom Controls */}
        <div className="space-y-4">
          {/* Navigation Dots */}
          <div className="flex items-center gap-2">
            {destinations.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-2.5 w-2.5 rounded-full transition-all duration-300 ${
                  index === current
                    ? "bg-white w-8"
                    : "bg-white/40 hover:bg-white/60"
                }`}
                aria-label={`Go to destination ${index + 1}`}
              />
            ))}
          </div>

          {/* Arrow Navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={goToPrevious}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm transition-all hover:bg-white/30 hover:scale-110"
              aria-label="Previous destination"
            >
              <ChevronLeft className="h-5 w-5 text-white" />
            </button>
            
            <div className="text-center">
              <p className="text-xs font-medium text-white/60">
                Discover Amazing Places
              </p>
              <p className="text-sm font-semibold text-white">
                {current + 1} / {destinations.length}
              </p>
            </div>

            <button
              onClick={goToNext}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm transition-all hover:bg-white/30 hover:scale-110"
              aria-label="Next destination"
            >
              <ChevronRight className="h-5 w-5 text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

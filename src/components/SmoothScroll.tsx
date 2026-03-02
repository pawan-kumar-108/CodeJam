'use client'
import { useEffect, useState } from 'react'
import Lenis from 'lenis'
import { AnimatePresence } from 'framer-motion'
import Preloader from './Preloader'
import { usePathname } from 'next/navigation'

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true)
  const pathname = usePathname()

  // Only run preloader on home page initially? 
  // Or globally? A global refresh preloader is cool for a "Hackathon" demo.
  // But maybe annoying if navigating around.
  // Let's keep it simple: Reset on mount (refresh). 
  // Since this component stays mounted on navigation in Next.js App Router (if layout persists), 
  // it might only run once. Which is perfect.

  useEffect(() => {
    const lenis = new Lenis()

    // Stop scrolling while loading
    if (isLoading) {
      lenis.stop()
    } else {
      lenis.start()
    }

    function raf(time: number) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }

    requestAnimationFrame(raf)

    return () => {
      lenis.destroy()
    }
  }, [isLoading])

  return (
    <>
      <AnimatePresence mode="wait">
        {isLoading && <Preloader onComplete={() => setIsLoading(false)} />}
      </AnimatePresence>
      {children}
    </>
  )
}

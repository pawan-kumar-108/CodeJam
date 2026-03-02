'use client';
import { LayoutGroup } from 'framer-motion';
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import TextRevealSection from "@/components/TextRevealSection";
import DataSources from "@/components/DataSources";
import FeatureArrows from "@/components/FeatureArrows";
import HowItWorks from "@/components/HowItWorks";
import InfoSection from "@/components/InfoSection";
import StatsTicker from "@/components/StatsTicker";
import FloatingIcons from "@/components/FloatingIcons";
import Footer from "@/components/Footer";
import { useEffect, useState } from 'react';
import DemoVideo from '@/components/DemoVideo';

export default function Home() {
  const [viewState, setViewState] = useState<'hero' | 'showcase' | 'hidden'>('hero');

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const vh = window.innerHeight;

      // 0 - 0.3vh: Hero Mode (Docked Icons)
      // 0.3vh - 0.9vh: Showcase Mode (Centered Icons)
      // > 0.9vh: Hidden Mode (Icons moved to text)

      if (scrollY < vh * 0.3) {
        setViewState('hero');
      } else if (scrollY < vh * 0.9) {
        setViewState('showcase');
      } else {
        setViewState('hidden');
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <main className="min-h-screen bg-nav-black text-white selection:bg-nav-lime selection:text-black">
      <LayoutGroup>
        <Navbar />
        <Hero viewState={viewState} />
        <TextRevealSection showIcons={viewState === 'hidden'} />
        <DataSources />
        <FeatureArrows />
        <DemoVideo />
        <HowItWorks />
        <InfoSection />
        <StatsTicker />
        <FloatingIcons viewState={viewState} />
        <Footer />
      </LayoutGroup>
    </main>
  );
}

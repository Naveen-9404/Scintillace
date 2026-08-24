import Hero from "../../components/sections/Hero";
import PromoVideo from "../../components/sections/PromoVideo";
import Countdown from "../../components/sections/Countdown";
import About from "../../components/sections/About";
import { FeaturedEvents } from "../../components/sections/Events";
import Timeline from "../../components/sections/Timeline";
import Gallery from "../../components/sections/Gallery";
import FAQ from "../../components/sections/FAQ";
import CTA from "../../components/sections/CTA";

import LatestAnnouncements from "../../components/sections/Announcements/LatestAnnouncements";

export default function Home() {
  return (
    <>
      <Hero />

      <PromoVideo />

      <Countdown />

      <About />

      <FeaturedEvents />

      <LatestAnnouncements />

      <Timeline />

      <Gallery />
<FAQ />

      <CTA />
    </>
  );
}

import { useEffect, useState } from "react";

const sectionIds = [
  "hero",
  "countdown",
  "about",
  "events",
  "timeline",
  "gallery",
  "sponsors",
  "faq",
];

export default function useActiveSection() {
  const [activeSection, setActiveSection] = useState("hero");

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 150;

      let current = "hero";

      sectionIds.forEach((id) => {
        const section = document.getElementById(id);

        if (section && scrollPosition >= section.offsetTop) {
          current = id;
        }
      });

      setActiveSection(current);
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return activeSection;
}
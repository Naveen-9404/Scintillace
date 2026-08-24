import {
  Flag,
  Music,
  Mic2,
  Presentation,
  Cpu,
  Sparkles,
  PartyPopper,
  Shirt,
} from "lucide-react";

export const timeline = [
  {
    day: "Day 1",
    date: "29 September 2026",

    events: [
      {
        title: "Inauguration",
        description:
          "The official inauguration of Scintillace and the beginning of the three-day celebration.",
        icon: Flag,
      },

      {
        title: "Prayer Song & Classical Dance",
        description:
          "Begin the celebrations with a prayer song followed by a classical dance performance.",
        icon: Music,
      },

      {
        title: "Speeches",
        description:
          "Welcome addresses and speeches by the college and department dignitaries.",
        icon: Mic2,
      },

      {
        title: "Presentations",
        description:
          "Students showcase their ideas and work through presentations.",
        icon: Presentation,
      },

      {
        title: "Hardware Expo",
        description:
          "Explore hardware projects and engineering innovations showcased by students.",
        icon: Cpu,
      },

      {
        title: "Flash Mob",
        description:
          "A high-energy flash mob performance bringing the campus celebration to life.",
        icon: PartyPopper,
      },

      {
        title: "Crackers & Dispersal",
        description:
          "The first day concludes with crackers followed by dispersal.",
        icon: Sparkles,
      },
    ],
  },

  {
    day: "Day 2",
    date: "30 September 2026",

    events: [
      {
        title: "Workshop",
        description:
          "An engaging hands-on workshop designed to provide participants with practical learning and new skills.",
        icon: Cpu,
      },

      {
        title: "Cultural Events",
        description:
          "An evening of cultural performances celebrating creativity, talent and entertainment.",
        icon: Music,
      },
    ],
  },

  {
    day: "Day 3",
    date: "1 October 2026",

    events: [
      {
        title: "Ethnic Day",
        description:
          "Celebrate culture and tradition through a vibrant Ethnic Day.",
        icon: Shirt,
      },
    ],
  },
];
import {
  Flag,
  BrainCircuit,
  Code2,
  Cpu,
  Music2,
  Trophy,
  PartyPopper,
  Award,
} from "lucide-react";

export const timeline = [
  {
    day: "Day 1",
    date: "10 Sept 2026",
    events: [
      {
        time: "09:00 AM",
        title: "Opening Ceremony",
        icon: Flag,
        description:
          "Kick off Celestia 2K26 with the inaugural ceremony, keynote addresses, and the official festival launch.",
      },
      {
        time: "11:00 AM",
        title: "AI & Emerging Technologies Workshop",
        icon: BrainCircuit,
        description:
          "Explore Artificial Intelligence, Machine Learning, and the latest innovations through an interactive workshop.",
      },
      {
        time: "02:00 PM",
        title: "24-Hour Hackathon",
        icon: Code2,
        description:
          "Teams collaborate to solve real-world challenges through innovative software and hardware solutions.",
      },
      {
        time: "07:00 PM",
        title: "Cultural Evening",
        icon: Music2,
        description:
          "An energetic evening featuring music, dance, and cultural performances by talented students.",
      },
    ],
  },

  {
    day: "Day 2",
    date: "11 Sept 2026",
    events: [
      {
        time: "09:30 AM",
        title: "Robotics Challenge",
        icon: Cpu,
        description:
          "Compete in exciting robotics events including autonomous navigation and obstacle challenges.",
      },
      {
        time: "11:30 AM",
        title: "Project Expo",
        icon: Trophy,
        description:
          "Showcase innovative engineering projects, research prototypes, and creative technical solutions.",
      },
      {
        time: "04:00 PM",
        title: "E-Sports Championship",
        icon: PartyPopper,
        description:
          "Witness thrilling gaming competitions as participants battle for the championship title.",
      },
    ],
  },

  {
    day: "Day 3",
    date: "12 Sept 2026",
    events: [
      {
        time: "10:00 AM",
        title: "Paper Presentation",
        icon: BrainCircuit,
        description:
          "Present innovative research ideas and technical papers before judges and faculty members.",
      },
      {
        time: "03:00 PM",
        title: "Prize Distribution",
        icon: Award,
        description:
          "Celebrate outstanding performances and honor winners across all technical and cultural events.",
      },
      {
        time: "05:00 PM",
        title: "Closing Ceremony",
        icon: Flag,
        description:
          "Celebrate the success of Celestia 2K26 and conclude three unforgettable days of innovation and creativity.",
      },
    ],
  },
];
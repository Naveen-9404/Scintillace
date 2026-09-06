import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Megaphone, ChevronRight } from "lucide-react";
import { getPublishedAnnouncements } from "../../api/announcements.api";

export default function AnnouncementTicker() {
  const [latestAnnouncement, setLatestAnnouncement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let mounted = true;
    
    const fetchLatest = async () => {
      try {
        setLoading(true);
        // Fetch a small batch, sorted descending by createdAt to get the latest
        const res = await getPublishedAnnouncements({ page: 1, limit: 1, sort: "-createdAt" });
        if (mounted && res?.announcements?.length > 0) {
          setLatestAnnouncement(res.announcements[0]);
        }
      } catch (err) {
        console.error("Failed to fetch latest announcement:", err);
        if (mounted) setError(true);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchLatest();

    return () => {
      mounted = false;
    };
  }, []);

  if (loading || error || !latestAnnouncement) {
    return null;
  }

  // Strip HTML tags for clean text preview
  const stripHtml = (html) => {
    if (!html) return "";
    const doc = new DOMParser().parseFromString(html, "text/html");
    return doc.body.textContent || "";
  };

  const previewContent = stripHtml(latestAnnouncement.content);
  // Construct the display string. We combine title and a short preview of the content.
  const displayString = `${latestAnnouncement.title}${previewContent ? ` — ${previewContent}` : ''}`;

  return (
    <>
      <style>
        {`
          @keyframes marquee {
            0% { transform: translate3d(0, 0, 0); }
            100% { transform: translate3d(-100%, 0, 0); }
          }
          .animate-marquee {
            animation: marquee 25s linear infinite;
          }
          .ticker-container:hover .animate-marquee {
            animation-play-state: paused;
          }
          @media (prefers-reduced-motion: reduce) {
            .animate-marquee {
              animation: none !important;
              transform: none !important;
              padding-left: 0 !important;
              white-space: nowrap !important;
              width: 100%;
              text-overflow: ellipsis;
              overflow: hidden;
            }
            .ticker-scroll-wrapper {
              display: flex;
              align-items: center;
              padding-left: 1rem;
              overflow: hidden;
              width: 100%;
            }
          }
        `}
      </style>
      <div className="relative z-[60] flex h-10 w-full items-center overflow-hidden bg-slate-950/95 border-b border-cyan-500/20">
        
        {/* Label (Fixed on the left) */}
        <div className="absolute left-0 z-10 flex h-full items-center bg-slate-950 px-3 md:px-6 shadow-[15px_0_20px_-5px_rgba(2,6,23,1)]">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-cyan-400">
            <Megaphone size={14} className="text-cyan-400" />
            <span className="hidden sm:inline">Latest Announcement</span>
            <span className="inline sm:hidden">Update</span>
          </div>
          <ChevronRight size={14} className="ml-2 text-cyan-500/50" />
        </div>
        
        {/* Scrolling Content */}
        <Link 
          to="/announcements"
          className="ticker-container flex h-full flex-1 items-center overflow-hidden"
          title="View Announcements"
        >
          <div className="ticker-scroll-wrapper inline-block w-full">
            <div className="animate-marquee inline-block whitespace-nowrap pl-[100%] pr-8 py-2 text-sm text-slate-200 transition-colors hover:text-cyan-300">
              {displayString}
            </div>
          </div>
        </Link>
      </div>
    </>
  );
}

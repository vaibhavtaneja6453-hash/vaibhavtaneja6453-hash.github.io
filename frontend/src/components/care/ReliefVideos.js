import React, { useState } from "react";
import { PlayCircle } from "lucide-react";

export function ReliefVideos({ videos }) {
  const [active, setActive] = useState(null);

  return (
    <div className="pm-card p-6">
      <div className="flex items-center gap-2 mb-3"><PlayCircle className="w-5 h-5 text-pm-secondary" /><h4 className="font-display font-bold text-pm-ink">Relief & relaxation videos</h4></div>
      <div className="grid sm:grid-cols-2 gap-4">
        {videos.map((v) => (
          <div key={v.id} className="rounded-2xl overflow-hidden" style={{ background: "var(--pm-surface-muted)", border: "1px solid var(--pm-border)" }} data-testid={`relief-video-${v.id}`}>
            <div className="relative aspect-video bg-black">
              {active === v.id ? (
                <iframe className="w-full h-full" src={`https://www.youtube-nocookie.com/embed/${v.id}?autoplay=1&rel=0`} title={v.title}
                  allow="accelerated-sensors; autoplay; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
              ) : (
                <button onClick={() => setActive(v.id)} className="group w-full h-full" data-testid={`relief-video-play-${v.id}`} aria-label={`Play ${v.title}`}>
                  <img src={`https://img.youtube.com/vi/${v.id}/hqdefault.jpg`} alt={v.title} loading="lazy" className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                  <span className="absolute inset-0 grid place-items-center">
                    <PlayCircle className="w-14 h-14 text-white drop-shadow-lg group-hover:scale-110 transition-transform" />
                  </span>
                </button>
              )}
            </div>
            <p className="px-3 py-2.5 text-sm font-semibold text-pm-ink">{v.title}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

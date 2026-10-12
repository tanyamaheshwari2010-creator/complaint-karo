// The bottom edge of the page: a road with a garbage pile (left) and a water-filled pothole (right).
// Purely decorative, so it is hidden from screen readers.
export default function RoadScene() {
  return (
    <>
      <div aria-hidden="true" className="dash-road pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-32" />

      {/* garbage pile */}
      <div aria-hidden="true" className="pointer-events-none absolute bottom-[50px] left-[clamp(8px,5vw,90px)] z-[2] w-[clamp(190px,21vw,300px)]">
        <svg viewBox="0 0 280 190" xmlns="http://www.w3.org/2000/svg" className="block h-auto w-full overflow-visible">
          <defs>
            <radialGradient id="bagBlack" cx=".35" cy=".3" r=".85">
              <stop offset="0" stopColor="#6d7f94" /><stop offset=".5" stopColor="#2c3646" /><stop offset="1" stopColor="#151b25" />
            </radialGradient>
            <radialGradient id="bagGreen" cx=".35" cy=".3" r=".85">
              <stop offset="0" stopColor="#7fbfa6" /><stop offset=".5" stopColor="#2f6e59" /><stop offset="1" stopColor="#173a30" />
            </radialGradient>
            <radialGradient id="bagBlue" cx=".35" cy=".3" r=".85">
              <stop offset="0" stopColor="#9ab8d8" /><stop offset=".55" stopColor="#4b6f9c" /><stop offset="1" stopColor="#27405f" />
            </radialGradient>
            <linearGradient id="canG" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="#f3f7fb" /><stop offset=".5" stopColor="#a7b4c3" /><stop offset="1" stopColor="#6c7886" />
            </linearGradient>
          </defs>

          <ellipse cx="142" cy="173" rx="128" ry="12" fill="rgba(15,25,45,.35)" />

          {/* big black bag */}
          <path d="M44 168 C28 130 50 90 92 88 C136 90 158 130 142 168 C120 180 66 180 44 168 Z" fill="url(#bagBlack)" />
          <path d="M92 88 C80 66 66 70 72 80 C76 86 86 87 92 88 Z M92 88 C106 66 120 70 112 80 C108 86 98 87 92 88 Z" fill="#1f2733" />
          <circle cx="92" cy="86" r="4.5" fill="#10151d" />
          <ellipse cx="68" cy="124" rx="9" ry="24" transform="rotate(-18 68 124)" fill="#fff" opacity=".2" />
          <path d="M60 150 Q92 160 124 148 M70 112 Q92 120 116 110" fill="none" stroke="#fff" strokeOpacity=".1" strokeWidth="2" />

          {/* green bag */}
          <g transform="rotate(9 176 150)">
            <path d="M134 168 C122 140 140 114 178 112 C216 114 232 142 218 168 C198 180 154 180 134 168 Z" fill="url(#bagGreen)" />
            <path d="M178 112 C168 92 154 96 160 104 C164 110 172 111 178 112 Z M178 112 C190 92 204 96 198 104 C194 110 184 111 178 112 Z" fill="#1b4034" />
            <circle cx="178" cy="110" r="4" fill="#0f2820" />
            <ellipse cx="152" cy="142" rx="8" ry="20" transform="rotate(-16 152 142)" fill="#fff" opacity=".22" />
          </g>

          {/* torn blue bag */}
          <path d="M6 170 C2 152 18 142 40 144 C64 146 76 158 68 171 C50 178 22 178 6 170 Z" fill="url(#bagBlue)" />
          <path d="M22 146 L32 156 L40 144 L50 156 L58 147" fill="none" stroke="#1d2f47" strokeWidth="3" strokeLinejoin="round" />
          <ellipse cx="26" cy="158" rx="6" ry="14" transform="rotate(-20 26 158)" fill="#fff" opacity=".2" />

          {/* spilled bits */}
          <g transform="translate(222 166) rotate(-16)">
            <rect x="-19" y="-9" width="38" height="18" rx="4" fill="url(#canG)" />
            <rect x="-19" y="-3.5" width="38" height="7" fill="#e0524f" opacity=".9" />
            <ellipse cx="19" cy="0" rx="3" ry="9" fill="#b6c2d0" />
          </g>
          <path d="M96 172 q10 -16 24 -5 q-9 2 -13 9 q-7 3 -11 -4 Z" fill="#f3d04b" stroke="#c4a021" strokeWidth="1.5" />
          <circle cx="74" cy="173" r="7.5" fill="#f4f7fb" />
          <path d="M69 171 l5 3 l4 -4" stroke="#b8c4d2" fill="none" />
          <circle cx="262" cy="170" r="6" fill="#eef3f9" />
          <g transform="translate(184 177) rotate(6)">
            <rect x="-14" y="-6" width="28" height="12" rx="6" fill="rgba(150,210,245,.65)" stroke="#6fb3e0" strokeWidth="1.5" />
            <rect x="14" y="-3" width="7" height="6" rx="2" fill="#6fb3e0" />
          </g>

          {/* smell + flies */}
          <path className="stink" d="M84 74 q-6 -8 0 -14 q6 -6 0 -14" fill="none" stroke="#7fa06b" strokeWidth="2.5" strokeLinecap="round" />
          <path className="stink s2" d="M112 70 q-6 -8 0 -14 q6 -6 0 -14" fill="none" stroke="#7fa06b" strokeWidth="2.5" strokeLinecap="round" />
          <circle className="fly" cx="150" cy="96" r="2.2" fill="#222" />
          <circle className="fly f2" cx="72" cy="76" r="2" fill="#222" />
          <circle className="fly f3" cx="196" cy="104" r="2.2" fill="#222" />
        </svg>
      </div>

      {/* pothole filled with water */}
      <div aria-hidden="true" className="pointer-events-none absolute bottom-3.5 right-[clamp(8px,6vw,110px)] z-[2] w-[clamp(230px,25vw,350px)]">
        <svg viewBox="0 0 320 90" xmlns="http://www.w3.org/2000/svg" className="block h-auto w-full overflow-visible">
          <defs>
            <linearGradient id="water" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="#cdeafd" /><stop offset=".55" stopColor="#7fc0ec" /><stop offset="1" stopColor="#4a9ad6" />
            </linearGradient>
          </defs>
          <path d="M22 44 L-6 38 M30 30 L8 16 M64 14 L56 -2 M270 16 L288 -2 M300 40 L324 34 M296 62 L322 74 M40 66 L18 82" fill="none" stroke="#3a4655" strokeWidth="2.2" strokeLinecap="round" opacity=".7" />
          <path d="M20 48 C14 28 52 12 100 10 C150 4 210 6 256 16 C300 24 312 44 290 60 C262 80 190 84 130 82 C70 82 26 72 20 48 Z" fill="#2c3644" />
          <path d="M20 48 C14 28 52 12 100 10 C150 4 210 6 256 16" fill="none" stroke="#97a5b8" strokeWidth="3" strokeDasharray="18 6 30 8" strokeLinecap="round" opacity=".8" />
          <path d="M40 48 C36 34 70 22 112 20 C160 16 214 18 250 26 C280 32 286 46 268 56 C244 70 184 74 132 72 C84 72 46 64 40 48 Z" fill="url(#water)" />
          <path d="M62 36 C90 26 130 24 168 24" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" opacity=".6" />
          <path d="M200 30 C226 30 246 34 258 40" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity=".45" />
          <ellipse className="ripple" cx="160" cy="46" rx="9" ry="3.2" fill="none" stroke="#fff" strokeWidth="1.5" />
          <ellipse className="ripple r2" cx="160" cy="46" rx="9" ry="3.2" fill="none" stroke="#fff" strokeWidth="1.5" />
          <ellipse className="ripple r3" cx="160" cy="46" rx="9" ry="3.2" fill="none" stroke="#fff" strokeWidth="1.5" />
        </svg>
      </div>
    </>
  );
}

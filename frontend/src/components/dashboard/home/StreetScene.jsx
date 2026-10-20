// The bottom of the home page: the road, with a standing street light (flickering all the time),
// garbage bags, three bins, and a pothole full of water. It ends right above the footer.
// Purely decorative, so it is hidden from screen readers.
export default function StreetScene() {
  return (
    <div aria-hidden="true" className="relative z-[1] mt-2.5 h-[250px]">
      <div className="dash-road absolute inset-x-0 bottom-0 h-32" />

      {/* standing street light */}
      <div className="pointer-events-none absolute bottom-14 left-[clamp(4px,3vw,60px)] z-[1] w-[clamp(96px,10vw,150px)] max-[640px]:left-0 max-[640px]:w-[84px]">
<svg viewBox="0 0 170 480" xmlns="http://www.w3.org/2000/svg" className="block h-auto w-full overflow-visible">
          <defs>
            <radialGradient id="glowG" cx=".5" cy=".5" r=".5"><stop offset="0" stopColor="#fff3a8" stopOpacity=".9"/><stop offset=".45" stopColor="#ffe57a" stopOpacity=".35"/><stop offset="1" stopColor="#ffe57a" stopOpacity="0"/></radialGradient>
            <linearGradient id="coneG" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#fff3a8" stopOpacity=".5"/><stop offset="1" stopColor="#fff3a8" stopOpacity="0"/></linearGradient>
            <linearGradient id="poleG" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stopColor="#5b6c85"/><stop offset=".5" stopColor="#3b4a62"/><stop offset="1" stopColor="#2a3649"/></linearGradient>
          </defs>
          <g className="glow">
            <polygon points="116,52 144,52 215,330 40,330" fill="url(#coneG)"/>
            <circle cx="130" cy="56" r="74" fill="url(#glowG)"/>
          </g>
          <ellipse cx="48" cy="472" rx="30" ry="6" fill="rgba(15,25,45,.3)"/>
          <path d="M34 470 Q36 452 42 448 H54 Q60 452 62 470 Z" fill="#2a3649"/>
          <rect x="43" y="64" width="10" height="390" rx="3" fill="url(#poleG)"/>
          <rect x="40" y="430" width="16" height="8" rx="2" fill="#2a3649"/>
          <path d="M48 74 C48 42 72 30 116 34" fill="none" stroke="#36465c" strokeWidth="8" strokeLinecap="round"/>
          <path d="M106 34 H154 Q159 34 157 41 L150 50 H110 L103 41 Q101 34 106 34 Z" fill="#2f3d52"/>
          <ellipse cx="130" cy="50" rx="19" ry="4.5" fill="#cfc89a"/>
          <ellipse className="bulb-on" cx="130" cy="50" rx="19" ry="4.5" fill="#fff7b8"/>
        </svg>
      </div>

      {/* garbage bags + three bins */}
      <div className="pointer-events-none absolute bottom-[50px] left-[clamp(110px,10vw,190px)] z-[2] w-[clamp(300px,40vw,580px)] max-[640px]:left-[52px] max-[640px]:w-[80vw]">
<svg viewBox="0 0 540 190" xmlns="http://www.w3.org/2000/svg" className="block h-auto w-full overflow-visible">
          <defs>
            <radialGradient id="bagBlack" cx=".35" cy=".3" r=".85"><stop offset="0" stopColor="#6d7f94"/><stop offset=".5" stopColor="#2c3646"/><stop offset="1" stopColor="#151b25"/></radialGradient>
            <radialGradient id="bagGreen" cx=".35" cy=".3" r=".85"><stop offset="0" stopColor="#7fbfa6"/><stop offset=".5" stopColor="#2f6e59"/><stop offset="1" stopColor="#173a30"/></radialGradient>
            <radialGradient id="bagBlue" cx=".35" cy=".3" r=".85"><stop offset="0" stopColor="#9ab8d8"/><stop offset=".55" stopColor="#4b6f9c"/><stop offset="1" stopColor="#27405f"/></radialGradient>
            <linearGradient id="canG" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#f3f7fb"/><stop offset=".5" stopColor="#a7b4c3"/><stop offset="1" stopColor="#6c7886"/></linearGradient>
            <linearGradient id="binGreen" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stopColor="#58c08d"/><stop offset=".55" stopColor="#2f8f5b"/><stop offset="1" stopColor="#1f6b45"/></linearGradient>
            <linearGradient id="binBlue" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stopColor="#6aa6ea"/><stop offset=".55" stopColor="#3b6fb5"/><stop offset="1" stopColor="#27508a"/></linearGradient>
            <linearGradient id="binGrey" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stopColor="#9aa6b6"/><stop offset=".55" stopColor="#5b6676"/><stop offset="1" stopColor="#3c4655"/></linearGradient>
          </defs>
          <ellipse cx="142" cy="173" rx="128" ry="12" fill="rgba(15,25,45,.35)"/>
          <path d="M44 168 C28 130 50 90 92 88 C136 90 158 130 142 168 C120 180 66 180 44 168 Z" fill="url(#bagBlack)"/>
          <path d="M92 88 C80 66 66 70 72 80 C76 86 86 87 92 88 Z M92 88 C106 66 120 70 112 80 C108 86 98 87 92 88 Z" fill="#1f2733"/>
          <circle cx="92" cy="86" r="4.5" fill="#10151d"/>
          <ellipse cx="68" cy="124" rx="9" ry="24" transform="rotate(-18 68 124)" fill="#fff" opacity=".2"/>
          <path d="M60 150 Q92 160 124 148 M70 112 Q92 120 116 110" fill="none" stroke="#fff" strokeOpacity=".1" strokeWidth="2"/>
          <g transform="rotate(9 176 150)">
            <path d="M134 168 C122 140 140 114 178 112 C216 114 232 142 218 168 C198 180 154 180 134 168 Z" fill="url(#bagGreen)"/>
            <path d="M178 112 C168 92 154 96 160 104 C164 110 172 111 178 112 Z M178 112 C190 92 204 96 198 104 C194 110 184 111 178 112 Z" fill="#1b4034"/>
            <circle cx="178" cy="110" r="4" fill="#0f2820"/>
            <ellipse cx="152" cy="142" rx="8" ry="20" transform="rotate(-16 152 142)" fill="#fff" opacity=".22"/>
          </g>
          <path d="M6 170 C2 152 18 142 40 144 C64 146 76 158 68 171 C50 178 22 178 6 170 Z" fill="url(#bagBlue)"/>
          <path d="M22 146 L32 156 L40 144 L50 156 L58 147" fill="none" stroke="#1d2f47" strokeWidth="3" strokeLinejoin="round"/>
          <ellipse cx="26" cy="158" rx="6" ry="14" transform="rotate(-20 26 158)" fill="#fff" opacity=".2"/>
          <g transform="translate(222 166) rotate(-16)"><rect x="-19" y="-9" width="38" height="18" rx="4" fill="url(#canG)"/><rect x="-19" y="-3.5" width="38" height="7" fill="#e0524f" opacity=".9"/><ellipse cx="19" cy="0" rx="3" ry="9" fill="#b6c2d0"/></g>
          <path d="M96 172 q10 -16 24 -5 q-9 2 -13 9 q-7 3 -11 -4 Z" fill="#f3d04b" stroke="#c4a021" strokeWidth="1.5"/>
          <circle cx="74" cy="173" r="7.5" fill="#f4f7fb"/><path d="M69 171 l5 3 l4 -4" stroke="#b8c4d2" fill="none"/>
          <ellipse cx="312" cy="174" rx="36" ry="5" fill="rgba(15,25,45,.3)"/>
          <path d="M281 98 H343 L337 172 H287 Z" fill="url(#binGreen)"/>
          <path d="M284 118 H340 M285 136 H339 M286 154 H338" stroke="#0f3d26" strokeOpacity=".35" strokeWidth="2"/>
          <path d="M288 104 L292 166" stroke="#fff" strokeOpacity=".25" strokeWidth="4" strokeLinecap="round"/>
          <rect x="277" y="88" width="70" height="13" rx="5" fill="#1f6b45"/><rect x="299" y="83" width="26" height="6" rx="3" fill="#175236"/>
          <circle cx="338" cy="172" r="6" fill="#222"/>
          <ellipse cx="392" cy="174" rx="36" ry="5" fill="rgba(15,25,45,.3)"/>
          <path d="M361 98 H423 L417 172 H367 Z" fill="url(#binBlue)"/>
          <path d="M364 118 H420 M365 136 H419 M366 154 H418" stroke="#0e2a52" strokeOpacity=".35" strokeWidth="2"/>
          <path d="M368 104 L372 166" stroke="#fff" strokeOpacity=".25" strokeWidth="4" strokeLinecap="round"/>
          <g transform="rotate(-42 357 96)"><rect x="357" y="84" width="70" height="13" rx="5" fill="#27508a"/></g>
          <ellipse cx="392" cy="97" rx="31" ry="9" fill="#5b4c35"/>
          <circle cx="379" cy="86" r="13" fill="#2c3646"/><circle cx="404" cy="83" r="14" fill="#3b5a46"/>
          <path d="M370 80 l10 -10 l7 12 z" fill="#f4f7fb"/><path d="M396 74 l12 -8 l4 13 z" fill="#e7dcc3"/>
          <path d="M418 98 q10 4 8 18 q-6 -6 -10 -2 z" fill="#f3d04b" stroke="#c4a021" strokeWidth="1.3"/>
          <rect x="387" y="66" width="7" height="14" rx="3" fill="rgba(150,210,245,.8)"/>
          <circle cx="418" cy="172" r="6" fill="#222"/>
          <path className="stink" d="M384 62 q-6 -8 0 -14 q6 -6 0 -14" fill="none" stroke="#7fa06b" strokeWidth="2.5" strokeLinecap="round"/>
          <path className="stink s2" d="M402 60 q-6 -8 0 -14 q6 -6 0 -14" fill="none" stroke="#7fa06b" strokeWidth="2.5" strokeLinecap="round"/>
          <g transform="translate(470 142) rotate(80)">
            <path d="M-31 -74 H31 L26 0 H-26 Z" fill="url(#binGrey)"/>
            <path d="M-28 -54 H28 M-27 -36 H27 M-26 -18 H26" stroke="#1e2733" strokeOpacity=".35" strokeWidth="2"/>
            <rect x="-35" y="-87" width="70" height="13" rx="5" fill="#3c4655"/>
            <circle cx="27" cy="2" r="6" fill="#222"/>
          </g>
          <ellipse cx="478" cy="175" rx="46" ry="5" fill="rgba(15,25,45,.28)"/>
          <circle cx="536" cy="166" r="9" fill="#f4f7fb"/><path d="M531 163 l5 4 l5 -5" stroke="#b8c4d2" fill="none"/>
          <path d="M522 172 l12 -4 l5 7 z" fill="#e7dcc3"/>
          <circle cx="552" cy="172" r="6" fill="#eef3f9"/>
          <path d="M556 176 q10 -14 22 -4 q-9 2 -12 9 q-7 3 -10 -5 Z" fill="#f3d04b" stroke="#c4a021" strokeWidth="1.3"/>
          <circle className="fly" cx="392" cy="70" r="2.2" fill="#222"/><circle className="fly f2" cx="372" cy="62" r="2" fill="#222"/>
          <circle className="fly f3" cx="410" cy="68" r="2.2" fill="#222"/><circle className="fly f4" cx="100" cy="76" r="2" fill="#222"/>
          <circle className="fly f5" cx="540" cy="140" r="2" fill="#222"/>
        </svg>
      </div>

      {/* pothole full of water */}
      <div className="pointer-events-none absolute bottom-3.5 right-[clamp(8px,6vw,110px)] z-[2] w-[clamp(230px,25vw,350px)] max-[640px]:bottom-1.5 max-[640px]:right-1 max-[640px]:w-[54vw]">
<svg viewBox="0 0 320 90" xmlns="http://www.w3.org/2000/svg" className="block h-auto w-full overflow-visible">
          <defs><linearGradient id="water" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#cdeafd"/><stop offset=".55" stopColor="#7fc0ec"/><stop offset="1" stopColor="#4a9ad6"/></linearGradient></defs>
          <path d="M22 44 L-6 38 M30 30 L8 16 M64 14 L56 -2 M270 16 L288 -2 M300 40 L324 34 M296 62 L322 74 M40 66 L18 82" fill="none" stroke="#3a4655" strokeWidth="2.2" strokeLinecap="round" opacity=".7"/>
          <path d="M20 48 C14 28 52 12 100 10 C150 4 210 6 256 16 C300 24 312 44 290 60 C262 80 190 84 130 82 C70 82 26 72 20 48 Z" fill="#2c3644"/>
          <path d="M20 48 C14 28 52 12 100 10 C150 4 210 6 256 16" fill="none" stroke="#97a5b8" strokeWidth="3" strokeDasharray="18 6 30 8" strokeLinecap="round" opacity=".8"/>
          <path d="M40 48 C36 34 70 22 112 20 C160 16 214 18 250 26 C280 32 286 46 268 56 C244 70 184 74 132 72 C84 72 46 64 40 48 Z" fill="url(#water)"/>
          <path d="M62 36 C90 26 130 24 168 24" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" opacity=".6"/>
          <path d="M200 30 C226 30 246 34 258 40" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity=".45"/>
          <ellipse className="ripple" cx="160" cy="46" rx="9" ry="3.2" fill="none" stroke="#fff" strokeWidth="1.5"/>
          <ellipse className="ripple r2" cx="160" cy="46" rx="9" ry="3.2" fill="none" stroke="#fff" strokeWidth="1.5"/>
          <ellipse className="ripple r3" cx="160" cy="46" rx="9" ry="3.2" fill="none" stroke="#fff" strokeWidth="1.5"/>
        </svg>
      </div>
    </div>
  );
}

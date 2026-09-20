// Original vector artwork: layered geometry stays sharp at every viewport size.
// Decorative only; the section's meaning remains in real HTML text.
export default function SkyScene() {
  return <div className="sky-art" aria-hidden="true">
    <div className="sky-day" /><div className="sky-sunset" /><div className="sky-night" />
    <svg className="stars" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice">
      {Array.from({ length: 65 }, (_, i) => <circle key={i} cx={(i * 193 + 59) % 1440} cy={(i * 97 + 23) % 490} r={i % 9 === 0 ? 1.8 : .85} fill="#e4eafa" opacity={.35 + (i % 5) * .13} />)}
      <path d="M1044 112v12m-6-6h12M1190 290v8m-4-4h8" stroke="#dceaff" strokeWidth="1" opacity=".7" />
    </svg>
    <div className="sun-track"><div className="sun-halo" /><div className="sun" /></div>
    <div className="moon-track"><div className="moon"><span /><i /></div></div>
    <svg className="clouds clouds-far" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice">
      <g fill="#fff" opacity=".35"><path d="M-90 188Q45 164 155 188T390 194Q290 210 126 204T-90 188Z" /><path d="M845 165Q920 145 1000 161T1235 167Q1120 185 1015 177T845 165Z" /></g>
    </svg>
    <svg className="clouds clouds-near" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice">
      <g fill="#fff" opacity=".65"><path d="M-60 330Q40 304 128 324Q166 295 245 318Q286 316 334 337Q205 350 83 340T-60 330Z" /><path d="M930 300Q985 278 1045 289Q1100 250 1162 290Q1250 279 1310 306Q1384 306 1470 329Q1320 337 1190 318T930 300Z" /></g>
    </svg>
    <svg className="landscape" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="sky-water-sheen" x2="0" y2="1"><stop stopColor="#fff" stopOpacity=".06" /><stop offset="1" stopColor="#fff" stopOpacity="0" /></linearGradient>
        <linearGradient id="sky-sun-reflection" x2="0" y2="1"><stop stopColor="#ffe8ba" stopOpacity=".65" /><stop offset="1" stopColor="#ffdfb1" stopOpacity="0" /></linearGradient>
      </defs>
      <path className="ridge-back" fill="#81aab6" d="M0 573L110 502 166 530 285 420 321 453 408 376 470 437 526 419 626 503 689 467 790 529 896 436 938 467 1012 389 1095 449 1139 430 1270 521 1350 468 1440 513V900H0Z" />
      <path className="snowcaps" fill="#f3f1e6" opacity=".28" d="M285 420l-32 47 38-16 30 2-13-14ZM408 376l-39 48 33-12 17 13 18-9ZM1012 389l-39 47 38-13 34 9Z" />
      <path className="ridge-mid" fill="#527f8d" d="M0 581L78 560 177 592 275 512 345 543 459 485 557 579 662 540 775 608 889 528 968 548 1060 488 1188 568 1267 540 1440 610V900H0Z" />
      <path className="ridge-front" fill="#315e6c" d="M0 621Q152 533 292 609T514 649Q637 608 733 635T927 638Q1030 569 1148 623T1440 640V900H0Z" />
      <path className="water" fill="#8bb8bb" d="M0 706Q210 661 455 682T918 673Q1150 664 1440 713V900H0Z" />
      <path fill="url(#sky-water-sheen)" d="M0 706Q210 661 455 682T918 673Q1150 664 1440 713V900H0Z" />
      <path className="sun-reflection" fill="url(#sky-sun-reflection)" d="M1080 679h35l75 181H996Z" />
      <g className="moon-reflection" stroke="#bddcf3" strokeLinecap="round"><path d="M1019 706h38m-56 17h71m-50 23h23m-61 27h97m-128 32h148m-117 24h70" opacity=".6" /><path d="M1009 715h58m-48 44h38m-32 55h28" opacity=".3" /></g>
      <g stroke="#d7e4df" opacity=".18" fill="none"><path d="M203 728h146m-180 32h210m161-48h80m-199 95h191m138-59h153m-93 52h94m328-65h91m-62 42h146" /></g>
      <path className="shore" fill="#264e54" d="M0 697Q119 713 263 782Q361 815 476 827L637 900H0ZM1440 674Q1290 710 1243 756Q1160 820 1040 866L1013 900H1440Z" />
      <g fill="#16373e"><path d="M85 573l-28 63h15l-26 43h27l-26 36h76l-27-36h25l-26-43h16ZM1378 552l-29 65h16l-31 47h27l-27 47h85l-29-47h26l-29-47h16Z" /><path d="M79 688h10v44H79M1373 688h11v39h-11" /></g>
      <g transform="translate(1190 724)"><path fill="#26303a" d="M0 12L31-8 65 12V45H0Z" /><path fill="#172731" d="M-6 14L31-12 72 14H62L31-5 3 14Z" /><path fill="#18232b" d="M45 24h10v21H45M12 23h18v13H12" /><path className="cabin-light" fill="#ffdb92" d="M12 23h7v13h-7M22 23h8v13h-8" /><path className="cabin-light" fill="#ffd38b" d="M46 25h7v20h-7" /><path className="cabin-light" fill="#ffdb92" opacity="0" d="M46 45h7l20 17H32Z" /></g>
    </svg>
  </div>
}

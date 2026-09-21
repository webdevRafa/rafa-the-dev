// Original vector streetscape: the geometry stays fixed while GSAP changes its light.
const clusters = [[-72,-29,.87,-18],[-41,-70,.92,8],[14,-81,.82,-28],[61,-48,.92,19],[76,3,.76,38],[21,14,1.13,-7],[-46,23,.88,25],[-92,8,.67,-14],[0,-28,1.07,3]]

function Canopy({x,y,scale=1}:{x:number;y:number;scale?:number}) {
  return <g transform={`translate(${x} ${y}) scale(${scale})`}>{clusters.map(([cx,cy,s,r],i)=><use key={i} href="#city-leaf-cluster" transform={`translate(${cx} ${cy}) rotate(${r}) scale(${s})`}/>)}</g>
}

function Tree({x,y,scale=1}:{x:number;y:number;scale?:number}) {
  return <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <Canopy x={0} y={-300} scale={1.12}/>
    <path fill="url(#city-bark)" d="M-8 0C-3-96-8-171-18-228C-29-250-47-280-61-299L-52-292C-33-272-21-254-12-239L-3-287-15-338-10-344 6-286 0-221C20-241 31-256 38-269L59-319 65-324C61-305 55-282 48-266L8-204C9-151 7-80 11 0Z"/>
    <path fill="none" stroke="var(--trunk)" strokeWidth="2" strokeLinecap="round" opacity=".7" d="M-12-242q-28-11-46-42m57 35q19-29 24-52m-8 79q24-4 46-27M-3-291q-15-8-29-30"/>
    <path fill="#d5ad79" opacity=".24" d="M-3 0C0-108-5-158-7-216L-14-237-5-226 0-181 4-80 3 0ZM7-216l40-50 11-25-8 28-42 58Z"/>
    <Canopy x={-34} y={-335} scale={.86}/><Canopy x={45} y={-302} scale={.72}/>
  </g>
}

function Window({x,y,w,h,warm=0,curtain=false}:{x:number;y:number;w:number;h:number;warm?:number;curtain?:boolean}) {
  return <g transform={`translate(${x} ${y})`}>
    <rect x="-6" y="-5" width={w+12} height={h+13} fill="var(--pale-shadow)"/>
    <rect width={w} height={h} fill="#202831"/><rect x="6" y="6" width={w-12} height={h-12} fill="url(#city-glass)"/>
    <rect className="window-warm-light" data-light-order={warm} x="6" y="6" width={w-12} height={h-12} fill="url(#city-interior-light)"/>
    <path d={`M7 7H${w*.36}V${h-7}H7Z`} fill="#f3e9d0" opacity={curtain?'.21':'.08'}/>
    {curtain&&<g stroke="#e5ddc5" strokeWidth="2" opacity=".2"><path d={`M17 9v${h-19}m10-${h-19}v${h-19}m9-${h-19}v${h-19}`}/></g>}
    <path d={`M${w*.08} ${h*.68}h${w*.17}v${h*.25}H${w*.08}Zm${w*.48} ${h*-.04}h${w*.18}v${h*.29}H${w*.56}Z`} fill="#202a30" opacity=".25"/>
    <path d={`M${w*.75} ${h*.87}q-${w*.15}-${h*.24}-${w*.03}-${h*.2}q${w*.12} ${h*.05} ${w*.03} ${h*.2}q${w*.13}-${h*.24} ${w*.19}-${h*.2}q0 ${h*.1}-${w*.19} ${h*.2}`} fill="#253c31" opacity=".7"/>
    <path d={`M6 8L${w-6} ${h*.35}V${h*.55}L6 ${h*.28}Z`} fill="url(#city-glass-reflection)" opacity=".23"/>
    <path d={`M${w/2} 3V${h-3}`} stroke="#232a2e" strokeWidth="6"/><path d={`M4 ${h*.62}H${w-4}`} stroke="#252d31" strokeWidth="4"/>
    <path d={`M1 1h${w-2}v${h-2}H1Z`} fill="none" stroke="#101a22" strokeWidth="3"/><rect x="-8" y={h+2} width={w+16} height="11" fill="var(--trim)"/>
  </g>
}

function Storefront({x,y,w,h,variant=0}:{x:number;y:number;w:number;h:number;variant?:number}) {
  return <g transform={`translate(${x} ${y})`}>
    <rect width={w} height={h} fill="#252d32"/><rect x="8" y="8" width={w-16} height={h-17} fill="url(#city-store-glass)"/>
    <rect x="8" y="8" width={w-16} height={h-17} fill="#c6ac82" opacity=".31"/>
    <rect className="window-warm-light" data-light-order={variant+3} x="8" y="8" width={w-16} height={h-17} fill="url(#city-store-light)"/>
    <path d={`M14 10h${w*.22}v${h-31}H14Z`} fill="#eedcb3" opacity=".13"/><path d={`M${w*.58} 26h${w*.19}v${h*.42}H${w*.58}Z`} fill="#34423d" opacity=".45"/>
    <g fill="#202c2a" opacity=".6"><rect x={w*.65} y={h*.3} width={w*.16} height="7"/><rect x={w*.66} y={h*.3-20} width="8" height="20"/><rect x={w*.71} y={h*.3-25} width="10" height="25"/><rect x={w*.76} y={h*.3-16} width="6" height="16"/></g>
    <path d={`M${w*.19} ${h*.74}q${w*.27}-5 ${w*.55} 0v5H${w*.19}ZM${w*.45} ${h*.74+5}h5v${h*.2}h-5Z`} fill="#3c3e32"/>
    <path d={`M${w*.18} ${h*.67}q12-4 25 0l7 24h-24Zm${w*.42} 0q13-4 27-2l-10 27h-25Z`} fill="#5e6553" opacity=".8"/>
    <path d={`M${w*.18+7} ${h*.67+28}v25m20-25 5 25M${w*.6-7} ${h*.67+28}l-5 25m20-25v25`} fill="none" stroke="#393d32" strokeWidth="3"/>
    <path d={`M${w*.46} 6v38`} stroke="#3b392f" strokeWidth="2"/><path d={`M${w*.46-13} 55q2-16 13-16t13 16Z`} fill="#fff1c1" opacity=".8"/>
    <path d={`M${w*.46-31} 93l17-38h28l17 38Z`} fill="#ffe8ab" opacity=".06"/>
    <path d={`M${w*.28} 3v${h-6}M${w*.64} 3v${h-6}`} stroke="#202b31" strokeWidth="7"/><path d={`M5 40h${w-10}`} stroke="#243037" strokeWidth="7"/>
    <path d={`M6 8L${w-7} ${h*.4}v${h*.16}L6 ${h*.18}Z`} fill="#fff" opacity=".035"/><rect x={w*.28+12} y={h*.65} width="4" height="27" fill="#aa9e80"/>
    <path d={`M2 2h${w-4}v${h-4}H2Z`} fill="none" stroke="#19262d" strokeWidth="4"/>
  </g>
}

const skyline=[[527,575,28,57],[560,544,18,88],[585,576,33,56],[621,548,25,83],[663,513,35,119],[705,574,15,58],[722,539,36,94],[767,562,21,70],[793,495,31,137],[889,566,17,68],[911,520,37,113],[960,555,19,78],[993,540,28,94]]

export default function SkyScene() {
  return <div className="sky-art" aria-hidden="true"><svg className="city-artwork" viewBox="0 0 1672 941" preserveAspectRatio="xMidYMid slice">
    <defs>
      <linearGradient id="city-sky" x2="0" y2="1"><stop stopColor="var(--sky-top)"/><stop offset=".58" stopColor="var(--sky-mid)"/><stop offset="1" stopColor="var(--sky-bottom)"/></linearGradient>
      <linearGradient id="city-air" x2="0" y2="1"><stop stopColor="#fff" stopOpacity="0"/><stop offset="1" stopColor="#e6efff" stopOpacity=".15"/></linearGradient>
      <radialGradient id="city-sun-halo"><stop stopColor="#fff2c6" stopOpacity=".7"/><stop offset=".38" stopColor="#ffe9a8" stopOpacity=".3"/><stop offset="1" stopColor="#ffebba" stopOpacity="0"/></radialGradient>
      <radialGradient id="city-moon-halo"><stop stopColor="#fff0c5" stopOpacity=".4"/><stop offset=".4" stopColor="#ffeaba" stopOpacity=".12"/><stop offset="1" stopColor="#f6e1b0" stopOpacity="0"/></radialGradient>
      <radialGradient id="city-lamp-halo"><stop stopColor="#fff0b7" stopOpacity=".95"/><stop offset=".22" stopColor="#ffc366" stopOpacity=".42"/><stop offset=".6" stopColor="#ffc063" stopOpacity=".1"/><stop offset="1" stopColor="#ffc063" stopOpacity="0"/></radialGradient>
      <radialGradient id="city-ground-light"><stop stopColor="#ffc668" stopOpacity=".56"/><stop offset=".5" stopColor="#ffb051" stopOpacity=".2"/><stop offset="1" stopColor="#ffbb62" stopOpacity="0"/></radialGradient>
      <linearGradient id="city-glass" x2=".8" y2="1"><stop stopColor="var(--glass-light)"/><stop offset="1" stopColor="var(--glass)"/></linearGradient>
      <linearGradient id="city-store-glass" x2="0" y2="1"><stop stopColor="var(--glass)"/><stop offset="1" stopColor="var(--glass-light)" stopOpacity=".65"/></linearGradient>
      <linearGradient id="city-interior-light" x2=".2" y2="1"><stop stopColor="#ffc36b"/><stop offset=".6" stopColor="#ffdb91"/><stop offset="1" stopColor="#c99654"/></linearGradient>
      <linearGradient id="city-store-light" x2=".9" y2="1"><stop stopColor="#fbd591"/><stop offset=".5" stopColor="#edb365"/><stop offset="1" stopColor="#ad7946"/></linearGradient>
      <linearGradient id="city-water" x2="0" y2="1"><stop stopColor="var(--water-light)"/><stop offset="1" stopColor="var(--water)"/></linearGradient>
      <linearGradient id="city-road" x2="0" y2="1"><stop stopColor="var(--road-light)"/><stop offset="1" stopColor="var(--road)"/></linearGradient>
      <linearGradient id="city-paving" x2=".65" y2="1"><stop stopColor="var(--paving-light)"/><stop offset="1" stopColor="var(--paving)"/></linearGradient>
      <linearGradient id="city-facade" x1="0" y1="0" x2=".95" y2=".8"><stop stopColor="var(--pale-light)"/><stop offset=".42" stopColor="var(--pale)"/><stop offset="1" stopColor="var(--pale-shadow)"/></linearGradient>
      <linearGradient id="city-brick" x1="0" y1="0" x2=".8" y2="1"><stop stopColor="var(--brick-light)"/><stop offset=".32" stopColor="var(--brick)"/><stop offset="1" stopColor="var(--brick-shadow)"/></linearGradient>
      <linearGradient id="city-glass-reflection" x2=".8" y2=".6"><stop stopColor="#f8eedc" stopOpacity=".8"/><stop offset="1" stopColor="#d0e1eb" stopOpacity="0"/></linearGradient>
      <linearGradient id="city-bark" x2="1" y2=".15"><stop stopColor="var(--trunk)"/><stop offset=".43" stopColor="#aa8c64"/><stop offset=".62" stopColor="var(--trunk)"/><stop offset="1" stopColor="var(--foliage-dark)"/></linearGradient>
      <radialGradient id="city-leaf-volume" cx=".28" cy=".2" r=".9"><stop stopColor="var(--foliage)"/><stop offset=".45" stopColor="var(--foliage)"/><stop offset="1" stopColor="var(--foliage-dark)"/></radialGradient>
      <radialGradient id="city-leaf-sunlit" cx=".25" cy=".1" r=".8"><stop stopColor="var(--foliage-light)" stopOpacity=".72"/><stop offset=".6" stopColor="var(--foliage)" stopOpacity=".35"/><stop offset="1" stopColor="var(--foliage)" stopOpacity="0"/></radialGradient>
      <pattern id="city-brickwork" width="42" height="18" patternUnits="userSpaceOnUse"><path d="M0 0H42M0 9H42M0 18H42M21 0v9M0 9v9M42 9v9" fill="none" stroke="#f6d0a9" strokeWidth=".8" opacity=".15"/><path d="M2 2h17v5H2Zm22 9h15v5H24Z" fill="#723d28" opacity=".035"/></pattern>
      <pattern id="city-stonework" width="94" height="61" patternUnits="userSpaceOnUse"><path d="M0 0H94V61H0ZM47 0v61" fill="none" stroke="#47424a" strokeWidth="1" opacity=".13"/></pattern>
      <pattern id="city-distant-windows" width="9" height="15" patternUnits="userSpaceOnUse"><path d="M3 4h2v4H3" fill="#ffd48b" opacity=".72"/><path d="M3 12h2v1H3" fill="#ffe5b0" opacity=".34"/></pattern>
      <g id="city-leaf-cluster">
        <path fill="url(#city-leaf-volume)" d="M-48 10q-12-1-13-10t10-13q-9-12-1-20 6-6 14-2-4-15 7-18 10-4 15 5 0-17 12-17 8-1 13 9 9-14 21-8 7 4 6 12 17-6 22 7 3 7-3 13 18 0 20 12 2 10-10 14 12 11 3 21-6 7-17 2 3 16-11 20-10 2-17-7-7 13-20 8-8-3-9-11-13 9-24-1-8-8-2-16-14 0-16-9-1-8 10-11Z"/>
        <path fill="url(#city-leaf-sunlit)" d="M-48-8q-12-12 2-20 1-13 13-9-2-16 10-15 11-3 12 8 5-18 18-12 9 3 5 12 14-11 24-1 8 8-2 14 17 1 14 14-2 6-11 7 10 10 0 16-10 8-17-5-5 15-16 10-7-2-9-13-8 13-20 7-8-5-2-14-18 1-14-12Z"/>
        <path fill="var(--foliage-dark)" opacity=".4" d="M-29 6q9-9 16 1t-1 13q-13 4-15-14Zm35 1q12-6 16 4t-11 10q-7-2-5-14Zm24 18q11-9 17-3t-4 12q-9 2-13-9ZM-5 34q10-8 15-2t-6 9Z"/>
        <path fill="var(--foliage)" opacity=".82" d="M-45-14q-14-2-12-12 12-3 14 8Zm36-25q-8-8-4-16 10 1 11 12ZM32-16q6-12 16-9 0 11-12 15Zm-3 35q10-8 16-4-1 9-13 9ZM-33 17q-12 0-13-8 10-5 16 4Z"/>
        <path fill="var(--foliage-light)" opacity=".69" d="M-42-32q-10-4-6-13 10 0 11 9ZM-27-44q-1-12 8-15 5 9-3 15ZM-10-30q-9-9-3-15 11 4 8 13ZM8-45q2-10 12-11 2 11-8 13ZM23-29q6-11 15-7-1 11-13 12ZM-48-5q-12-1-14-10 12-5 17 6ZM-26-17q-10-4-8-13 12-1 13 9ZM-3-10q-4-11 5-14 8 8-1 16ZM18-9q4-12 14-8 1 10-10 13ZM-18 8q-12-2-13-9 12-6 17 4Z"/>
        <path fill="var(--foliage-light)" opacity=".35" d="M-58 4q-7-4-5-10 9-1 11 6ZM-34 29q-7-7-2-12 8 3 8 11ZM9 25q1-9 10-10 5 8-7 12ZM41 3q4-11 11-7 1 9-8 11ZM-13-56q-7-6-2-10 8 2 7 8Z"/>
        <path fill="#f6eb9d" opacity=".12" d="M-39-34q-5-3-3-7 5 0 6 5ZM10-47q1-6 6-7 2 5-4 7ZM-25-20q-5-3-3-6 6-1 7 4Z"/>
      </g>
    </defs>

    <rect width="1672" height="941" fill="url(#city-sky)"/><rect y="260" width="1672" height="681" fill="url(#city-air)"/>
    <g className="city-star" fill="#edf1ff">{Array.from({length:43},(_,i)=><circle key={i} cx={71+(i*173)%1500} cy={24+(i*53)%405} r={i%7===0?1.6:.85} opacity={.38+i%4*.17}/>)}<path d="M658 57l2 3 3 1-3 1-2 3-1-3-3-1 3-1ZM1110 260l1 3 3 1-3 1-1 3-1-3-3-1 3-1Z"/></g>
    <g className="city-celestial-position">
    <g className="city-sun"><circle cx="420" cy="111" r="112" fill="url(#city-sun-halo)"/><circle cx="420" cy="111" r="46" fill="#fff0c2"/></g>
    <g className="city-moon"><circle cx="473" cy="119" r="102" fill="url(#city-moon-halo)"/><circle cx="473" cy="119" r="35" fill="#fff0ca"/><path d="M454 111q2-13 10-16m22 36 3-8m-24 19 8 1" stroke="#dbc9a8" strokeWidth="6" strokeLinecap="round" opacity=".12"/></g>
    </g>
    <g className="city-cloud-far" fill="var(--cloud)">
      <path d="M96 104q30-8 53 1l42 7-57-3ZM176 111q-1-13 13-11 8 0 12 8l25 5-49 1 72 4-28-8 40 8Z"/>
      <path d="M400 229l47-6q7-13 22-8 7-12 16-5l11 9 26 1q15-16 26-6 9-12 18-6l13 10 31 6q-6-13-16-12-3-15-20-10-5-19-20-18-23-3-30 15-16-7-29 6-24-8-35 12Z" opacity=".8"/>
      <path d="M564 343q57-13 88-9l57-8q20-15 34-4 16-23 32-7l30 6 89 8-187 4Z" opacity=".75"/>
      <path d="M771 134l51-9q4-9 16-5 7-17 17-10 7-7 15-2 11 11 34 11l-40 6-31 1ZM498 454l170-14 40 2-131 17Z" opacity=".55"/>
    </g>
    <g className="city-cloud-near">
      <path fill="var(--cloud)" d="M-40 205V83q14-31 39-35 37-12 57 24 10 17 1 30 26-3 27 22 25-2 27 22 15-32 40-23 22 6 23 31 27-8 33 22 22-5 24 18 18-3 25 15l49 15-122 4Z"/>
      <path fill="var(--cloud-shade)" d="M-37 208V114q15-25 35-17 7-28 30-10 5 16 22 17-7 11 4 24 22-1 27 20 19-12 31 9-14 10-9 21 24-5 32 18 17-8 28 9l47 14Z" opacity=".53"/>
      <path fill="var(--cloud)" d="M739 331l44-17q8-18 28-19-4-34 24-49 34-18 49 13 7-19 29-16 7-36 27-46 0-34 24-43 18-38 45-11 27-7 41 24 24-7 43 20 6-44 41-45 4-38 37-38 12-37 43-22 25-24 44-1 25-16 47 6 5-22 28-18 9-24 30-15 8-22 28-17 23 6 16 24 29-3 38 25 23-5 40 18l90 50v197Z"/>
      <path fill="var(--cloud-shade)" d="M758 330l48-15q4-18 27-15-9-31 15-34 15-2 22 18 14-25 37-13 13-43 35-26-12-40 17-39 8-33 30-29 22 5 18 28 22-17 38 5l35-9q1-41 28-32 10-25 30-11 14-26 33-15 19-18 34 3 23-5 29 14 24 1 26 19 30 4 28 25 30 1 34 25 24 5 22 22-7 20-36 24-29 16-80 14Q1007 351 758 330Z" opacity=".43"/>
      <path fill="var(--cloud)" opacity=".42" d="M525 366l133-15 196 3 116-9-132 18Z"/>
    </g>

    <g className="city-landscape">
    <g fill="var(--skyline-far)"><path d="M517 628v-55h17v-20h16v75h12v-40h21v-27h13v67h16v-84h15v-17h19v101h22v-58h17v-33h21v91h59v-25h17v-24h17v49h74v-59h19v-19h22v78h65v-75h19v-22h12v97h56v-70h18v-17h19v87Z"/><path d="M538 598h495v37H538" opacity=".4"/></g>
    <g fill="var(--skyline)">
      {skyline.map(([x,y,w,h],i)=><g key={i}><rect x={x} y={y} width={w} height={h}/><path d={`M${x+w*.14} ${y}v-${i%3===0?12:5}h${w*.7}v${i%3===0?12:5}`}/><rect x={x+2} y={y+5} width={w-4} height={h-7} fill="url(#city-distant-windows)" className="city-lights"/><path d={`M${x+w*.7} ${y+4}v${h-4}`} stroke="#dce6f5" opacity=".12"/></g>)}
      <g data-scene-anchor="tower"><path d="M833 630l5-166 3-43 9-6 3-31h4v-27h2v27h4l3 31 11 7 3 48 6 160Z"/><path d="M841 424l8-7 4 210h-17Z" fill="#dbe6f7" opacity=".09"/><path d="M843 435h27v180h-27Z" fill="url(#city-distant-windows)" className="city-lights"/><path className="city-lights" d="M858 358v53m-10 11 21-2" fill="none" stroke="#bce2ff" strokeWidth="1.5" strokeDasharray="3 5"/></g>
    </g>
    <rect x="501" y="634" width="576" height="106" fill="url(#city-water)"/>
    <g fill="none" stroke="var(--water-light)" opacity=".8"><path d="M521 659h62m17 6h111m35-8h38m80 4h82m-408 30h52m80-9h85m25 10h110m-313 22h91m78-2h101m-29-38h86m-417 39h19m228 19h72"/><path d="M537 674h17m87-17h38m-4 45h45m185 9h61m-403 10h57m164-39h67m87 13h44" strokeWidth="2"/></g>
    <g className="water-warm-reflection" stroke="#ffc66b" fill="none" strokeLinecap="round"><path d="M553 650h16m-22 8h29m58-6h21m-27 9h34m96-12h20m-25 10h31m63-9h15m-25 9h39m-206 16h15m-24 9h26m96-16h25m-33 9h41m58-4h19m-24 12h30m-197 10h15m92-4h30m-13 9h15m94-29h14" strokeWidth="3" opacity=".65"/><path d="M617 667h28m111 21h33m69 15h28m-312 4h26" strokeWidth="5" opacity=".22"/></g>
    <path fill="var(--skyline)" d="M505 624h556v9H505Zm6 8h68q48 4 54 24h-15q-14-16-40-16h-46v16h-12v-16h-9Zm138 0h78q43 4 45 24h-15q-12-15-42-16h-47v16h-12v-16h-7Zm139 0h81q41 4 46 24h-15q-13-15-43-16h-48v16h-13v-16h-8Zm139 0h89v9h-69v15h-13v-16h-7Z"/>
    <path d="M510 626h530" stroke="var(--trim)" opacity=".55" strokeWidth="2"/><path className="bridge-lights" d="M517 629h23m17 0h23m17 0h23m17 0h23m17 0h23m17 0h23m17 0h23m17 0h23m17 0h23m17 0h23m17 0h23m17 0h23m17 0h23" stroke="#ffce88" strokeWidth="2.5"/>
    <Tree x={516} y={741} scale={.66}/><Canopy x={514} y={737} scale={.48}/><Canopy x={923} y={725} scale={.57}/><Canopy x={1003} y={723} scale={.5}/>
    <path fill="var(--foliage-dark)" d="M508 739q42-22 91-6l18 9h278q17-17 54-11l42 14v14H501Z"/>

    <g data-scene-anchor="left-building">
      <path fill="var(--pale-shadow)" d="M0 180h112l81 67H0Z"/><path fill="var(--pale-light)" d="M110 194l84 59h-32l-51-41Z"/>
      <path fill="url(#city-facade)" d="M0 247h478v505H0Z"/><path fill="var(--pale-light)" d="M478 248l43 72v424l-43 8Z"/>
      <path fill="var(--pale-shadow)" d="M0 264h478v7H0ZM0 448h478v10H0Z" opacity=".4"/><path fill="var(--trim)" d="M0 246h478v13H0ZM478 246l45 79v9l-45-73Z"/>
      <path fill="var(--pale)" d="M0 196h112v51H0Z"/><path fill="var(--trim)" d="M0 180h112v16H0Z"/>
      <Window x={272} y={308} w={150} h={134} curtain/>
      <path fill="#2e3640" d="M490 331l8 14v108l-8-3Zm15 27 7 12v89l-7-3Z"/><path fill="var(--glass)" d="M492 340l4 8v94l-4-2Zm15 25 3 6v78l-3-2Z"/>
      <Storefront x={-14} y={546} w={456} h={198}/><path fill="var(--pale)" d="M127 543h16v201h-16ZM222 543h16v201h-16Z"/>
      <path fill="#263240" d="M0 489h453l-19 50H0Z"/><path fill="var(--awning)" d="M0 500h451l-17 39H0Z"/>
      <path fill="#192630" d="M0 539h435v12H0Z"/><path fill="var(--pale-shadow)" opacity=".5" d="M434 544l21-49v246h-13V550Z"/>
      <path fill="var(--pale-shadow)" d="M484 516l14 6v167l-14 9Z"/><path fill="var(--glass)" d="M488 529l6 2v150l-6 4Z"/><path fill="var(--pale-shadow)" opacity=".32" d="M0 742h474v13H0Z"/>
    </g>

    <g data-scene-anchor="right-building">
      <path fill="var(--brick-light)" d="M1022 244l62-127v631l-62-19Z"/><path fill="url(#city-brick)" d="M1084 132h374v616h-374Z"/><path fill="url(#city-brickwork)" d="M1084 152h374v591h-374Z"/>
      <path fill="var(--trim)" d="M1081 116h376v16h-376ZM1020 242l61-126v15l-61 129Z"/><path fill="var(--pale-shadow)" d="M1085 133h372v19h-372Z" opacity=".6"/>
      <path fill="var(--trim)" d="M1084 457h374v26h-374ZM1022 470l62-13v26l-62 14Z"/><path fill="var(--pale-shadow)" opacity=".2" d="M1085 484h372v10h-372Z"/>
      <Window x={1139} y={230} w={107} h={176} warm={1}/><Window x={1307} y={230} w={106} h={176} warm={2}/>
      <path fill="var(--trim)" d="M1129 207h129v16h-129Zm166 0h131v16h-131Z"/>
      <path fill="#26313b" d="M1042 283l10-20v162l-10 8ZM1063 240l11-22v204l-11 3Z"/><path fill="var(--glass)" d="M1045 287l4-9v143l-4 3ZM1066 244l5-11v183l-5 3Z"/>
      <path fill="#332d29" d="M1032 528l17-5v185l-17-3ZM1057 520l17-5v201l-17-5Z"/><path fill="var(--glass)" d="M1036 531l9-3v173l-9-1ZM1061 523l9-3v189l-9-2Z"/>
      <Storefront x={1123} y={549} w={295} h={199} variant={1}/><path fill="var(--trim)" d="M1096 487h17v261h-17Z"/>
      <path fill="var(--awning)" d="M1111 490h324l-13 53h-298Z"/><path fill="var(--pale-light)" d="M1112 491l38 42h281l5-42Z" opacity=".55"/><path fill="#28313d" d="M1122 542h304v14h-304Z"/><path fill="var(--pale-shadow)" d="M1418 555h22v192h-22Z" opacity=".45"/>
    </g>
    <g>
      <path fill="var(--pale)" d="M1463 120h42V0h167v751h-209Z"/><path fill="url(#city-stonework)" d="M1463 120h42V0h167v751h-209Z"/><path fill="var(--pale-light)" d="M1498 27l29-27h13l-32 34v85h-10Z"/><path fill="var(--trim)" d="M1464 117h65v12h-65Z"/>
      <Window x={1596} y={34} w={115} h={136} warm={3}/><Window x={1523} y={263} w={126} h={179} warm={2}/><Storefront x={1487} y={548} w={200} h={202} variant={2}/>
      <path d="M1470 171h202M1490 120v51m30-51v51m30-51v51m30-51v51m30-51v51m30-51v51" fill="none" stroke="#293736" strokeWidth="4"/>
      <Canopy x={1471} y={108} scale={.49}/><Canopy x={1573} y={166} scale={.35}/><use href="#city-leaf-cluster" transform="translate(1577 201) scale(.27 .5)"/><use href="#city-leaf-cluster" transform="translate(1586 236) scale(.17 .34)"/>
    </g>

    <path fill="url(#city-paving)" d="M0 749l498-6h550l624 10v63H0Z"/><path fill="url(#city-road)" d="M0 816h1672v125H0Z"/>
    <g className="day-shadows" fill="#22314c" opacity=".28"><path d="M475 746l424 167h671l-550-166Z"/><path d="M983 751l248 57h43l-285-57Z"/><path d="M69 784l308 129h98L75 778Z"/><path d="M1572 784l100 82v45l-106-122Z"/><path transform="translate(240 846) skewX(55) scale(2.1 .45)" d="M-90 0q-15-12-2-24 9-8 20-2-7-20 11-26 12-5 20 7 5-21 22-17 11 2 14 13 15-19 31-9 10 7 6 19 22-8 30 9 4 11-7 19 24 5 20 24-3 12-19 11 11 17-5 29-12 8-24-3-6 22-25 18-13-3-15-16-19 15-34 1-9-9-3-21-22 1-24-14-1-11 14-17Z"/><path transform="translate(489 914) skewX(55) scale(2.8 .35)" d="M-70 0q-16-8-9-22 6-10 19-5-4-21 12-25 13-2 16 12 11-18 25-10 8 5 5 15 22-11 31 5 5 10-5 18 21 1 23 16 1 10-12 15 15 16-1 25-10 6-19-4-3 19-19 19-13-1-16-14-14 12-27 3-10-8-4-17-20 0-20-14 0-10 11-17Z"/></g>
    <g className="light-pool"><ellipse cx="978" cy="768" rx="158" ry="40" fill="url(#city-ground-light)"/><ellipse cx="1232" cy="767" rx="197" ry="43" fill="url(#city-ground-light)"/><ellipse cx="246" cy="763" rx="214" ry="43" fill="url(#city-ground-light)"/><ellipse cx="987" cy="850" rx="54" ry="20" fill="url(#city-ground-light)" opacity=".3"/></g>
    <g fill="none" stroke="var(--pale-shadow)" strokeWidth="1.5" opacity=".43"><path d="M0 775h1672M0 806h1672M160 750l-49 56m241-57-27 57m255-62-75 62m246-62 5 62m212-62 70 62m184-57 83 57m159-55 106 55"/></g>
    <path fill="var(--pale-shadow)" d="M0 809h1672v16H0Z"/><path d="M0 809h1672" stroke="var(--trim)" strokeWidth="3"/><path d="M0 823h1672" stroke="#171f31" strokeWidth="3" opacity=".45"/>
    <path d="M0 817h1672M72 810v13m91-13v13m92-13v13m92-13v13m92-13v13m92-13v13m92-13v13m92-13v13m92-13v13m92-13v13m92-13v13m92-13v13m92-13v13m92-13v13m92-13v13m92-13v13m92-13v13" stroke="#e9d9c5" strokeWidth="1" opacity=".12"/>
    <path d="M0 896h263m133 0h269m103 0h151m193 0h391m97 0h72" stroke="var(--trim)" strokeWidth="5" opacity=".31"/>

    <g fill="none" stroke="#253633"><path d="M512 682h449M519 691h437" strokeWidth="4"/><path d="M529 683v51m13-51v54m13-54v57m13-57v59m13-59v59m13-59v59m13-59v59m13-59v59m13-59v59m13-59v59m13-59v59m13-59v59m13-59v59m13-59v59m13-59v59m13-59v59m13-59v59m13-59v59m13-59v59m13-59v59m13-59v59m13-59v59m13-59v59m13-59v57m13-57v55m13-55v52m13-52v50m13-50v47m13-47v43m13-43v42m13-42v40m13-40v39" strokeWidth="1.6"/><path d="M530 680v59m161-59v63m158-63v60m103-60v49" strokeWidth="5"/></g>
    <g transform="translate(604 705)"><path d="M2 22h107M8 18 3 41m99-23 8 23M8 7 6 30m95-23 3 23" stroke="#2b352d" strokeWidth="4" fill="none"/><path fill="#715844" d="M0 0h110v5H0Zm0 7h110v5H0Zm0 7h110v5H0Zm-4 10h119v6H-4Z"/><path d="M1 1h108M1 8h108M1 15h108M-3 25h116" stroke="#c09a6b" strokeWidth="1.5" opacity=".55"/></g>
    <g transform="translate(983 0)"><ellipse className="lamp-glow" cx="0" cy="490" rx="77" ry="83" fill="url(#city-lamp-halo)"/>
      <path fill="#293237" d="M-16 752h32l-3-10H-13ZM-10 742h20l-4-29H-6ZM-5 718H5l-1-190h-8ZM-8 528h16v-8H-8ZM-6 520H6l4-12H-10Z"/>
      <path d="M-2 539v176m-4 13h4" fill="none" stroke="#b1a18c" strokeWidth="1.6" opacity=".55"/><path fill="var(--trim)" d="M-13 478h26l-5 27H-8Z"/><path className="lamp-bulb" fill="#d9d6c5" d="M-12 479h24l-4 25H-8Z"/>
      <path d="M-14 477h28l-5 29H-9ZM-1 479v27" fill="none" stroke="#2a3337" strokeWidth="3"/><path fill="#2a3337" d="M-19 477h38l-5-7-11-7H-3l-11 7Z"/><circle cy="460" r="4" fill="#303b40"/><path d="M-14 472h28" stroke="#b0a28b" opacity=".5"/>
    </g>
    <g><path fill="#3b4650" d="M397 712h38l-5 40h-28Z"/><path fill="var(--foliage-dark)" d="M414 716l-4-78 4-9 3 37 8-25 8-2-9 31 10-9 9 3-20 18 5 19-12 15Z"/><use href="#city-leaf-cluster" transform="translate(416 665) scale(.24 .42)"/></g>
    <g><path fill="var(--pale-shadow)" d="M1284 716h34l-5 37h-24Z"/><use href="#city-leaf-cluster" transform="translate(1302 691) scale(.37 .4)"/><path d="M1301 717v-39" stroke="var(--trunk)" strokeWidth="3"/></g>
    <path fill="#34424c" d="M1484 722h183v32h-183Z"/><Canopy x={1521} y={719} scale={.26}/><Canopy x={1610} y={721} scale={.3}/>
    <Tree x={69} y={788} scale={1.25}/><Tree x={1574} y={789} scale={1.08}/>
    <g fill="var(--pale-shadow)"><path d="M14 786l83-9 39 8v13H14Z"/><path d="M1528 788l74-9 28 9v14h-102Z"/></g>
    <g fill="var(--foliage-dark)"><path d="M23 786l9-13 8 8 5-14 9 13 11-11 8 11 11-14 9 14 12-6 14 13Z"/><path d="M1538 788l8-11 7 7 7-16 8 14 8-9 8 12 11-13 9 14 11-8 5 10Z"/></g>
    <path d="M14 787h122m1392 2h102" stroke="var(--trim)" strokeWidth="3" opacity=".75"/>
    </g>
  </svg></div>
}

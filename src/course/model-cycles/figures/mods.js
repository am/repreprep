import { svgFig, T } from "../../shared/html.js";

/* ---- Modded Cycles: drawings for the custom-firmware lessons ---- */
export const MOD_FIGS = (()=>{
  const P=pts=>"M"+pts.map(([x,y])=>`${x.toFixed(1)} ${y.toFixed(1)}`).join(" L");
  const stroke=(c,w=3)=>`style="fill:none;stroke:${c};stroke-width:${w};stroke-linejoin:round;stroke-linecap:round"`;
  const box=(x,y,w,h,extra="")=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12" class="box" ${extra}/>`;
  const fill=(x,y,w,h,c,rx=8)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" style="fill:${c};stroke:var(--line)"/>`;
  const arrow=(x1,y1,x2,y2)=>`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="ln"/><path d="M${x2} ${y2} l-9 -5 v10 z" style="fill:var(--faint)" transform="rotate(${Math.atan2(y2-y1,x2-x1)*180/Math.PI} ${x2} ${y2})"/>`;
  /* sawtooth or square from x over width w, centred on y */
  const saw=(x,y,w,a,n)=>{const pts=[];for(let c=0;c<n;c++){const x0=x+w*c/n,x1=x+w*(c+1)/n;pts.push([x0,y-a],[x1,y+a]);if(c<n-1)pts.push([x1,y-a]);}return P(pts);};
  const sq=(x,y,w,a,n)=>{const pts=[];for(let c=0;c<n;c++){const x0=x+w*c/n,x1=x+w*(c+1)/n,m=(x0+x1)/2;pts.push([x0,y-a],[m,y-a],[m,y+a],[x1,y+a]);}pts.push([x+w,y-a]);return P(pts);};
  const sine=(x,y,w,a,n,N=160)=>{const pts=[];for(let i=0;i<=N;i++){const t=i/N;pts.push([x+w*t,y-a*Math.sin(2*Math.PI*n*t)]);}return P(pts);};
  /* a decaying burst: noise-like zigzag inside an exponential envelope */
  const rnd=[.9,-.6,.75,-1,.5,-.8,.95,-.4,.7,-.85,.3,-.65,.8,-.5,.6,-.9];
  const burst=(x,y,w,a,k=4,N=40)=>{const pts=[];for(let i=0;i<=N;i++){const t=i/N;pts.push([x+w*t,y-a*Math.exp(-k*t)*rnd[i%rnd.length]]);}return P(pts);};

  return {
  /* ACID */
  m303(){
    let s=T(400,34,"Inside a TB-303, and where ACID puts it","fh");
    [["Oscillator",40,"saw or square","PUNCH: saw / square"],["Filter",305,"low-pass + resonance","COLOR cutoff · SHAPE res"],["Amp",570,"note on, note off","CONTOUR: drive"]]
      .forEach(([h,x,a,b])=>{s+=box(x,56,190,150)+T(x+95,82,h,"fl")+T(x+95,166,a,"fs")+T(x+95,192,b,"fm");});
    s+=`<path d="${saw(75,124,120,20,3)}" ${stroke("var(--led)")}/>`;
    s+=`<path d="M330 112 L392 112 Q412 112 418 90 Q424 112 436 140 L446 150" ${stroke("var(--turn)")}/>`;
    s+=`<path d="M600 145 L607 102 L730 102 L738 145" ${stroke("var(--done)")}/>`;
    s+=arrow(232,124,303,124)+arrow(497,124,568,124);
    s+=box(230,234,340,80)+`<path d="${P([[255,298],[259,252],...Array.from({length:24},(_,i)=>[259+i*3.2,298-46*Math.exp(-i/6)])])}" ${stroke("var(--hold)")}/>`;
    s+=T(450,258,"Envelope","fl")+T(450,280,"opens the filter, then falls","fs")+T(450,302,"SWEEP env mod · DECAY time","fm");
    s+=arrow(400,232,400,209);
    s+=T(400,344,"Each step of the 303's sequencer also stores two switches:","fm");
    s+=fill(150,356,230,36,"var(--hold-soft)")+T(265,379,"Accent: louder and brighter","fm");
    s+=fill(420,356,230,36,"var(--turn-soft)")+T(535,379,"Slide: glide into the next note","fm");
    s+=T(400,412,"The acid sound is mostly one hand on cutoff and resonance while the line repeats.","fs");
    return svgFig("0 0 800 420",s,"The TB-303 signal path: oscillator, resonant filter and amp, with an envelope opening the filter, and the ACID knob for each");
  },
  mslide(){
    let s=T(400,34,"Two notes, retriggered or slid","fh");
    const Y=v=>v,step=56,x0=140;
    const grid=y=>{let g="";for(let i=0;i<=3;i++)g+=`<line x1="${x0+i*step}" y1="${y-60}" x2="${x0+i*step}" y2="${y+18}" class="grid"/>`;return g;};
    // retriggered
    s+=T(x0-14,90,"Normal","fl","end")+T(x0-14,110,"LEN 1","fs","end")+grid(120);
    s+=fill(x0+2,62,step-6,18,"var(--done)",5)+fill(x0+step+2,92,step-6,18,"var(--done)",5);
    s+=T(x0+step*2+20,90,"each note stops, the next starts with a new attack","fm","start");
    // slide
    s+=T(x0-14,240,"Slide","fl","end")+T(x0-14,260,"LEN 2","fs","end")+grid(270);
    s+=fill(x0+2,212,step*2-6,18,"var(--turn)",5)+fill(x0+step+2,242,step-6,18,"var(--done)",5);
    s+=`<path d="M${x0+step-4} 221 C${x0+step+14} 221 ${x0+step+10} 251 ${x0+step+30} 251" ${stroke("var(--hold)",3)}/>`;
    s+=T(x0+step*2+20,240,"the first note is still held when the second arrives:","fm","start")+T(x0+step*2+20,262,"no new attack, the pitch glides up","fm","start");
    s+=T(400,345,"Make a trig longer than the gap to the next trig, with GATE on, and ACID slides.","fb");
    s+=T(400,375,"Slide on a few notes only. On every note it turns into one long smear.","fs");
    return svgFig("0 0 800 420",s,"Two notes played normally and with a slide, where the first note overlaps the second");
  },
  /* MACRO */
  mbraids(){
    let s=T(400,34,"A macro oscillator: one knob picks the model","fh");
    const fam=[["0–8","classic waves","CSAW, SYNC…","var(--led-soft)"],["9–16","stacks","SAW SWARM, TOY","var(--turn-soft)"],["17–24","filters, vowels","VOSIM, VOWEL","var(--hold-soft)"],["25–27","FM","FM, FEEDBACK FM","var(--done-soft)"],
      ["28–33","physical models","PLUCKED, BELL","var(--led-soft)"],["34–36","drums","KICK, CYMBAL, SNARE","var(--turn-soft)"],["37–40","wavetables","WAVETABLES…","var(--hold-soft)"],["41–46","noise, grains","GRANULAR CLOUD","var(--done-soft)"]];
    fam.forEach(([n,h,ex,c],i)=>{const col=i%4,row=Math.floor(i/4),x=24+col*192,y=60+row*110;
      s+=fill(x,y,180,96,c,12)+T(x+90,y+28,n,"fs")+T(x+90,y+54,h,"fl")+T(x+90,y+80,ex,"fs");});
    s+=T(400,300,"SHAPE: model (0–46)","fl");
    s+=T(140,340,"COLOR: Timbre","fm")+T(400,340,"SWEEP: Color","fm")+T(660,340,"CONTOUR: envelope on Timbre","fm");
    s+=T(400,378,"Timbre and Color do whatever matters most for the model you picked.","fb");
    s+=T(400,404,"So: pick a model, then explore it with two knobs and your ears.","fs");
    return svgFig("0 0 800 420",s,"The 47 MACRO models in eight families, picked with SHAPE");
  },
  /* Syntakt drums */
  mclap(){
    let s=T(400,34,"A snare and a clap, taken apart","fh");
    s+=box(30,60,350,250)+T(205,88,"Snare: a body plus wires","fl");
    s+=`<path d="${sine(55,160,300,34,5)}" ${stroke("var(--done)")}/>`+T(205,212,"body: a short tone, the drum shell","fs");
    s+=`<path d="${burst(55,250,300,26,3.5,60)}" ${stroke("var(--turn)",2)}/>`+T(205,295,"noise: the snare wires","fs");
    s+=box(420,60,350,250)+T(595,88,"Clap: hands that don't land together","fl");
    [0,26,52].forEach(d=>s+=`<path d="${burst(450+d,170,22,40,1,8)}" ${stroke("var(--hold)",2)}/>`);
    s+=`<path d="${burst(528,170,215,40,3.2,46)}" ${stroke("var(--hold)",2)}/>`;
    s+=`<path d="M452 222 h26 M478 222 h26" class="ln"/>`+T(478,242,"spacing","fs");
    s+=T(640,232,"a longer tail: the room","fs");
    s+=T(595,290,"a few short bursts, then one longer one","fs");
    s+=T(400,350,"SD VINTAGE: COLOR inharmonicity, SHAPE complexity, SWEEP pitch drop, CONTOUR mod envelope.","fm");
    s+=T(400,374,"CP VINTAGE: COLOR body character, SHAPE balance, SWEEP spacing, CONTOUR body envelope.","fm");
    s+=T(400,404,"Drawn from how classic drum machines build these sounds, not from the Syntakt's code.","fs");
    return svgFig("0 0 800 420",s,"A snare as tone plus noise, and a clap as several short noise bursts with a tail");
  },
  /* Syntakt synths */
  msynths(){
    let s=T(400,34,"Three Syntakt synth voices","fh");
    const cols=[["SY TOY",30,"a struck object","FORM · IMPACT","BRIGHT · PARTIAL DECAY"],["SY BITS",285,"chip-style waves","DETUNE · BALANCE","RATE REDUX · WAVEFORM"],["SY SWARM",540,"a stack of saws","NOISE MOD · DETUNE ANIM","DETUNE · OSC MIX"]];
    cols.forEach(([h,x,a,b,c])=>{s+=box(x,60,230,290)+T(x+115,90,h,"fl")+T(x+115,112,a,"fs")+T(x+115,318,b,"fs")+T(x+115,336,c,"fs");});
    // toy: partials decaying at different speeds
    [[150,.9,2.5],[190,.6,5],[230,.4,9]].forEach(([y,a,k],i)=>{const pts=[];for(let j=0;j<=50;j++){const t=j/50;pts.push([55+180*t,y-26*a*Math.exp(-k*t)*Math.sin(2*Math.PI*(4+i*3)*t)]);}s+=`<path d="${P(pts)}" ${stroke(["var(--done)","var(--turn)","var(--hold)"][i],2)}/>`;});
    s+=T(145,268,"high partials die first","fm")+T(145,290,"like a bell or a toy piano","fm");
    // bits: a stepped square and a stepped triangle
    s+=`<path d="${sq(305,150,190,22,4)}" ${stroke("var(--led)",2)}/>`;
    const tri=[];for(let j=0;j<=24;j++){const t=j/24,v=Math.round((1-Math.abs(((t*3)%1)*2-1))*4)/4;tri.push([305+190*t,224-44*v+22],[305+190*(t+1/24),224-44*v+22]);}
    s+=`<path d="${P(tri.slice(0,-1))}" ${stroke("var(--turn)",2)}/>`;
    s+=T(400,268,"square, triangle and noise in steps","fm")+T(400,290,"like early game consoles","fm");
    // swarm: detuned saws
    [0,6,12].forEach((d,i)=>s+=`<path d="${saw(560+d,140+i*28,178,12,4)}" ${stroke(["var(--turn)","var(--done)","var(--hold)"][i],2)}/>`);
    s+=`<path d="${sine(560,236,190,10,1)}" ${stroke("var(--led)",2)}/>`+T(568,258,"sub","fs","start");
    s+=T(655,268,"saws slightly out of tune","fm")+T(655,290,"plus a sub two octaves down","fm");
    s+=T(400,384,"Same Model:Cycles knobs, three new ways to make a tone.","fb");
    s+=T(400,408,"The labels follow the Syntakt's own parameter names.","fs");
    return svgFig("0 0 800 420",s,"SY TOY as decaying partials, SY BITS as stepped chip waves, SY SWARM as detuned saws");
  },
  /* Chord Keys */
  mdegrees(){
    let s=T(400,34,"Chord Keys in A minor: one key, one chord","fh");
    const ch=["Am7","Bm7♭5","Cmaj7","Dm7","Em7","Fmaj7","G7"],rn=["i","ii°","III","iv","v","VI","VII"];
    const x0=24,st=47,kw=42;
    for(let i=1;i<=16;i++){const d=(i-1)%7,x=x0+(i-1)*st,yours=[1,4,5,6].includes(i);
      s+=fill(x,80,kw,kw,yours?"var(--turn)":"var(--surface-2)",7)+T(x+kw/2,106,i,yours?"fbar":"fm");
      s+=T(x+kw/2,146,rn[d],"fs")+T(x+kw/2,166,ch[d],"fs");}
    s+=`<path d="M${x0} 186 h${st*7-6}" class="ln"/>`+T(x0+st*3.5,206,"keys 1–7: root octave","fs");
    s+=`<path d="M${x0+st*7} 186 h${st*7-6}" class="ln"/>`+T(x0+st*10.5,206,"keys 8–14: one octave up","fs");
    s+=`<path d="M${x0+st*14} 186 h${st*2-6}" class="ln"/>`+T(x0+st*15,206,"15–16","fs");
    s+=T(400,250,"Your chords from lesson 11, now under one finger each:","fb");
    [["Am7","key 1"],["Fmaj7","key 6"],["Dm7","key 4"],["Em7","key 5"]].forEach(([c,k],i)=>{const x=130+i*140;s+=fill(x,268,120,56,i?"var(--surface-2)":"var(--led-soft)",10)+T(x+60,292,c,"fl")+T(x+60,312,k,"fs");});
    s+=T(400,362,"The scale decides each chord's quality. You only pick the degree.","fb");
    s+=T(400,392,"Settings: Root A, Scale MINOR, extension 7 on every degree.","fs");
    return svgFig("0 0 800 420",s,"The 16 trig keys mapped to the seven chords of A minor, with keys 1, 4, 5 and 6 marked");
  },
  /* Sampler */
  mslice(){
    let s=T(400,34,"Slicing: one loop becomes 8 sounds","fh");
    const x0=60,w=680,y=130,n=8,sw=w/n;
    const hits=[[0,1],[1,.4],[2,.8],[3,.4],[4,1],[5,.4],[6,.8],[7,.5]];
    hits.forEach(([i,a])=>s+=`<path d="${burst(x0+i*sw+4,y,sw-10,48*a,4,30)}" ${stroke("var(--turn)",2)}/>`);
    for(let i=0;i<=n;i++)s+=`<line x1="${x0+i*sw}" y1="${y-62}" x2="${x0+i*sw}" y2="${y+62}" class="${i%n?"mark":"ln"}"/>`;
    for(let i=0;i<n;i++)s+=T(x0+i*sw+sw/2,y+84,i+1,"fl");
    s+=T(400,y+112,"Slice mode cuts the sample at each hit (TRN) or into equal parts (EQL).","fb");
    s+=T(400,276,"On the sequencer, each trig's NOTE picks a slice:","fm");
    const order=[1,2,3,2,5,6,7,1];
    order.forEach((sl,i)=>{const x=x0+i*sw+8;s+=fill(x,292,sw-16,46,sl===[1,2,3,4,5,6,7,8][i]?"var(--surface-2)":"var(--hold-soft)",8)+T(x+(sw-16)/2,321,sl,"fl");});
    s+=T(400,372,"Same sound, new order. Highlighted steps play a different slice than before.","fs");
    s+=T(400,398,"This is how producers chop breaks: rearrange the pieces into a new groove.","fs");
    return svgFig("0 0 800 420",s,"A drum loop cut into eight slices, then replayed in a new order");
  },
  mtextures(){
    let s=T(400,34,"Four ways to read the same sample","fh");
    const cells=[["Granular",30,60,"tiny overlapping grains","POSITION · GRAIN SIZE · DENSITY · SPRAY"],["Stretch",410,60,"grains with a moving playhead","SPEED · GRAIN SIZE · DENSITY · SPRAY"],["Pluck",30,230,"the sample strikes a string","STRIKE POS · STRIKE LEN · TONE · FEEDBACK"],["Wave",410,230,"the sample as a wavetable","WAVE POS · FRAME SIZE · SMOOTH · DETUNE"]];
    cells.forEach(([h,x,y,a,b])=>{s+=box(x,y,360,160)+T(x+180,y+26,h,"fl")+T(x+180,y+44,a,"fs")+T(x+180,y+150,b,"fs");});
    // granular: little windowed grains scattered
    [[70,150],[110,136],[150,158],[175,144],[215,152],[250,138],[290,156]].forEach(([x,y],i)=>s+=`<path d="${sine(x,y,30,9*Math.sin(Math.PI*.5),3)}" ${stroke(i%2?"var(--turn)":"var(--hold)",2)}/>`);
    s+=`<line x1="190" y1="122" x2="190" y2="180" class="mark"/>`+T(196,190,"position","fs","start");
    // stretch: playhead moving slowly
    s+=`<path d="${burst(440,145,300,24,1.2,60)}" ${stroke("var(--faint)",1.5)}/>`;
    [470,520,570].forEach((x,i)=>s+=`<line x1="${x}" y1="118" x2="${x}" y2="172" style="stroke:var(--turn);stroke-width:2;opacity:${.4+i*.3}"/>`);
    s+=arrow(580,186,660,186)+T(700,190,"speed","fs");
    // pluck: burst into a feedback loop
    s+=`<path d="${burst(60,300,60,22,1,12)}" ${stroke("var(--hold)",2)}/>`+arrow(126,300,160,300);
    s+=fill(162,280,90,40,"var(--surface)",8)+T(207,305,"delay","fs");
    s+=`<path d="M252 300 H300 V340 H140 V312" class="ln"/>`+T(220,356,"feedback: a ringing string","fs");
    s+=`<path d="${sine(300,300,60,16,4)}" ${stroke("var(--done)",2)}/>`;
    // wave: frames stacked in depth
    for(let i=0;i<5;i++)s+=`<path d="${sine(470+i*16,350-i*9,170,10-i,1+i*.5)}" ${stroke(i===2?"var(--turn)":"var(--faint)",i===2?2.5:1.2)}/>`;
    s+=T(750,302,"wave pos","fs","end");
    s+=T(400,410,"Switch modes with [SETTINGS] + [MACHINES] on a Sampler track.","fs");
    return svgFig("0 0 800 420",s,"Granular, stretch, pluck and wave: four ways the Sampler can play one sample");
  },
  /* master FX page */
  mpump(){
    let s=T(400,34,"Pump: the kick pushes everything else down","fh");
    const x0=70,w=660,beat=w/4;
    for(let b=0;b<4;b++){const x=x0+b*beat;s+=`<rect x="${x}" y="76" width="16" height="40" rx="4" style="fill:var(--led)"/>`;}
    s+=T(x0-12,102,"kick","fs","end");
    const pts=[];for(let b=0;b<4;b++){const x=x0+b*beat;pts.push([x,170]);pts.push([x+2,250]);for(let i=1;i<=24;i++){const t=i/24;pts.push([x+2+t*(beat-4),250-80*(1-Math.exp(-4.2*t))]);}}
    s+=`<path d="${P(pts)}" ${stroke("var(--turn)")}/>`+T(x0-12,218,"the rest","fs","end");
    s+=`<line x1="${x0}" y1="170" x2="${x0+w}" y2="170" class="ln2"/>`+T(x0+w+6,174,"full","fs","start");
    s+=`<path d="M${x0+4} 270 h${beat*.33}" class="ln"/>`+T(x0+4+beat*.17,290,"~170 ms back up","fs");
    s+=T(400,334,"The kick's pad is turned off on the FX page: it plays clean and drives the pump.","fb");
    s+=T(400,362,"The lit tracks dip on every kick and swell back between them.","fm");
    s+=T(400,392,"Depth is knob 4, SHAPE. A little reads as groove; a lot reads as an effect.","fs");
    return svgFig("0 0 800 420",s,"The level of the other tracks dipping on every kick and recovering");
  },
  /* arpeggiator */
  marp(){
    let s=T(400,34,"Hold A, C and E: the arpeggiator plays them in turn","fh");
    const rows=[["UP",[0,1,2,0,1,2,0,1]],["DOWN",[2,1,0,2,1,0,2,1]],["UPDN",[0,1,2,1,0,1,2,1]],["UP, OCT 2",[0,1,2,3,4,5,0,1]]];
    const names=["A","C","E","A","C","E"],x0=170,st=70;
    rows.forEach(([lab,seq],r)=>{const y=70+r*80,base=y+60;s+=T(x0-24,y+38,lab,"fl","end");
      for(let i=0;i<8;i++){const v=seq[i],cy=base-v*10-4,x=x0+i*st;s+=`<line x1="${x}" y1="${y}" x2="${x}" y2="${base}" class="grid"/>`+`<rect x="${x+4}" y="${cy-8}" width="${st-12}" height="14" rx="4" style="fill:${v>2?"var(--hold)":["var(--led)","var(--turn)","var(--done)"][v]}"/>`+T(x+st/2-2,cy+4,names[v],"fbar");}});
    s+=T(400,404,"RTE sets how fast it steps. Every note lands on its own sequencer step when you record it.","fs");
    return svgFig("0 0 800 420",s,"An A minor chord arpeggiated up, down, up and down, and up over two octaves");
  },
  /* per-track filter */
  mfilter(){
    let s=T(400,34,"One knob, two filters: low-pass left, high-pass right","fh");
    const panel=(x,title,kind,label)=>{let g=box(x,60,230,200)+T(x+115,86,title,"fl")+T(x+115,250,label,"fs");
      const y0=110,y1=220,xa=x+20,xb=x+210,xc=x+115;
      g+=`<line x1="${xa}" y1="${y1}" x2="${xb}" y2="${y1}" class="ln"/>`+T(xa,y1+14,"low","fs","start")+T(xb,y1+14,"high","fs","end");
      if(kind==="lp")g+=`<path d="M${xa} 140 L${xc-30} 140 Q${xc-12} 140 ${xc-6} 118 Q${xc} 140 ${xc+16} 180 L${xc+44} ${y1}" ${stroke("var(--turn)")}/>`;
      if(kind==="off")g+=`<path d="M${xa} 140 L${xb} 140" ${stroke("var(--faint)")}/>`;
      if(kind==="hp")g+=`<path d="M${xb} 140 L${xc+30} 140 Q${xc+12} 140 ${xc+6} 118 Q${xc} 140 ${xc-16} 180 L${xc-44} ${y1}" ${stroke("var(--hold)")}/>`;
      return g;};
    s+=panel(30,"L: low-pass","lp","keeps the lows: darker")+panel(285,"OFF (centre)","off","everything passes")+panel(540,"H: high-pass","hp","keeps the highs: thinner");
    s+=T(400,300,"Hold MACHINES and turn:","fb");
    s+=T(400,330,"SWEEP cutoff · CONTOUR resonance · COLOR envelope amount · SHAPE envelope decay","fm");
    s+=T(400,362,"A 2-pole filter: a gentle 12 dB per octave slope, so it shapes rather than chops.","fm");
    s+=T(400,394,"Let go of MACHINES and the knobs are the machine's again.","fs");
    return svgFig("0 0 800 420",s,"A low-pass curve, an open filter and a high-pass curve, with the knobs that set them");
  },
  /* LFO 2, 3, 4 */
  mlfos(){
    let s=T(400,34,"Two LFOs on one knob: slow sweep plus fast wobble","fh");
    const x0=90,w=620;
    const row=(y,lab,f,c,a=26)=>{const pts=[];for(let i=0;i<=300;i++){const t=i/300;pts.push([x0+w*t,y-f(t)*a]);}return T(x0-14,y+4,lab,"fs","end")+`<line x1="${x0}" y1="${y}" x2="${x0+w}" y2="${y}" class="grid"/>`+`<path d="${P(pts)}" ${stroke(c,2.5)}/>`;};
    const slow=t=>Math.sin(2*Math.PI*t),fast=t=>Math.sin(2*Math.PI*12*t);
    s+=row(100,"LFO 1",slow,"var(--turn)")+row(185,"LFO 2",t=>.5*fast(t),"var(--hold)")+row(285,"together",t=>slow(t)+.4*fast(t),"var(--done)",28);
    s+=T(400,350,"Each LFO has its own wave, speed and depth. Their movements add up on the knob.","fb");
    s+=T(400,378,"LFO 2 is saved with the sound and can be locked per step; LFO 3 and 4 are for live play.","fm");
    s+=T(400,404,"On the LFO page, press LFO again to reach LFO 2, 3 and 4.","fs");
    return svgFig("0 0 800 420",s,"A slow LFO, a fast LFO, and the two combined on one destination");
  },
  /* six-channel USB audio */
  mstems(){
    let s=T(400,34,"Six tracks, six channels into Live","fh");
    const names=["T1 kick","T2 snare","T3 hats","T4 perc","T5 bass","T6 chords"],cols=["var(--led)","var(--hold)","var(--turn)","var(--done)","var(--led)","var(--turn)"];
    names.forEach((n,i)=>{const y=62+i*44;s+=fill(85,y,150,34,"var(--surface-2)",8)+T(160,y+22,n,"fm");
      s+=arrow(241,y+17,465,y+17)+T(353,y+11,"USB input "+(i+1),"fs");
      s+=fill(471,y,200,34,"var(--surface)",8)+`<rect x="471" y="${y}" width="8" height="34" rx="3" style="fill:${cols[i]}"/>`+T(575,y+22,"Live audio track "+(i+1),"fm");});
    s+=T(400,356,"Each channel is the dry track, before pan, delay and reverb.","fb");
    s+=T(400,384,"Rebuild the space in Live with return tracks, then mix the six faders.","fm");
    s+=T(400,408,"48 kHz, one mono channel per track. The stereo mix is no longer sent over USB.","fs");
    return svgFig("0 0 800 420",s,"Six Model:Cycles tracks sent as six USB channels into six Live audio tracks");
  },
  /* MIDI to the MicroFreak */
  mmidi(){
    let s=T(400,34,"OUT, THRU, and THRU with the mod","fh");
    const dev=(x,y,n,c="var(--surface-2)")=>fill(x,y,150,46,c,10)+T(x+75,y+29,n,"fl");
    const rows=[["OUT (stock)",80,null,"the Cycles' notes and clock go out"],["THRU (stock)",180,"keyboard","only the keyboard's notes pass through"],["THRU + mod",280,"keyboard","the keyboard's notes and the Cycles' own"]];
    rows.forEach(([lab,y,src,note])=>{s+=T(30,y+28,lab,"fm","start");
      if(src)s+=dev(140,y,src,"var(--surface)")+arrow(292,y+23,335,y+23);
      s+=dev(340,y,"Model:Cycles","var(--turn-soft)")+arrow(492,y+23,565,y+23)+dev(570,y,"MicroFreak","var(--hold-soft)");
      s+=T(720,y+66,note,"fs","end");});
    s+=T(400,392,"Each Cycles track that sends MIDI needs MOUT on and its own channel.","fb");
    return svgFig("0 0 800 420",s,"Three MIDI chains: the Cycles alone, a keyboard passed through, and both with the mod");
  },
  /* tempo past 300 BPM */
  mpitch(){
    let s=T(400,34,"Speed up a rhythm and it turns into a tone","fh");
    const rows=[[90,"6 per second: a pulse"],[300,"20 per second: a flutter"],[546,"36 per second: a low buzz"]];
    rows.forEach(([bpm,lab],r)=>{const y=90+r*80,rate=bpm/60*4,n=Math.round(rate);s+=T(120,y+5,bpm+" BPM","fl","end");
      for(let i=0;i<n;i++){const x=150+i*(560/n);s+=`<line x1="${x}" y1="${y-16}" x2="${x}" y2="${y+16}" style="stroke:${r===2?"var(--led)":r===1?"var(--hold)":"var(--turn)"};stroke-width:2"/>`;}
      s+=T(150,y+38,"16th notes for about a second: "+lab,"fs","start");});
    s+=T(400,338,"Around 20 hits a second, the ear stops counting and starts hearing a pitch.","fb");
    s+=T(400,366,"Rhythm and pitch are the same thing at different speeds.","fm");
    s+=T(400,396,"Projects saved above 300 BPM open at 120 BPM on the stock firmware.","fs");
    return svgFig("0 0 800 420",s,"Sixteenth notes at 90, 300 and 546 BPM, getting dense enough to become a tone");
  },
  };
})();

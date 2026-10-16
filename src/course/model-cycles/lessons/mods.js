import { hits } from "../../shared/html.js";
import { noteLock } from "./helpers.js";

/* ============================================================
   MODDED CYCLES: lessons for the Modded Cycles custom firmware (the community mods flashed with the
   Modded Cycles web flasher). One lesson per added machine or feature. Each opens with the original
   instrument or idea the mod is based on, then a bridge back to the main course.
   `mod` names the mod the lesson needs (shown in lists as "needs …").
   Each lesson works in its own pattern in bank D (D01, D02 …), so B01 and the song studies in bank C stay untouched.
   Settings the mod's guide doesn't spell out are listed under "Check on your unit".
   ============================================================ */

const modHome=(n,bpm)=>({k:"play",t:`Go to this lesson's own pattern: hold [PATTERN], press [T4] (bank D), then press [TRIG ${n}]. If anything plays there, clear it with [FUNC] + [PLAY]. Press [TEMPO], set ${bpm} BPM with [LEVEL/DATA], and press [BACK].`,hl:`h:pattern p:t4 p:s${n} p:tempo t:level p:back`,hear:`D${String(n).padStart(2,"0")} on the screen, at ${bpm} BPM.`});
const setMachine=(pad,machine,hear)=>({k:"play",t:`Set the machine: hold [TRACK] and press [T${pad}]. Press [MACHINES], turn [LEVEL/DATA] to ${machine}, and press [BACK].`,hl:`h:track p:t${pad} p:machines t:level p:back`,hear});
const save={k:"play",t:"Save the pattern: hold [FUNC] and long-press [SETTINGS].",hl:"h:func p:settings",hear:"Saved to the project, so it's there next time you switch on."};

export const MOD_LESSONS = [
/* ---------------- ACID: Open303, a TB-303 model ---------------- */
{ id:"m01", mod:"ACID", unit:"Modded Cycles", title:"Acid bass", minutes:40,
  goal:"Hear how a TB-303 line is built (one oscillator, a resonant filter, accent and slide) and write your own squelching acid line with the ACID machine.",
  listen:"Phuture, \"Acid Tracks\" (1987). One short bass line repeats for minutes. Listen to how the sound keeps opening, closing and squealing while the notes stay the same.",
  concepts:[
    {h:"The original: Roland TB-303",p:["Roland released the TB-303 Bass Line in 1981. Its designer, Tadao Kikumoto, meant it to stand in for a bass player, so a solo musician could practise and play gigs with it next to the TR-606 drum machine. It didn't sell: about 10,000 were made, and it was discontinued within two years.","It has one oscillator (saw or square), a resonant low-pass filter, and knobs for tuning, cutoff, resonance, envelope amount, decay and accent. Its step sequencer stores, for each step, a note plus two switches: accent (louder and brighter) and slide (glide into the next note)."]},
    {h:"How it became acid",p:["In Chicago around 1985, DJ Pierre, Spanky and Herb J, the group Phuture, bought a cheap second-hand 303, jammed with it over a drum machine while twisting the filter knobs, and recorded it to tape. DJ Ron Hardy played that tape at the Music Box club. Released in 1987 on Trax Records as \"Acid Tracks\", it gave acid house its name and its sound."]},
    {h:"The engine: Open303",p:["ACID runs Open303, an open-source software model of the 303 by Robin Schmidt. The mod puts its controls on the Cycles' knobs: [COLOR] is cutoff, [SHAPE] resonance, [SWEEP] envelope amount, [CONTOUR] drive, [DECAY] the filter and amp decay, and [PUNCH] switches from saw (off) to square (on)."]},
    {h:"The bridge: lessons 5 and 10",p:["In lesson 10 your T5 bassline had three jobs: rhythm, harmony and melody. An acid line adds a fourth: the sound itself moves while the notes repeat.","The envelope from lesson 5 is back too, but here [DECAY] also closes the filter. Short decay gives short, plucky blips; long decay gives rubbery, open notes."]},
    {h:"Check on your unit",p:["The mod's guide doesn't say how ACID is named on the screen (it's the last machine in the list) or describe an accent control, so this lesson makes accents with velocity and a brighter cutoff on one step. Slides come from a trig length that runs past the next trig; if LEN 2 doesn't slide, try a longer LEN."]}
  ],
  steps:[
    {k:"learn",fig:"m303",t:"A TB-303 is a short chain: one oscillator, a resonant low-pass filter, and an envelope that opens the filter on each note and lets it fall. Resonance boosts the frequencies right at the cutoff. That boost is the squelch.",hear:"Turning cutoff while a line repeats is most of the acid sound."},
    {k:"learn",fig:{grid:{title:"An acid-style line",presets:[
      {name:"One note",bpm:120,note:"Rhythm only: the same low A on every hit.",rows:[{n:"Bass",s:"bass",note:45,v:hits("1,3,4,7,9,11,12,15")},{n:"Kick",s:"kick",v:hits("1,5,9,13")}]},
      {name:"Octave jumps",bpm:120,note:"Two notes jump an octave up. The 303 classic.",rows:[{n:"Bass",s:"bass",p:[45,0,45,57,0,0,45,0,45,0,45,57,0,0,45,0],v:hits("1,3,4,7,9,11,12,15")},{n:"Kick",s:"kick",v:hits("1,5,9,13")}]}
    ]}},t:"Acid lines are short, busy and repetitive, with octave jumps. Compare the two. The browser can't squelch, so listen to the rhythm and the jumps: the filter does the rest on the Cycles.",hear:"The octave jumps on 4 and 12 make one note sound like a riff."},
    {k:"learn",fig:"mslide",t:"Slide is a note that hasn't finished when the next one starts. Instead of a new attack, the pitch glides from one note to the other. On ACID you make it with trig length: give a note a LEN that runs past the next trig, with [GATE] on.",hear:"Use slide on one or two notes per bar. It works because the others don't slide."},
    modHome(1,120),
    setMachine(5,"ACID, the last machine in the list","If ACID isn't in the list, this lesson needs the ACID mod flashed."),
    {k:"play",t:"Start dark: turn [COLOR] (cutoff) to about 30 and [SHAPE] (resonance) to about 90. Turn [SWEEP] (env mod) to about 60, [CONTOUR] (drive) to 0, and [DECAY] to about 50. Leave [PUNCH] off for the saw wave. Tap [T5].",hl:"t:color t:shape t:sweep t:contour t:decay p:t5",hear:"A short, dark note with a whistle inside it. The whistle is the resonance."},
    {k:"play",t:`Write the line: press [RECORD]. On T5, place trigs on [TRIG 1], [TRIG 3], [TRIG 4], [TRIG 7], [TRIG 9], [TRIG 11], [TRIG 12] and [TRIG 15]. On [TRIG 4], ${noteLock} 12 semitones up. Do the same on [TRIG 12].`,hl:"p:record p:s1 p:s3 p:s4 p:s7 p:s9 p:s11 p:s12 p:s15 h:s4 p:level t:level",hear:"The line from the drawing: low notes with two octave jumps."},
    {k:"play",t:"Add the kick: select [T1] (hold [TRACK], press [T1]) and place kicks on [TRIG 1], [TRIG 5], [TRIG 9] and [TRIG 13]. Press [PLAY].",hl:"h:track p:t1 p:s1 p:s5 p:s9 p:s13 p:play",hear:"Four on the floor under a busy bass: the acid house frame."},
    {k:"play",t:"Play the filter: select [T5]. While it loops, slowly turn [COLOR] up over two bars and back down over two more. Then raise [SHAPE] a little and do it again.",hl:"h:track p:t5 t:color t:shape",hear:"Closed, it murmurs. Open, it barks. With high resonance it squeals."},
    {k:"play",t:"Shape the envelope: turn [SWEEP] up for a bigger \"yow\" on every note. Then turn [DECAY] down for tight blips, and up for rubbery notes.",hl:"t:sweep t:decay",hear:"SWEEP sets how far each note opens the filter. DECAY sets how fast it closes again."},
    {k:"play",t:"Add a slide: press [GATE] so it lights. Hold [TRIG 3], press [LEVEL/DATA] until LEN shows, and turn it to 2. The note on 3 now lasts into the note on 4.",hl:"p:gate h:s3 p:level t:level",hear:"Step 3 glides up into the octave on 4, with no new attack."},
    {k:"play",t:"Let velocity change the volume: press [FUNC] + [BACK] to open the PAD menu, turn [LEVEL/DATA] to VDEP, set it to 127, and press [BACK].",hl:"h:func p:back t:level",hear:"Nothing changes yet. Now each trig's VEL sets how loud it plays."},
    {k:"play",t:"Accent [TRIG 7]: hold it, press [LEVEL/DATA] until VEL shows, and turn it to 127. Lower the other trigs to about 90 the same way. Still in grid recording, hold [TRIG 7] and turn [COLOR] up by about 20.",hl:"h:s7 p:level t:level t:color",hear:"One note jumps out louder and brighter, like the 303's accent switch."},
    {k:"play",t:"Try the rest: turn [CONTOUR] to about 40 for drive, and press [PUNCH] to switch to the square wave. Keep whichever you like best. Press [RECORD] to leave grid recording.",hl:"t:contour p:punch p:record",hear:"Square is hollower and rounder; saw is brighter and buzzier. Drive adds fuzz."},
    save,
    {k:"check",t:"Which ACID knob gives the line its squelchy whistle?",q:["[DECAY]","![SHAPE], the resonance","[PUNCH]","[VOLUME + DIST]"],a:"Resonance boosts the frequencies right at the cutoff. Sweep the cutoff (COLOR) with resonance up and that boost moves, which is the squelch.",hear:"Set resonance high, then play the cutoff like an instrument."},
    {k:"check",t:"How do you make one ACID note slide into the next?",q:["Hold [PUNCH] on the step","!Give it a LEN longer than the gap to the next trig, with GATE on","Turn [SWEEP] to the top","Put the two notes an octave apart"],a:"A slide happens when a note is still playing as the next one starts. GATE makes notes last their LEN, so a long LEN overlaps the next trig and the pitch glides.",hear:"Slide only a note or two per bar, so it stands out."}
  ],
  challenge:"Perform it: let D01 loop for 32 bars and touch only [COLOR] and [SHAPE], the way Phuture did on tape. Record the take into Live if you like."
},
/* ---------------- MACRO: Mutable Instruments Braids ---------------- */
{ id:"m02", mod:"MACRO", unit:"Modded Cycles", title:"Forty-seven voices", minutes:40,
  goal:"Understand what a macro oscillator is, tour the MACRO machine's families of sounds, and turn one short line into many voices by locking a different model to each step.",
  listen:"No track this time. Play your bassline from lesson 10 (B01, T5) on its own and listen to its tone: one FM voice. In this lesson the same kind of line gets 47 other voices.",
  concepts:[
    {h:"The original: Mutable Instruments Braids",p:["Braids is a Eurorack synth module designed in 2012 by Émilie Gillet, founder of Mutable Instruments in France. She called it a macro oscillator: one module holding many ways of making sound, each one a model with the same two controls, TIMBRE and COLOR, set to whatever matters most for that model.","Mutable retired Braids in 2017, writing that it had too many models and a menu system for something meant to be quick to play. Its successor, Plaits, kept the idea with fewer, better models. Braids' code is open source (MIT licence), so it lives on in software, and now in the MACRO machine."]},
    {h:"What's inside",p:["47 models in eight families: classic analog-style waves, stacks of detuned voices, digital filters and vowels, FM, physical models (plucked and bowed strings, blown and struck things), drums, wavetables, and noise and grains."]},
    {h:"The bridge: lesson 6",p:["In lesson 6 you learned that brightness is harmonics, and that the TONE machine adds harmonics with FM. MACRO's model 25 is FM too. The other 46 are other ways to get harmonics: filters remove them, vowels shape them like a mouth, physical models let them die away like a real object."]},
    {h:"Careful with the processor",p:["MACRO voices are heavy, and the mod's guide says MACRO has no load protection of its own. Use it on one or two tracks at a time. If the sound crackles, switch one MACRO track back to a stock machine."]},
    {h:"Check on your unit",p:["The guide doesn't say whether the screen shows the model's name or only its number, so this lesson uses the numbers from the guide's list. On a MACRO track, [FUNC] + [PITCH] is a lo-fi control (sample rate and bits), not semitone tuning."]}
  ],
  steps:[
    {k:"learn",fig:"mbraids",t:"A macro oscillator packs many synthesis methods into one voice. On MACRO, [SHAPE] picks the model (0 to 46). [COLOR] and [SWEEP] are Timbre and Color: two knobs that do whatever matters most for the model you picked.",hear:"Pick a family by ear first. Then explore inside it with the two knobs."},
    modHome(2,90),
    setMachine(5,"MACRO","If MACRO isn't in the list, this lesson needs the MACRO mod flashed."),
    {k:"play",t:`Write a short line: press [RECORD] and place trigs on [TRIG 1], [TRIG 4], [TRIG 7] and [TRIG 11]. On [TRIG 4], ${noteLock} 3 semitones up. On [TRIG 7], 7 up. On [TRIG 11], 12 up. Press [RECORD] again, then [PLAY].`,hl:"p:record p:s1 p:s4 p:s7 p:s11 h:s4 p:level t:level p:play",hear:"Root, minor third, fifth, octave: the notes of a minor chord, one at a time."},
    {k:"play",t:"Classic waves: turn [SHAPE] to 0 (CSAW), then step through 1 to 8. On each one, turn [COLOR] and [SWEEP] and listen.",hl:"t:shape t:color t:sweep",hear:"Familiar synth tones: saws, squares, sub octaves, hard sync."},
    {k:"play",t:"FM again: turn [SHAPE] to 25 (FM). Turn [COLOR] slowly up, then try 26 (FEEDBACK FM).",hl:"t:shape t:color",hear:"The metallic, glassy colours of lesson 6, from a different engine."},
    {k:"play",t:"Physical models: turn [SHAPE] to 28 (PLUCKED), then 29 (BOWED), then 32 (STRUCK BELL). Turn [DECAY] up so each one rings.",hl:"t:shape t:decay",hear:"Each note now plucks, bows or strikes a modelled object."},
    {k:"play",t:"Vowels: turn [SHAPE] to 22 (VOWEL) and turn [COLOR] slowly from one end to the other.",hl:"t:shape t:color",hear:"It sounds like a mouth shaping aa, ee, oo."},
    {k:"play",t:"Noise and grains: try 44 (GRANULAR CLOUD) and 41 (FILTERED NOISE), with [DECAY] long.",hl:"t:shape t:decay",hear:"Textures more than notes: good for the background of a night track."},
    {k:"play",t:"Give the notes a life: pick a model you like and turn [CONTOUR] up. The envelope now opens the Timbre at the start of each note.",hl:"t:contour",hear:"Each note starts brighter and closes as it fades."},
    {k:"play",t:"One line, four voices: press [RECORD]. Hold [TRIG 7] and turn [SHAPE] to a different model. Do the same on [TRIG 11] with a third one. Press [RECORD] again.",hl:"p:record h:s7 t:shape h:s11",hear:"A parameter lock: the model changes on just those steps, so the line switches voice as it plays."},
    {k:"play",t:"Lo-fi: hold [FUNC] and turn [PITCH] left to lower the sample rate, or right to lower the bit depth. Centre is OFF.",hl:"h:func t:pitch",hear:"Left gets dull and aliased, right gets gritty. A little goes a long way."},
    save,
    {k:"check",t:"On the MACRO machine, which knob changes the kind of synthesis?",q:["[COLOR]","![SHAPE]: it picks one of 47 models","[DECAY]","[PITCH]"],a:"SHAPE is the model selector. COLOR and SWEEP (Timbre and Color) then shape whatever model is selected.",hear:"A model is a whole synthesis method. Choose the method, then shape it."},
    {k:"check",t:"Why did Braids give every model the same two knobs?",q:["To save money on parts","!So any model can be explored the same way: pick it, then play Timbre and Color","Because all the models sound the same","So the module could be played without a screen"],a:"Émilie Gillet mapped each model's most useful parameters onto the same two controls. You don't need to know how FM or a bowed string works to play them.",hear:"One interface, many engines."}
  ],
  challenge:"Find three models you'd use in your night track (a bass, a bell, a texture) and write their numbers in your notes. Then lock all three onto steps of one line."
},
/* ---------------- Syntakt drums ---------------- */
{ id:"m03", mod:"Syntakt engines", unit:"Modded Cycles", title:"Vintage snare and clap", minutes:35,
  goal:"Learn how a drum machine builds a snare and a clap, then layer the Syntakt's SD VINTAGE and CP VINTAGE into one backbeat.",
  listen:"No track this time. Play B01 and mute everything except T2, your soft snare from lesson 5. Keep that sound in your ear: you'll put an older-sounding snare and a clap next to it.",
  concepts:[
    {h:"The original: Elektron Syntakt",p:["Syntakt is Elektron's drum computer and synth from 2022: twelve tracks, four analog and eight digital, each with a choice of machines. SD VINTAGE (a snare) and CP VINTAGE (a clap) are two of its digital machines.","The mod doesn't imitate them. It takes the machine code from your own Syntakt OS file and runs it on the Cycles, which is why the flasher asks for that file."]},
    {h:"How a snare is built",p:["A real snare is a drum shell with metal wires stretched under it. Drum machines copy it with two parts: a short pitched tone for the shell and a burst of noise for the wires. More noise sounds crisper; more tone sounds woodier."]},
    {h:"How a clap is built",p:["A clap is several hands that don't quite land together. Classic drum machines such as Roland's TR-808 fake it with a few very short bursts of noise a hair apart, then one longer burst for the room. That gap between the bursts is what makes it read as a clap."]},
    {h:"The bridge: lessons 5 and 7",p:["In lesson 5 you softened the stock SNARE. In lesson 7 you built a drum from layers that each do one job. Here the new snare and clap become two layers of one backbeat: the snare gives the body, the clap gives width and air."]},
    {h:"Check on your unit",p:["They show as SDVtg and CPVtg. Choosing them loads the Syntakt's default settings, so switching machine and back resets your tweaks. The guide maps COLOR, SHAPE, SWEEP and CONTOUR but doesn't say what DECAY does on them."]}
  ],
  steps:[
    {k:"learn",fig:"mclap",t:"A drum machine snare is a short tone (the shell) plus noise (the wires). A clap is a few tiny noise bursts a hair apart, then a longer one. Every knob on these two machines moves one of those parts.",hear:"Snare: more tone is woodier, more noise is crisper. Clap: the spacing between bursts is the clap."},
    modHome(3,90),
    setMachine(2,"SDVtg (one of the Syntakt engines, after CHORD)","If SDVtg isn't in the list, this lesson needs the Syntakt engines mod."),
    setMachine(4,"CPVtg","T1 stays KICK."),
    {k:"play",t:"Lay down the beat: press [RECORD]. On T1, kicks on [TRIG 1] and [TRIG 11]. On T2, snares on [TRIG 5] and [TRIG 13]. Press [PLAY].",hl:"p:record h:track p:t1 p:s1 p:s11 p:t2 p:s5 p:s13 p:play",hear:"A slow, half-time beat with the Syntakt snare on the backbeat."},
    {k:"play",t:"Shape the snare: select [T2]. Turn [COLOR] (inharmonicity) for a more metallic or more tonal body. Turn [SHAPE] (frequency complexity) and listen to it thicken. Turn [SWEEP] (pitch sweep) down for less of a drop.",hl:"h:track p:t2 t:color t:shape t:sweep",hear:"Find a snare that sounds like an old record: a little dull, a little papery."},
    {k:"play",t:"Add the clap: select [T4] and place claps on [TRIG 5] and [TRIG 13], with the snare.",hl:"h:track p:t4 p:s5 p:s13",hear:"The backbeat gets wider and brighter."},
    {k:"play",t:"Shape the clap: turn [SWEEP] (spacing) slowly. Then turn [SHAPE] (balance) to move between the bursts and the body, and [COLOR] for the body's character.",hl:"t:sweep t:shape t:color",hear:"Tight spacing sounds like one slap. Wide spacing sounds like a few people."},
    {k:"play",t:"Balance the layers: with T4 selected, turn [LEVEL/DATA] down until the clap sits just behind the snare. Give the clap some [REVERB SEND] and leave the snare dry.",hl:"t:level t:reverb",hear:"One backbeat with a dry centre and a roomy edge, not two separate drums."},
    {k:"play",t:"Test the layering: mute and unmute T4 ([FUNC] + [T4]) while it plays. Press [RECORD] to leave grid recording.",hl:"h:func p:t4 p:record",hear:"Without the clap the snare feels small; with it, the backbeat opens up."},
    save,
    {k:"check",t:"What makes a drum machine clap sound like a clap?",q:["One long burst of noise","!A few short noise bursts a hair apart, then a longer tail","A pitched tone with a fast drop","A sine wave with distortion"],a:"Hands never land together. The tiny gaps between the bursts are what your ear reads as a clap. CP VINTAGE's SWEEP (spacing) controls them.",hear:"Spacing makes it a clap. Body and tail decide the room."},
    {k:"check",t:"Why does the flasher ask for your Syntakt OS file?",q:["To check you own a Syntakt","!Because the mod runs the Syntakt's own machine code, taken from that file","To make the Cycles louder","It doesn't need it"],a:"The Syntakt engines aren't an imitation: the flasher copies the real machine code from your Syntakt OS file into the Cycles firmware.",hear:"Same code, different box."}
  ],
  challenge:"Try a CPVtg clap in B04, your bright twin of the night track, on the same steps as its snare. Does it make B04 feel older or newer?"
},
/* ---------------- Syntakt synths ---------------- */
{ id:"m04", mod:"Syntakt engines", unit:"Modded Cycles", title:"Toy, bits and swarm", minutes:40,
  goal:"Hear three new ways to make a tone (a struck object, chip-style waves and a swarm of saws) and give each one a job in a short loop.",
  listen:"No track this time. Think of three sounds: a music box, an old video game, and a huge, shimmering trance chord. This lesson builds one of each.",
  concepts:[
    {h:"The originals",p:["All three are Syntakt machines, again run from your own Syntakt OS file. SY TOY is the Syntakt's only physical-modelling machine. SY BITS is a voice with chip-style waveforms and bit reduction. SY SWARM arrived in Syntakt OS 1.20 as Elektron's take on the supersaw: six oscillators stacked on a main one, plus a sub oscillator two octaves down."]},
    {h:"Physical modelling (SY TOY)",p:["Instead of starting from a wave, physical modelling simulates an object being struck: how hard, where, and how its parts ring. Struck things like bells, toy pianos and xylophones ring with many overtones (partials), and the high ones die first. PARTIAL DECAY sets how long they last."]},
    {h:"Chip sounds (SY BITS)",p:["Early game consoles and home computers made music with a few simple channels (square, triangle and noise) at low resolution. Lowering the bit depth or the sample rate adds that grainy, stepped quality."]},
    {h:"The supersaw (SY SWARM)",p:["Roland's JP-8000 synth made the supersaw famous in the late 1990s: several sawtooth waves slightly out of tune with each other. The tiny differences make them drift in and out of phase, which sounds wide and shimmering. It became the sound of trance."]},
    {h:"The bridge: lessons 6 and 9",p:["From lesson 6: a saw has every harmonic, so a stack of saws is the brightest sound here, and mixing the side saws down darkens it. From lesson 9: all three play notes from the trig keys with [TRIG 9] as the root, so your minor-scale map still works."]},
    {h:"Check on your unit",p:["They show as SYToy, SYBit and SYSwm. The guide also lists a PUNCH setting for each (punch on SY TOY, bit reduction on SY BITS, sub octave on SY SWARM): press [PUNCH] and listen."]}
  ],
  steps:[
    {k:"learn",fig:"msynths",t:"Three voices, three ideas. SY TOY strikes a modelled object. SY BITS plays simple chip waves at low resolution. SY SWARM stacks detuned saws over a sub.",hear:"Struck, stepped, stacked."},
    modHome(4,90),
    setMachine(3,"SYToy","If SYToy isn't in the list, this lesson needs the Syntakt engines mod."),
    setMachine(5,"SYBit"),
    setMachine(6,"SYSwm","T1 stays KICK."),
    {k:"play",t:"Make a music box: select [T3]. Outside recording, play [TRIG 9], [TRIG 12] and [TRIG 16], and turn [COLOR] (form) slowly as you play.",hl:"h:track p:t3 p:s9 p:s12 p:s16 t:color",hear:"It moves from metallic to woody and back."},
    {k:"play",t:"Strike and ring: turn [SHAPE] (impact) for a harder hit, and [CONTOUR] (partial decay) down for a short knock, up for a long ring.",hl:"t:shape t:contour",hear:"Somewhere in the middle it's a toy piano."},
    {k:"play",t:`Give it a melody: press [RECORD]. On T3, place notes on [TRIG 1], [TRIG 7] and [TRIG 11]. On [TRIG 7], ${noteLock} 3 semitones up. On [TRIG 11], 7 up.`,hl:"p:record p:s1 p:s7 p:s11 h:s7 p:level t:level",hear:"Three bell notes from the A minor chord."},
    {k:"play",t:"Chip bass: select [T5]. Hold [FUNC] and turn [PITCH] to -12. Turn [CONTOUR] (waveform) to find a square or a triangle, and [SWEEP] (rate redux) up for grit. Place notes on [TRIG 1] and [TRIG 9].",hl:"h:track p:t5 h:func t:pitch t:contour t:sweep p:s1 p:s9",hear:"A buzzy little bass, straight out of a game console."},
    {k:"play",t:"Swarm pad: select [T6] and place one note on [TRIG 1]. Press [GATE] so it lights. Hold [TRIG 1], press [LEVEL/DATA] until LEN shows, and set it to 16, a whole bar.",hl:"h:track p:t6 p:s1 p:gate h:s1 p:level t:level",hear:"One long note held across the bar."},
    {k:"play",t:"Spread the swarm: press [PLAY]. Turn [SWEEP] (detune) up slowly. Then turn [SHAPE] (detune animation) for movement, and [CONTOUR] (oscillator mix) to bring the side saws in or out.",hl:"p:play t:sweep t:shape t:contour",hear:"From one clean saw to a wide, shimmering wall."},
    {k:"play",t:"Mix it: on T1, kicks on [TRIG 1] and [TRIG 9]. Balance the three voices with [LEVEL/DATA] on each track, and give T3 and T6 some [REVERB SEND]. Press [RECORD] to leave grid recording.",hl:"h:track p:t1 p:s1 p:s9 t:level t:reverb p:record",hear:"Bell on top, swarm in the middle, chip bass below: three jobs, three heights."},
    save,
    {k:"check",t:"Why does a supersaw sound so wide?",q:["It is played very loud","!Several saws slightly out of tune drift in and out of phase","It uses a long reverb","It has no harmonics"],a:"Detuned copies of the same wave never line up for long. That slow drifting is heard as width and shimmer. SWEEP (detune) on SY SWARM sets how far apart they are.",hear:"Detune makes width. Too much makes it sour."},
    {k:"check",t:"On SY TOY, what does PARTIAL DECAY change?",q:["The tempo","!How long the ringing overtones last","The note's pitch","How loud the kick is"],a:"Struck objects ring with many partials. PARTIAL DECAY sets how long they last, from a dead knock to a long bell.",hear:"Short partials: wood. Long partials: metal and glass."}
  ],
  challenge:"Play the roots of your lesson 11 chords (A, F, D, E) as long notes on the SYSwm track, one per bar, and hear how much a swarm fills the space a chord used to."
},
/* ---------------- Chord Keys ---------------- */
{ id:"m05", mod:"Chord Keys", unit:"Modded Cycles", title:"Chords under your fingers", minutes:35,
  goal:"Learn how a scale builds its own chords, set Chord Keys to A minor, and play your lesson 11 progression with one finger per chord.",
  listen:"Kiasmos, \"Looped\". Listen to the piano chords: every change is a single move, and they all clearly belong to one key.",
  concepts:[
    {h:"Chords that come from a scale",p:["Every scale has seven notes. Stack every other note of the scale on each one (1, 3, 5, then the 7th) and you get seven chords that belong together. Musicians name them by degree with Roman numerals, as in lesson 11.","In a minor key, i, iv and v are minor, III, VI and VII are major, and ii° is diminished. In a major key the pattern moves: I, IV and V are major, ii, iii and vi minor, and vii° diminished."]},
    {h:"Seven scales, seven moods",p:["Chord Keys offers MAJ, DOR, PHR, LYD, MIX, MINOR and LOC. These are the seven modes: the same seven notes, starting on a different one. MINOR (also called Aeolian) and DOR (Dorian, a minor scale with a brighter sixth note) both suit night music."]},
    {h:"Where it comes from",p:["Chord Keys is a mod by Nico Heuser. It works like the chord modes on many modern keyboards and apps: choose a key and scale once, then each key plays a whole chord that fits. On the Cycles it plays through the CHORD machine's own voices."]},
    {h:"The bridge: lesson 11",p:["In lesson 11 you built Am7, Fmaj7, Dm7 and Em7 on T6 by setting a chord type and moving its root by semitones. With Chord Keys you set the key once, and the same four chords are degrees i, VI, iv and v: keys 1, 6, 4 and 5."]},
    {h:"Check on your unit",p:["Chord Keys only turns on for CHORD tracks, and it can't be flashed together with Model-TG. Only root notes are recorded; the chords are rebuilt from Root, Scale and the extensions as they play, so changing the scale later changes the recorded chords too. Menu names here follow the mod's guide."]}
  ],
  steps:[
    {k:"learn",fig:"mdegrees",t:"Chord Keys turns the trig keys into the seven chords of a scale, in order. In A minor, key 1 is Am7, key 4 is Dm7, key 5 is Em7 and key 6 is Fmaj7: your lesson 11 progression.",hear:"You pick the degree. The scale picks major or minor."},
    {k:"learn",fig:{grid:{title:"i, VI, iv, v in A minor",edit:false,presets:[
      {name:"Am7 Fmaj7 Dm7 Em7",bpm:90,note:"One chord per beat, all from the A minor scale.",rows:[{n:"7th",s:"keys",p:[67,0,0,0,64,0,0,0,60,0,0,0,62],v:hits("1,5,9,13",.6)},{n:"5th",s:"keys",p:[64,0,0,0,60,0,0,0,57,0,0,0,59],v:hits("1,5,9,13",.6)},{n:"3rd",s:"keys",p:[60,0,0,0,57,0,0,0,53,0,0,0,55],v:hits("1,5,9,13",.6)},{n:"Root",s:"keys",p:[57,0,0,0,53,0,0,0,50,0,0,0,52],v:hits("1,5,9,13",.7)}]}
    ]}},t:"Each column is one chord, built from every other note of the A minor scale. Press Play and listen to how the four chords lean on each other.",hear:"Em7 at the end wants to go back to Am7. That pull is what makes it loop."},
    modHome(5,90),
    {k:"play",t:"Select [T6] (hold [TRACK], press [T6]) and check that its machine is CHORD. Press [GATE] so it lights, and turn [DECAY] to about 90.",hl:"h:track p:t6 p:gate t:decay",hear:"Chords will hold for their length and fade slowly."},
    {k:"play",t:"Turn on Chord Keys: press [FUNC] + [RETRIG]. Scroll with [LEVEL/DATA] past RTE, LEN and A.ON to Keys, and set it to ON.",hl:"h:func p:retrig t:level",hear:"If there's no Keys row, this lesson needs the Chord Keys mod."},
    {k:"play",t:"Still in that menu: set Root to A2 and Scale to MINOR. Set the rows I to VII to 7, so every chord gets its seventh. Press [BACK].",hl:"t:level p:back",hear:"Your key is set once, for this track in this pattern."},
    {k:"play",t:"Play the progression: press [TRIG 1], then [TRIG 6], [TRIG 4] and [TRIG 5], one slow chord each.",hl:"p:s1 p:s6 p:s4 p:s5",hear:"Am7, Fmaj7, Dm7, Em7: lesson 11, one finger per chord."},
    {k:"play",t:"Explore: [TRIG 3] is Cmaj7 and [TRIG 7] is G7, both bright. [TRIG 2] is the tense Bm7♭5. Keys 8 to 14 are the same chords an octave up.",hl:"p:s3 p:s7 p:s2",hear:"All seven fit the key. Some feel like home, some want to move."},
    {k:"play",t:"Voicing: turn [SHAPE], which is now Chord Voicing, from BASE to CLS1 and then OPN1. Set [COLOR] to about 32 to balance the voices.",hl:"t:shape t:color",hear:"Close voicings pack the notes tight. Open ones spread them out and sound bigger."},
    {k:"play",t:"Make T6 four bars long: hold [FUNC] and press [PAGE] (SCALE menu), press [T6], set LEN to 64 with [LEVEL/DATA], and press [BACK].",hl:"h:func p:page p:t6 t:level p:back",hear:"One chord per bar needs four bars."},
    {k:"play",t:"Record it live: hold [RECORD] and press [PLAY]. Press [TRIG 1] on the first beat of bar 1, [TRIG 6] in bar 2, [TRIG 4] in bar 3 and [TRIG 5] in bar 4. Press [RECORD] to stop recording.",hl:"h:record p:play p:s1 p:s6 p:s4 p:s5 p:record",hear:"Your progression plays back on its own."},
    {k:"play",t:"Change the mood: open [FUNC] + [RETRIG] again and set Scale to DOR. Listen, then set it back to MINOR.",hl:"h:func p:retrig t:level",hear:"Same keys, new chords: in Dorian key 6 becomes F♯m7♭5 and key 4 becomes D7."},
    save,
    {k:"check",t:"In A minor, which degree and key give you Fmaj7?",q:["i, key 1","iv, key 4","!VI, key 6","v, key 5"],a:"The sixth note of A minor is F, and stacking every other scale note on it gives F, A, C, E: Fmaj7.",hear:"Count up the scale from the root to find the degree."},
    {k:"check",t:"You recorded with Chord Keys, then changed the scale. What happens to the recording?",q:["Nothing: the chords are frozen","The pattern is erased","!The chords are rebuilt from the new scale, because only the roots were recorded","Only the first chord changes"],a:"Chord Keys records root notes. As it plays, it rebuilds each chord from the current Root, Scale and extensions.",hear:"A quick way to try a whole progression in another mode."}
  ],
  challenge:"Write a new four-chord loop using only keys 1 to 7. End it on key 5 or key 7 so it leans back into key 1."
},
/* ---------------- Model-TG: Sampler and resampling ---------------- */
{ id:"m06", mod:"Model-TG", unit:"Modded Cycles", title:"Print it, chop it", minutes:45,
  goal:"Learn what a sampler adds, resample a beat you made into audio, and chop it into slices you can rearrange.",
  listen:"Burial, \"Near Dark\". Listen for the sounds that aren't instruments: crackle, rain-like noise, cut-up fragments. Those are samples.",
  concepts:[
    {h:"The original: sampling",p:["A sampler records a sound and plays it back from a key, at any pitch. The Fairlight CMI (1979) and E-mu Emulator (1981) made that possible, at the price of a house. Cheaper drum samplers such as the E-mu SP-1200 and the Akai MPC60 (designed with Roger Linn, 1988) let hip hop producers cut records into pieces and replay them as new beats. That's chopping."]},
    {h:"The firmware: Model-TG",p:["Model-TG is an open-source add-on for the Model:Cycles by TinyGregAudio (version 1.1, MIT licence). It adds a Sampler machine, resampling, a master effects page, slide trigs, and attack, filter and resonance on every machine. To load files it borrows the Model:Samples' storage, so Elektron Transfer sees a Model:Samples when the Cycles' Transfer setting is SMP."]},
    {h:"Resampling",p:["Resampling means recording your own machine's output back into its sampler. It turns a pattern into one piece of audio that you can chop, reverse or stretch, and frees the tracks it used."]},
    {h:"The bridge: lessons 3 and 7",p:["In lesson 7 you added a found sound to your kit. A sampler makes any sound a found sound, your own beat included. Chopping is lesson 3's groove work done with audio: the same pieces in a new order."]},
    {h:"Check on your unit",p:["The Sampler is the 7th machine, right after CHORD. Model-TG can't be combined with Chord Keys or the per-track filter mod. To send your own WAV files, set Transfer to SMP, but never accept an OS update while it's on SMP.","The guide lists the resampling menu's rows but not a step-by-step order, so the steps here follow those rows. It names the Sampler's four knobs in order (Start, End, Filter, Res); this lesson assumes they sit on COLOR, SHAPE, SWEEP and CONTOUR."]}
  ],
  steps:[
    {k:"learn",fig:"mslice",t:"Slice mode cuts a sample into pieces, at each hit or into equal parts. On the sequencer, each trig's NOTE then picks which slice plays. Same audio, new order: that's chopping.",hear:"Producers have rebuilt grooves this way since the first drum samplers."},
    modHome(6,90),
    {k:"play",t:"Make a quick beat to print: press [RECORD]. On T1, kicks on [TRIG 1], [TRIG 7] and [TRIG 11]. On T2, snares on [TRIG 5] and [TRIG 13]. On T3, hats on [TRIG 3], [TRIG 7], [TRIG 11] and [TRIG 15]. Press [RECORD] again.",hl:"p:record h:track p:t1 p:s1 p:s7 p:s11 p:t2 p:s5 p:s13 p:t3 p:s3 p:s15",hear:"A simple one-bar beat. It's only raw material."},
    setMachine(4,"the Sampler, one step past CHORD","If there's nothing after CHORD, this lesson needs the Model-TG mod."),
    {k:"play",t:"Set up resampling: hold [SETTINGS] and press [RECORD]. Set SRC to MST (the main output), LEN to 1 bar, STA to PAT and MUT to ON.",hl:"h:settings p:record t:level",hear:"MUT ON mutes the other tracks as soon as the take lands on T4."},
    {k:"play",t:"Record the take: press [PLAY], then arm REC in the menu. Wait for the bar to go round.",hl:"p:play t:level p:level",hear:"The drums go quiet and T4 plays the same bar back, now as one piece of audio."},
    {k:"play",t:"Save it: go to SAV in the same menu, name the take and confirm. Unsaved takes only live in memory.",hl:"t:level p:level",hear:"The take is stored in the Resampled folder."},
    {k:"play",t:"Switch T4 to Slice: hold [SETTINGS] and press [MACHINES], turn a knob until Slice shows, and press [BACK].",hl:"h:settings p:machines t:color p:back",hear:"The sample is now cut into slices."},
    {k:"play",t:"Slice options: hold [SETTINGS] and press [PUNCH]. Set MOD to TRN to cut at each hit. Run SEQ to lay the slices onto the trigs in order. Press [BACK].",hl:"h:settings p:punch t:level p:back",hear:"T4 plays the beat back slice by slice, sounding like the original."},
    {k:"play",t:"Hear the slices: outside recording, select [T4] and press [TRIG 1] to [TRIG 8] one at a time.",hl:"h:track p:t4 p:s1 p:s2 p:s3 p:s4 p:s5 p:s6 p:s7 p:s8",hear:"Each key plays the next slice: kick, hat, snare and so on."},
    {k:"play",t:"Rearrange: press [RECORD]. On T4, hold the trig on [TRIG 4], press [LEVEL/DATA] until NOTE shows, and turn it until it plays the slice from step 2. Do the same on [TRIG 8] with the first slice.",hl:"p:record h:s4 p:level t:level h:s8",hear:"Same sounds, a new groove: the drawing's second row."},
    {k:"play",t:"Reverse one slice: hold the last trig on T4 and turn [COLOR] (Start) past [SHAPE] (End). Press [RECORD] to leave grid recording.",hl:"h:s15 t:color t:shape p:record",hear:"Start after End plays that slice backwards: a little sucking sound before the bar repeats."},
    save,
    {k:"check",t:"What is resampling?",q:["Buying a sample pack","!Recording the machine's own output back into its sampler","Speeding a sample up","Copying a pattern"],a:"Resampling prints what your tracks play into one piece of audio inside the sampler, ready to chop, reverse or stretch.",hear:"Print, then mangle."},
    {k:"check",t:"In Slice mode, what picks which slice a sequencer trig plays?",q:["!The trig's NOTE","The trig's velocity","The track's volume","The tempo"],a:"In Slice mode the note chooses the slice. Change a trig's NOTE and that step plays a different piece of the sample.",hear:"Notes become slice numbers."}
  ],
  challenge:"Resample your night track, B01, onto a Sampler track and chop it into a one-bar variation for a breakdown."
},
/* ---------------- Model-TG: textures ---------------- */
{ id:"m07", mod:"Model-TG", unit:"Modded Cycles", title:"Grains, strings and waves", minutes:40,
  goal:"Understand granular synthesis, plucked-string modelling and wavetables, and turn one sample into a pad, a string and a synth tone.",
  listen:"No track this time. Play the take you saved in Print it, chop it once and remember it. By the end of this lesson it will be a pad, a plucked string and a buzzy synth.",
  concepts:[
    {h:"Granular: sound as grains",p:["In 1947 the physicist Dennis Gabor proposed that any sound can be described as tiny grains. The composer Iannis Xenakis built music from such grains on tape around 1960, and Curtis Roads made the first computer granular synthesis in the 1970s.","A granular engine plays many overlapping slivers from one spot in a sample (here 10 ms to 1 s long), so a moment of sound becomes a sustained cloud. Stretch is the same with a moving playhead: you can slow a sample down without lowering its pitch, or freeze it."]},
    {h:"Pluck: Karplus-Strong",p:["Kevin Karplus and Alex Strong published a tiny algorithm in 1983 in Computer Music Journal: fill a short delay with a burst of noise and feed it back through an averaging filter. It rings at a pitch set by the delay length, and the filter dulls the highs on every pass, so it sounds like a plucked string. Pluck mode strikes that loop with a piece of your sample instead of noise."]},
    {h:"Wave: wavetables",p:["Wolfgang Palm's PPG Wave synths, from 1981, played tables of single-cycle waves and moved through them. Wave mode cuts your sample into single cycles (frames of 32 to 4096 samples) and scans through them. Model-TG's guide points to the 2048-sample frames of software synths like Serum and Vital."]},
    {h:"The bridge: lesson 8",p:["In lesson 8 an LFO turned a knob for you. Point one at a Sampler knob like Position and these textures move on their own."]},
    {h:"Check on your unit",p:["The guide names each mode's four knobs in order; this lesson assumes they sit on COLOR, SHAPE, SWEEP and CONTOUR. Stereo (the CHN option) uses about twice the processor."]}
  ],
  steps:[
    {k:"learn",fig:"mtextures",t:"The Sampler can read the same sample four more ways. Granular plays tiny grains. Stretch moves through them slowly. Pluck uses the sample to strike a string. Wave treats it as a table of waveforms.",hear:"None of these play the sample as it is: they use it as raw material."},
    modHome(7,90),
    setMachine(4,"the Sampler, one step past CHORD"),
    {k:"play",t:"Load your take: press [FUNC] + [MACHINES], open the Resampled folder, pick the take you saved, and confirm.",hl:"h:func p:machines t:level p:level",hear:"\"Sample loaded\" on the screen. Any other sample works too."},
    {k:"play",t:"Granular: hold [SETTINGS] and press [MACHINES], turn a knob until Granular shows, and press [BACK]. Press [GATE] so it lights, then hold [T4].",hl:"h:settings p:machines t:color p:back p:gate h:t4",hear:"A sustained cloud instead of a beat."},
    {k:"play",t:"Shape the cloud: turn [COLOR] (position) to scan through the sample. Turn [SHAPE] (grain size) down for a buzz and up for smooth. [SWEEP] (density) thickens it; [CONTOUR] (spray) scatters it.",hl:"t:color t:shape t:sweep t:contour",hear:"Find a spot where it sounds like a pad."},
    {k:"play",t:"Play it as a pad: hold [TRIG 9], then [TRIG 12], then [TRIG 16].",hl:"h:s9 h:s12 h:s16",hear:"Grains play at the note's pitch, so your beat becomes a chord-like drone."},
    {k:"play",t:"Make it drift: hold [LFO] and turn [COLOR] a little to send the LFO to position. Turn [LFO SPEED] to a slow value, like 2.",hl:"h:lfo t:color t:lfospd",hear:"The pad wanders slowly through the sample by itself."},
    {k:"play",t:"Stretch: switch the mode to Stretch the same way. Turn [COLOR] (speed) to 96 for the original speed, lower to slow it down, and to 0 to freeze it.",hl:"h:settings p:machines t:color",hear:"Your beat in slow motion, without dropping in pitch."},
    {k:"play",t:"Pluck: switch to Pluck and play [TRIG 9]. Turn [CONTOUR] (feedback) for a longer ring and [SWEEP] (tone) for brighter. Turn [COLOR] (strike position) to change which part of the sample strikes the string.",hl:"h:settings p:machines p:s9 t:contour t:sweep t:color",hear:"A plucked string whose attack is made of your drums."},
    {k:"play",t:"Wave: switch to Wave. Hold [TRIG 9] and turn [COLOR] (wave position) slowly, then [SHAPE] (frame size).",hl:"h:settings p:machines h:s9 t:color t:shape",hear:"A buzzy synth tone that morphs as you scan the table."},
    {k:"play",t:"Pick your favourite mode and leave T4 on it.",hl:"",hear:"Note in your notes which mode and settings you kept."},
    save,
    {k:"check",t:"What does a granular engine actually play?",q:["The whole sample, faster","!Many tiny overlapping slivers of the sample","Only the first note","A sine wave"],a:"Granular synthesis plays short grains from one spot in the sample, overlapping them into a continuous sound. Position chooses the spot.",hear:"A moment of sound, held as long as you like."},
    {k:"check",t:"In the Karplus-Strong algorithm, what sets the pitch of the string?",q:["The volume of the noise","!The length of the delay loop","The sample rate","The reverb"],a:"The burst circulates through a short delay. A shorter loop repeats faster, which is a higher pitch.",hear:"The averaging filter is why the highs fade first, like a real string."}
  ],
  challenge:"Turn a recording of a found sound (your voice, a cup, rain) into a pad with Granular and play the chords of lesson 11 on it."
},
/* ---------------- Model-TG: master FX, pump, slide trigs ---------------- */
{ id:"m08", mod:"Model-TG", unit:"Modded Cycles", title:"Master effects and pump", minutes:40,
  goal:"Perform repeats, filter sweeps and pump on your night track with the master effects page, and glide between two sounds with a slide trig.",
  listen:"No track this time. Play B01 and imagine a DJ's mixer on top of it: a loop stuttering, a filter sweeping, the record slowing to a stop. That's this page.",
  concepts:[
    {h:"The originals: DJ and dub effects",p:["Beat repeats, filter sweeps and tape stops come from DJ booths and dub studios: a DJ stuttering a loop, a mixer's filter knob, a turntable or tape machine switched off mid-play. Model-TG puts twelve of them on one page that acts on the tracks you pick, before delay and reverb."]},
    {h:"Sidechain pump",p:["Sidechain compression turns one sound down whenever another plays. Radio used it to duck music under a voice. Dance music turned it into rhythm: everything dips on the kick and swells back, so the track breathes. Model-TG's Pump does it directly: an instant dip, back up in about 170 ms."]},
    {h:"Slide trigs",p:["Some of Elektron's other machines have slide trigs: a step that glides every setting that changed from the previous trig. Model-TG brings them to the Cycles, so one sound can morph into another across the gap."]},
    {h:"The bridge: lessons 13 and 16",p:["Lesson 13's dub throws were effects you played, not set and forgot. In lesson 16 you performed your arrangement. This page is for both: hold, sweep, let go."]},
    {h:"Check on your unit",p:["The effects keep running when you change pattern and aren't saved with it. [SETTINGS] + [BACK] turns them all off from any screen. The slide trig part uses pattern B12, which is free in the course's pattern map."]}
  ],
  steps:[
    {k:"learn",fig:"mpump",t:"Pump dips every other sound on each kick and lets it swell back. On the effects page, the tracks whose pads you turn off play clean and drive the pump.",hear:"A little reads as groove. A lot reads as an effect."},
    {k:"play",t:"Go to B01 (hold [PATTERN], press [T2], press [TRIG 1]) and press [PLAY]. Hold [SETTINGS] and press [RETRIG] to open the effects page.",hl:"h:pattern p:t2 p:s1 p:play h:settings p:retrig",hear:"All six pads light: every track is in."},
    {k:"play",t:"Repeat: hold [TRIG 9] and let go. Then try [TRIG 13] and [TRIG 16]. Key 1 repeats fastest (1/64) and key 16 repeats a whole bar.",hl:"h:s9 h:s13 h:s16",hear:"A tempo-locked stutter, like a DJ grabbing a loop."},
    {k:"play",t:"Keep the kick out: press [T1] so its pad goes dark.",hl:"p:t1",hear:"Now repeats and effects skip the kick, which keeps the floor steady."},
    {k:"play",t:"Sweep: turn [SWEEP] (filter) left for a low-pass and back to the centre, then right for a high-pass and back. Add [CONTOUR] (resonance) for a sharper sweep.",hl:"t:sweep t:contour",hear:"Left muffles everything but the kick. Right thins it out."},
    {k:"play",t:"Pump: the kick's pad is off, so it drives the pump. Turn [SHAPE] (pump) up to about 60.",hl:"t:shape",hear:"Chords, bass and hats dip on every kick and swell back."},
    {k:"play",t:"Dust and ending: turn [SWING] (vinyl) up a little. On the last bar of a phrase, turn [VOLUME + DIST] (tape stop) up.",hl:"t:swing t:vol",hear:"Crackle, then the whole track slows to a halt."},
    {k:"play",t:"Close the page with [SETTINGS]. The effects keep running. To turn them all off, press [SETTINGS] + [BACK].",hl:"p:settings h:settings p:back",hear:"Back to the dry B01."},
    {k:"play",t:"Slide trigs on a copy: hold [PATTERN] + [TRIG 1] and press [RECORD]. Then hold [PATTERN] + [TRIG 12] and hold [STOP] until the countdown ends. Go to B12 (hold [PATTERN], press [TRIG 12]).",hl:"h:pattern p:s1 p:record p:s12 h:stop",hear:"B12 is an exact copy of B01."},
    {k:"play",t:"Place a slide: press [RECORD] and select [T6], your chords. Hold [SETTINGS] and press [TRIG 9].",hl:"p:record h:track p:t6 h:settings p:s9",hear:"A slide trig appears on step 9. It blinks twice."},
    {k:"play",t:"Give it a destination: hold [TRIG 9] and turn [SWEEP] and [DECAY] to very different values. Press [RECORD] again and listen.",hl:"h:s9 t:sweep t:decay p:record",hear:"Between step 1 and step 9 the chord morphs smoothly into the new sound."},
    save,
    {k:"check",t:"On the effects page, which track drives the pump?",q:["The track with the loudest volume","!A track whose pad you turned off (here the kick)","Every track at once","None: it's an LFO"],a:"Turning a pad off takes that track out of the effects and makes it the pump's trigger. With no pad off, the pump fires on every quarter note.",hear:"The kick leads, the rest breathe."},
    {k:"check",t:"What does a slide trig do?",q:["Plays the note twice","!Glides every changed setting from the previous trig to this one","Mutes the track","Changes the tempo"],a:"Parameters that differ between the previous trig and the slide trig glide across the gap and arrive as the slide trig plays. Switches like the machine or GATE jump instead.",hear:"A morph you write into the pattern."}
  ],
  challenge:"Perform 32 bars of B01 using only this page: one repeat, one sweep, pump in the second half, and a tape stop at the end. Record it into Live."
},
/* ---------------- Arpeggiator ---------------- */
{ id:"m09", mod:"Arpeggiator", unit:"Modded Cycles", title:"Arpeggios", minutes:30,
  goal:"Learn what an arpeggio is, set up the arpeggiator on a synth track, and record a rolling arpeggio from a held chord.",
  listen:"No track this time. Hum A, C, E, C, A, C, E, C slowly, then faster. You've just played an arpeggio.",
  concepts:[
    {h:"What an arpeggio is",p:["Arpeggio comes from the Italian arpeggiare, to play like a harp: the notes of a chord one at a time instead of together. It turns a chord into a rhythm and a melody at once."]},
    {h:"The original: synth arpeggiators",p:["Around 1980, polyphonic synths such as Roland's Jupiter-8 (1981) and Juno-60 (1982) had arpeggiators built in: hold a chord and the synth plays its notes up, down, or up and down, over one to several octaves, locked to a clock. It became a sound of its own in synth-pop and electronic music."]},
    {h:"The mod",p:["This arpeggiator adds ARP (direction) and OCT (1 to 4 octaves) to the Cycles' RETRIG menu. It plays the notes you hold at the retrig rate, and live recording writes each arpeggiated note to its own step."]},
    {h:"The bridge: lessons 9 and 11",p:["A minor chord from lesson 11 is A, C and E. On lesson 9's trig-key map that's [TRIG 9], [TRIG 12] and [TRIG 16]. Hold those three and the arpeggiator walks the chord for you."]},
    {h:"Check on your unit",p:["A step holds one note, so at rates faster than one note per step only the last note of each step is recorded. Setting names follow the mod's guide; your screen may shorten them."]}
  ],
  steps:[
    {k:"learn",fig:"marp",t:"An arpeggiator takes the notes you hold and plays them one at a time, in an order you choose: up, down, up and down, or random, across one or more octaves.",hear:"The chord stays the same. The order and the octaves make the pattern."},
    {k:"learn",fig:{grid:{title:"A minor, arpeggiated",edit:false,presets:[
      {name:"UP",bpm:90,note:"A C E, A C E… in sixteenth notes.",rows:[{n:"Arp",s:"pluck",p:[57,60,64,57,60,64,57,60,64,57,60,64,57,60,64,57],v:hits("1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16",.7)},{n:"Kick",s:"kick",v:hits("1,5,9,13")}]},
      {name:"UPDN",bpm:90,note:"Up and back down, no repeated top or bottom note.",rows:[{n:"Arp",s:"pluck",p:[57,60,64,60,57,60,64,60,57,60,64,60,57,60,64,60],v:hits("1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16",.7)},{n:"Kick",s:"kick",v:hits("1,5,9,13")}]},
      {name:"UP, OCT 2",bpm:90,note:"The same three notes, then an octave higher.",rows:[{n:"Arp",s:"pluck",p:[57,60,64,69,72,76,57,60,64,69,72,76,57,60,64,69],v:hits("1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16",.7)},{n:"Kick",s:"kick",v:hits("1,5,9,13")}]}
    ]}},t:"Switch between the three while it plays. The chord never changes.",hear:"Three notes in groups of three against a beat in fours: that's why arpeggios roll."},
    modHome(9,90),
    {k:"play",t:"Select [T5] (hold [TRACK], press [T5]) and check that its machine is TONE. Turn [DECAY] to about 40 for short notes, and give it a little [DELAY SEND].",hl:"h:track p:t5 t:decay t:delay",hear:"Short, plucky notes with an echo."},
    {k:"play",t:"Set up the arpeggiator: press [FUNC] + [RETRIG]. Set RTE to 1/16 and A.ON to ON. Scroll down and set Arp to UP and Oct to 1. Press [BACK].",hl:"h:func p:retrig t:level p:back",hear:"If there are no Arp and Oct rows, this lesson needs the Arpeggiator mod."},
    {k:"play",t:"Hold [TRIG 9], [TRIG 12] and [TRIG 16] together.",hl:"h:s9 h:s12 h:s16",hear:"A, C, E, A, C, E… in sixteenth notes, for as long as you hold."},
    {k:"play",t:"Change direction: open the menu again and set Arp to DOWN, then UPDN, then RAND. Hold the chord after each change.",hl:"h:func p:retrig t:level h:s9 h:s12 h:s16",hear:"Down sounds like falling, UPDN like a wave, RAND like rain."},
    {k:"play",t:"Spread it: set Oct to 2, then 3, and hold the chord again. Then try RTE 1/12 for triplets.",hl:"h:func p:retrig t:level",hear:"More octaves make it climb. Triplets make it gallop."},
    {k:"play",t:"Add a kick: press [RECORD], select [T1] and place kicks on [TRIG 1], [TRIG 5], [TRIG 9] and [TRIG 13]. Press [RECORD] again.",hl:"p:record h:track p:t1 p:s1 p:s5 p:s9 p:s13",hear:"A pulse under the arpeggio."},
    {k:"play",t:"Record the arpeggio: set Arp back to UP and RTE to 1/16. Select [T5], hold [RECORD] and press [PLAY]. Hold [TRIG 9], [TRIG 12] and [TRIG 16] for one bar, then let go and press [RECORD] to stop recording.",hl:"h:track p:t5 h:record p:play h:s9 h:s12 h:s16 p:record",hear:"Each arpeggiated note is now a trig on its own step."},
    {k:"play",t:"Switch A.ON back off ([FUNC] + [RETRIG]) so the pads play normally again. The recorded notes are ordinary trigs: edit them like any others.",hl:"h:func p:retrig t:level",hear:"Try changing one note so the pattern isn't quite regular."},
    save,
    {k:"check",t:"What is an arpeggio?",q:["A chord played louder","!The notes of a chord played one at a time","A drum roll","A fast tempo"],a:"An arpeggio plays a chord's notes in turn, like a harp. The arpeggiator does it for you from the notes you hold.",hear:"Chord in, melody out."},
    {k:"check",t:"Arp is UP, Oct is 2, and you hold A, C and E. What plays?",q:["A, C, E over and over","E, C, A, then lower","!A, C, E, then A, C, E an octave higher, then back to the start","Only A"],a:"Oct 2 adds the same notes one octave up, so UP climbs through both octaves before starting again.",hear:"Octaves make an arpeggio feel bigger without new notes."}
  ],
  challenge:"Hold each chord of lesson 11 for one bar while live recording: A minor ([TRIG 9], [TRIG 12], [TRIG 16]), F major ([TRIG 5], [TRIG 9], [TRIG 12]), D minor ([TRIG 2], [TRIG 5], [TRIG 9]) and E minor ([TRIG 4], [TRIG 7], [TRIG 11]). Set T5's LEN to 64 first."
},
/* ---------------- Per-track filter ---------------- */
{ id:"m10", mod:"Per-track filter", unit:"Modded Cycles", title:"A filter on every track", minutes:35,
  goal:"Learn what low-pass and high-pass filters do, and use the per-track filter to darken chords, thin out hats and make a filter pluck.",
  listen:"No track this time. Play B01 and listen to your hats and chords. In lesson 6 you darkened them by turning modulation down; this lesson does it with a real filter.",
  concepts:[
    {h:"The original: the synth filter",p:["Most synths make a bright, harmonic-rich wave and then carve it with a filter. A low-pass filter lets the lows through and removes the highs above its cutoff; a high-pass does the opposite. Resonance boosts the frequencies right at the cutoff.","Robert Moog's ladder filter removes 24 dB per octave above the cutoff. Oberheim's SEM module (1974) used a gentler 12 dB-per-octave, 2-pole design that keeps more of the sound's body. This mod adds a 2-pole filter to every track."]},
    {h:"One knob, both ways",p:["DJ mixers made the single filter knob famous: turn left and the music gets muffled (low-pass), turn right and it gets thin (high-pass), centre is off. The mod's cutoff works the same way: L values on the left, OFF in the middle, H values on the right."]},
    {h:"The bridge: lessons 6 and 8",p:["In lesson 6 the Cycles had no filter, so you darkened sounds by turning modulation down, which makes fewer harmonics at the source. A filter removes harmonics after they're made. Both darken, but a filter can also go thin, and it can move.","In lesson 8 an LFO moved a knob for you. The filter's cutoff, resonance, envelope amount and decay are LFO destinations too (FREQ, RESO, FENV, FDEC)."]},
    {h:"Check on your unit",p:["Hold [MACHINES] and turn [SWEEP] (cutoff), [CONTOUR] (resonance), [COLOR] (envelope amount) or [SHAPE] (envelope decay). Pressing [MACHINES] alone still opens the machine menu. The filter can't be combined with Model-TG or with LFO 2, 3, 4.","If you flashed Model-TG instead, [MACHINES] + [SWEEP] and [CONTOUR] give you its own low-pass filter and resonance on every machine: the low-pass steps here work, the high-pass and envelope ones don't."]}
  ],
  steps:[
    {k:"learn",fig:"mfilter",t:"A low-pass filter keeps the lows and removes the highs, so a sound gets darker. A high-pass does the opposite, so it gets thinner. On this mod one knob does both: left is low-pass, right is high-pass, the centre is off.",hear:"Low-pass for warmth and distance, high-pass for space and lightness."},
    modHome(10,90),
    {k:"play",t:"Build a loop to filter: press [RECORD]. On T1, kicks on [TRIG 1] and [TRIG 9]. On T3, hats on [TRIG 1], [TRIG 3], [TRIG 5], [TRIG 7], [TRIG 9], [TRIG 11], [TRIG 13] and [TRIG 15]. On T6, one chord on [TRIG 1], with [DECAY] at about 100. Press [RECORD] again, then [PLAY].",hl:"p:record h:track p:t1 p:s1 p:s9 p:t3 p:t6 t:decay p:play",hear:"A plain loop: kick, steady hats, one ringing chord per bar."},
    {k:"play",t:"Darken the chord: select [T6]. Hold [MACHINES] and turn [SWEEP] left to about L30. Let go of [MACHINES].",hl:"h:track p:t6 h:machines t:sweep",hear:"The chord sounds further away, as if through a wall."},
    {k:"play",t:"Add resonance: hold [MACHINES] and turn [CONTOUR] up to about 70. Then sweep [SWEEP] slowly while still holding [MACHINES].",hl:"h:machines t:contour t:sweep",hear:"A whistling peak moves through the chord as you sweep."},
    {k:"play",t:"Make it a filter pluck: hold [MACHINES], turn [COLOR] (envelope amount) to about +40 and [SHAPE] (envelope decay) short.",hl:"h:machines t:color t:shape",hear:"Each chord opens bright and closes fast: the classic synth pluck."},
    {k:"play",t:"Thin the hats: select [T3]. Hold [MACHINES] and turn [SWEEP] right to about H30.",hl:"h:track p:t3 h:machines t:sweep",hear:"The hats lose their body and become a light, airy tick."},
    {k:"play",t:"Lock one hat: press [RECORD]. Hold [TRIG 7], then hold [MACHINES] and turn [SWEEP] back to OFF. Press [RECORD] again.",hl:"p:record h:s7 h:machines t:sweep",hear:"One full-bodied hat among thin ones: a small accent."},
    {k:"play",t:"Let it move: select [T6] and press [LFO]. Set DST to FREQ and DEP to about 30, then press [BACK]. Set [LFO SPEED] to 32.",hl:"h:track p:t6 p:lfo t:level p:back t:lfospd",hear:"The chord's cutoff drifts open and closed every few bars."},
    save,
    {k:"check",t:"You want the hats thinner and lighter. Which filter setting?",q:["L: low-pass","!H: high-pass","OFF","Resonance at the top"],a:"A high-pass removes the lows and keeps the highs, so hats lose their body and get lighter. A low-pass would make them darker instead.",hear:"Left darker, right thinner."},
    {k:"check",t:"What does resonance do?",q:["Changes the tempo","Adds reverb","!Boosts the frequencies right at the cutoff","Removes the highs"],a:"Resonance adds a peak at the cutoff. Sweep the cutoff with resonance up and you hear that peak move.",hear:"A little adds character. A lot whistles."}
  ],
  challenge:"Perform a filter build: start T6 at L64 (nearly closed) and open it to OFF over 8 bars, the way a DJ brings a track in."
},
/* ---------------- LFO 2, 3, 4 ---------------- */
{ id:"m11", mod:"LFO 2, 3, 4", unit:"Modded Cycles", title:"Layers of movement", minutes:30,
  goal:"Combine two LFOs on one sound, a slow sweep and a faster movement, and use the extra LFOs for live play.",
  listen:"No track this time. Listen to wind, or the sea: a slow swell with faster ripples on top. That's two speeds of movement at once.",
  concepts:[
    {h:"The original: several LFOs",p:["Modular synthesists patch many LFOs at once, each moving a different thing at a different speed. Most synths since have two or more; your MicroFreak has an LFO plus a cycling envelope that can act as a second one. Stock, each Model:Cycles track has just one."]},
    {h:"Slow plus fast",p:["One slow LFO gives a sound a shape over several bars. A second, faster one adds life inside each note. Together they stop a sound from feeling static or mechanical."]},
    {h:"The mod",p:["On the LFO page, press [LFO] again to reach LFO 2, 3 and 4. LFO 2 is saved with the sound and can be locked to steps; LFO 3 and 4 are for live play and aren't saved. The mod is credited to DavidCaruso's work."]},
    {h:"The bridge: lesson 8",p:["In lesson 8 one LFO moved one knob. Here LFO 1 keeps that job and LFO 2 adds a second movement on top."]},
    {h:"Check on your unit",p:["The mod's guide doesn't list LFO 2, 3 and 4's rows. This lesson assumes they look like LFO 1's (WAV, MUL, DST, DEP) and that each has its own speed row. It can't be combined with the per-track filter mod."]}
  ],
  steps:[
    {k:"learn",fig:"mlfos",t:"Two LFOs on one sound add their movements together. A slow one shapes the sound over bars; a fast one adds a ripple inside each note.",hear:"Slow for shape, fast for life."},
    modHome(11,90),
    {k:"play",t:"One long chord: select [T6] (CHORD). Press [RECORD], place a chord on [TRIG 1] and press [GATE] so it lights. Hold [TRIG 1], press [LEVEL/DATA] until LEN shows, and set it to 16. Press [RECORD] again, then [PLAY].",hl:"h:track p:t6 p:record p:s1 p:gate h:s1 p:level t:level p:play",hear:"One chord held for the whole bar."},
    {k:"play",t:"LFO 1, the slow one: hold [LFO] and turn [SWEEP] to about 40. Set [LFO SPEED] to 32.",hl:"h:lfo t:sweep t:lfospd",hear:"The chord's wavetable sweeps slowly, one cycle every few bars."},
    {k:"play",t:"LFO 2, the fast one: press [LFO], then press [LFO] again for LFO 2. Set WAV to SIN, DST to PAN and DEP to about 30. Set its speed to a quick value. Press [BACK].",hl:"p:lfo t:level p:back",hear:"The chord now swings left and right while it slowly sweeps. Use headphones."},
    {k:"play",t:"Compare: open LFO 2 again and set DEP to 0, then back to 30.",hl:"p:lfo t:level",hear:"With only one LFO it's smooth but flat. With both, it breathes."},
    {k:"play",t:"Lock LFO 2 to one step: press [RECORD], open LFO 2's page, hold [TRIG 1] and set DEP to 63. Press [RECORD] again.",hl:"p:record p:lfo h:s1 t:level",hear:"LFO 2 is saved with the sound, so its settings can be locked per step."},
    {k:"play",t:"Live movement: open LFO 3, set DST to REVERB SEND (or another destination) and play with DEP while the loop runs.",hl:"p:lfo t:level",hear:"LFO 3 and 4 aren't saved: use them for moves you only want in the moment."},
    save,
    {k:"check",t:"Which of the extra LFOs is saved with the sound and can be locked to steps?",q:["!LFO 2","LFO 3","LFO 4","None of them"],a:"LFO 2 is stored with the sound and accepts parameter locks. LFO 3 and 4 are for live play.",hear:"Write with LFO 2, perform with 3 and 4."},
    {k:"check",t:"Why combine a slow and a fast LFO?",q:["To change the tempo","!The slow one shapes the sound over bars and the fast one adds life inside each note","To make the sound louder","Because one LFO can't reach every knob"],a:"Two speeds of movement at once make a sound feel alive, like a swell with ripples on top.",hear:"Slow for shape, fast for life."}
  ],
  challenge:"Give your bass in B01 a slow LFO 1 on [SWEEP] and a very small LFO 2 on PITCH (vibrato). Keep LFO 2's depth tiny."
},
/* ---------------- 6-channel USB audio ---------------- */
{ id:"m12", mod:"6-channel USB audio", unit:"Modded Cycles", title:"Six tracks into Live", minutes:40,
  goal:"Record each Model:Cycles track to its own channel in Live, rebuild the space there, and mix your night track from six faders.",
  listen:"No track this time. Play B01 and listen for which track you'd like a little louder or quieter. Until now you could only balance them on the Cycles.",
  concepts:[
    {h:"The original: multitrack recording",p:["Studios record each instrument to its own track so every part can be balanced, panned and processed later. Separate recordings of each part are called stems. Elektron's Overbridge sends stems from several of its machines over USB, but the stock Model:Cycles sends only its stereo mix."]},
    {h:"The mod",p:["With 6-channel USB audio, track 1 arrives on USB input 1, track 2 on input 2, and so on, at 48 kHz. Each channel is the dry track before pan, delay and reverb. The stereo mix is no longer sent over USB, so the mix happens in Live. The mod builds on scottmetoyer's ms-multi-output."]},
    {h:"The bridge: lesson 16",p:["In lesson 16 you recorded the Cycles into Live as one stereo track. Now each track is its own audio track, so you can fix the balance after recording and add effects to one part only."]},
    {h:"Check on your unit",p:["On macOS nothing needs installing: the Cycles shows six inputs. On Windows the guide uses FlexASIO with channels = 6 and a 48 kHz project. Playing your computer's audio through the Cycles is unreliable in this mode, so use another output. Live's menu names here are from Live 11 and 12."]}
  ],
  steps:[
    {k:"learn",fig:"mstems",t:"Each Cycles track arrives in Live on its own channel. The channels are dry: no pan, delay or reverb. You rebuild the space in Live and mix the six faders.",hear:"Six faders instead of one stereo pair."},
    {k:"play",t:"Connect the Cycles to your computer with USB and open Live. In Live's Settings, open Audio and set the Audio Input Device to Model:Cycles and the sample rate to 48000.",hl:"",hear:"Live now listens to the Cycles."},
    {k:"play",t:"Turn on the six inputs: in the same Audio settings, open Input Config and enable mono inputs 1 to 6. Close the settings.",hl:"",hear:"Each track can now pick its own Cycles input."},
    {k:"play",t:"Make six audio tracks: insert six audio tracks (Cmd+T on a Mac, Ctrl+T on Windows). On each, set Audio From to Ext. In and pick input 1, 2, 3, 4, 5 and 6 in order. Name them kick, snare, hats, perc, bass, chords.",hl:"",hear:"One Live track per Cycles track."},
    {k:"play",t:"Listen in: set every track's Monitor to In. On the Cycles, go to B01 (hold [PATTERN], press [T2], press [TRIG 1]) and press [PLAY].",hl:"h:pattern p:t2 p:s1 p:play",hear:"Each Live meter moves with its own track. It sounds dry: the delay and reverb aren't there."},
    {k:"play",t:"Rebuild the space: in Live, put a Reverb on Return A and a delay on Return B. Turn up the chords' and hats' sends to taste.",hl:"",hear:"The night track gets its room back, now set per track in Live."},
    {k:"play",t:"Record it: arm all six tracks, press Live's record button in the Arrangement view, then press [PLAY] on the Cycles. Stop after 16 bars.",hl:"p:play",hear:"Six clips, one per track, all lined up."},
    {k:"play",t:"Mix: balance the six faders and pan the hats and perc a little apart. Solo each track once to hear what it's really doing.",hl:"",hear:"Things you couldn't hear in the stereo mix stand out on their own."},
    {k:"check",t:"Why don't the six channels include the Cycles' reverb?",q:["The reverb is broken","!Each channel is the dry track; delay and reverb are applied to the mix, which isn't sent in this mode","Live removes it","Reverb only works on T6"],a:"The stems are taken before pan, delay and reverb. Rebuild the space in Live with return tracks.",hear:"Dry stems, wet mix in Live."},
    {k:"check",t:"Which Cycles track arrives on USB input 3?",q:["T1","!T3","T6","All of them"],a:"Track 1 goes to input 1, track 2 to input 2, and so on up to track 6.",hear:"Name the Live tracks after the Cycles tracks."}
  ],
  challenge:"Record the five sections of lesson 15 as six stems and rebalance the breakdown in Live: bring the chords up and the hats down."
},
/* ---------------- workflow tweaks ---------------- */
{ id:"m13", mod:"Workflow tweaks", unit:"Modded Cycles", title:"Faster hands", minutes:30,
  goal:"Play mutes like a dub engineer with latching mute, and use the small workflow mods (trig preview, quick trig removal, dimmed lock trigs, numbers and the browser) to work faster.",
  listen:"No track this time. Think of a dub mix: instruments drop out and come back while the groove keeps going. Every drop is a hand on the mixing desk.",
  concepts:[
    {h:"The original: the desk as an instrument",p:["In 1970s Jamaica, engineers like King Tubby and Lee \"Scratch\" Perry played the mixing desk live: muting the drums for a bar, letting the bass carry, bringing everything back on the one. Mutes became part of the music, not just a fix."]},
    {h:"Latching mute",p:["Stock, you hold [FUNC] and press a pad to mute it. With latching mute, hold [TRACK] and tap [FUNC] once: [FUNC] stays lit and every pad tap mutes or unmutes its track. A short tap on [FUNC] alone exits. By drumkilla."]},
    {h:"The small ones",p:["Trig preview: with the sequencer stopped, hold a trig and press [PAGE] to hear that step alone. Quick removal: a trig pressed and released within half a second is removed. Dimmed lock trigs: lock trigs light steady and dim instead of blinking. Numbers: the track's volume and pan show as numbers. Browser: three names at a time, long names scroll. The last few are by djd_oz and drumkilla."]},
    {h:"The bridge: lessons 13 and 16",p:["In lesson 13 you threw sounds into dub delays; in lesson 16 you performed your arrangement with mutes. Latching mute makes those mutes one tap each, so both hands are free."]},
    {h:"Check on your unit",p:["These are separate mods: you may have flashed only some of them. With Model-TG, mutes also apply at once. The startup animation mod only changes the boot logo."]}
  ],
  steps:[
    {k:"learn",fig:{grid:{title:"Mutes as arrangement",edit:false,presets:[
      {name:"Everything",bpm:90,note:"The full groove.",rows:[{n:"Kick",s:"kick",v:hits("1,9")},{n:"Snare",s:"snare",v:hits("5,13")},{n:"Hat",s:"hat",v:hits("3,7,11,15",.6)},{n:"Bass",s:"bass",note:33,v:hits("1,4,11")}]},
      {name:"Drop the drums",bpm:90,note:"Only the bass: the dub drop.",rows:[{n:"Kick",s:"kick",v:hits("")},{n:"Snare",s:"snare",v:hits("")},{n:"Hat",s:"hat",v:hits("")},{n:"Bass",s:"bass",note:33,v:hits("1,4,11")}]},
      {name:"Drums and bass",bpm:90,note:"Hats out: heavier and emptier.",rows:[{n:"Kick",s:"kick",v:hits("1,9")},{n:"Snare",s:"snare",v:hits("5,13")},{n:"Hat",s:"hat",v:hits("")},{n:"Bass",s:"bass",note:33,v:hits("1,4,11")}]}
    ]}},t:"Switch between the three while it plays. Nothing is rewritten: only mutes change. That's how a dub engineer arranges live.",hear:"The return after a drop hits harder than the groove ever did on its own."},
    modHome(13,90),
    {k:"play",t:"Build a groove: press [RECORD]. T1 kicks on [TRIG 1] and [TRIG 9]. T2 snares on [TRIG 5] and [TRIG 13]. T3 hats on [TRIG 3], [TRIG 7], [TRIG 11] and [TRIG 15]. On T5 (TONE), hold [FUNC] and turn [PITCH] to -12, then place notes on [TRIG 1], [TRIG 4] and [TRIG 11]. Press [RECORD] again, then [PLAY].",hl:"p:record h:track p:t1 p:t2 p:t3 p:t5 h:func t:pitch p:play",hear:"The groove from the drawing."},
    {k:"play",t:"Latch the mutes: hold [TRACK] and tap [FUNC]. [FUNC] stays lit. Tap [T1], [T2] and [T3] to drop the drums, then tap them again on the 1 to bring them back.",hl:"h:track p:func p:t1 p:t2 p:t3",hear:"One tap per track, no holding: a dub drop."},
    {k:"play",t:"Play the desk for 16 bars: drop and return tracks on the bar lines. Tap [FUNC] alone to leave latching mute.",hl:"p:t1 p:t2 p:t3 p:t5 p:func",hear:"An arrangement made only from mutes."},
    {k:"play",t:"Read the numbers: select [T3] and turn [LEVEL/DATA]. Its volume shows as a number (0–127). Hold [FUNC] and turn it to see pan (-64 to 63). Set the hats to exactly 80, panned 10 to the right.",hl:"h:track p:t3 t:level h:func",hear:"Exact values instead of a bar: easy to match tracks or write down a mix."},
    {k:"play",t:"Preview a step: press [STOP]. Press [RECORD], hold [TRIG 5] on T2 and press [PAGE].",hl:"p:stop p:record h:s5 p:page",hear:"That one snare plays on its own, with all its settings."},
    {k:"play",t:"Remove quickly: on T3, tap [TRIG 7] and let go at once. The hat is removed. Place it again, then hold it longer: its settings show instead.",hl:"p:s7 h:s7",hear:"A quick tap removes; a long hold edits."},
    {k:"play",t:"Spot lock trigs: on T5, hold [FUNC] and press [TRIG 8]. Press [RECORD] to leave grid recording.",hl:"h:func p:s8 p:record",hear:"Lock trigs (no note, only settings) now light dim and steady instead of blinking."},
    {k:"play",t:"Browse faster: press [FUNC] + [MACHINES]. Three names show at once: > marks the cursor and ■ a folder. Press [BACK].",hl:"h:func p:machines p:back",hear:"Long names scroll, so you can read them in full."},
    save,
    {k:"check",t:"Latching mute is on. How do you mute T3?",q:["Hold [FUNC] and press [T3]","!Tap [T3]","Hold [T3] for two seconds","Press [PAGE]"],a:"With latching mute on, [FUNC] stays lit, so a single tap on a pad mutes or unmutes that track. A short tap on [FUNC] alone exits.",hear:"Both hands free for the desk."},
    {k:"check",t:"With the sequencer stopped, how do you hear one step on its own?",q:["Press [PLAY]","!Hold its trig and press [PAGE]","Mute every other track","Turn [CHANCE] to 100"],a:"Trig preview plays that step with its note, length and locks, even on a muted track.",hear:"Check a step without starting the pattern."}
  ],
  challenge:"Record a 32-bar mute performance of B01 into Live, using only latching mute. Count the bars before each return."
},
/* ---------------- MIDI out during THRU ---------------- */
{ id:"m14", mod:"MIDI OUT during THRU", unit:"Modded Cycles", title:"Play the MicroFreak from the Cycles", minutes:40,
  goal:"Understand MIDI OUT and THRU, sequence your MicroFreak from a Cycles track, and keep a keyboard in the chain with the THRU mod.",
  listen:"No track this time. Play your bassline from lesson 10 and imagine it on a different synth, with a real analog filter. That's what MIDI lets you do.",
  concepts:[
    {h:"The original: MIDI",p:["MIDI was agreed by synth makers in 1983, led by Dave Smith of Sequential and Ikutaro Kakehashi of Roland; the first public demo joined a Sequential Prophet-600 and a Roland Jupiter-6. It sends notes, velocity, clock and knob moves between instruments, not sound."]},
    {h:"OUT and THRU",p:["A MIDI OUT sends what the instrument itself plays. A MIDI THRU copies what arrives at MIDI IN, so you can chain instruments. The Cycles has one port that does either, set in the MIDI PORTS menu."]},
    {h:"The mod",p:["Stock, THRU only forwards what comes in, so the Cycles' own notes are lost. With this mod, THRU sends both: the incoming notes and the Cycles' own clock and notes. A second version of the mod (Live MIDI OUT + THRU toggle) lets you switch between the two with [FUNC] + a press of [LEVEL/DATA]. Both are by AveyCole; you can only flash one."]},
    {h:"The bridge: lesson 10",p:["Your bassline from lesson 10 can now play the MicroFreak, layered with the Cycles' own TONE or on its own. Layering two sounds that each do one job is lesson 7's idea again."]},
    {h:"Check on your unit",p:["Both units use 3.5 mm MIDI jacks with DIN adapters; the Cycles' OUT POL setting must match the cable type (STD for standard Type A). Check that the MicroFreak listens on MIDI channel 1 in its own MIDI settings. If the Cycles follows an incoming clock and also sends clock, turn CLK OUT off to avoid double clock."]}
  ],
  steps:[
    {k:"learn",fig:"mmidi",t:"OUT sends the Cycles' own notes. Stock THRU only copies what comes in. With the mod, THRU sends both, so a keyboard and the Cycles can play the MicroFreak through one cable.",hear:"MIDI carries instructions, not sound: connect the MicroFreak's audio separately."},
    {k:"play",t:"Cables: connect the Cycles' MIDI OUT/THRU (with its DIN adapter) to the MicroFreak's MIDI IN (with its adapter) using a standard MIDI cable. Connect the MicroFreak's audio out to your mixer or interface.",hl:"",hear:"Two cables: MIDI between the boxes, audio from the MicroFreak."},
    modHome(14,90),
    {k:"play",t:"Ports: press [SETTINGS], open CONFIG, then MIDI, then PORTS. Set OUT TO to MID and OUT/THRU to OUT. Press [BACK] until you're out.",hl:"p:settings t:level p:level p:back",hear:"The port now sends the Cycles' MIDI."},
    {k:"play",t:"Channel: in the same MIDI menu, open OUT CHAN and set T5 OUT to 1. Press [BACK].",hl:"p:settings t:level p:back",hear:"Track 5 will talk on channel 1, the MicroFreak's."},
    {k:"play",t:"Let T5 send: press [FUNC] + [TRACK], select [T5] (hold [TRACK], press [T5]), and check MOUT. Press [BACK].",hl:"h:func p:track h:track p:t5 t:level p:back",hear:"T5 now sends its notes, velocity and length out of the MIDI port."},
    {k:"play",t:`Write a line: press [RECORD] and on T5 place notes on [TRIG 1], [TRIG 4], [TRIG 7] and [TRIG 11]. On [TRIG 7], ${noteLock} 7 semitones up. Press [RECORD] again, then [PLAY].`,hl:"p:record p:s1 p:s4 p:s7 p:s11 h:s7 p:level t:level p:play",hear:"The MicroFreak plays the line along with the Cycles' TONE."},
    {k:"play",t:"Choose the layer: turn T5's [LEVEL/DATA] down to 0 to hear only the MicroFreak, or keep both for a layer. Shape the MicroFreak's filter while it plays.",hl:"t:level",hear:"The Cycles sequences, the MicroFreak sings."},
    {k:"play",t:"Sync: in MIDI SYNC, set CLK OUT to ON so the MicroFreak's arpeggiator and LFO can follow the Cycles' tempo.",hl:"p:settings t:level",hear:"Tempo-synced movement on both boxes."},
    {k:"play",t:"Try THRU with the mod: back in PORTS, set OUT/THRU to THR. Press [PLAY] again.",hl:"p:settings t:level p:play",hear:"With the mod, the MicroFreak still plays the Cycles' notes. Stock THRU would go silent. A keyboard into the Cycles' MIDI IN would now pass through too."},
    save,
    {k:"check",t:"Stock THRU is set and the Cycles is playing. What does the MicroFreak receive?",q:["The Cycles' notes","Both","!Only what arrives at the Cycles' MIDI IN","Audio"],a:"Stock THRU only copies the input. The mod adds the Cycles' own notes and clock to it.",hear:"OUT: mine. THRU: theirs. THRU with the mod: both."},
    {k:"check",t:"What does MOUT on a track do?",q:["Mutes the track","!Sends that track's notes, velocity and length out over MIDI","Changes the machine","Records audio"],a:"With MOUT checked, the track's sequencer data goes out on its MIDI channel (set in OUT CHAN) as well as playing its own sound.",hear:"One track, two instruments."}
  ],
  challenge:"Send T6 to the MicroFreak too: set T6 OUT to 1 and turn MOUT on for T6. The CHORD track sends only its trig note over MIDI, so the MicroFreak plays the chord's root: a bass under your chords."
},
/* ---------------- tempo up to 546 BPM ---------------- */
{ id:"m15", mod:"Tempo up to 546 BPM", unit:"Modded Cycles", title:"When rhythm turns into pitch", minutes:25,
  goal:"Hear how a rhythm becomes a tone when it gets fast enough, using tempos past the stock 300 BPM limit.",
  listen:"No track this time. Tap a table slowly, then faster and faster. At some point you stop hearing taps and start hearing a buzz.",
  concepts:[
    {h:"The original idea: one continuum",p:["In his 1957 essay \"…how time passes…\", the composer Karlheinz Stockhausen argued that rhythm and pitch are the same thing at different speeds. Repeat a click a few times a second and you hear a rhythm. Past roughly 20 times a second, the ear hears a low tone instead."]},
    {h:"The numbers",p:["At 90 BPM, sixteenth notes come 6 times a second. At 300 BPM, the stock limit, they come 20 times a second: right at the edge. At 546 BPM they come about 36 times a second, which sounds like a low D. Halving the rate drops the tone an octave, just like halving a string's speed."]},
    {h:"The mod",p:["The tempo is stored as 1/120 of a BPM in 16 bits, which is why the ceiling is 546 (65,535 ÷ 120). Tap tempo and incoming MIDI clock follow it, and tempo-synced LFOs stay accurate at those speeds."]},
    {h:"The bridge: lessons 1 and 9",p:["In lesson 1 you felt the pulse and the grid. In lesson 9 an octave was a doubling. Here they meet: double the pulse and the buzz goes up an octave."]},
    {h:"Check on your unit",p:["Projects saved above 300 BPM reopen at 120 BPM on the stock firmware. Fast retrigs and heavy machines add processor load, so keep this to a simple sound. Save this pattern at a normal tempo."]}
  ],
  steps:[
    {k:"learn",fig:"mpitch",t:"Sixteenth notes at 90 BPM are a pulse. At 300 they flutter. At 546 they come about 36 times a second and turn into a low buzz.",hear:"The ear stops counting at about 20 per second."},
    modHome(15,120),
    {k:"play",t:"A tick on every step: select [T3] (METAL) and turn [DECAY] very short. Press [RECORD] and place trigs on all 16 trig keys. Press [RECORD] again, then [PLAY].",hl:"h:track p:t3 t:decay p:record p:play",hear:"Steady sixteenth-note ticks."},
    {k:"play",t:"Speed up: press [TEMPO] and turn [LEVEL/DATA] slowly up to 300.",hl:"p:tempo t:level",hear:"The ticks blur into a flutter."},
    {k:"play",t:"Go past the limit: keep turning to 546 BPM.",hl:"t:level",hear:"A low, rough tone. The rhythm has become a note."},
    {k:"play",t:"Drop an octave: press [RECORD] and remove every even trig ([TRIG 2], [TRIG 4] … [TRIG 16]). Press [RECORD] again.",hl:"p:record p:s2 p:s4 p:s16 p:record",hear:"Half the rate: back below the edge, a flutter again, an octave lower."},
    {k:"play",t:"Put the even trigs back the same way. Then turn [LEVEL/DATA] slowly down from 546 towards 300.",hl:"p:record t:level",hear:"The buzz slides down in pitch as the tempo falls, until it breaks back into ticks."},
    {k:"play",t:"Back to safety: set the tempo to 120 and press [BACK]. Then save: hold [FUNC] and long-press [SETTINGS].",hl:"t:level p:back h:func p:settings",hear:"Saved below 300, the pattern opens the same on stock firmware."},
    {k:"check",t:"Why does the 546 BPM hat pattern sound like a note?",q:["The machine changed","!Above about 20 hits a second, the ear hears a pitch instead of separate hits","The reverb is on","It's out of tune"],a:"Repeated clicks fast enough fuse into a tone. Sixteenths at 546 BPM are about 36 per second, a low D.",hear:"Rhythm and pitch: the same thing at different speeds."},
    {k:"check",t:"You save a project at 400 BPM and later load it on the stock firmware. What happens?",q:["It plays at 400 BPM","It won't load","!It opens at 120 BPM","It plays at 300 BPM"],a:"The stock firmware can't store tempos above 300, so the mod's guide says such projects reopen at 120 BPM.",hear:"Save fast experiments, then set a normal tempo before you save the project."}
  ],
  challenge:"Set the tempo to 412.5 BPM. Sixteenths then come 27.5 times a second, the pitch of the lowest A on a piano. Compare it with 546 and write down which you'd use as a drone."
},
];

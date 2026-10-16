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

const modHome=(n,bpm)=>({k:"play",t:`Go to this lesson's own pattern: hold [PATTERN], press [T4] (bank D), then press [TRIG ${n}]. If anything plays there, clear it with [FUNC] + [PLAY]. Press [TEMPO], set ${bpm} BPM with [LEVEL/DATA], and press [BACK].`,hl:`h:pattern p:t4 p:s${n} p:tempo t:level p:back`,hear:`D0${n} on the screen, at ${bpm} BPM.`});
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
];

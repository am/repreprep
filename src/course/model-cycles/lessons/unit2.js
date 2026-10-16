import { hits } from "../../shared/html.js";
import { TRACK_MAP, songHome, songMachines, noteLock } from "./helpers.js";

export const UNIT_2_LESSONS = [
{ id:"w05", week:5, unit:"Sound", title:"What makes a sound", minutes:35,
  goal:"Describe any sound by its pitch, loudness, timbre and envelope, and reshape your kick and snare into soft, round night-time drums.",
  listen:"Trentemøller, \"Miss You\". Listen to how gently each sound starts and how slowly it fades away, rather than how loud it is.",
  concepts:[
    {h:"Four things every sound has",p:["Pitch is how high or low it is. Loudness is how strong it is. Timbre is everything else: the reason a piano and a flute playing the same note, equally loud, still sound different. The fourth is the envelope: the sound's shape in time."]},
    {h:"The envelope",p:["ADSR: attack (how fast it starts), decay (how fast it falls), sustain (the level it holds while you hold the key) and release (how long it fades after). A, D and R are times; S is a level. Drums are almost all attack and decay."]},
    {h:"Words for sounds",p:["Producers describe timbre in everyday words: round, soft, dusty, glassy, bright, dark. Naming what you want, like \"a soft, round kick\", makes it much easier to find with the knobs."]},
    {h:"Your kit, one sound at a time",p:["Stock drum sounds are built to punch. This unit reshapes B01 for the night, one sound at a time, starting here with a soft, round kick and snare."]}
  ],
  steps:[
    {k:"learn",fig:"u2four",t:"Every sound has four sides: pitch (high or low), loudness, timbre (its colour) and an envelope (its shape in time). Two sounds can share three of them and still feel completely different because of the fourth."},
    {k:"learn",fig:"u2adsr",t:"An envelope is a sound's shape in time. Attack: how fast it rises. Decay: how fast it falls to the sustain level. Sustain: the level held while you hold the key. Release: the fade after you let go.",hear:"A pad has a slow attack and long release. A drum is an instant attack and a decay."},
    {k:"learn",fig:"u2gate",t:"On the Model:Cycles every sound starts at full level at once and then decays, and [DECAY] sets how long. [GATE] adds a hold: the sound stays at full level while the pad is held, or for the trig's length, before it decays."},
    {k:"learn",fig:"u2kick",t:"Three knobs decide if a kick punches or rolls. [SWEEP] sets how far and how fast its pitch drops. [CONTOUR] adds a burst at the start that you hear as a click. [DECAY] sets how long it rings."},
    {k:"play",t:"Go to B01 (hold [PATTERN], press [T2], press [TRIG 1]) and press [PLAY]. Select the kick (hold [TRACK], press [T1]) and tap [T1] a few times. Describe the stock kick in two words.",hl:"h:pattern p:t2 p:s1 p:play h:track p:t1",hear:"Stock kicks are usually punchy and clicky: good in a club, loud for night music."},
    {k:"play",t:"Make it round: turn [SWEEP] down until the pitch barely drops, and [CONTOUR] down until the click softens. Turn [COLOR] and [SHAPE] down too, for less modulation and a purer tone.",hl:"t:sweep t:contour t:color t:shape",hear:"A soft thump, closer to a low hum than a laser."},
    {k:"play",t:"Tune and lengthen it: hold [FUNC] and turn [PITCH] down 2 or 3 semitones. Turn [DECAY] up until each kick rings a little but stops before the kick on [TRIG 11]. Went too far? Press [BACK] within about three seconds to undo.",hl:"h:func t:pitch t:decay p:back",hear:"Deeper and rounder, with a short soft tail."},
    {k:"play",t:"Hear a sustain: press [GATE] so it lights, then press and hold [T1] for a second before letting go. Try short and long holds. Press [GATE] again to switch it off.",hl:"p:gate h:t1",hear:"With GATE on, the kick holds at full level while you hold the pad, then decays when you let go."},
    {k:"play",t:"Hear loudness against timbre: turn [VOLUME + DIST] up from 60 towards 90, then back to 60. Above 60 it gets louder and starts to distort.",hl:"t:vol",hear:"First just louder, then rougher. Distortion adds harmonics, which changes the timbre too."},
    {k:"play",t:"Soften the snare: select [T2]. Turn [SHAPE] down to soften its noise and [COLOR] down for a more tonal body. Hold [FUNC] and turn [PITCH] down 2 semitones. Set [DECAY] so it sounds like a soft brush, not a crack.",hl:"h:track p:t2 t:shape t:color h:func t:pitch t:decay",hear:"A woody, muted snare. Your ghost note on [TRIG 12] softens with it."},
    {k:"play",t:"Write two words for your new kick and two for your snare (round, soft, woody, dull…). Then save: hold [FUNC] and long-press [SETTINGS].",hl:"h:func p:settings",hear:"Same beat as lesson 4, but it now sounds like late at night."},
    {k:"check",t:"You turned SWEEP down on the kick. What did that change?",q:["How long it rings","!How far its pitch drops after each hit","How loud it is","How late it plays"],a:"On the KICK machine, SWEEP sets the depth and time of the pitch sweep. A big, fast drop sounds punchy; a small one sounds round. DECAY is the knob for how long it rings.",hear:"Shape the envelope first (DECAY, GATE), then the colour (the four macros)."}
  ],
  challenge:"Pick a sound from a track you love and describe it in four words: one each for its pitch, loudness, timbre and envelope. Try to get T1 or T2 close to it."
},
{ id:"w06", week:6, unit:"Sound", title:"Bright and dark", minutes:40,
  goal:"Hear harmonics, tell bright sounds from dark ones, and use the macros to make a dark and a bright version of your loop.",
  listen:"Floating Points, \"Last Bloom\". Notice which sounds feel muffled and dark and which feel airy and bright, and whether that changes as the track goes on.",
  concepts:[
    {h:"Harmonics",p:["Almost every sound is a stack of tones: the note you hear plus quieter harmonics above it. Few harmonics sound dark, soft or pure. Many sound bright, buzzy or glassy."]},
    {h:"Waveforms",p:["A sine wave has no harmonics, so it is pure and round. A triangle adds a few quiet ones, a square more, and a sawtooth has them all, so it's the brightest."]},
    {h:"Filters and FM",p:["A low-pass filter darkens a sound by removing the harmonics above a cutoff. FM works the other way: one oscillator wobbles another's pitch very fast, which adds harmonics. More modulation, brighter sound.","The Model:Cycles is an FM machine with no filter knob, so you darken a sound by turning its modulation down."]},
    {h:"Listen, don't calculate",p:["COLOR, SHAPE, SWEEP and CONTOUR do different jobs on each machine. Don't think in FM terms: turn one, listen, and name what changed."]}
  ],
  steps:[
    {k:"learn",fig:"u2waves",t:"Every sound is a stack of tones: the note you hear plus quieter harmonics above it. A sine has none, a sawtooth has them all. The more harmonics, the brighter the sound."},
    {k:"learn",fig:"u2spectrum",t:"A low-pass filter darkens a sound by turning down everything above a cutoff. Burial's hats in \"Ghost Hardware\" are pitched way down with their highs cut away, so they sound dusty rather than crisp."},
    {k:"learn",fig:"u2fm",t:"FM, in plain words: one oscillator wobbles another's pitch very fast. A little wobble adds a few harmonics; a lot adds many, then noise. The Model:Cycles has no filter knob, so less modulation is how you go dark."},
    {k:"learn",fig:"u2macros",t:"The four macros mean something different on each machine. On five of the six, SHAPE and CONTOUR set how much modulation there is, so they are your main brightness knobs.",hear:"COLOR and SWEEP change the tuning and movement of the tone. Use your ears to decide if that's brighter."},
    {k:"play",t:"Let pattern changes wait for the bar: on B01, hold [FUNC] and press [PAGE] to open the SCALE menu, set CHG to 64 with [LEVEL/DATA], then press [BACK].",hl:"h:func p:page t:level p:back",hear:"Nothing changes in the sound. When you pick another pattern now, it starts at the end of your 4 bars."},
    {k:"play",t:"Make a twin: hold [PATTERN] + [TRIG 1] and press [RECORD] to copy B01. Then hold [PATTERN] + [TRIG 4] and press and hold [STOP] until the countdown finishes. Go to B04 (hold [PATTERN], press [TRIG 4]).",hl:"h:pattern p:s1 p:record p:s4 h:stop",hear:"B04 is an exact copy. B04 becomes the bright version, B01 the dark one."},
    {k:"play",t:"Brighten B04's hats: press [PLAY], select [T3] and turn [SHAPE] and [CONTOUR] up. Hold [FUNC] and turn [PITCH] up a few semitones.",hl:"p:play h:track p:t3 t:shape t:contour h:func t:pitch",hear:"Crisp, glassy hats, the kind that cut through a club."},
    {k:"play",t:"Brighten the rest of B04: on T1 turn [CONTOUR] up for click, on T2 turn [SHAPE] up for more crack, and on T4 turn [SHAPE] and [COLOR] up.",hl:"h:track p:t1 t:contour p:t2 t:shape p:t4 t:color",hear:"The same beat, now hard and shiny."},
    {k:"play",t:"Now the dark one: hold [PATTERN] and press [TRIG 1]. When B01 starts, select [T3], hold [FUNC] and turn [PITCH] well down. Turn [SHAPE] and [CONTOUR] down and [DECAY] a little shorter.",hl:"h:pattern p:s1 h:track p:t3 h:func t:pitch t:shape t:contour t:decay",hear:"Dusty hats: more like brushed paper than cymbals."},
    {k:"play",t:"Darken the perc too: select [T4] and turn [SHAPE] and [COLOR] down. Leave your round kick and snare from lesson 5 as they are.",hl:"h:track p:t4 t:shape t:color",hear:"A soft, muted loop where nothing pokes out."},
    {k:"play",t:"Compare: switch between B01 and B04 while it plays (hold [PATTERN], press [TRIG 1] or [TRIG 4]). Finish on B01, your track, and save it: hold [FUNC] and long-press [SETTINGS].",hl:"h:pattern p:s1 p:s4 h:func p:settings",hear:"Same rhythm, two worlds. Dark sits back and lets you lean in; bright jumps forward."},
    {k:"check",t:"You want your hats darker. Which move works on the Model:Cycles?",q:["Turn SHAPE and CONTOUR up","!Turn SHAPE and CONTOUR down, and lower PITCH","Turn VOLUME + DIST up","Turn SWING up"],a:"Less modulation means fewer harmonics, and a lower pitch moves everything down. Together they do the job a low-pass filter does on other synths.",hear:"More harmonics, brighter. Fewer, darker. In night music, start dark and add brightness only where you want the ear to go."}
  ],
  challenge:"In B01, give just one hat its own sparkle: press [RECORD], hold that hat's trig and turn [SHAPE] up. One bright hit in a dark loop pulls the ear to it."
},
{ id:"w07", week:7, unit:"Sound", title:"Building a sound palette", minutes:40,
  goal:"Build a sound from layers that each do one job, add a found sound, and save your night-time kit.",
  listen:"Burial, \"Near Dark\". Listen past the drums to the crackle and small odd sounds around them. The texture is part of the music.",
  concepts:[
    {h:"Body, top and tail",p:["A big drum is often several sounds played at once. The body gives weight and pitch, the top gives the bright attack, and the tail sets how long it lingers. Describe the drum you want, then give each job to one layer."]},
    {h:"Layers that don't fight",p:["Layers work when each owns a different height (low, middle, high) and a different moment (the start or the tail). Two layers doing the same job just get louder and muddier."]},
    {h:"Found sounds and texture",p:["Burial built percussion from sounds like video game effects and laid crackle under his tracks. Kiasmos used a lighter's wheel as a hat. Small, odd sounds give a track its own world."]},
    {h:"A kit is a palette",p:["Your six track sounds together are a kit. The Model:Cycles can save the whole kit, and a preset lock lets a single step borrow a different sound."]}
  ],
  steps:[
    {k:"learn",fig:"u2layers",t:"Three layers, one hit: a short, bright top for the attack, a body for weight and pitch, and a tail for length. Played together, the ear hears one drum."},
    {k:"learn",fig:{grid:{title:"One snare, three layers",presets:[
      {name:"Body",bpm:90,note:"A soft, low hit on 2 and 4: weight, but no edge.",rows:[{n:"Kick",s:"kick",v:hits("1,9,11")},{n:"Body",s:"perc",v:hits("5,13")},{n:"Top",s:"rim",v:hits("")},{n:"Tail",s:"ohat",v:hits("")},{n:"Hat",s:"hat",v:hits("3,7,11,15",.4)}]},
      {name:"Body + top",bpm:90,note:"A quiet click on the same steps gives it an edge.",rows:[{n:"Kick",s:"kick",v:hits("1,9,11")},{n:"Body",s:"perc",v:hits("5,13")},{n:"Top",s:"rim",v:hits("5:.4,13:.4")},{n:"Tail",s:"ohat",v:hits("")},{n:"Hat",s:"hat",v:hits("3,7,11,15",.4)}]},
      {name:"Body + top + tail",bpm:90,note:"A soft noise that rings on lets the hit linger.",rows:[{n:"Kick",s:"kick",v:hits("1,9,11")},{n:"Body",s:"perc",v:hits("5,13")},{n:"Top",s:"rim",v:hits("5:.4,13:.4")},{n:"Tail",s:"ohat",v:hits("5:.3,13:.3")},{n:"Hat",s:"hat",v:hits("3,7,11,15",.4)}]}
    ]}},t:"Switch through the three versions while it plays. Each row is one layer on the same two steps. An example of the idea, built from this page's simple sounds.",hear:"With all three, it stops sounding like three sounds and becomes one fuller snare."},
    {k:"learn",fig:"u2palette",t:"Think of your kit as a palette: each sound owns its own spot, low or high, short or long. A new sound fits best in an empty spot. Leave room for the bass and chords you'll add later."},
    {k:"play",t:"Play B01. Your soft snare from lesson 5 is the body. Give it a tail: select [T2] and turn [DECAY] up a little, until each backbeat lingers.",hl:"p:play h:track p:t2 t:decay",hear:"A longer, softer hit."},
    {k:"play",t:"Add a top layer on T3: press [RECORD], select [T3], make sure the first page light is on, and press [TRIG 5] and [TRIG 13] so a hat plays with each snare.",hl:"p:record h:track p:t3 p:s5 p:s13",hear:"The snare gets an edge, but your dark hat is the wrong colour for it. Shape it next."},
    {k:"play",t:"Shape the top: hold [TRIG 5] and turn [DECAY] right down, then [PITCH] and [SHAPE] up. Do the same on [TRIG 13]. Hold both, press [LEVEL/DATA] until VEL shows, and set about 50.",hl:"h:s5 t:decay t:pitch t:shape h:s13 p:level t:level",hear:"A tiny bright tick that only adds edge. Listen to the snare: it should sound like one drum."},
    {k:"play",t:"Copy the layer to every bar: hold [TRIG 5] and [TRIG 13] and press [RECORD]. Press [PAGE] for page 2, hold [TRIG 5] and press [STOP] to paste. Repeat on pages 3 and 4.",hl:"h:s5 h:s13 p:record p:page p:stop",hear:"Every backbeat has its top now, locks included."},
    {k:"play",t:"Make a found sound on T4: select [T4], hold [FUNC] and turn [PITCH] up an octave, turn [DECAY] short and [COLOR] up until it sounds like a lighter's wheel or a click, not a drum.",hl:"h:track p:t4 h:func t:pitch t:decay t:color",hear:"A small, odd tick drifting on its 12-step loop and coming and going with its chance."},
    {k:"play",t:"Borrow a sound with a preset lock: still on T4, hold [TRIG 10] and press [MACHINES] to open the PRESET menu. Browse with [LEVEL/DATA], press [T4] to hear each one, and press [LEVEL/DATA] to lock a small, strange sound to that step.",hl:"h:s10 p:machines t:level p:t4 p:level",hear:"Once round each 12-step loop, T4 plays a different sound. [MACHINES] lights when you hold that trig."},
    {k:"play",t:"Save the kit: press [RECORD] to leave grid recording. Press [FUNC] + [MACHINES], then [FUNC] to open the save menu. Choose SAVE KIT and press [LEVEL/DATA]. Name it (hold [FUNC] and turn [LEVEL/DATA] to change a letter), press [LEVEL/DATA] and choose YES.",hl:"p:record h:func p:machines t:level p:level",hear:"Your six sounds are now a kit you can load in other projects."},
    {k:"play",t:"Save the pattern too: hold [FUNC] and long-press [SETTINGS].",hl:"h:func p:settings"},
    {k:"check",t:"In your layered snare, what job does the short T3 hit do?",q:["Adds weight and low end","!Adds a short, bright attack","Makes the snare ring longer","Moves the snare later in time"],a:"It's the top layer: a short, bright attack that gives the soft snare an edge. The snare itself is the body, and its longer DECAY is the tail.",hear:"Describe the drum first (body, top, tail), then give each job to one layer."}
  ],
  challenge:"Listen to Burial's \"Near Dark\" again and list three sounds that are neither drums nor melody. Try to make one of them on T4 and preset lock it to another T4 step."
},
{ id:"w08", week:8, unit:"Sound", title:"Movement", minutes:40,
  goal:"Make sounds move on their own with an LFO, choosing its speed, depth, shape and destination, and fade a sound in with a slow attack.",
  listen:"Floating Points, \"Silhouettes (I, II & III)\". Listen for sounds that keep slowly changing colour while the notes stay where they are.",
  concepts:[
    {h:"What an LFO is",p:["A low-frequency oscillator is a slow wave that turns a knob for you. Rate is how fast it moves, depth how far, shape the way it moves, and destination which knob it turns."]},
    {h:"Shapes",p:["Triangle and sine glide back and forth, square jumps between two values, sawtooth sweeps one way and snaps back, random picks a new value each time. On a beat, shapes the ear can follow usually groove better than random."]},
    {h:"The LFO on the Model:Cycles",p:["Each track has its own LFO. The LFO SPEED knob sets the rate (-64 to 63; 8, 16 and 32 lock to straight beats, negative values run it backwards). [LFO] opens WAV, MUL, DST and DEP. [FUNC] + [LFO] opens LFO SETUP: RST, FDE and SPH."]},
    {h:"An LFO as an envelope",p:["With WAV set to ENV, the LFO runs once from the start of each note and stops. Aim it at the volume with negative depth and the sound fades in: a slow attack."]}
  ],
  steps:[
    {k:"learn",fig:"u2lfo",t:"An LFO is a slow wave that turns a knob for you. Depth is how far the knob moves, rate how fast, and the waveform how it gets there. The Model:Cycles offers seven waveforms."},
    {k:"learn",fig:{grid:{title:"An LFO on the hats' volume",presets:[
      {name:"No LFO",bpm:90,note:"Every hat the same. An example of the idea.",rows:[{n:"Kick",s:"kick",v:hits("1,9,11")},{n:"Snare",s:"snare",v:hits("5,13")},{n:"Hat",s:"hat",v:Array(16).fill(.55)}]},
      {name:"Triangle",bpm:90,note:"Rises and falls once per bar.",rows:[{n:"Kick",s:"kick",v:hits("1,9,11")},{n:"Snare",s:"snare",v:hits("5,13")},{n:"Hat",s:"hat",v:[.2,.3,.4,.5,.6,.7,.8,.9,.9,.8,.7,.6,.5,.4,.3,.2]}]},
      {name:"Square",bpm:90,note:"Loud for half a bar, quiet for the other half.",rows:[{n:"Kick",s:"kick",v:hits("1,9,11")},{n:"Snare",s:"snare",v:hits("5,13")},{n:"Hat",s:"hat",v:[.8,.8,.8,.8,.8,.8,.8,.8,.25,.25,.25,.25,.25,.25,.25,.25]}]},
      {name:"Random",bpm:90,note:"A new value on every step.",rows:[{n:"Kick",s:"kick",v:hits("1,9,11")},{n:"Snare",s:"snare",v:hits("5,13")},{n:"Hat",s:"hat",v:[.5,.3,.8,.4,.6,.9,.3,.5,.7,.4,.8,.3,.6,.5,.9,.4]}]}
    ]}},t:"Here an LFO moves the hats' volume, shown as the height of each hit. The same 16 hats, four kinds of movement. Play each one.",hear:"The triangle breathes once a bar. Random sounds like an unsteady hand."},
    {k:"learn",fig:"u2reset",t:"LFO SETUP decides how the wave meets your notes. RST OFF lets it run freely, so each hit lands somewhere different on the wave. RST ON restarts it on every note. FDE fades the movement in or out; SPH sets where it starts."},
    {k:"learn",fig:"u2attack",t:"The ENV waveform runs once per note, like an envelope. Point it at the volume with depth -64 and it pulls the volume down at the start, then lets go: the sound fades in. GATE keeps it held while it does."},
    {k:"play",t:"Play B01 and select your dusty hats (hold [TRACK], press [T3]). Hold [LFO] and turn [DECAY] a little to the right. That makes DECAY the LFO's destination, and turning further sets the depth.",hl:"p:play h:track p:t3 h:lfo t:decay",hear:"The hats start to breathe: some short, some longer."},
    {k:"play",t:"Set the rate: turn [LFO SPEED] to 16, one of the values that lock to the beat. Try 8 and 32 too, then a negative value, which runs the wave backwards. Keep the one you like.",hl:"t:lfospd",hear:"Higher values move faster. Pick a speed that feels like breathing, not wobbling."},
    {k:"play",t:"Pick the shape: press [LFO] to open the LFO menu. DST now shows DECAY and DEP your depth. Use [LEVEL/DATA] to try each WAV, including random with a small DEP. Press [BACK] when you've chosen.",hl:"p:lfo t:level p:back",hear:"Triangle and sine glide, square flips between two lengths, random sounds like a human hand."},
    {k:"play",t:"Give the perc a slow drift: select [T4], hold [LFO] and turn [COLOR] a little. Turn [LFO SPEED] down to a small positive value, like 2, so it changes slowly. If it's still too fast, press [LFO] and set MUL lower.",hl:"h:track p:t4 h:lfo t:color t:lfospd p:lfo t:level",hear:"The found tick slowly changes colour from bar to bar."},
    {k:"play",t:"Hear RST: select [T3] again and press [FUNC] + [LFO] to open LFO SETUP. Set RST to ON with [LEVEL/DATA] and listen, then set it back to OFF.",hl:"h:track p:t3 h:func p:lfo t:level",hear:"ON: every hat gets the same slice of the wave and the movement disappears. OFF: it flows across the hats again."},
    {k:"play",t:"Still in LFO SETUP, try FDE at -30 (fade in) and +30 (fade out), and with RST ON try SPH at 0 and 64. Set FDE back to 0 and RST to OFF, press [BACK], then save B01: hold [FUNC] and long-press [SETTINGS].",hl:"t:level p:back h:func p:settings",hear:"Small changes, but now you know every setting on the LFO page. These setup settings can't be locked to a step."},
    {k:"play",t:"Try the slow attack on B04, your bright copy: hold [PATTERN], press [TRIG 4]. Select [T6] (CHORD), press [RECORD] and place a chord on [TRIG 1]. Hold it, press [LEVEL/DATA] until LEN shows, and set 8. Press [GATE] so it lights.",hl:"h:pattern p:s4 h:track p:t6 p:record p:s1 p:level t:level p:gate",hear:"A chord that holds for half a bar, then fades out."},
    {k:"play",t:"Press [FUNC] + [BACK], check FIX is OFF, and press [BACK]. Press [LFO] and set WAV to ENV, MUL to X1, DST to DIST and DEP to -64. Turn [LFO SPEED] to set how slowly it fades in.",hl:"h:func p:back p:lfo t:level t:lfospd",hear:"The chord swells in instead of starting at once: a slow attack made from an LFO."},
    {k:"check",t:"Your hats move with an LFO on DECAY. You set RST to ON and the movement disappears. Why?",q:["DEP went back to 0","RST switches the LFO off","!The LFO restarts on every note, so every hat gets the same part of the wave","The LFO speed doubled"],a:"RST ON restarts the wave each time a note is trigged. With a hat on every step, each one starts from the same point and gets the same movement. RST OFF lets the wave run freely across them.",hear:"An LFO is a hand on a knob: choose which knob, how far, how fast, and how it moves."}
  ],
  challenge:"Lock the LFO to one step: press [RECORD], press [LFO] to open the LFO menu, hold one hat's trig and use [LEVEL/DATA] to give only that step a much bigger DEP."
}
];

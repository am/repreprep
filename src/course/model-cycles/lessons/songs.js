import { hits } from "../../shared/html.js";
import { TRACK_MAP, songHome, songMachines, noteLock } from "./helpers.js";

export const SONG_LESSONS = [
{ id:"s01", song:"Kiasmos – Looped", unit:"Kiasmos", title:"Looped",
  goal:"Build a club loop around one piano-like chord figure, add the beat one layer at a time, and keep the low end light.",
  listen:"Kiasmos, \"Looped\" (from the album Kiasmos, 2014). Notice what stays in front the whole time, and how the beat builds up around it.",
  concepts:[
    {h:"What Kiasmos said",p:["Janus Rasmussen called Looped an experiment in putting piano and strings into a club track, and said the piano chords are pretty much the only thing in focus for most of the song. It runs at about 120 BPM."]},
    {h:"One idea, many layers",p:["Instead of writing new parts, keep one idea and let other layers arrive and leave around it. Each new layer is one step up in energy, and the ear stays with the idea."]},
    {h:"Low chords, light bass",p:["Ólafur Arnalds explained that because the piano chords sit low, the bass line can be lighter. Two busy parts in the same low range crowd each other."]}
  ],
  steps:[
    {k:"learn",fig:"layers",t:"Looped keeps one thing in focus: the piano chords. Everything else comes and goes around them, and each layer that arrives lifts the energy a step."},
    {k:"learn",fig:{grid:{title:"Build it in layers",presets:[
      {name:"Chords alone",bpm:120,note:"The idea on its own.",rows:[{n:"Chord",s:"keys",note:55,v:hits("1,7,11",.8)},{n:"Chord",s:"keys",note:58,v:hits("1,7,11",.7)},{n:"Chord",s:"keys",note:62,v:hits("1,7,11",.7)},{n:"Kick",s:"kick",v:hits("")},{n:"Hat",s:"hat",v:hits("")},{n:"Clap",s:"clap",v:hits("")}]},
      {name:"+ kick",bpm:120,note:"The same chords, now with a pulse.",rows:[{n:"Chord",s:"keys",note:55,v:hits("1,7,11",.8)},{n:"Chord",s:"keys",note:58,v:hits("1,7,11",.7)},{n:"Chord",s:"keys",note:62,v:hits("1,7,11",.7)},{n:"Kick",s:"kick",v:hits("1,5,9,13")},{n:"Hat",s:"hat",v:hits("")},{n:"Clap",s:"clap",v:hits("")}]},
      {name:"+ hats and clap",bpm:120,note:"The full beat. The chords haven't changed at all.",rows:[{n:"Chord",s:"keys",note:55,v:hits("1,7,11",.8)},{n:"Chord",s:"keys",note:58,v:hits("1,7,11",.7)},{n:"Chord",s:"keys",note:62,v:hits("1,7,11",.7)},{n:"Kick",s:"kick",v:hits("1,5,9,13")},{n:"Hat",s:"ohat",v:hits("3,7,11,15",.6)},{n:"Clap",s:"clap",v:hits("5,13",.7)}]}
    ]}},t:"Switch through the three versions while it plays. The chord part never changes. Only what surrounds it does.",hear:"With the beat under it, the same chords feel faster and more urgent."},
    {k:"learn",fig:{grid:{title:"Heavy or light low end",presets:[
      {name:"Busy bass",bpm:120,note:"A bass on every eighth note, under low chords.",rows:[{n:"Chord",s:"keys",note:55,v:hits("1,7,11",.8)},{n:"Chord",s:"keys",note:58,v:hits("1,7,11",.7)},{n:"Kick",s:"kick",v:hits("1,5,9,13")},{n:"Bass",s:"bass",note:31,v:hits("1,3,5,7,9,11,13,15",.8)}]},
      {name:"Light bass",bpm:120,note:"Two bass notes per bar. The chords breathe.",rows:[{n:"Chord",s:"keys",note:55,v:hits("1,7,11",.8)},{n:"Chord",s:"keys",note:58,v:hits("1,7,11",.7)},{n:"Kick",s:"kick",v:hits("1,5,9,13")},{n:"Bass",s:"bass",note:31,v:hits("1,11",.8)}]}
    ]}},t:"When the chords sit low, a busy bass fights them for the same space. Compare the two and listen to the chords, not the bass.",hear:"With the light bass you can hear each chord ring out."},
    songHome(1,120),
    songMachines("T1 KICK, T2 SNARE, T3 METAL, T5 TONE, T6 CHORD"),
    {k:"play",t:"Make the piano chords: press [RECORD], select [T6]. Turn [SHAPE] until the screen shows minor, [PITCH] down to -12 to sit low, and [DECAY] up to about 90 so it rings.",hl:"p:record h:track p:t6 t:shape t:pitch t:decay",hear:"Tap [T6]: one dark, low chord."},
    {k:"play",t:"Give it the figure from the drawing: on T6, place chords on [TRIG 1], [TRIG 7] and [TRIG 11]. Press [PLAY].",hl:"p:s1 p:s7 p:s11 p:play",hear:"A short, off-balance chord figure. This is the whole idea of your loop."},
    {k:"play",t:"Add the beat: on T1, kicks on [TRIG 1], [TRIG 5], [TRIG 9] and [TRIG 13]. On T3, hats on [TRIG 3], [TRIG 7], [TRIG 11] and [TRIG 15] with [DECAY] turned up so they ring open. On T2, a snare on [TRIG 5] and [TRIG 13].",hl:"h:track p:t1 p:s1 p:s5 p:s9 p:s13 p:t3 t:decay p:t2",hear:"A club beat around your chords."},
    {k:"play",t:"Add a light bass: select [T5] (TONE), turn [PITCH] down to -24 and place notes only on [TRIG 1] and [TRIG 11].",hl:"h:track p:t5 t:pitch p:s1 p:s11",hear:"Just two low notes. The chords already fill the middle."},
    {k:"play",t:"Play the build: press [RECORD] to leave grid recording, then mute T1, T2, T3 and T5 ([FUNC] + each pad) so only the chords play. Every 8 bars, unmute one more track. Save when you're done: hold [FUNC] and long-press [SETTINGS].",hl:"p:record h:func p:t1 p:t2 p:t3 p:t5 p:settings",hear:"The loop never changes, but the energy keeps climbing."},
    {k:"check",t:"What did Kiasmos keep in focus for most of Looped?",q:["The drums","!The piano chords","A vocal","The bassline"],a:"The piano chords. Janus Rasmussen said they are pretty much the only thing in focus for most of the song. The beat builds up around them.",hear:"One strong idea, with layers arriving around it one at a time."}
  ],
  challenge:"Listen to Looped again and notice roughly how long each new layer waits before it arrives. Play your mutes with the same patience."
},
{ id:"s02", song:"Kiasmos – Thrown", unit:"Kiasmos", title:"Thrown",
  goal:"Turn one short, plucked sound into chords by stacking it at different pitches, and build a moving groove out of harmony.",
  listen:"Kiasmos, \"Thrown\" (from the album Kiasmos, 2014, first released on the Thrown EP in 2012). Listen for the short plucked chords that drive the track, and the bell-like melody above them.",
  concepts:[
    {h:"What Kiasmos said",p:["Janus Rasmussen said the main pluck in Thrown is a Korg MS-20, a synth that plays one note at a time, recorded many times over so that it plays chords. Ólafur Arnalds said the track grew out of a remake of \"Sudden Throw\" from his album For Now I Am Winter. It was also their first track with strings. It runs at about 120 BPM."]},
    {h:"A pluck",p:["A pluck starts sharply and dies quickly: short decay, no sustain. Played in a pattern, plucks work like a rhythm part that also has notes."]},
    {h:"Stacking makes chords",p:["One note at a time is a melody. The same sound at three pitches at once is a chord. A note, another 3 semitones above it and another 7 above the first make a minor chord."]}
  ],
  steps:[
    {k:"learn",fig:"stack",t:"The MS-20 they used plays one note at a time. To get chords, they recorded the same pluck again and again at different notes and layered the recordings."},
    {k:"learn",fig:{grid:{title:"One pluck, then three",presets:[
      {name:"Single notes",bpm:120,note:"The pluck rhythm on one note.",rows:[{n:"Pluck",s:"pluck",note:53,v:hits("1,3,4,7,9,11,12,15",.8)},{n:"Pluck +3",s:"pluck",note:56,v:hits("")},{n:"Pluck +7",s:"pluck",note:60,v:hits("")},{n:"Kick",s:"kick",v:hits("1,5,9,13")}]},
      {name:"Stacked",bpm:120,note:"The same rhythm copied 3 and 7 semitones higher.",rows:[{n:"Pluck",s:"pluck",note:53,v:hits("1,3,4,7,9,11,12,15",.8)},{n:"Pluck +3",s:"pluck",note:56,v:hits("1,3,4,7,9,11,12,15",.65)},{n:"Pluck +7",s:"pluck",note:60,v:hits("1,3,4,7,9,11,12,15",.65)},{n:"Kick",s:"kick",v:hits("1,5,9,13")}]}
    ]}},t:"The same rhythm, first as single notes, then stacked three high. Nothing new was written, only copied at other pitches.",hear:"Stacked, the line turns into harmony."},
    songHome(2,120),
    songMachines("T1 KICK, T3 METAL, T5 TONE, T6 CHORD"),
    {k:"play",t:"Make a pluck: press [RECORD], select [T6], turn [SHAPE] to minor and [DECAY] down to about 20. The CHORD machine does the stacking for you: its voices play the same sound at different pitches.",hl:"p:record h:track p:t6 t:shape t:decay",hear:"Tap [T6]: a short, plucked chord."},
    {k:"play",t:"Sequence it: on T6, place trigs on [TRIG 1], [TRIG 3], [TRIG 4], [TRIG 7], [TRIG 9], [TRIG 11], [TRIG 12] and [TRIG 15]. Press [PLAY].",hl:"p:s1 p:s3 p:s4 p:s7 p:s9 p:s11 p:s12 p:s15 p:play",hear:"A rolling chord rhythm, the same one as in the grid."},
    {k:"play",t:`Make it move: on [TRIG 9], ${noteLock} 2 semitones down. Do the same on [TRIG 11], [TRIG 12] and [TRIG 15].`,hl:"h:s9 p:level t:level h:s11 h:s12 h:s15",hear:"The second half of the bar steps down: two chords from one sound."},
    {k:"play",t:`Add a bell on top: select [T5] (TONE), turn [COLOR] up until it sounds like a bell and [DECAY] to about 70. Place notes on [TRIG 1] and [TRIG 9]. On [TRIG 9], ${noteLock} 3 semitones up.`,hl:"h:track p:t5 t:color t:decay p:s1 p:s9 h:s9 t:level",hear:"A slow melody over a busy pluck: two speeds working together."},
    {k:"play",t:"Add the beat: on T1, kicks on [TRIG 1], [TRIG 5], [TRIG 9] and [TRIG 13]. On T3, hats on [TRIG 3], [TRIG 7], [TRIG 11] and [TRIG 15]. Save: hold [FUNC] and long-press [SETTINGS].",hl:"h:track p:t1 p:t3 h:func p:settings"},
    {k:"check",t:"How did Kiasmos get chords out of the MS-20 in Thrown?",q:["!They recorded the same pluck many times at different notes","They used a chord preset","They sampled a piano","They ran it through a guitar pedal"],a:"They layered it. Janus Rasmussen said the MS-20 pluck was layered many times to play chords. The CHORD machine on your Model:Cycles stacks a sound in the same way, inside a single track.",hear:"Copy the same sound at new pitches and a line becomes harmony."}
  ],
  challenge:"Try other chord types on T6's [SHAPE] (sus2, m7) with the same rhythm, and keep the one that sounds most like night."
},
{ id:"s03", song:"Kiasmos – Swayed", unit:"Kiasmos", title:"Swayed",
  goal:"Start a track the way Kiasmos often do, from a drum machine groove, and bring it to life with small changes on single steps.",
  listen:"Kiasmos, \"Swayed\" (from the album Kiasmos, 2014). Listen to the drums only, and to how the small sounds shift slightly from bar to bar.",
  concepts:[
    {h:"What Kiasmos said",p:["Ólafur Arnalds called Swayed a nod to their early, more techno days. Janus Rasmussen said it came late, was driven by the groove, and is full of micro edits to the synths and effects. Ólafur has also said they often start a track from a beat on an Elektron Machinedrum and jam over it. It runs at about 122 BPM."]},
    {h:"Groove first",p:["Starting from the beat gives every later part something to lock to. Techno at 120–130 BPM usually means a kick on every beat, an open hat between the beats, and a clap or snare on 2 and 4."]},
    {h:"Found sounds as hats",p:["On their first album they used a thumb piano, finger snaps and the grinding wheel of a lighter where others would use electronic hi-hats. Any short, bright sound can do a hi-hat's job."]},
    {h:"Micro edits",p:["Small changes on single steps, a bit longer here, a touch lower there, keep a loop from sounding copied and pasted. On Elektron machines these are parameter locks: hold a step and turn a knob."]}
  ],
  steps:[
    {k:"learn",fig:{grid:{title:"The techno frame",bpm:122,rows:[{n:"Kick",s:"kick",v:hits("1,5,9,13")},{n:"Open hat",s:"ohat",v:hits("3,7,11,15",.6)},{n:"Clap",s:"clap",v:hits("5,13",.7)},{n:"Shaker",s:"shaker",v:hits("2:.3,4:.4,6:.3,8:.4,10:.3,12:.4,14:.3,16:.4")}]}},t:"The classic techno frame at 122 BPM: a kick on every beat, an open hat in between, a clap on 2 and 4. Press Play.",hear:"The open hat between the kicks is what pushes it forward."},
    {k:"learn",fig:{grid:{title:"Machine hats or found sounds",presets:[
      {name:"Electronic hats",bpm:122,note:"A clean, even hat.",rows:[{n:"Kick",s:"kick",v:hits("1,5,9,13")},{n:"Hat",s:"hat",v:hits("2,3,4,6,7,8,10,11,12,14,15,16",.5)},{n:"Rim",s:"rim",v:hits("")},{n:"Perc",s:"perc",v:hits("")}]},
      {name:"Found sounds",bpm:122,note:"Small woody and clicky hits sharing the hat's job.",rows:[{n:"Kick",s:"kick",v:hits("1,5,9,13")},{n:"Hat",s:"shaker",v:hits("3,7,11,15",.5)},{n:"Rim",s:"rim",v:hits("4:.3,8:.25,12:.35,16:.2")},{n:"Perc",s:"perc",v:hits("6:.3,14:.25")}]}
    ]}},t:"Kiasmos swapped electronic hats for things like finger snaps and a lighter's wheel. Compare a clean hat with a mix of small found-sound hits.",hear:"The found sounds feel more like a room and less like a machine."},
    {k:"learn",fig:"plock",t:"Micro edits: the same sound on every step, but some steps get their own small change. Hold a step and turn a knob, and only that step changes. Elektron calls this a parameter lock."},
    songHome(3,122),
    songMachines("T1 KICK, T2 SNARE, T3 METAL, T4 PERC"),
    {k:"play",t:"Lay the frame: press [RECORD]. On T1, kicks on [TRIG 1], [TRIG 5], [TRIG 9] and [TRIG 13]. On T2, a snare on [TRIG 5] and [TRIG 13]. On T3, hats on [TRIG 3], [TRIG 7], [TRIG 11] and [TRIG 15], with [DECAY] turned up so they ring open. Press [PLAY].",hl:"p:record h:track p:t1 p:t2 p:t3 t:decay p:play",hear:"The techno frame from the grid."},
    {k:"play",t:"Make a found-sound tick: select [T4] (PERC), turn [PITCH] right up and [DECAY] down until it clicks like wood. Place it on every even trig, [TRIG 2] to [TRIG 16].",hl:"h:track p:t4 t:pitch t:decay p:s2 p:s4 p:s6 p:s8 p:s10 p:s12 p:s14 p:s16",hear:"A small, woody tick filling the gaps, more object than drum."},
    {k:"play",t:"Micro edits: hold [TRIG 6] and turn [DECAY] up a little. Hold [TRIG 10] and turn [PITCH] down a little. Hold [TRIG 14] and turn [DECAY] down a little.",hl:"h:s6 t:decay h:s10 t:pitch h:s14",hear:"Three ticks now sound slightly different. Their keys flash quickly to show the locks."},
    {k:"play",t:"Jam over it: press [RECORD] to leave grid recording, select [T4] and slowly ride [DECAY] and [COLOR] while it plays. Save: hold [FUNC] and long-press [SETTINGS].",hl:"p:record h:track p:t4 t:decay t:color h:func p:settings",hear:"The groove stays steady while the small sounds keep changing."},
    {k:"check",t:"How do Kiasmos often start a track?",q:["!From a beat on a drum machine","From a piano melody","From a vocal","From a field recording"],a:"From a beat. Ólafur Arnalds said they often start from a groove on an Elektron Machinedrum and jam over it. Swayed is one of their most groove-driven tracks.",hear:"Start with the groove, then give single steps their own small changes."}
  ],
  challenge:"Lock a different [PITCH] on every one of the eight ticks to turn a percussion sound into a tiny melody."
},
{ id:"s04", song:"Kiasmos – Blurred", unit:"Kiasmos", title:"Blurred",
  goal:"Make a snare out of a sound that isn't a drum, and write a chord progression that climbs.",
  listen:"Kiasmos, \"Blurred\" (from the Blurred EP, 2017). Listen to the hit on 2 and 4 first, then follow the chords and notice how they rise.",
  concepts:[
    {h:"What Kiasmos said",p:["Janus Rasmussen said the snare in Blurred is actually Ólafur Arnalds hitting the piano. Reviews describe a simple drum beat, strings and a chord progression that climbs. It runs at about 122 BPM."]},
    {h:"A snare is a job, not a sound",p:["In lesson 2 you met the snare's job: the backbeat on 2 and 4. Any short, sharp hit can do that job, whether it's the body of a piano, a book or a hand on a table. An unusual snare gives a track its own character."]},
    {h:"Chords that climb",p:["When each chord sits a little higher than the last, the music feels like it's lifting. Keeping the beat steady while the chords rise is a simple, strong way to build tension."]}
  ],
  steps:[
    {k:"learn",fig:"snaresrc",t:"The snare is a role: the hit on beats 2 and 4. In Blurred, that hit is Ólafur Arnalds striking the piano. Anything short and sharp can take the job."},
    {k:"learn",fig:{grid:{title:"Same beat, different snare",presets:[
      {name:"Snare",bpm:122,rows:[{n:"Kick",s:"kick",v:hits("1,5,9,13")},{n:"Backbeat",s:"snare",v:hits("5,13")},{n:"Hat",s:"hat",v:hits("3,7,11,15",.5)}]},
      {name:"Rim",bpm:122,rows:[{n:"Kick",s:"kick",v:hits("1,5,9,13")},{n:"Backbeat",s:"rim",v:hits("5,13")},{n:"Hat",s:"hat",v:hits("3,7,11,15",.5)}]},
      {name:"Wood knock",bpm:122,rows:[{n:"Kick",s:"kick",v:hits("1,5,9,13")},{n:"Backbeat",s:"perc",v:hits("5,13")},{n:"Hat",s:"hat",v:hits("3,7,11,15",.5)}]},
      {name:"Clap",bpm:122,rows:[{n:"Kick",s:"kick",v:hits("1,5,9,13")},{n:"Backbeat",s:"clap",v:hits("5,13")},{n:"Hat",s:"hat",v:hits("3,7,11,15",.5)}]}
    ]}},t:"Switch the sound on 2 and 4 while it plays. The groove stays the same and only the character changes.",hear:"Every version still has a backbeat. The job is the same and the feel is different."},
    {k:"learn",fig:{grid:{title:"Chords that climb",bpm:122,rows:[
      {n:"Chord",s:"keys",p:[57,0,0,0,60,0,0,0,62,0,0,0,64,0,0,0],v:hits("1,5,9,13",.75)},
      {n:"Chord",s:"keys",p:[60,0,0,0,63,0,0,0,65,0,0,0,67,0,0,0],v:hits("1,5,9,13",.6)},
      {n:"Chord",s:"keys",p:[64,0,0,0,67,0,0,0,69,0,0,0,71,0,0,0],v:hits("1,5,9,13",.6)},
      {n:"Kick",s:"kick",v:hits("1,5,9,13")},{n:"Knock",s:"perc",v:hits("5,13",.7)}]}},t:"Four minor chords, each a little higher than the last (0, 3, 5 and 7 semitones above the first). An example of the idea, not the song's own chords.",hear:"By the last chord you want to fall back to the first. That pull is what a rising progression gives you."},
    songHome(4,122),
    songMachines("T1 KICK, T3 METAL, T4 PERC, T6 CHORD"),
    {k:"play",t:"Make a piano-body snare: press [RECORD], select [T4] (PERC). Turn [PITCH] down a little, [DECAY] to about 40 and [COLOR] up until it sounds like knocking on wood. Place it on [TRIG 5] and [TRIG 13].",hl:"p:record h:track p:t4 t:pitch t:decay t:color p:s5 p:s13",hear:"A dull, woody knock where the snare usually is."},
    {k:"play",t:"Add the beat around it: on T1, kicks on [TRIG 1], [TRIG 5], [TRIG 9] and [TRIG 13]. On T3, hats on [TRIG 3], [TRIG 7], [TRIG 11] and [TRIG 15]. Press [PLAY].",hl:"h:track p:t1 p:t3 p:play",hear:"Same groove as always, with a new voice on the backbeat."},
    {k:"play",t:"Add the chords: select [T6] (CHORD), turn [SHAPE] to minor and [DECAY] to about 100. Place chords on [TRIG 1], [TRIG 5], [TRIG 9] and [TRIG 13].",hl:"h:track p:t6 t:shape t:decay p:s1 p:s5 p:s9 p:s13",hear:"The same chord four times. Next, make it climb."},
    {k:"play",t:`Make it climb: on [TRIG 5], ${noteLock} 3 semitones up. On [TRIG 9], 5 up. On [TRIG 13], 7 up.`,hl:"h:s5 p:level t:level h:s9 h:s13",hear:"Each chord a step higher than the last, then back down at the top of the bar."},
    {k:"play",t:"Save: press [RECORD] to leave grid recording, then hold [FUNC] and long-press [SETTINGS].",hl:"p:record h:func p:settings"},
    {k:"check",t:"What made the snare sound in Blurred?",q:["A classic drum machine snare","!Ólafur Arnalds hitting the piano","Finger snaps","A clap sample"],a:"The piano. Janus Rasmussen said the snare is actually Ólafur hitting the piano. It still works as a snare because it's short, sharp and sits on 2 and 4.",hear:"The backbeat is a job. Any short, sharp sound on 2 and 4 can do it."}
  ],
  challenge:"Record a real-world hit (a book, a table, a mug) into Live, and compare it with your PERC knock. Which fits the chords better?"
}
];

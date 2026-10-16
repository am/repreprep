import { hits } from "../../shared/html.js";
import { TRACK_MAP, songHome, songMachines, noteLock } from "./helpers.js";

export const UNIT_3_LESSONS = [
{ id:"w09", week:9, unit:"Notes and harmony", title:"Notes, octaves and scales", minutes:35,
  goal:"Find the 12 notes and the octave on the trig keys, hear major against minor, and play a riff that stays inside the minor pentatonic.",
  listen:"Air, \"La Femme d'Argent\". Notice how few notes the bass and keys use, and how long they repeat over the slow groove without getting boring.",
  concepts:[
    {h:"Twelve notes, then they repeat",p:["Western music uses 12 notes. Each one is a semitone (half step) from the next. After 12 semitones you reach the same note name again, higher: an octave."]},
    {h:"A scale is a choice",p:["A scale picks 7 of the 12 notes. Major goes whole, whole, half, whole, whole, whole, half and sounds bright. Natural minor goes whole, half, whole, whole, half, whole, whole and sounds darker.","The note you hear first is the 3rd: 3 semitones above the root in minor, 4 in major."]},
    {h:"Minor pentatonic",p:["Five notes of the minor scale: the root and 3, 5, 7 and 10 semitones up. It leaves out the two notes most likely to clash, so almost anything you play on it sounds right."]},
    {h:"No scale lock here",p:["In CHROMATIC mode, the default, the 16 trig keys play 16 semitones and [TRIG 9] is the root of the active track's sound. The Model:Cycles won't keep you in a scale, so you learn which keys belong to it."]}
  ],
  steps:[
    {k:"learn",fig:"u3keys",t:"Western music uses 12 notes. Every key on a piano is one semitone from its neighbour, black keys included. Twelve semitones up you reach the same letter again, an octave higher: it sounds like the same note, only brighter."},
    {k:"learn",fig:{grid:{title:"Three scales on A",presets:[
      {name:"Major",bpm:90,note:"Whole, whole, half, whole, whole, whole, half: A B C# D E F# G# A.",rows:[{n:"Kick",s:"kick",v:hits("1,9",.5)},{n:"Notes",s:"keys",v:hits("1,3,5,7,9,11,13,15",.7),p:[57,0,59,0,61,0,62,0,64,0,66,0,68,0,69,0]}]},
      {name:"Natural minor",bpm:90,note:"Whole, half, whole, whole, half, whole, whole: A B C D E F G A.",rows:[{n:"Kick",s:"kick",v:hits("1,9",.5)},{n:"Notes",s:"keys",v:hits("1,3,5,7,9,11,13,15",.7),p:[57,0,59,0,60,0,62,0,64,0,65,0,67,0,69,0]}]},
      {name:"Minor pentatonic",bpm:90,note:"Five notes, A C D E G, up and back down.",rows:[{n:"Kick",s:"kick",v:hits("1,9",.5)},{n:"Notes",s:"keys",v:hits("1,3,5,7,9,11,13,15",.7),p:[57,0,60,0,62,0,64,0,67,0,69,0,67,0,64,0]}]}
    ]}},t:"A scale is a choice of notes from the 12. Play the three versions: same root, same rhythm, different notes. Listen closely to the third note of major and minor.",hear:"Major sounds open and bright, minor darker. The pentatonic has gaps, which is why it sounds so easy."},
    {k:"learn",fig:"u3trigmap",t:"On the Model:Cycles the trig keys are a small keyboard: one semitone per key, [TRIG 9] the root. There's no scale lock, so this map shows which keys belong to the minor scale and to the minor pentatonic. Keep it next to you this lesson."},
    {k:"play",t:"Go to B01 (hold [PATTERN], press [T2], press [TRIG 1]) and make sure [RECORD] is off. Select [T5] and turn [DECAY] to about 60. Press [TRIG 9], then [TRIG 1] to [TRIG 16] left to right.",hl:"h:pattern p:t2 p:s1 h:track p:t5 t:decay p:s9",hear:"[TRIG 9] is the root. Left to right, each key is one semitone higher: this is CHROMATIC mode."},
    {k:"play",t:"Hear an octave: press [TRIG 2], then [TRIG 14]. Then [TRIG 4] and [TRIG 16]. Each pair is 12 keys apart.",hl:"p:s2 p:s14 p:s4 p:s16",hear:"The second note sounds like the first, only higher. Same note, an octave up."},
    {k:"play",t:"Play the minor scale from the map: [TRIG 4], [TRIG 5], [TRIG 7], [TRIG 9], [TRIG 11], [TRIG 12], [TRIG 14], [TRIG 16]. Then slip [TRIG 10] or [TRIG 13] into the middle of it.",hl:"p:s4 p:s5 p:s7 p:s9 p:s11 p:s12 p:s14 p:s16",hear:"The lit keys belong together. [TRIG 10] and [TRIG 13] sound like a wrong turn."},
    {k:"play",t:"Hear what makes minor: press [TRIG 9], [TRIG 12] and [TRIG 16] one after the other (root, minor 3rd, 5th). Then [TRIG 9], [TRIG 13], [TRIG 16].",hl:"p:s9 p:s12 p:s16 p:s13",hear:"First dark, then bright. One key, the 3rd, decides the mood."},
    {k:"play",t:"Press [PLAY] and improvise over your beat on the pentatonic keys only: [TRIG 2], [TRIG 4], [TRIG 7], [TRIG 9], [TRIG 12], [TRIG 14], [TRIG 16]. Try ending each idea on [TRIG 9].",hl:"p:play p:s2 p:s4 p:s7 p:s9 p:s12 p:s14 p:s16",hear:"Nothing clashes. Ending on [TRIG 9] sounds like coming home."},
    {k:"play",t:"Give T5 a one-bar loop: hold [FUNC] and press [PAGE] (SCALE menu). MOD is already TRACK, so press [T5], set its LEN to 16 with [LEVEL/DATA], and press [BACK].",hl:"h:func p:page p:t5 t:level p:back",hear:"T5 will repeat every bar while the rest of B01 runs its four bars."},
    {k:"play",t:`Press [RECORD] and, on T5, place notes on [TRIG 1], [TRIG 4], [TRIG 7] and [TRIG 11]. On [TRIG 4], ${noteLock} 3 semitones up. On [TRIG 7], 7 up. On [TRIG 11], 5 up.`,hl:"p:record p:s1 p:s4 p:s7 p:s11 h:s4 p:level t:level h:s7 h:s11",hear:"Root, minor 3rd, 5th, then down a step to the 4th: four pentatonic notes."},
    {k:"play",t:"Press [RECORD] to leave grid recording and listen with the beat. Turn T5's [REVERB SEND] up a little. Save: hold [FUNC] and long-press [SETTINGS].",hl:"p:record t:reverb h:func p:settings",hear:"A four-note riff over your beat. It can't sound wrong: every note is in the scale."},
    {k:"check",t:"[TRIG 9] is your root. Which key plays the minor 3rd, the note that makes it sound minor?",q:["[TRIG 10]","![TRIG 12]","[TRIG 13]","[TRIG 16]"],a:"[TRIG 12] is 3 semitones above the root: the minor 3rd. [TRIG 13], [TRIG 4] semitones up, is the major 3rd and turns the mood bright.",hear:"Count semitones from the root: 3 up is minor, 4 up is major."},
  ],
  challenge:"With the beat running, find a different four-note riff on the pentatonic keys and write its TRIG numbers in your notes. End it once on [TRIG 9] and once on [TRIG 14]: which one sounds finished?"
},
{ id:"w10", week:10, unit:"Notes and harmony", title:"Basslines", minutes:40,
  goal:"Write a slow bassline that hits with the kick, plays the roots of your chord changes, and adds an octave jump and an approach note.",
  listen:"Air, \"La Femme d'Argent\", then Augustus Pablo, \"King Tubby Meets Rockers Uptown\". Follow only the bass: when it plays, when it rests, and how often it comes back to the same note.",
  concepts:[
    {h:"Three jobs",p:["A bassline keeps rhythm by hitting with the kick. It plays harmony by sitting on the root of each chord, which tells your ear where home is. And it adds a little melody: octave jumps and passing notes."]},
    {h:"Start simple, add one move",p:["Start on one note in the kick's rhythm. Then add an octave jump, then an approach note: a note a step away that walks into the next root. Add one move at a time, and stop when it grooves."]},
    {h:"Leave space",p:["Bass notes are long and heavy, so the gaps matter. In dub the bass rests almost as much as it plays, and the silence is what makes each note land."]},
    {h:"Note length on the Model:Cycles",p:["With GATE on, a note holds for its trig length (LEN) before it decays. With GATE off, LEN is ignored and only DECAY sets how long it rings."]}
  ],
  steps:[
    {k:"learn",fig:"u3bassjobs",t:"A bassline has three jobs. It hits with the kick, so the low end lands as one. It plays the root, which tells your ear what the chord is. And it moves a little: an octave up, or a note that walks into the next one."},
    {k:"learn",fig:{grid:{title:"Building a bassline",presets:[
      {name:"With the kick",bpm:90,note:"One note, A, on every kick.",rows:[{n:"Kick",s:"kick",v:hits("1,9,11")},{n:"Snare",s:"snare",v:hits("5,13")},{n:"Hat",s:"hat",v:hits("3,7,11,15",.5)},{n:"Bass",s:"bass",v:hits("1,9,11"),note:45}]},
      {name:"Leave space",bpm:90,note:"Drop the bass on beat 3: fewer notes, more weight.",rows:[{n:"Kick",s:"kick",v:hits("1,9,11")},{n:"Snare",s:"snare",v:hits("5,13")},{n:"Hat",s:"hat",v:hits("3,7,11,15",.5)},{n:"Bass",s:"bass",v:hits("1,11"),note:45}]},
      {name:"Octave jump",bpm:90,note:"A hop up an octave at the end of the bar.",rows:[{n:"Kick",s:"kick",v:hits("1,9,11")},{n:"Snare",s:"snare",v:hits("5,13")},{n:"Hat",s:"hat",v:hits("3,7,11,15",.5)},{n:"Bass",s:"bass",v:hits("1,11,15"),p:[45,0,0,0,0,0,0,0,0,0,45,0,0,0,57,0]}]},
      {name:"Approach note",bpm:90,note:"A G on the last step walks up into the A on the 1.",rows:[{n:"Kick",s:"kick",v:hits("1,9,11")},{n:"Snare",s:"snare",v:hits("5,13")},{n:"Hat",s:"hat",v:hits("3,7,11,15",.5)},{n:"Bass",s:"bass",v:hits("1,11,16"),p:[45,0,0,0,0,0,0,0,0,0,45,0,0,0,0,43]}]},
      {name:"Too busy",bpm:90,note:"Notes everywhere: the kick has nowhere to land.",rows:[{n:"Kick",s:"kick",v:hits("1,9,11")},{n:"Snare",s:"snare",v:hits("5,13")},{n:"Hat",s:"hat",v:hits("3,7,11,15",.5)},{n:"Bass",s:"bass",v:hits("1,2,3,5,7,8,9,11,12,13,15,16"),p:[45,57,45,0,45,0,57,45,45,0,45,57,45,0,57,43]}]}
    ]}},t:"The same bassline, built one move at a time over your beat. Play the versions in order: each adds one idea. Then try the last one.",hear:"The octave and the approach note give it life. Too many notes, and the kick has nowhere to land."},
    {k:"learn",fig:"u3bassmap",t:"This is the bassline you'll build. Every bar has the same rhythm, but the root changes: A, then F, D and E. Each root can carry its own chord, so the bass already tells the story."},
    {k:"play",t:"Keep last lesson's riff: with [RECORD] off, hold [PATTERN] + [TRIG 1] and press [RECORD]. Then hold [PATTERN] + [TRIG 11] and press and hold [STOP] until the countdown finishes. Stay on B01.",hl:"h:pattern p:s1 p:record p:s11 h:stop",hear:"B11 keeps the riff. B01 is where the bass goes."},
    {k:"play",t:"Press [RECORD], select [T5] and clear its trigs with [FUNC] + [PLAY]. Open the SCALE menu ([FUNC] + [PAGE]), check that T5's LEN is still 16, and press [BACK].",hl:"p:record h:track p:t5 h:func p:play p:page p:back",hear:"T5 is silent and one bar long, ready for the bass."},
    {k:"play",t:"Make it a bass: hold [FUNC] and turn [PITCH] to -24 (two octaves down). Turn [SHAPE] down for a round, soft tone and [DECAY] to about 70. Press [GATE] so it lights: notes now hold for their length.",hl:"h:func t:pitch t:shape t:decay p:gate",hear:"Tap [T5]: a deep, round note. If it vanishes on small speakers, use -12."},
    {k:"play",t:"Lock it to the kick: place bass notes on [TRIG 1], [TRIG 11] and [TRIG 15]. Make the first one long: hold [TRIG 1], press [LEVEL/DATA] until LEN shows, and turn it up to about 6.",hl:"p:s1 p:s11 p:s15 h:s1 p:level t:level",hear:"A long root on the 1 and a push with the kick on 11."},
    {k:"play",t:"Make [TRIG 15] the octave jump: hold it, hold [FUNC] too, and turn [PITCH] up to -12, one octave above the other notes.",hl:"h:s15 h:func t:pitch",hear:"A little hop at the end of the bar that pulls you back to the 1."},
    {k:"play",t:"Spread it over four bars: open the SCALE menu ([FUNC] + [PAGE]), press [T5], set LEN to 64 and press [BACK]. The trigs on page 1 are copied onto pages 2, 3 and 4.",hl:"h:func p:page p:t5 t:level p:back",hear:"The same bar four times, for now."},
    {k:"play",t:"Change the roots: press [PAGE] for page 2, hold [TRIG 1], [TRIG 11] and [TRIG 15] together, press [LEVEL/DATA] until NOTE shows, and turn 4 semitones down. Page 3: 7 down. Page 4: 5 down.",hl:"p:page h:s1 h:s11 h:s15 p:level t:level",hear:"A, F, D, E. You can almost hear chords that aren't there yet."},
    {k:"play",t:`Add the approach note: on page 4, place a note on [TRIG 16], then ${noteLock} 2 semitones down, to G. Press [RECORD], listen, and save (hold [FUNC], long-press [SETTINGS]).`,hl:"p:page p:s16 h:s16 p:level t:level p:record h:func p:settings",hear:"E, then G, then A at the top of the loop: the bass leans into its own beginning."},
    {k:"check",t:"Your bass plays A, F, D and E, one root per bar. Which job is that?",q:["Rhythm","!Harmony: it plays the root of each chord","Melody","Leaving space"],a:"Playing the root of each chord is the harmony job. It tells your ear which chord you're on, even before any chords are playing.",hear:"Bass on the root, with the kick. Then add one move at a time."},
  ],
  challenge:"Make bar 4's approach note come and go: on page 4, hold [TRIG 16] in grid recording and turn [CHANCE] to 1:2. Listen to eight bars. Does the loop feel longer?"
},
{ id:"w11", week:11, unit:"Notes and harmony", title:"Chords that feel like night", minutes:40,
  goal:"Build minor, major and seventh chords from semitone formulas, and play a slow four-chord progression on the CHORD machine over your bass.",
  listen:"Bonobo, \"Black Sands\". Listen past the beat to the harmony underneath: a few soft chords, repeated, set the whole mood.",
  concepts:[
    {h:"A chord is a formula",p:["Stack notes on a root, counting semitones. Minor is 0-3-7, major is 0-4-7. Only the middle note moves, and it flips the mood from dark to bright."]},
    {h:"Sevenths for the night",p:["Add a fourth note and the chord softens. A minor 7th (0-3-7-10) sounds relaxed and dusky, a major 7th (0-4-7-11) warm and dreamy. A lot of downtempo and jazz lives on these two."]},
    {h:"Progressions in numerals",p:["Chords are named by where their root sits in the scale: i is the root chord, iv the chord on the 4th note, VI on the 6th. Lower case means minor, upper case major. Am–G–Dm–Am is i–VII–iv–i, in any key."]},
    {h:"Inversions and a taste of Dorian",p:["An inversion plays the same chord notes in another order, so chords can change by small steps instead of jumps. Dorian is minor with a raised 6th: in A it turns the iv chord into D major, a brighter, more hopeful minor."]}
  ],
  steps:[
    {k:"learn",fig:"u3formula",t:"A chord is a formula, counted in semitones from the root. Minor is 0-3-7 and major 0-4-7: only the middle note moves. Add a fourth note and you get the soft seventh chords. The CHORD machine's SHAPE knob uses these same names."},
    {k:"learn",fig:{grid:{title:"Four chords on A",presets:[
      {name:"Minor",bpm:60,note:"0-3-7: A, C, E.",rows:[{n:"Root",s:"keys",v:hits("1,9",.7),note:57},{n:"3rd",s:"keys",v:hits("1,9",.7),note:60},{n:"5th",s:"keys",v:hits("1,9",.7),note:64},{n:"7th",s:"keys",v:hits(""),note:67}]},
      {name:"Major",bpm:60,note:"0-4-7: A, C#, E.",rows:[{n:"Root",s:"keys",v:hits("1,9",.7),note:57},{n:"3rd",s:"keys",v:hits("1,9",.7),note:61},{n:"5th",s:"keys",v:hits("1,9",.7),note:64},{n:"7th",s:"keys",v:hits(""),note:68}]},
      {name:"m7",bpm:60,note:"0-3-7-10: A, C, E, G.",rows:[{n:"Root",s:"keys",v:hits("1,9",.7),note:57},{n:"3rd",s:"keys",v:hits("1,9",.7),note:60},{n:"5th",s:"keys",v:hits("1,9",.7),note:64},{n:"7th",s:"keys",v:hits("1,9",.7),note:67}]},
      {name:"Maj7",bpm:60,note:"0-4-7-11: A, C#, E, G#.",rows:[{n:"Root",s:"keys",v:hits("1,9",.7),note:57},{n:"3rd",s:"keys",v:hits("1,9",.7),note:61},{n:"5th",s:"keys",v:hits("1,9",.7),note:64},{n:"7th",s:"keys",v:hits("1,9",.7),note:68}]}
    ]}},t:"Hear each formula on the same root, A. Switch between the four while it plays.",hear:"Minor: dark. Major: bright. m7: relaxed and dusky. Maj7: warm, a little bittersweet."},
    {k:"learn",fig:"u3prog",t:"Chords move in progressions, written in Roman numerals so they work in any key. Here are two melancholic ones, and the one your bass already plays: A, F, D, E."},
    {k:"learn",fig:{grid:{title:"Three progressions",presets:[
      {name:"i VII iv i",bpm:60,note:"Am, G, Dm, Am: one chord per beat here, one per bar in a song.",rows:[{n:"Bass",s:"bass",v:hits("1,5,9,13",.7),p:[45,0,0,0,43,0,0,0,38,0,0,0,45,0,0,0]},{n:"Low",s:"keys",v:hits("1,5,9,13",.6),p:[57,0,0,0,55,0,0,0,57,0,0,0,57,0,0,0]},{n:"Mid",s:"keys",v:hits("1,5,9,13",.6),p:[60,0,0,0,59,0,0,0,62,0,0,0,60,0,0,0]},{n:"High",s:"keys",v:hits("1,5,9,13",.6),p:[64,0,0,0,62,0,0,0,65,0,0,0,64,0,0,0]},{n:"Top",s:"keys",v:hits(""),note:67}]},
      {name:"i7 iv7 VImaj7 VII7",bpm:60,note:"Am7, Dm7, Fmaj7, G7.",rows:[{n:"Bass",s:"bass",v:hits("1,5,9,13",.7),p:[45,0,0,0,38,0,0,0,41,0,0,0,43,0,0,0]},{n:"Low",s:"keys",v:hits("1,5,9,13",.6),p:[57,0,0,0,57,0,0,0,57,0,0,0,55,0,0,0]},{n:"Mid",s:"keys",v:hits("1,5,9,13",.6),p:[60,0,0,0,60,0,0,0,60,0,0,0,59,0,0,0]},{n:"High",s:"keys",v:hits("1,5,9,13",.6),p:[64,0,0,0,62,0,0,0,64,0,0,0,62,0,0,0]},{n:"Top",s:"keys",v:hits("1,5,9,13",.6),p:[67,0,0,0,65,0,0,0,65,0,0,0,65,0,0,0]}]},
      {name:"Your B01",bpm:60,note:"Am7, Fmaj7, Dm7, Em7: the roots your bass already plays.",rows:[{n:"Bass",s:"bass",v:hits("1,5,9,13",.7),p:[45,0,0,0,41,0,0,0,38,0,0,0,40,0,0,0]},{n:"Low",s:"keys",v:hits("1,5,9,13",.6),p:[57,0,0,0,57,0,0,0,57,0,0,0,55,0,0,0]},{n:"Mid",s:"keys",v:hits("1,5,9,13",.6),p:[60,0,0,0,60,0,0,0,60,0,0,0,59,0,0,0]},{n:"High",s:"keys",v:hits("1,5,9,13",.6),p:[64,0,0,0,64,0,0,0,62,0,0,0,62,0,0,0]},{n:"Top",s:"keys",v:hits("1,5,9,13",.6),p:[67,0,0,0,65,0,0,0,65,0,0,0,64,0,0,0]}]}
    ]}},t:"Play the three progressions. Watch the four chord rows: the notes barely move from chord to chord. Each chord is voiced as an inversion, so it steps instead of jumping.",hear:"The 7ths blur the edges. Your B01 progression never quite comes home, which keeps it feeling like night."},
    {k:"play",t:"Go to B01, press [RECORD] and select [T6]. Turn [SHAPE] until the screen shows m7, [DECAY] to about 110 and [REVERB SEND] to about 60.",hl:"p:record h:track p:t6 t:shape t:decay t:reverb",hear:"Tap [T6]: a soft minor 7th chord."},
    {k:"play",t:"Tap [T5] and [T6] together. If they clash, the sounds are tuned differently: select [T6], hold [FUNC] and turn [PITCH] one semitone at a time until chord and bass agree.",hl:"p:t5 p:t6 h:track h:func t:pitch",hear:"Bass and chord on the same root: one instrument, low and high."},
    {k:"play",t:"Open the SCALE menu ([FUNC] + [PAGE]), press [T6], set LEN to 16 and press [BACK]. Place one chord on [TRIG 1]. Then set T6's LEN back to 64 the same way.",hl:"h:func p:page p:t6 t:level p:back p:s1",hear:"One long chord at the top of every bar, copied to all four pages."},
    {k:"play",t:`Follow the bass: press [PAGE] for page 2 and on [TRIG 1], ${noteLock} 4 semitones down. Page 3: 7 down. Page 4: 5 down.`,hl:"p:page h:s1 p:level t:level",hear:"The chords move with the bass now. Bar 2 sounds sour: an F minor doesn't belong in A minor."},
    {k:"play",t:"Fix bar 2 with a major 7th: on page 2, hold [TRIG 1] and turn [SHAPE] to Maj7. Bars 3 and 4 stay m7.",hl:"p:page h:s1 t:shape",hear:"Am7, Fmaj7, Dm7, Em7: warm and wide in the middle, never fully home."},
    {k:"play",t:"Shape the voicing: with no trig held, turn [COLOR] slowly. On the CHORD machine it changes the mix of the chord's voices, so some notes come forward and others fade. Then try [SWEEP] for the timbre.",hl:"t:color t:sweep",hear:"Same chords, from thin and glassy to full and soft. Keep what feels like night."},
    {k:"play",t:"A taste of Dorian: on page 3, hold [TRIG 1] and turn [SHAPE] to Major. D major brings in F#, the raised 6th of A. Keep it, or turn it back to m7.",hl:"p:page h:s1 t:shape",hear:"Bar 3 glows brighter for a moment: a hopeful kind of minor."},
    {k:"play",t:"Press [RECORD] to leave grid recording and listen to all four bars with the bass and drums. Save: hold [FUNC] and long-press [SETTINGS].",hl:"p:record h:func p:settings",hear:"Beat, bass and four chords: a full night-time loop."},
    {k:"check",t:"Which semitone formula is a minor 7th chord (m7)?",q:["0-4-7","0-3-7","!0-3-7-10","0-4-7-11"],a:"A minor triad (0-3-7) plus a 7th 10 semitones up. 0-4-7-11 is the major 7th, Maj7.",hear:"3 up is minor, 4 up is major. 10 or 11 on top makes a seventh."},
  ],
  challenge:"Lock a different SHAPE onto one chord at a time (sus2, sus4, madd9, m9no5) and hear how each one colours your progression. Keep your favourite and write the others in your notes."
},
{ id:"w12", week:12, unit:"Notes and harmony", title:"Melody, question and answer", minutes:40,
  goal:"Write a short melody that asks a question and answers it, using steps and the root, and let it vary with trig conditions.",
  listen:"Air, \"Playground Love\". Notice how short the melody's phrases are, and how each one seems to reply to the one before.",
  concepts:[
    {h:"Steps and leaps",p:["Melodies move mostly by steps, to the next note of the scale, with a few leaps for drama. After a leap, stepping back the other way sounds natural."]},
    {h:"Chord tones",p:["Notes that belong to the chord underneath (root, 3rd, 5th, 7th) sound stable, especially on strong beats. Other scale notes work as passing notes in between."]},
    {h:"Question and answer",p:["A phrase that ends away from the root sounds like a question. Repeat its start and end on the root, and it becomes the answer. A short motif repeated, sometimes at a new pitch (a sequence), is what makes a melody stick."]},
    {h:"One track, two voices",p:["Each track plays one sound at a time. Your melody lives on T6 in the gaps between chords: a SHAPE lock to Unison turns a chord step into a single note."]}
  ],
  steps:[
    {k:"learn",fig:"u3contour",t:"A melody is a line of steps and leaps. Steps, to the next scale note, feel smooth and singable. Leaps feel dramatic, and sound best when the line then steps back the other way."},
    {k:"learn",fig:"u3qa",t:"Melodies talk in phrases. A question ends away from home, often on the 2nd or 5th. The answer starts the same way and lands on the root. In B01 the chords play bars 1 and 3, and the melody asks in bar 2 and answers in bar 4."},
    {k:"learn",fig:{grid:{title:"Ask, then answer",presets:[
      {name:"Question and answer",bpm:80,note:"A C B (a comma), then A C B A (a full stop).",rows:[{n:"Kick",s:"kick",v:hits("1,9",.6)},{n:"Bass",s:"bass",v:hits("1,9",.6),note:45},{n:"Melody",s:"pluck",v:hits("1,3,5,9,11,13,15"),p:[69,0,72,0,71,0,0,0,69,0,72,0,71,0,69,0]}]},
      {name:"Two questions",bpm:80,note:"A C B twice: it never lands.",rows:[{n:"Kick",s:"kick",v:hits("1,9",.6)},{n:"Bass",s:"bass",v:hits("1,9",.6),note:45},{n:"Melody",s:"pluck",v:hits("1,3,5,9,11,13"),p:[69,0,72,0,71,0,0,0,69,0,72,0,71,0,0,0]}]},
      {name:"Sequence",bpm:80,note:"A C B, the same shape from C (C E D), then home to A.",rows:[{n:"Kick",s:"kick",v:hits("1,9",.6)},{n:"Bass",s:"bass",v:hits("1,9",.6),note:45},{n:"Melody",s:"pluck",v:hits("1,3,5,9,11,13,15"),p:[69,0,72,0,71,0,0,0,72,0,76,0,74,0,69,0]}]}
    ]}},t:"Hear it: three notes asked, then answered. Then the version that never lands, and a sequence, where the motif repeats from a higher note.",hear:"Ending on the root feels like a full stop. Ending anywhere else feels like a comma."},
    {k:"play",t:"Go to B01, press [RECORD] and select [T6]. Press [PAGE] for page 2 and place a note on [TRIG 9]: the melody's first note.",hl:"p:record h:track p:t6 p:page p:s9",hear:"The chord in bar 2 now stops halfway: a track plays one sound at a time."},
    {k:"play",t:"Make it a single note: hold [TRIG 9] and turn [SHAPE] to Unison ×2. Still holding it, hold [FUNC] and turn [PITCH] 12 semitones up, so the melody sits an octave above the chords.",hl:"h:s9 t:shape h:func t:pitch",hear:"One clear, higher note. If it sounds sour, hold the trig and turn [COLOR] down: in Unison, COLOR is detune."},
    {k:"play",t:"Copy it: hold [TRIG 9] and press [RECORD]. Then hold [TRIG 11] and press [STOP], and hold [TRIG 13] and press [STOP].",hl:"h:s9 p:record h:s11 p:stop h:s13 p:stop",hear:"Three identical notes. The SHAPE and PITCH locks came along with them."},
    {k:"play",t:`Shape the question: on [TRIG 11], ${noteLock} 3 semitones up. On [TRIG 13], 2 up. The motif is now A, C, B.`,hl:"h:s11 p:level t:level h:s13",hear:"It ends on B, the 2nd, and hangs in the air: a question."},
    {k:"play",t:"Answer it: hold [TRIG 9], [TRIG 11] and [TRIG 13] and press [RECORD]. Press [PAGE] for page 4, hold [TRIG 9] and press [STOP]. Then copy [TRIG 9] to [TRIG 15] the same way.",hl:"h:s9 h:s11 h:s13 p:record p:page p:stop h:s15",hear:"Bar 4 plays A, C, B and then A again: the answer lands home."},
    {k:"play",t:"Make the answer wait: on page 4, hold [TRIG 15] and turn [CHANCE] until the screen shows 2:2. It now lands home only every second time round.",hl:"h:s15 t:chance",hear:"Bars 1–4 ask twice, bars 5–8 finally answer: an 8-bar phrase from a 4-bar pattern."},
    {k:"play",t:`Let the question vary: on page 2, copy [TRIG 13] to [TRIG 15]. On [TRIG 15], ${noteLock} 3 semitones higher, to D. Then hold it and turn [CHANCE] to 50%.`,hl:"p:page h:s13 p:record h:s15 p:stop p:level t:level t:chance",hear:"Sometimes the question climbs one step further. It never plays quite the same way twice."},
    {k:"play",t:"Press [RECORD] to leave grid recording and listen to eight bars. Mute T6 ([FUNC] + [T6]) to hear the space it fills, unmute it, and save (hold [FUNC], long-press [SETTINGS]).",hl:"p:record h:func p:t6 p:settings",hear:"Chords call in bars 1 and 3, the melody replies in 2 and 4. Your track now sings."},
    {k:"check",t:"Bar 2 plays A, C, B and bar 4 plays A, C, B, A. Why does bar 4 sound finished?",q:["It's louder","!It ends on the root, A","It has more notes","It uses a leap"],a:"Ending on the root sounds like a full stop. Ending on B, the 2nd, sounds like a comma. That's question and answer.",hear:"Ask away from home, answer on the root."},
  ],
  challenge:"Hum a four-note answer of your own over the loop, then find it on the pentatonic keys ([TRIG 2], [TRIG 4], [TRIG 7], [TRIG 9], [TRIG 12], [TRIG 14], [TRIG 16]). Put it on page 4 in place of A, C, B, A, and keep the last note on the root."
},
];

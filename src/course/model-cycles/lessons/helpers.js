export const TRACK_MAP="T1 KICK, T2 SNARE, T3 METAL (hats), T4 PERC, T5 TONE (bass), T6 CHORD (chords)";
/* song studies: each lives in its own pattern in bank C, so your course track in B01 stays untouched */
export const songHome=(n,bpm)=>({k:"play",t:`Go to this study's own pattern: hold [PATTERN], press [T3] (bank C), then press [TRIG ${n}]. If anything plays there, clear it with [FUNC] + [PLAY]. Press [TEMPO], set ${bpm} BPM with [LEVEL/DATA], and press [BACK].`,hl:`h:pattern p:t3 p:s${n} p:tempo t:level p:back`,hear:`C0${n} on the screen, at ${bpm} BPM.`});
export const songMachines=list=>({k:"play",t:`Set the machines this study needs, the same layout as your course track: ${list}. For each: hold [TRACK], press the pad, press [MACHINES], turn [LEVEL/DATA] to the machine and press [BACK].`,hl:"h:track p:machines t:level p:back"});
export const noteLock="hold the trig, press [LEVEL/DATA] until NOTE shows, and turn it";

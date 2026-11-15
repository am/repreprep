(function () {
  function shuffle(list) {
    for (var i = list.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1)),
        swap = list[i];
      list[i] = list[j];
      list[j] = swap;
    }
    return list;
  }
  // hand-picked sets of three colors, each set clearly apart within itself (checked in OKLab) and readable
  // on the page background; light mode gets its own deeper sets
  var PALETTES = {
    dark: [
      ["#2f5bff", "#ffe14d", "#ff3b6b"],
      ["#00e0b8", "#8a3cff", "#ff8a00"],
      ["#ff2bd6", "#00c2ff", "#c6ff00"],
      ["#ff4f1f", "#4d7cff", "#7dffb0"],
      ["#8b5cff", "#ffb000", "#00d68f"],
      ["#ff006e", "#3a86ff", "#ffbe0b"],
      ["#00f5d4", "#f15bb5", "#6a4dff"],
      ["#fb5607", "#9b5cff", "#06d6a0"],
      ["#c1ff00", "#ff00a0", "#1f6bff"],
      ["#ff7a00", "#00b3ff", "#d000ff"],
      ["#1aff6e", "#ff2e2e", "#7b61ff"],
      ["#fff03a", "#ff3df0", "#00a3ff"],
    ],
    light: [
      ["#1434f5", "#ff7a00", "#00a37a"],
      ["#008f7a", "#7a2cff", "#ff4f1f"],
      ["#d4009b", "#0072e0", "#3fae00"],
      ["#e01e00", "#2f2fd0", "#00a37a"],
      ["#6d28d9", "#e07b00", "#009e60"],
      ["#e0005a", "#1c5fe0", "#c79400"],
      ["#0096a8", "#c2007a", "#4b2bff"],
      ["#e04800", "#7b2fe0", "#00956b"],
      ["#5aa800", "#d6008a", "#0047d6"],
      ["#d96600", "#0089d6", "#a600d6"],
      ["#00a344", "#d61f1f", "#5a3dff"],
      ["#b8a000", "#d600c2", "#0070d6"],
    ],
  };
  function linear(channel) {
    return channel <= 0.04045 ? channel / 12.92 : Math.pow((channel + 0.055) / 1.055, 2.4);
  }
  function luminance(rgb) {
    var channels = rgb.map(linear);
    return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
  }
  function oklab(hex) {
    var rgb = [1, 3, 5].map(function (start) {
      return linear(parseInt(hex.slice(start, start + 2), 16) / 255);
    });
    var long = Math.cbrt(0.4122214708 * rgb[0] + 0.5363325363 * rgb[1] + 0.0514459929 * rgb[2]);
    var medium = Math.cbrt(0.2119034982 * rgb[0] + 0.6806995451 * rgb[1] + 0.1073969566 * rgb[2]);
    var shortWave = Math.cbrt(0.0883024619 * rgb[0] + 0.2817188376 * rgb[1] + 0.6299787005 * rgb[2]);
    return [
      0.2104542553 * long + 0.793617785 * medium - 0.0040720468 * shortWave,
      1.9779984951 * long - 2.428592205 * medium + 0.4505937099 * shortWave,
      0.0259040371 * long + 0.7827717662 * medium - 0.808675766 * shortWave,
    ];
  }
  function distance(hexA, hexB) {
    var labA = oklab(hexA),
      labB = oklab(hexB);
    return Math.hypot(labA[0] - labB[0], labA[1] - labB[1], labA[2] - labB[2]);
  }
  function backgroundLuminance() {
    var channels = getComputedStyle(document.body).backgroundColor.match(/[\d.]+/g);
    return channels
      ? luminance(
          channels.slice(0, 3).map(function (channel) {
            return channel / 255;
          })
        )
      : 0;
  }
  // the next set of colors: one whose every color is as far as possible from every color showing now,
  // so a swap reads as a new palette, not the same three colors trading places
  function palette(logo) {
    var sets = PALETTES[backgroundLuminance() > 0.4 ? "light" : "dark"],
      showing = [];
    if (logo)
      showing = [0, 1, 2]
        .map(function (index) {
          return logo.children[index].style.getPropertyValue("--c");
        })
        .filter(function (color) {
          return color.charAt(0) === "#";
        });
    if (!showing.length)
      try {
        showing = (sessionStorage.getItem("rrr-logo-pal") || "").split(",").filter(Boolean);
      } catch {}
    var recent = [];
    try {
      recent = JSON.parse(sessionStorage.getItem("rrr-logo-recent") || "[]");
    } catch {}
    var ranked = sets
      .filter(function (set) {
        return recent.indexOf(set.join()) < 0;
      })
      .map(function (set) {
        var gap = Infinity;
        set.forEach(function (color) {
          showing.forEach(function (shown) {
            gap = Math.min(gap, distance(color, shown));
          });
        });
        return { set: set, gap: showing.length ? gap : Math.random() };
      })
      .sort(function (first, second) {
        return second.gap - first.gap;
      });
    var chosen = ranked[0].set; // the farthest from what's showing
    recent = [chosen.join()].concat(recent).slice(0, 5); // the last five sets sit out, so it doesn't bounce between two
    try {
      sessionStorage.setItem("rrr-logo-pal", chosen.join(","));
      sessionStorage.setItem("rrr-logo-recent", JSON.stringify(recent));
    } catch {}
    return chosen.slice();
  }
  // each layer gets its own offset slot (plus a little jitter) so all three always show,
  // and the slots stay within a small box so the word still reads as one REP
  function slots() {
    return shuffle([0, 0.045, 0.09]).map(function (offset) {
      return (offset + Math.random() * 0.02).toFixed(3) + "em";
    });
  }
  function remix(logo) {
    var colors = shuffle(palette(logo)),
      offsetsX = slots(),
      offsetsY = slots();
    Array.prototype.forEach.call(logo.children, function (layer, index) {
      layer.style.setProperty("--c", colors[index]);
      layer.style.setProperty("--x", offsetsX[index]);
      layer.style.setProperty("--y", offsetsY[index]);
    });
  }
  function randomBetween(min, max) {
    return min + Math.random() * (max - min);
  }
  // one glitch: a few fast frames of hidden layers, cut slices and jumps, then a fresh remix
  function glitch(logo) {
    var frames = 3 + Math.floor(Math.random() * 4),
      colors = palette(logo);
    logo.classList.add("glitch");
    (function frame(framesLeft) {
      if (!framesLeft) {
        Array.prototype.forEach.call(logo.children, function (layer) {
          layer.style.opacity = "";
          layer.style.clipPath = "";
        });
        remix(logo);
        logo.classList.remove("glitch");
        return;
      }
      Array.prototype.forEach.call(logo.children, function (layer, index) {
        layer.style.opacity = Math.random() < 0.25 ? "0" : "";
        var top = randomBetween(0, 70);
        layer.style.clipPath =
          Math.random() < 0.5
            ? "inset(" + top.toFixed(0) + "% 0 " + (100 - top - randomBetween(15, 40)).toFixed(0) + "% 0)"
            : "";
        layer.style.setProperty("--x", randomBetween(-0.12, 0.2).toFixed(3) + "em");
        layer.style.setProperty("--y", randomBetween(-0.06, 0.12).toFixed(3) + "em");
        if (Math.random() < 0.5) layer.style.setProperty("--c", colors[(index + framesLeft) % 3]);
      });
      setTimeout(
        function () {
          frame(framesLeft - 1);
        },
        randomBetween(40, 110)
      );
    })(frames);
  }
  // beats are scheduled from a fixed start time so they never drift; tap() can restart them at a new tempo.
  // The tap key's light flashes on every beat, like the TEMPO key on the Model:Cycles.
  function beats(logo, bpm, onBeat) {
    var beat = (logo._beat = { ms: 60000 / bpm, start: performance.now(), count: 0, timer: 0 }),
      key = tapKey(logo);
    beat.tick = function tick() {
      clearTimeout(beat.timer);
      if (!logo.isConnected) return; // page swapped; the new page starts its own loop
      if (!document.hidden) {
        onBeat(beat.count % 4 === 0, beat.ms);
        if (beat.sound > 0) {
          click(beat.count % 4 === 0);
          beat.sound--;
        }
        if (key) {
          key.classList.toggle("down", beat.count % 4 === 0);
          key.classList.add("lit");
          later(90, function () {
            key.classList.remove("lit");
          });
        }
      }
      beat.count++;
      if (performance.now() - (beat.start + beat.count * beat.ms) > beat.ms)
        beat.start = performance.now() - beat.count * beat.ms; // back from a background tab
      beat.timer = setTimeout(tick, Math.max(0, beat.start + beat.count * beat.ms - performance.now()));
    };
    beat.tick();
  }
  // a quiet, dry metronome, like the Model:Cycles click: "clack" on the bar, "tik" on the other beats.
  // Browsers only allow sound after a tap, so it starts with the first tap and stops four bars after the last one.
  var audio;
  function click(down) {
    try {
      audio = audio || new (window.AudioContext || window.webkitAudioContext)();
      var now = audio.currentTime,
        seconds = down ? 0.03 : 0.018;
      var buffer = audio.createBuffer(1, Math.ceil(audio.sampleRate * seconds), audio.sampleRate),
        samples = buffer.getChannelData(0);
      for (var i = 0; i < samples.length; i++)
        samples[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / samples.length, 4);
      var source = audio.createBufferSource(),
        filter = audio.createBiquadFilter(),
        gain = audio.createGain();
      source.buffer = buffer;
      filter.type = "bandpass";
      filter.frequency.value = down ? 1500 : 3200;
      filter.Q.value = down ? 4 : 6;
      gain.gain.value = down ? 0.22 : 0.12;
      source.connect(filter);
      filter.connect(gain);
      gain.connect(audio.destination);
      source.start(now);
    } catch {}
  }
  function tapKey(logo) {
    var wrap = logo.parentNode;
    return wrap && wrap.classList.contains("logo-wrap") ? wrap.querySelector(".tap") : null;
  }
  // tap tempo: each tap lands on a beat (the first tap of a run is the downbeat); from the second tap on,
  // the tempo is the average gap of the last few taps, kept within the Model:Cycles range of 30 to 300 BPM.
  // A pause of two seconds starts a new run.
  function tap(logo) {
    var beat = logo._beat,
      key = tapKey(logo),
      now = performance.now(),
      taps = logo._taps || [];
    if (!beat) return;
    if (taps.length && now - taps[taps.length - 1] > 2000) {
      taps = [];
      logo._tapCount = 0;
    }
    taps.push(now);
    logo._taps = taps = taps.slice(-5);
    if (taps.length > 1) {
      beat.ms = Math.min(2000, Math.max(200, (taps[taps.length - 1] - taps[0]) / (taps.length - 1)));
      try {
        localStorage.setItem("rrr-bpm", Math.round(60000 / beat.ms));
      } catch {}
    }
    beat.sound = 16 + 1; // this tap's beat plus four bars
    beat.count = logo._tapCount = logo._tapCount || 0;
    logo._tapCount++;
    beat.start = now - beat.count * beat.ms;
    beat.tick();
    if (key) {
      key.querySelector("b").textContent = taps.length > 1 ? Math.round(60000 / beat.ms) + " BPM" : "TAP";
      key.classList.add("on");
      clearTimeout(logo._tapOff);
      logo._tapOff = setTimeout(function () {
        key.classList.remove("on");
        key.querySelector("b").textContent = "TAP";
      }, 2500);
    }
  }
  function later(ms, callback) {
    setTimeout(callback, ms);
  }
  function slot() {
    return randomBetween(0, 0.11).toFixed(3) + "em";
  }
  // a whole new set of colors at once (offsets stay)
  function recolor(logo) {
    var colors = shuffle(palette(logo));
    [0, 1, 2].forEach(function (index) {
      logo.children[index].style.setProperty("--c", colors[index]);
    });
  }
  // one layer per beat, never the same one twice in a row (and never `not`, when given)
  function pick(logo, not) {
    var index;
    do {
      index = Math.floor(Math.random() * 3);
    } while (index === logo._last || logo.children[index] === not);
    logo._last = index;
    return logo.children[index];
  }
  // a short, soft fade toward the page background (a tint, not transparency, so it never blends with the
  // layers underneath); depth is how much color stays at the bottom of the dip
  function pulse(layer, depth, ms) {
    var color = getComputedStyle(layer).color,
      background = getComputedStyle(document.body).backgroundColor;
    var dip = "color-mix(in oklab, " + color + " " + Math.round((depth || 0.5) * 100) + "%, " + background + ")";
    layer.animate([{ color: color }, { color: dip, offset: 0.3 }, { color: color }], {
      duration: ms || 220,
      easing: "ease-out",
    });
  }
  // the layer is torn sideways for a moment, with fresh noise each time
  function tear(layer, scale, ms) {
    var noise = document.querySelector("#rrr-tear feTurbulence"),
      displace = document.querySelector("#rrr-tear feDisplacementMap");
    if (!noise) return;
    noise.setAttribute("seed", Math.floor(Math.random() * 999));
    displace.setAttribute("scale", scale || 34);
    layer.style.filter = "url(#rrr-tear)";
    later(ms || 110, function () {
      layer.style.filter = "";
    });
  }
  // a tiny accent on the off-beats, picked at random so the pattern never shows: a quick blink, a flash of
  // another layer's color, a small tear, or (now and then) nothing
  function accent(logo) {
    var layer = logo.children[Math.floor(Math.random() * 3)],
      roll = Math.random();
    if (roll < 0.3) pulse(layer, 0.25, 90);
    else if (roll < 0.55) {
      var other =
        logo.children[(Array.prototype.indexOf.call(logo.children, layer) + 1 + Math.floor(Math.random() * 2)) % 3];
      var color = getComputedStyle(other).color;
      layer.animate([{ color: color }, { color: color }], { duration: 70 });
    } else if (roll < 0.85) tear(layer, 9 + Math.random() * 8, 70);
  }
  // a layer snaps to a new spot; on the bar another layer jolts and the colors swap
  function drift(logo, down, layer) {
    layer = layer || pick(logo);
    layer.style.setProperty("--x", slot());
    layer.style.setProperty("--y", slot());
    if (down) {
      var other = pick(logo),
        offsetX = other.style.getPropertyValue("--x");
      other.style.transition = "none";
      other.style.setProperty("--x", (parseFloat(offsetX) + 0.08).toFixed(3) + "em");
      later(60, function () {
        other.style.setProperty("--x", offsetX);
        other.style.transition = "";
      });
      recolor(logo);
    }
    return layer;
  }
  // each beat one layer snaps to a new spot while a different layer pulses; the bar gets the full tear,
  // the other beats a small random accent
  function dance(logo, down) {
    var pulsing = pick(logo),
      moved = drift(logo, down, pick(logo, pulsing));
    pulse(pulsing);
    if (down) tear(moved);
    else
      later(Math.random() * 40, function () {
        accent(logo);
      });
  }
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  // a new theme means a new background: switch to a palette made for it
  if (!window.__rrrLogoTheme) {
    window.__rrrLogoTheme = true;
    window.addEventListener("rrr-theme", function () {
      Array.prototype.forEach.call(document.querySelectorAll(".logo[data-on]"), recolor);
    });
  }
  Array.prototype.forEach.call(document.querySelectorAll(".logo:not([data-on])"), function (logo) {
    logo.dataset.on = "1";
    remix(logo);
    var dances = logo.hasAttribute("data-dance");
    var savedBpm = 0;
    try {
      savedBpm = +localStorage.getItem("rrr-bpm");
    } catch {}
    if (dances && !reduce)
      beats(logo, savedBpm || +logo.dataset.bpm, function (down) {
        dance(logo, down);
      });
    else if (!reduce) {
      (function next() {
        setTimeout(
          function () {
            if (!logo.isConnected) return;
            if (!document.hidden) glitch(logo);
            next();
          },
          randomBetween(10000, 40000)
        );
      })();
    }
    logo.addEventListener("click", function (event) {
      if (dances && logo._beat) tap(logo);
      else remix(logo);
      if (location.pathname === "/" || dances) event.preventDefault();
    });
  });
})();

let ctx = null;

function context() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

// Play a sequence of [frequencyHz, durationSec] notes back to back.
function playNotes(notes, type = 'sine', volume = 0.2) {
  const ac = context();
  let t = ac.currentTime;
  for (const [freq, dur] of notes) {
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(volume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
    osc.connect(gain).connect(ac.destination);
    osc.start(t);
    osc.stop(t + dur);
    t += dur;
  }
}

// Short filtered noise burst, used for the velcro sound.
function playNoise(durationSec, filterHz, volume) {
  const ac = context();
  const length = Math.floor(ac.sampleRate * durationSec);
  const buffer = ac.createBuffer(1, length, ac.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i += 1) data[i] = Math.random() * 2 - 1;
  const src = ac.createBufferSource();
  src.buffer = buffer;
  const filter = ac.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = filterHz;
  filter.Q.value = 0.7;
  const gain = ac.createGain();
  const t = ac.currentTime;
  gain.gain.setValueAtTime(volume, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + durationSec);
  src.connect(filter).connect(gain).connect(ac.destination);
  src.start(t);
}

export function playPick() { playNotes([[660, 0.08]], 'triangle', 0.1); }
export function playCorrect() { playNotes([[523, 0.12], [659, 0.12], [784, 0.2]]); }
export function playWrong() { playNotes([[300, 0.2], [220, 0.3]], 'sawtooth', 0.12); }
export function playUnlock() { playNotes([[523, 0.1], [659, 0.1], [784, 0.1], [1047, 0.35]], 'triangle'); }
export function playSleep() { playNotes([[440, 0.3], [392, 0.3], [349, 0.5]], 'sine', 0.15); }
// Velcro pressed shut: a crisp "rip" followed by a soft thud.
export function playVelcro() {
  playNoise(0.16, 3200, 0.25);
  playNotes([[160, 0.08]], 'sine', 0.15);
}

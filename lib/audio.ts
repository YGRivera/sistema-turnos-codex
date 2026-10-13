type AudioContextWindow = Window & typeof globalThis & { webkitAudioContext?: typeof AudioContext };

let audioContext: AudioContext | null = null;

function getAudioContext() {
  if (typeof window === "undefined") return null;
  const AudioContextConstructor = window.AudioContext || (window as AudioContextWindow).webkitAudioContext;
  if (!AudioContextConstructor) return null;
  audioContext ??= new AudioContextConstructor();
  return audioContext;
}

/** Call from the ticket button's click handler to unlock audio before the API request. */
export function prepareAudio() {
  const context = getAudioContext();
  if (context?.state === "suspended") void context.resume();
}

function playChime(notes: number[]) {
  const context = getAudioContext();
  if (!context) return;
  if (context.state === "suspended") void context.resume();

  const startAt = context.currentTime + 0.03;
  notes.forEach((frequency, index) => {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const noteStart = startAt + index * 0.2;
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(frequency, noteStart);
    gain.gain.setValueAtTime(0.0001, noteStart);
    gain.gain.exponentialRampToValueAtTime(0.18, noteStart + 0.025);
    gain.gain.exponentialRampToValueAtTime(0.0001, noteStart + 0.42);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(noteStart);
    oscillator.stop(noteStart + 0.44);
  });
}

function speak(message: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const announcement = new SpeechSynthesisUtterance(message);
  announcement.lang = "es-MX";
  announcement.rate = 0.95;
  announcement.volume = 1;
  window.speechSynthesis.speak(announcement);
}

export function announceTicketTaken(ticket: string) {
  playChime([659, 880]);
  speak(`Tu turno ${ticket} está listo. Por favor, espera nuestro llamado.`);
}

export function announceTicketCalled(ticket: string, module: number) {
  playChime([880, 659, 880]);
  speak(`Atención. Turno ${ticket}. Por favor, pase al módulo ${module}.`);
}

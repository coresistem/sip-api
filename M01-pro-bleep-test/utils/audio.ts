export class AudioEngine {
  private ctx: AudioContext | null = null;
  private voices: SpeechSynthesisVoice[] = [];
  private masterGain: GainNode | null = null;
  private volume: number = 0.8;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = () => {
        this.voices = window.speechSynthesis.getVoices();
      };
    }
  }

  public init() {
    if (!this.ctx) {
      const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
      this.ctx = new AudioContextClass();
      this.masterGain = this.ctx.createGain();
      this.masterGain.connect(this.ctx.destination);
      this.masterGain.gain.value = this.volume;
    } else if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    
    if ('speechSynthesis' in window) {
      this.voices = window.speechSynthesis.getVoices();
    }
  }

  public setVolume(val: number) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.masterGain) {
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx?.currentTime || 0);
    }
  }

  public getCurrentTime(): number {
    return this.ctx ? this.ctx.currentTime : 0;
  }

  private speak(text: string) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    
    if (this.voices.length === 0) {
      this.voices = window.speechSynthesis.getVoices();
    }

    // Prefer female voices
    const femaleVoice = this.voices.find(v => 
      v.name.includes('Google US English') || 
      v.name.includes('Samantha') || 
      v.name.includes('Zira') || 
      v.name.toLowerCase().includes('female')
    );

    if (femaleVoice) {
      utterance.voice = femaleVoice;
    }

    utterance.rate = 1.1;
    utterance.volume = this.volume; 
    
    window.speechSynthesis.speak(utterance);
  }

  public announceLevel(level: number) {
    this.speak(`Level ${level}`);
  }

  public announceReady() {
    this.speak("Ready");
  }

  public announceGetReady() {
    this.speak("Get Ready");
  }

  public playFail() {
    if (!this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;
    
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, t);
    osc.frequency.linearRampToValueAtTime(100, t + 0.5);
    
    gain.gain.setValueAtTime(0.5, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.5);
    
    osc.start(t);
    osc.stop(t + 0.5);
  }

  public playBeep(startTime: number, type: 'shuttle' | 'level' | 'stop') {
    if (!this.ctx || !this.masterGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.connect(gain);
    gain.connect(this.masterGain);

    if (type === 'shuttle') {
      // High pitch short beep
      osc.frequency.setValueAtTime(880, startTime);
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.5, startTime);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);
      osc.start(startTime);
      osc.stop(startTime + 0.3);
    } else if (type === 'level') {
      // Triple beep for level up
      const now = startTime;
      
      // Beep 1
      const o1 = this.ctx.createOscillator();
      const g1 = this.ctx.createGain();
      o1.connect(g1); g1.connect(this.masterGain);
      o1.frequency.setValueAtTime(1200, now);
      o1.type = 'square';
      g1.gain.setValueAtTime(0.3, now);
      g1.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      o1.start(now); o1.stop(now + 0.15);

      // Beep 2
      const o2 = this.ctx.createOscillator();
      const g2 = this.ctx.createGain();
      o2.connect(g2); g2.connect(this.masterGain);
      o2.frequency.setValueAtTime(1200, now + 0.2);
      o2.type = 'square';
      g2.gain.setValueAtTime(0.3, now + 0.2);
      g2.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      o2.start(now + 0.2); o2.stop(now + 0.35);

       // Beep 3
      const o3 = this.ctx.createOscillator();
      const g3 = this.ctx.createGain();
      o3.connect(g3); g3.connect(this.masterGain);
      o3.frequency.setValueAtTime(1500, now + 0.4);
      o3.type = 'square';
      g3.gain.setValueAtTime(0.3, now + 0.4);
      g3.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
      o3.start(now + 0.4); o3.stop(now + 0.8);

    } else if (type === 'stop') {
      // Low long tone
      osc.frequency.setValueAtTime(220, startTime);
      osc.frequency.exponentialRampToValueAtTime(110, startTime + 1.5);
      osc.type = 'triangle';
      gain.gain.setValueAtTime(0.5, startTime);
      gain.gain.linearRampToValueAtTime(0, startTime + 1.5);
      osc.start(startTime);
      osc.stop(startTime + 1.5);
    }
  }
}

export const audioEngine = new AudioEngine();
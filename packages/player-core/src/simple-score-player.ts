import { Disposable } from './basic/disposable';
import { AudioDecoder } from './audio-decoder';
import { MusicalInstrumentPlugin } from './musical-instrument-plugin';
import { Note } from './data-format/note';
import { ScorePart } from './data-format/part';
import { groupBy } from 'lodash-es';

function createAudioContext(contextOptions?: AudioContextOptions): AudioContext {
  const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
  return new AudioContext(contextOptions);
}

export interface WithTimelineNote extends Note {
  timestamp: number;
  played: boolean;
}

export function transformNotesWithTimeline(scorePart: ScorePart, quaterTime: number) {
  const result: WithTimelineNote[] = [];
  let totalTime = 0;
  scorePart.measures.forEach(measure => {
    let measureTime = totalTime;
    // @ts-ignore
    const noteGroups = groupBy(measure.notes, (note => note.staff));
    Object.values(noteGroups).forEach(groupedNotes => {
      let time = totalTime;
      let oldTime = time;
      groupedNotes.forEach(note => {
        // @ts-ignore
        const beginTime = note.chord ? oldTime : time; // 和弦的时候采用上一次的开始时间
        const finalNote = {
          ...note,
          timestamp: beginTime, // 开始播放的时间
          played: false,
        };
        result.push(finalNote);
        // @ts-ignore
        if (!note.chord) {
          oldTime = time;
          // @ts-ignore
          time += quaterTime * note.stay;
        }
        if (time > measureTime) {
          measureTime = time;
        }
      });
    });
    totalTime = measureTime;
  });
  return result;
}

export class ScorePartPlayer implements Disposable {

  readonly audioContext: AudioContext = createAudioContext();

  readonly audioDecoder: AudioDecoder = new AudioDecoder(this.audioContext);

  readonly audioAnalyser: AnalyserNode;

  protected unionSourceNode: AudioNode;

  protected plugins: MusicalInstrumentPlugin[] = [];

  protected notes: WithTimelineNote[] = [];

  constructor() {
    const { audioContext } = this;
    this.unionSourceNode = audioContext.createWaveShaper();
    this.audioAnalyser = audioContext.createAnalyser();
    const { audioAnalyser, unionSourceNode } = this;
    unionSourceNode.connect(audioAnalyser);
    audioAnalyser.connect(audioContext.destination);
    this.loop = this.loop.bind(this);
  }

  addPlugins(plugins: MusicalInstrumentPlugin[]) {
    this.plugins = this.plugins.concat(plugins);
  }

  setScorePart(scorePart: ScorePart) {
    this.notes = transformNotesWithTimeline(scorePart, 900);
  }

  async play(): Promise<void> {
    await this.audioContext.resume();
    this.loop();
  }

  playShot(note: Note) {
    this.prepareAudioBufferSources(note);
  }

  pause(): void {
    this.audioContext.suspend();
  }

  resume(): void {
    this.audioContext.resume();
  }

  dispose(): void {
    this.audioContext.close();
    // @ts-ignore
    this.audioContext = undefined!;
    this.audioDecoder.dispose();
    // @ts-ignore
    this.audioDecoder = undefined!;
    this.plugins = [];
  }

  private loop() {
    const { audioContext, notes } = this;
    let allPlayed = true;
    notes.forEach(note => {
      if (note.played) return;
      allPlayed = false;
      if (note.timestamp <= audioContext.currentTime * 1000) {
        this.playShot(note);
        note.played = true;
      }
    });
    if (allPlayed) {
      audioContext.suspend();
      return;
    }
    requestAnimationFrame(this.loop);
  }

  private prepareAudioBufferSources(note: Note) {
    const sourceNodes: AudioBufferSourceNode[] = [];
    let time = 0;
    const { audioContext, unionSourceNode, plugins } = this;
    for (let i = 0; i < plugins.length; i++) {
      const plugin = plugins[i];
      let audioBufferSource = audioContext.createBufferSource();
      audioBufferSource.buffer = plugin.chooseAudioBuffer(note);
      audioBufferSource = plugin.beforePlay(audioBufferSource, note);
      // audioBufferSource.playbackRate.value = 1;
      // audioBufferSource.connect(this.audioContext.destination);
      console.log('[ScorePartPlayer] AudioContext currentTime', audioContext.currentTime);
      audioBufferSource.connect(unionSourceNode);
      audioBufferSource.start(audioContext.currentTime);
      audioBufferSource.stop(audioContext.currentTime + 3);
      time += 10;
      sourceNodes.push(audioBufferSource);
    }
    return sourceNodes;
  }
}

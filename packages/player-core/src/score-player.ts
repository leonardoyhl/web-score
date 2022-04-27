import { Disposable } from './basic/disposable';
import { AudioDecoder } from './audio-decoder';
import { MusicalInstrumentPlugin, MusicalInstrumentPluginConstructor } from './musical-instrument-plugin';
import { Note } from './data-format/note';
import { ScorePart } from './data-format/part';
import { Measure } from './data-format/measure';

function createAudioContext(contextOptions?: AudioContextOptions): AudioContext {
  const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
  return new AudioContext(contextOptions);
}

class ScorePartAccessor {
  constructor(
    public readonly part: ScorePart,
  ) {
    // do nothing
  }

  get id() {
    return this.part.id;
  }

  get measures() {
    return this.part.measures;
  }

  get notes() {
    let notes: Note[] = [];
    const { measures } = this.part;
    for (let i = 0; i < measures.length; i++) {
      const measure = measures[i];
      notes = notes.concat(measure.notes);
    }
    return notes;
  }

  iterateMeasures(): Iterator<Measure> {
    const { measures } = this.part;
    return measures[Symbol.iterator]();
  }

  iterateNotes(): Iterator<Note> {
    const { measures } = this.part;
    let measureIndex = 0;
    let noteIndex = 0;

    let measure: Measure | undefined = measures[measureIndex];
    return {
      next: () => {
        let note: Note | undefined;
        if (!measure) {
          return {
            value: undefined,
            done: true,
          };
        }
        note = measure.notes[noteIndex];
        noteIndex++;
        if (noteIndex >= measure.notes.length) {
          measureIndex++;
          noteIndex = 0;
          measure = measures[measureIndex];
        }
        return {
          value: note,
          done: measureIndex >= measures.length,
        };
      },
    };

    // return this.notes[Symbol.iterator]();
  }
}

interface ScorePlayerTracker {
  part: ScorePart;
  partAccessor: ScorePartAccessor;
  plugins: MusicalInstrumentPlugin[];
}

export class ScorePlayer implements Disposable {

  private audioContext: AudioContext = createAudioContext();

  private audioDecoder: AudioDecoder = new AudioDecoder(this.audioContext);

  private audioAnalyser: AnalyserNode;

  private unionSourceNode: AudioNode;

  // private scorePartAccessors: ScorePartAccessor[] = [];

  private trackers: ScorePlayerTracker[] = [];

  private plugins: MusicalInstrumentPlugin[] = [];

  constructor(
    scoreParts: ScorePart[],
    pluginMapping: MusicalInstrumentPluginConstructor[][],
  ) {
    console.log('init', scoreParts, pluginMapping);
    const { audioContext } = this;
    this.unionSourceNode = audioContext.createWaveShaper();
    this.audioAnalyser = audioContext.createAnalyser();
    const { audioAnalyser, unionSourceNode, audioDecoder } = this;
    unionSourceNode.connect(audioAnalyser);
    audioAnalyser.connect(audioContext.destination);
    // analyser
    // const buffer = new Uint8Array(audioAnalyser.frequencyBinCount);
    // setInterval(() => {
    //   audioAnalyser.getByteFrequencyData(buffer);
    //   const sum = buffer.reduce((acc, v) => acc + v, 0);
    //   console.log('getByteFrequencyData', sum);
    // }, 500);

    for (let i = 0; i < scoreParts.length; i++) {
      const scorePart = scoreParts[i];
      const scorePartAccessor = new ScorePartAccessor(scorePart);
      // this.scorePartAccessors.push(new ScorePartAccessor(scorePart));
      const plugins = pluginMapping[i].map(Plugin => new Plugin(audioDecoder));
      console.log('init', scorePart, scorePartAccessor, pluginMapping[i], plugins);
      this.trackers.push({
        part: scorePart,
        partAccessor: scorePartAccessor,
        plugins,
      });
    }
  }

  private prepareAudioBufferSources(note: Note) {
    const sourceNodes: AudioBufferSourceNode[] = [];
    let time = 0;
    const { audioContext, unionSourceNode } = this;
    for (let i = 0; i < this.plugins.length; i++) {
      const plugin = this.plugins[i];
      const audioBufferSource = this.audioContext.createBufferSource();
      audioBufferSource.buffer = plugin.chooseAudioBuffer(note);
      console.log('prepareAudioBufferSources', note, audioBufferSource.buffer, plugin.chooseAudioBuffer(note));
      audioBufferSource.playbackRate.value = 1;
      // audioBufferSource.connect(this.audioContext.destination);
      audioBufferSource.connect(unionSourceNode);
      audioBufferSource.start(audioContext.currentTime + time);
      audioBufferSource.stop(audioContext.currentTime + time + 3);
      time += 10;
      sourceNodes.push(audioBufferSource);
    }
    return sourceNodes;
  }

  private connectToDestNode(sourceNode: AudioNode) {
    const { unionSourceNode } = this;
    sourceNode.connect(unionSourceNode);
  }

  private prepare() {
    console.log('prepare', this);
    this.trackers.forEach(async tracker => {
      const { partAccessor, plugins } = tracker;
      console.log('prepare', partAccessor, plugins);
      // const promises = plugins.map(async plugin => {
      //   return await plugin.decode(this.audioDecoder);
      // });
      // await Promise.all(promises);
      this.plugins = plugins;
      const { notes } = partAccessor;
      console.log('prepare', partAccessor, plugins, 'notes', notes);
      notes.forEach(note => {
        this.prepareAudioBufferSources(note);
      });
    });
  }

  private prepared = false;

  play(): void {
    this.audioContext.resume().then(() => {
      this.prepare();
      this.prepared = true;
    });
  }

  pause(): void {
    this.audioContext.suspend();
  }

  resume(): void {
    this.audioContext.resume();
  }

  dispose(): void {
    this.audioContext.close();
    this.audioContext = undefined!;
    this.audioDecoder.dispose();
    this.audioDecoder = undefined!;
  }
}

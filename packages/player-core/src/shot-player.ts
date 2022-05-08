import { Disposable } from './basic/disposable';
import { AudioDecoder } from './audio-decoder';
import { MusicalInstrumentPlugin } from './musical-instrument-plugin';
import { Note } from './data-format/note';

function createAudioContext(contextOptions?: AudioContextOptions): AudioContext {
  const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
  return new AudioContext(contextOptions);
}

export class ScoreShotPlayer implements Disposable {

  readonly audioContext: AudioContext = createAudioContext();

  readonly audioDecoder: AudioDecoder = new AudioDecoder(this.audioContext);

  readonly audioAnalyser: AnalyserNode;

  protected unionSourceNode: AudioNode;

  protected plugins: MusicalInstrumentPlugin[] = [];

  constructor() {
    const { audioContext } = this;
    this.unionSourceNode = audioContext.createWaveShaper();
    this.audioAnalyser = audioContext.createAnalyser();
    const { audioAnalyser, unionSourceNode } = this;
    unionSourceNode.connect(audioAnalyser);
    audioAnalyser.connect(audioContext.destination);
    // analyser
    // const buffer = new Uint8Array(audioAnalyser.frequencyBinCount);
    // setInterval(() => {
    //   audioAnalyser.getByteFrequencyData(buffer);
    //   const sum = buffer.reduce((acc, v) => acc + v, 0);
    //   console.log('getByteFrequencyData', sum);
    // }, 500);
  }

  addPlugins(plugins: MusicalInstrumentPlugin[]) {
    this.plugins = this.plugins.concat(plugins);
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
      console.log('[ShotPlayer] AudioContext currentTime', audioContext.currentTime);
      audioBufferSource.connect(unionSourceNode);
      audioBufferSource.start(audioContext.currentTime);
      audioBufferSource.stop(audioContext.currentTime + 3);
      time += 10;
      sourceNodes.push(audioBufferSource);
    }
    return sourceNodes;
  }

  play(): void {
    this.audioContext.resume();
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
}

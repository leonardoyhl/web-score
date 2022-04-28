import { AudioDecoder } from './audio-decoder';
import { Note } from './data-format/note';

// export interface Constructor<T, P extends any[]> {
//   new (...args: P): T;
//   prototype: T;
// }

// export type MusicalInstrumentPluginConstructor = Constructor<MusicalInstrumentPlugin, [AudioDecoder]>;

export interface MusicalInstrumentPluginConstructor {
  new (decoder: AudioDecoder): MusicalInstrumentPlugin;
  readonly prototype: MusicalInstrumentPlugin;
}

export interface MusicalInstrumentPlugin {
  decode(decoder: AudioDecoder): Promise<void>;

  chooseAudioBuffer(note: Note): AudioBuffer;

  beforePlay(sourceNode: AudioBufferSourceNode, note: Note): AudioBufferSourceNode;
}

export declare var MusicalInstrumentPlugin: MusicalInstrumentPluginConstructor;

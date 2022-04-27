import { decode } from 'base64-arraybuffer';

import { MusicalInstrumentPlugin } from '../../musical-instrument-plugin';
import { Note } from '../../data-format/note';
import { PIANO_SOUND } from './sound';
import { AudioDecoder } from '../../audio-decoder';

function decodeBase64AsArrayBuffer(base64Map: typeof PIANO_SOUND) {
  const arrayBufferMap: Record<string, ArrayBuffer> = {};
  Object.keys(base64Map).forEach(key => {
    const base64 = base64Map[key as keyof typeof base64Map];
    arrayBufferMap[key] = decode(base64);
  });
  return arrayBufferMap;
}

export class PianoPlugin implements MusicalInstrumentPlugin {

  private audioBufferMap: Record<string, AudioBuffer> = {};

  constructor(
    decoder: AudioDecoder,
  ) {
    // do nothing
    this.decode(decoder);
  }

  async decode(decoder: AudioDecoder): Promise<void> {
    let count = 0;
    const arrayBufferMap = decodeBase64AsArrayBuffer(PIANO_SOUND);
    const promises = Object.keys(arrayBufferMap).map(async key => {
      count++;
      const arrayBuffer = arrayBufferMap[key];
      console.log('decode', count, arrayBuffer);
      const audioBuffer = await decoder.decode(arrayBuffer);
      console.log('decode finish', count, arrayBuffer);
      this.audioBufferMap[key] = audioBuffer;
    });
    await Promise.all(promises);
  }

  chooseAudioBuffer(note: Note): AudioBuffer {
    let { pitch: {
      step, octave, alter,
    } } = note;
    // if (alter === 1) {
    //   if (step === 'E') {
    //     step = 'F' as any;
    //     alter = 0;
    //   }

    //   if (step === 'B') {
    //     step = 'C' as any;
    //     alter = 0;
    //     octave += 1;
    //   }
    // }
    console.log('[PianoPlugin] chooseAudioBuffer', step, this.audioBufferMap[step], this.audioBufferMap);
    return this.audioBufferMap[step];
  }

  beforePlay(): void {
    throw new Error('Method not implemented.');
  }
}

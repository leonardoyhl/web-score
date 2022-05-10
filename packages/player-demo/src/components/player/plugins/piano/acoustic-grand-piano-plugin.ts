import { decode } from 'base64-arraybuffer';
import { MusicalInstrumentPlugin, AudioDecoder, Note, Step } from 'player-core';

import sounds from './sounds';

const PITCH_RATE = [0.0625, 0.125, 0.25, 0.5, 1, 2, 4, 8, 16];

function decodeBase64AsArrayBuffer(base64Map: typeof sounds) {
  const arrayBufferMap: Record<string, ArrayBuffer> = {};
  Object.keys(base64Map).forEach(key => {
    const base64 = base64Map[key as keyof typeof base64Map];
    const realContent = base64.split(',')[1];
    arrayBufferMap[key] = decode(realContent);
  });
  return arrayBufferMap;
}

export class AcousticGrandPianoPlugin implements MusicalInstrumentPlugin {

  private audioBufferMap: Record<string, AudioBuffer> = {};

  constructor(
    decoder: AudioDecoder,
  ) {
    // do nothing
    this.decode(decoder);
  }

  async decode(decoder: AudioDecoder): Promise<void> {
    let count = 0;
    const arrayBufferMap = decodeBase64AsArrayBuffer(sounds);
    const promises = Object.keys(arrayBufferMap).map(async key => {
      count++;
      const arrayBuffer = arrayBufferMap[key];
      console.log('decode begin', key, count, arrayBuffer);
      const audioBuffer = await decoder.decode(arrayBuffer);
      console.log('decode finish', key, count, arrayBuffer);
      this.audioBufferMap[key] = audioBuffer;
    });
    await Promise.all(promises);
  }

  chooseAudioBuffer(note: Note): AudioBuffer {
    let { pitch: {
      step, octave, alter,
    } } = note;
    if (alter === 1) {
      if (step === 'E') {
        step = Step.F;
        alter = 0;
      }

      if (step === 'B') {
        step = Step.C;
        alter = 0;
        octave += 1;
      }
    }
    const key = [step, alter === 1 ? 'b' : '', octave].join('');
    console.log('[AcousticGrandPianoPlugin] chooseAudioBuffer', step, octave, alter, key, this.audioBufferMap[key]);
    return this.audioBufferMap[key];
  }

  beforePlay(sourceNode: AudioBufferSourceNode, note: Note): AudioBufferSourceNode {
    return sourceNode;
  }
}

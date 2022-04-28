import { decode } from 'base64-arraybuffer';

import { MusicalInstrumentPlugin } from '../../musical-instrument-plugin';
import { Note } from '../../data-format/note';
import { PIANO_SOUND } from './sound';
import { AudioDecoder } from '../../audio-decoder';
import { Step } from '../..';

const PITCH_RATE = [0.0625, 0.125, 0.25, 0.5, 1, 2, 4, 8, 16];

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
    console.log('[PianoPlugin] chooseAudioBuffer', step, octave, alter, this.audioBufferMap[step]);
    return this.audioBufferMap[step];
  }

  beforePlay(sourceNode: AudioBufferSourceNode, note: Note): AudioBufferSourceNode {
    let { pitch: {
      step, octave, alter,
    } } = note;
    const rate = PITCH_RATE[octave] * (alter ? 1.06 : 1);
    sourceNode.playbackRate.value = rate;
    return sourceNode;
  }
}

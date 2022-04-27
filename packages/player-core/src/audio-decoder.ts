import { Disposable } from './basic/disposable';


function decodeAudioData(audioContext: AudioContext, audioArrayBuffer: ArrayBuffer) {
  return new Promise<AudioBuffer>((resolve, reject) => {
    audioContext.decodeAudioData(audioArrayBuffer, (decodedData) => {
      resolve(decodedData);
    }, (error) => {
      reject(error);
    });
  });
}

export class AudioDecoder implements Disposable {
  constructor(
    private context: AudioContext,
  ) {
    // do nothing
  }

  decode(audioArrayBuffer: ArrayBuffer): Promise<AudioBuffer> {
    return decodeAudioData(this.context, audioArrayBuffer);
  }

  dispose(): void {
    this.context = undefined!;
  }
}

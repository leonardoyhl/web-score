import { Pitch } from './pitch';

/**
 * 音符标识
 */
export interface Note {
  /**
   * 音高
   */
  pitch: Pitch;
  /**
   * 音符类型，如全音符/半音符/四分音符/八分音符/十六分音符/三十二分音符
   */
  type: NoteType;
  /**
   * 音长标识
   * - 表示当前音演奏时长
   * - 与`<attribute>`中的`<divisions>`相互配合，来表示当前音符总共演奏多长时间，可理解为占比
   */
  duration: number;
}

export enum NoteType {
  /** 全音符 */
  Whole = 'whole',
  /** 半音符 */
  Half = 'half',
  /** 四分音符 */
  Quarter = 'quarter',
  /** 八分音符 */
  Eighth = '8th',
  /** 十六分音符 */
  Sixteenth = '16th',
  /** 三十二分音符 */
  ThirtySecond = '32nd',
}

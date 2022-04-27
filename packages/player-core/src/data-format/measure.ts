import { Note } from './note';

export interface Measure {
  number: number;
  attributes: MeasureAttributes;
  notes: Note[];
}

export type MeasureKeyMode = 'major' | 'minor';

export interface MeasureAttributes {
  /**
   * 小节中一个四分音符的标准时间长度
   */
  divisions: number;
  /**
   * 调号
   */
  key: {
    /**
     * - `2` - D调
     */
    fifths: number;
    mode?: MeasureKeyMode;
  };
  /**
   * 节拍
   */
  time: {
    beats: number;
    beatType: number;
  };
  /**
   * 谱号，如高音谱号
   */
  clef: {
    /**
     * `G`
     */
    sign: string;
    line: number;
  };
}

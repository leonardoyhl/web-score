import { Alter } from './alter';
import { Octave } from './octave';
import { Step } from './step';

/**
 * 音高标识，音阶+八度+升降调
 */
export interface Pitch {
  step: Step;
  octave: Octave;
  alter: Alter;
}

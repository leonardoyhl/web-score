import { useRef } from 'react';
import { Note, NoteType, PianoPlugin, ScorePart, ScorePlayer, ScoreShotPlayer, Step } from 'player-core';
import { Octave } from 'player-core/dist/data-format/octave';
import AudioVisualizer from './AudioVisualizer';

const scoreParts: ScorePart[] = [
  {
    id: 'P1',
    measures: [
      {
        number: 1,
        attributes: {} as any,
        notes: [
          {
            type: NoteType.Quarter,
            duration: 0,
            pitch: {
              step: Step.C,
              octave: 3,
              alter: 0,
            },
          },
          {
            type: NoteType.Quarter,
            duration: 0,
            pitch: {
              step: Step.D,
              octave: 3,
              alter: 0,
            },
          },
          {
            type: NoteType.Quarter,
            duration: 0,
            pitch: {
              step: Step.E,
              octave: 3,
              alter: 0,
            },
          },
          {
            type: NoteType.Quarter,
            duration: 0,
            pitch: {
              step: Step.F,
              octave: 3,
              alter: 0,
            },
          },
          {
            type: NoteType.Quarter,
            duration: 0,
            pitch: {
              step: Step.G,
              octave: 3,
              alter: 0,
            },
          },
          {
            type: NoteType.Quarter,
            duration: 0,
            pitch: {
              step: Step.A,
              octave: 3,
              alter: 0,
            },
          },
          {
            type: NoteType.Quarter,
            duration: 0,
            pitch: {
              step: Step.B,
              octave: 3,
              alter: 0,
            },
          },
          {
            type: NoteType.Quarter,
            duration: 0,
            pitch: {
              step: Step.C,
              octave: 5,
              alter: 0,
            },
          },
          {
            type: NoteType.Quarter,
            duration: 0,
            pitch: {
              step: Step.D,
              octave: 5,
              alter: 0,
            },
          },
          {
            type: NoteType.Quarter,
            duration: 0,
            pitch: {
              step: Step.E,
              octave: 5,
              alter: 0,
            },
          },
          {
            type: NoteType.Quarter,
            duration: 0,
            pitch: {
              step: Step.F,
              octave: 5,
              alter: 0,
            },
          },
          {
            type: NoteType.Quarter,
            duration: 0,
            pitch: {
              step: Step.G,
              octave: 5,
              alter: 0,
            },
          },
          {
            type: NoteType.Quarter,
            duration: 0,
            pitch: {
              step: Step.A,
              octave: 5,
              alter: 0,
            },
          },
          {
            type: NoteType.Quarter,
            duration: 0,
            pitch: {
              step: Step.B,
              octave: 5,
              alter: 0,
            },
          },
        ],
      },
    ],
  },
];

function reverseRepeatNotes(notes: Note[]) {
  const len = notes.length;
  for (let i = len - 1; i >= 0; i--) {
    const note = notes[i];
    notes.push({...note});
  }
}

function buildNotes() {
  const notes: Note[] = [];
  const steps = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
  for (let octave = 0; octave < 9; octave++) {
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      notes.push({
        type: NoteType.Quarter,
        duration: 0,
        pitch: {
          step: step as Step,
          octave: octave as Octave,
          alter: 0,
        },
      });
    }
  }
  return notes;
}

scoreParts[0].measures[0].notes = buildNotes();
reverseRepeatNotes(scoreParts[0].measures[0].notes);

export default function TestPlayer() {
  // const playerRef = useRef(new ScorePlayer(scoreParts, [[PianoPlugin]]));
  const playerRef = useRef(new ScoreShotPlayer());
  playerRef.current.addPlugins([new PianoPlugin(playerRef.current.audioDecoder)]);
  const scorePlayer = playerRef.current;

  let count = 0;
  const handleClick = () => {
    const notes = scoreParts[0].measures[0].notes;
    scorePlayer.play();
    const index = count % notes.length;
    scorePlayer.playShot(notes[index]);
    count++;
  }

  return (
    <div onClick={handleClick}>
      <p>ScoreShotPlayer</p>
      <p>Press 'Space' key to siwtch pitch.</p>
      <button style={{padding: '20px 30px'}}>Play</button>
      <AudioVisualizer analyserNode={playerRef.current.audioAnalyser} />
      <AudioVisualizer analyserNode={playerRef.current.audioAnalyser} />
    </div>
  );
}

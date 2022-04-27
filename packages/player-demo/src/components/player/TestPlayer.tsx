import { useRef } from 'react';
import { NoteType, PianoPlugin, ScorePart, ScorePlayer, Step } from 'player-core';

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
        ],
      },
    ],
  },
];

export default function TestPlayer() {
  const playerRef = useRef(new ScorePlayer(scoreParts, [[PianoPlugin]]));
  const scorePlayer = playerRef.current;

  const handleClick = () => {
    scorePlayer.play();
  }

  return (
    <div onClick={handleClick}>
      <button>Play</button>
    </div>
  );
}

import { useEffect, useRef } from 'react';
import { ScorePartPlayer } from 'player-core';
import AudioVisualizer from './AudioVisualizer';
import { extractNotes, xmlToJson } from './utils';
import cannon from './music-xml/cannon';
import { AcousticGrandPianoPlugin } from './plugins/piano/acoustic-grand-piano-plugin';

export default function TestScorePartPlayer() {
  const playerRef = useRef(new ScorePartPlayer());
  const scorePlayer = playerRef.current;

  useEffect(() => {
    scorePlayer.addPlugins([new AcousticGrandPianoPlugin(scorePlayer.audioDecoder)]);
    const xmlJson = xmlToJson(cannon);
    const scorePart = extractNotes(xmlJson);
    scorePlayer.setScorePart(scorePart);
  });

  const handleClick = () => {
    scorePlayer.play();
  };

  return (
    <div onClick={handleClick}>
      <p>ScorePartPlayer with AcousticGrandPianoPlugin</p>
      {/* <p>Press 'Space' key to switch pitch.</p> */}
      <button style={{padding: '20px 30px'}}>Play</button>
      <AudioVisualizer analyserNode={playerRef.current.audioAnalyser} />
    </div>
  );
}

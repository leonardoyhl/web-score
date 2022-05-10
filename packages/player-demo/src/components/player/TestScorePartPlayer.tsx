import { useEffect, useRef } from 'react';
import { PianoPlugin, ScorePartPlayer } from 'player-core';
import AudioVisualizer from './AudioVisualizer';
import { extractNotes, xmlToJson } from './utils';
import cannon from './music-xml/cannon';

export default function TestScorePartPlayer() {
  const playerRef = useRef(new ScorePartPlayer());
  const scorePlayer = playerRef.current;

  useEffect(() => {
    scorePlayer.addPlugins([new PianoPlugin(scorePlayer.audioDecoder)]);
    const xmlJson = xmlToJson(cannon);
    const scorePart = extractNotes(xmlJson);
    scorePlayer.setScorePart(scorePart);
  });

  const handleClick = () => {
    scorePlayer.play();
  };

  return (
    <div onClick={handleClick}>
      <p>ScorePartPlayer with normal PianoPlugin</p>
      {/* <p>Press 'Space' key to switch pitch.</p> */}
      <button style={{padding: '20px 30px'}}>Play</button>
      <AudioVisualizer analyserNode={playerRef.current.audioAnalyser} />
    </div>
  );
}

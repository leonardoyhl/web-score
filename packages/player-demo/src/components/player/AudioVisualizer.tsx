import { useEffect, useRef } from 'react';
import { StairBarPanel } from 'audio-visual';

export interface AudioVisualizerProps {
  analyserNode: AnalyserNode;
}

export default function AudioVisualizer(props: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!canvasRef.current) {
      return;
    }
    const stairBarPanel = new StairBarPanel(canvasRef.current);
    stairBarPanel.connect(props.analyserNode);

    return () => {
      stairBarPanel.disconnect();
    };
  }, []);

  return <canvas ref={canvasRef} width={window.innerWidth} height={window.innerHeight / 3}></canvas>
}

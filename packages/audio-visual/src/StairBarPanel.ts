/**
 * 阶梯形条形柱状图
 */
export class StairBarPanel {
  readonly context: CanvasRenderingContext2D;

  private analyserNode!: AnalyserNode;

  readonly buffer!: Uint8Array;

  readonly width: number;
  readonly height: number;

  private rafId: number | undefined;

  constructor(
    canvas: HTMLCanvasElement,
  ) {
    this.width = canvas.width;
    this.height = canvas.height;
    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("[StairBarPanel] CanvasRenderingContext2D unsupported");
    }
    this.context = context;
    this.draw = this.draw.bind(this);
  }

  connect(analyserNode: AnalyserNode) {
    this.analyserNode = analyserNode;
    // @ts-ignore
    this.buffer = new Uint8Array(analyserNode.frequencyBinCount);
    this.draw();
  }

  disconnect() {
    const { rafId } = this;
    typeof rafId !== "undefined" && cancelAnimationFrame(rafId);
    this.analyserNode = undefined!;
    // @ts-ignore
    this.buffer = undefined!;
  }

  private draw() {
    this.rafId = requestAnimationFrame(this.draw);
    const { context, analyserNode, buffer, width, height } = this;
    context.clearRect(0, 0, width, height);
    analyserNode.getByteFrequencyData(buffer);

    context.fillStyle = this.drawLine(0, height, width, -5);
    context.fillRect(0, height, width, -5);
    const barWidth = (width / (buffer.length / 8));
    let barHeight: number;
    let x = 0;
    for (let i = 0; i < buffer.length; i += 4) {
      barHeight = buffer[i];
      context.fillRect(x, barHeight, barWidth - 1, -barHeight - 5);
      x += barWidth;
    }
  }

  private drawLine(x: number, y: number, dx: number, dy: number) {
    const { context } = this;
    const line = context.createLinearGradient(x, 0, dx, 0);
    line.addColorStop(0, "#1b07ff");
    line.addColorStop(1, "#ff0000");
    return line;
  }
}

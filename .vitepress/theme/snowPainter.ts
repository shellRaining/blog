class snowFlake {
  x: number;
  y: number;
  r: number;
  d: number;

  constructor(x: number, y: number, r: number, d: number) {
    this.x = x;
    this.y = y;
    this.r = r;
    this.d = d;
  }
}

class SnowPainter {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  snowFlakes: snowFlake[] = [];
  snowFlakeCount = 400;
  snowFlakeSize = 2;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = this.canvas.getContext("2d")!;
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.createSnowFlakes();
    this.drawSnowFlakes();
  }

  createSnowFlakes() {
    for (let i = 0; i < this.snowFlakeCount; i++) {
      this.snowFlakes.push(
        new snowFlake(
          Math.random() * this.width,
          Math.random() * this.height,
          Math.random() * this.snowFlakeSize + 1,
          Math.random() * 2 + 0.5
        )
      );
    }
  }

  drawSnowFlakes() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
    this.ctx.beginPath();
    this.snowFlakes.forEach((snowFlake) => {
      this.ctx.moveTo(snowFlake.x, snowFlake.y);
      this.ctx.arc(snowFlake.x, snowFlake.y, snowFlake.r, 0, Math.PI * 2, true);
    });
    this.ctx.fill();
    this.moveSnowFlakes();
    window.requestAnimationFrame(() => this.drawSnowFlakes());
  }

  moveSnowFlakes() {
    // this.snowFlakes.forEach((snowFlake) => {
    //   snowFlake.y += snowFlake.d;
    //   if (snowFlake.y > this.height) {
    //     snowFlake.y = 0;
    //   }
    // });

  }

}

export default SnowPainter;

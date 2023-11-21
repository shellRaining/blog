<script lang="ts" setup>
import { ref, onMounted } from "vue";

import SnowPainter from "./snowPainter";

function makeSnow(el: HTMLCanvasElement) {
  const ctx = el.getContext("2d");
  let width = 0;
  let height = 0;
  let particles = [];

  class Particle {
    x: number;
    y: number;
    dx: number;
    dy: number;

    constructor() {
      this.x = this.y = this.dx = this.dy = 0;
      this.reset();
    }

    reset() {
      this.y = Math.random() * height;
      this.x = Math.random() * width;
      this.dx = Math.random() * 1 - 0.5;
      this.dy = Math.random() * 0.5 + 0.5;
    }
  }

  function createParticles(count: number) {
    if (count != particles.length) {
      particles = [];
      for (let i = 0; i < count; i++) {
        particles.push(new Particle());
      }
    }
  }

  function onResize() {
    width = window.innerWidth;
    height = window.innerHeight;
    el.width = width;
    el.height = height;

    createParticles((width * height) / 10000);
  }

  function updateParticles() {
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "#f6f9fa";

    particles.forEach(function (particle) {
      particle.y += particle.dy;
      particle.x += particle.dx;

      if (particle.y > height) {
        particle.y = 0;
      }

      if (particle.x > width) {
        particle.reset();
        particle.y = 0;
      }

      ctx.beginPath();
      ctx.arc(particle.x, particle.y, 4, 0, Math.PI * 2, false);
      ctx.fill();
    });

    window.requestAnimationFrame(updateParticles);
  }

  onResize();
  updateParticles();
}

const canvas = ref(null);

onMounted(() => {
  // makeSnow(canvas.value);
  const snowPainter = new SnowPainter(canvas.value);
  snowPainter.drawSnowFlakes();
});
</script>

<template>
  <canvas ref="canvas"></canvas>
</template>

<style scoped></style>

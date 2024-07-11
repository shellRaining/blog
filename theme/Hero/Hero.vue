<script lang="ts" setup>
import { ref } from "vue";
import Avator from "./Avator.vue";

const heroName = ref("始不垂翅，终能奋翼");
</script>

<template>
  <Avator class="hero_img" />
  <div class="hero">
    <h1 class="hero__title">{{ heroName }}</h1>
    <p class="hero__description">shellRaining blog</p>
  </div>
</template>

<style scoped>
.hero_img {
  margin: 50px;
}
.hero {
  padding: 0 1rem;
  margin: 0 auto;
  max-width: 1200px;
  text-align: center;

  .hero__title {
    margin: 0;
    font-size: 2.5rem;
    line-height: 1.5;
  }
  .hero__description {
    font-size: 1.5rem;
    color: #666;
    line-height: 1;
  }

  @media (max-width: 768px) {
    .hero__title {
      font-size: 2rem;
    }
    .hero__description {
      font-size: 1rem;
    }
  }
  @media (max-width: 480px) {
    .hero__title {
      font-size: 1.5rem;
    }
    .hero__description {
      font-size: 0.9rem;
    }
  }
  @media (max-width: 320px) {
    .hero__title {
      font-size: 1rem;
    }
    .hero__description {
      font-size: 0.8rem;
    }
  }
}
</style>

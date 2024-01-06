<script lang="ts" setup>
import { useData } from "vitepress";
import { ref } from "vue";

const { frontmatter } = useData();
const heroName = ref(frontmatter.value.hero.name ?? "始不垂翅，终能奋翼");
</script>

<template>
  <div class="hero">
    <h1 class="hero__title">{{ heroName }}</h1>
    <p class="hero__description">shellRaining blog</p>
  </div>
</template>

<style scoped>
.hero {
  padding: 0 1rem;
  margin: 0 auto;
  max-width: 1200px;
  text-align: center;

  .hero__title {
    margin: 0;
    font-size: 3rem;
  }
  .hero__description {
    margin: 20px 0;
    font-size: 1.5rem;
    color: #666;
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

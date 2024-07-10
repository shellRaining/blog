<script lang="ts" setup>
import { onMounted, ref } from "vue";
import Avator from "./Avator.vue";

const heroName = ref("始不垂翅，终能奋翼");
const container = ref<HTMLElement | null>(null);
onMounted(() => {
  import("@antv/g2plot").then(({ WordCloud }) => {
    fetch("https://gw.alipayobjects.com/os/antfincdn/jPKbal7r9r/mock.json")
      .then((res) => res.json())
      .then((data) => {
        if (!container.value) {
          return;
        }
        const wordCloud = new WordCloud(container.value, {
          data,
          wordField: "x",
          weightField: "value",
          color: "#122c6a",
          wordStyle: {
            fontFamily: "Verdana",
            fontSize: [24, 80],
          },
          interactions: [{ type: "element-active" }],
          state: {
            active: {
              style: {
                lineWidth: 3,
              },
            },
          },
        });

        wordCloud.render();
      });
  });
});
</script>

<template>
  <Avator class="hero_img" />
  <div class="hero">
    <div ref="container"></div>
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

<script lang="ts" setup>
import { onMounted } from "vue";

onMounted(() => {
  let curInputIdx = 0;
  const inputLists = Array.from(
    document.querySelectorAll('input[type="radio"]'),
  ) as Array<HTMLInputElement>;

  window.addEventListener("click", () => {
    inputLists[curInputIdx].checked = false;
    curInputIdx = (curInputIdx + 1) % inputLists.length;
    inputLists[curInputIdx].checked = true;
  });
});
</script>

<template>
  <div class="box-main">
    <input type="radio" name="stages" id="init" checked />
    <input type="radio" name="stages" id="stage0" />
    <input type="radio" name="stages" id="stage1" />
    <input type="radio" name="stages" id="stage2" />
    <input type="radio" name="stages" id="stage3" />
    <input type="radio" name="stages" id="stage4" />
    <input type="radio" name="stages" id="stage5" />
    <input type="radio" name="stages" id="stage6" />

    <div class="cube">
      <i></i>
      <i></i>
      <i></i>
      <i></i>
      <i></i>
      <i></i>
    </div>
  </div>
</template>

<style scoped>
.box-main {
  perspective: 800px;
  *:not(:empty) {
    transform-style: preserve-3d;
  }
}

input[type="radio"] {
  display: none;

  &#init:checked {
    ~ .cube {
      transform: rotateX(-30deg) rotateY(-120deg);

      i {
        animation: none;
      }
    }
  }
  &#stage0:checked {
    ~ .cube {
      transform: rotateX(-45deg) rotateY(-45deg);

      i:nth-child(1) {
        animation-play-state: running, paused;
      }
    }
  }
  &#stage1:checked {
    ~ .cube {
      transform: rotateX(30deg) rotateY(-180deg);

      i:nth-child(-n + 2) {
        animation-play-state: running, paused;
      }
    }
  }
  &#stage2:checked {
    ~ .cube {
      transform: rotateX(30deg) rotateY(-75deg);

      i:nth-child(-n + 3) {
        animation-play-state: running, paused;
      }
    }
  }
  &#stage3:checked {
    ~ .cube {
      transform: rotateX(75deg) rotateY(-75deg);

      i:nth-child(-n + 4) {
        animation-play-state: running, paused;
      }
    }
  }
  &#stage4:checked {
    ~ .cube {
      transform: rotateX(0deg) rotateY(0deg);

      i:nth-child(-n + 5) {
        animation-play-state: running, paused;
      }
    }
  }
  &#stage5:checked {
    ~ .cube {
      transform: rotateX(-10deg) rotateY(75deg);

      i:nth-child(-n + 6) {
        animation-play-state: running, paused;
      }
    }
  }
  &#stage6:checked {
    ~ .cube {
      transform: rotateX(-45deg) rotateY(-45deg);

      i {
        animation-play-state: running;
      }
    }
  }
}

.cube {
  position: absolute;
  translate: 0 50px;
  transition: all 1s;

  --height: 5vmin;

  i {
    position: absolute;
    inset: calc(-1 * var(--height));
    background-color: #fffa;
    border: 2px solid #000;
    animation: lineEnter 2s paused both;

    .dark & {
      background-color: #000a;
      border: 2px solid #fff;
    }

    &:nth-child(1) {
      transform: rotateX(90deg) translateZ(var(--height));
      --lineAngle: 135deg;
      --startPosition: -200px 200px;
    }
    &:nth-child(2) {
      transform: rotateY(180deg) translateZ(var(--height));
      --lineAngle: 135deg;
      --startPosition: 200px -200px;
    }
    &:nth-child(3) {
      transform: rotateY(90deg) translateZ(var(--height));
      --lineAngle: -45deg;
      --startPosition: 200px -200px;
    }
    &:nth-child(4) {
      transform: rotateX(270deg) translateZ(var(--height));
      --lineAngle: -135deg;
      --startPosition: 200px 200px;
    }
    &:nth-child(5) {
      transform: translateZ(var(--height));
      --lineAngle: 45deg;
      --startPosition: 200px 200px;
    }
    &:nth-child(6) {
      transform: rotateY(270deg) translateZ(var(--height));
      --lineAngle: -135deg;
      --startPosition: 200px 200px;
    }
  }
}

@keyframes lineEnter {
  from {
    background-position: var(--startPosition);
  }
  to {
    background-position: 0;
  }
}
</style>

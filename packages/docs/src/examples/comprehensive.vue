<template>
  <div class="demo">
    <div class="top font16">
      <div class="mr10"> Ctrl+鼠标滚轮缩放画布 </div>
      <div class="mr10"> 空白键+鼠标左键键移动画布 </div>
      <div class="scale mr10"> 缩放比:{{ cpuScale }} </div>
      <div class="scale mr10"> 参考线:{{ JSON.stringify(post.lines) }} </div>
    </div>
    <div class="top font16">
      <button class="mr10 font16" @click="post.showRuler = !post.showRuler">{{
        (post.showRuler ? '隐藏' : '显示') + '规尺'
      }}</button>
      <button class="mr10 font16" @click="post.isShowReferLine = !post.isShowReferLine">{{
        (post.isShowReferLine ? '隐藏' : '显示') + '参考线'
      }}</button>
      <button class="mr10 font16" @click="lockLine = true">锁定参考线</button>
      <button class="mr10 font16" @click="changeShadow">模拟阴影切换</button>
      <button class="mr10 font16" @click.stop="resetMethod">还原</button>
      <button class="mr10 font16" @click.stop="zoomOutMethod">缩小</button>
      <span>禁止缩放</span>
      <input type="checkbox" class="switch" @change="changeScale" />
      <span>禁止移动</span>
      <input type="checkbox" class="switch mr10" @change="changeMove" />
      <span>框内移动</span>
      <input type="checkbox" class="switch mr10" @change="changeInsideMove" />
      <input
        class="mr10 font16"
        :value="state.scale"
        type="range"
        min="0.3"
        max="3"
        step="0.1"
        defaultValue="1"
        @input="scaleChange"
      />
      <div class="mr10"> 吸附横线: </div>
      <input class="mr10" style="width: 90px" :value="post.snapsObj.h" @blur="snapsChange" />
      <div class="mr10"> 吸附纵线: </div>
      <input class="mr10" style="width: 90px" :value="post.snapsObj.v" @blur="snapsChangeV" />

      <a
        href="https://github.com/kakajun/vue3-sketch-ruler"
        target="_blank"
        rel="noopener noreferrer"
      >
        <i class="fas fa-external-link-alt"></i> git源码
      </a>
    </div>

    <div
      class="wrapper"
      :class="[!store.isLight ? 'blackwrapper' : 'whitewrapper']"
      :style="rectStyle"
    >
      <SketchRule
        ref="sketchruleRef"
        :key="rendIndex"
        v-model:scale="state.scale"
        v-model:lock-line="lockLine"
        v-bind="post"
        :palette="cpuPalette"
        @on-corner-click="handleCornerClick"
        @zoomchange="zoomchange"
      >
        <template #default>
          <div data-type="page" :style="canvasStyle" @mousedown="handleMouseDown">
            <img class="img-style" :src="bgImg" alt="" />
          </div>
        </template>
        <template #btn="{ reset, zoomIn, zoomOut }">
          <div class="btns">
            <button @click.stop="reset">还原</button>
            <button @click.stop="zoomIn">放大</button>
            <button @click.stop="zoomOut">缩小</button>
          </div>
        </template>
      </SketchRule>
    </div>
  </div>
</template>
<script setup lang="ts">
import SketchRule from 'vue3-sketch-ruler'
import type { PaletteType } from 'vue3-sketch-ruler'
import 'vue3-sketch-ruler/lib/style.css'
import bgImg from '../assets/bg.png'
import { computed, ref, reactive, onMounted, watch } from 'vue'
import type { PanzoomEventDetail, PanzoomEvent } from 'simple-panzoom'
import { useAppStore } from '@/store/app'
const store = useAppStore()
const rendIndex = ref(0)
const sketchruleRef = ref()

// 更多配置,参见 https://github.com/timmywil/panzoom
const panzoomOption = reactive({
  canvas: true,
  maxScale: 3,
  minScale: 0.3,
  // startX: 0,   // 画布距离左边框距离, 如果想自动,那么不要传
  // startY: 0,   // 画布距离顶边框距离, 如果想自动,那么不要传
  disablePan: false,
  disableZoom: false,
  contain: 'none', // 'inside' | 'outside' | 'none'
  handleStartEvent: (event: PanzoomEvent['panzoomstart']) => {
    event.preventDefault()
    console.log('handleStartEvent', event)
  }
})
const lockLine = ref(false)

// 另外一个方法调用内部方法
const zoomOutMethod = () => {
  if (sketchruleRef.value) {
    sketchruleRef.value.zoomOut()
  }
}

const resetMethod = () => {
  if (sketchruleRef.value) {
    sketchruleRef.value.reset()
  }
}

const state = reactive({
  scale: 1
})

const cpuPalette = computed<PaletteType>(() => {
  return !store.isLight
    ? {
        bgColor: 'transparent',
        hoverBg: '#fff',
        bb: '#fff',
        hoverColor: '#000',
        longfgColor: '#BABBBC', // ruler longer mark color
        fontColor: '#DEDEDE', // ruler font color
        shadowColor: '#525252', // ruler shadow color
        lineColor: '#51d6a9',
        borderColor: '#B5B5B5'
      }
    : {
        bgColor: 'transparent',
        lineColor: '#51d6a9',
        lineType: 'dashed'
      }
})

const post = reactive({
  thick: 20,
  width: 1470,
  height: 750,
  showShadowText: false,
  // gridRatio: '0.5',
  // width: 770,
  // height: 472,
  canvasWidth: 1920,
  canvasHeight: 1080,
  // canvasWidth: 1000,
  // canvasHeight: 500,
  showRuler: true,
  snapsObj: { h: [0, 100, 200], v: [130] },
  shadow: {
    x: 0,
    y: 0,
    width: 300,
    height: 300
  },
  panzoomOption: panzoomOption,
  isShowReferLine: true,
  lines: {
    h: [0, 250],
    v: [0, 500]
  }
})

const rectStyle = computed(() => {
  return {
    width: `${post.width}px`,
    height: `${post.height}px`
  }
})

const cpuScale = computed(() => {
  const num = Number(state.scale)
  return num.toFixed(1)
})

const canvasStyle = computed(() => {
  return {
    width: `${post.canvasWidth}px`,
    height: `${post.canvasHeight}px`
  }
})

const scaleChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  if (target) {
    state.scale = Number(target.value)
    // 注意插件内部并没有监听scale的变化,所以需要手动调用zoom来改变scale
    if (sketchruleRef.value) {
      const panzoomInstance = sketchruleRef.value.panzoomInstance
      panzoomInstance.zoom(state.scale)
    }
  }
}

const handleCornerClick = (e: MouseEvent) => {
  console.log('handleCornerClick', e)
}

const zoomchange = (detail: PanzoomEventDetail) => {
  // console.log('zoomchange', detail)
}

const snapsChange = (e: { target: { value: string } }) => {
  const arr = e.target.value.split(',')
  post.snapsObj.h = arr.map((item) => Number(item))
}
const snapsChangeV = (e: { target: { value: string } }) => {
  const arr = e.target.value.split(',')
  post.snapsObj.v = arr.map((item) => Number(item))
}

const changeScale = (e: Event) => {
  const target = e.target as HTMLInputElement
  if (target) {
    panzoomOption.disableZoom = target.checked
  }
}
const changeMove = (e: Event) => {
  const target = e.target as HTMLInputElement
  if (target) {
    panzoomOption.disablePan = target.checked
  }
}

const changeInsideMove = (e: Event) => {
  const target = e.target as HTMLInputElement
  if (target) {
    panzoomOption.contain = target.checked ? 'inside' : 'none'
  }
}

const changeShadow = () => {
  post.shadow.x = Math.random() * post.canvasWidth
  post.shadow.y = Math.random() * post.canvasHeight
}

const handleMouseDown = (e: MouseEvent) => {
  console.log('handleMouseDown', e)
}
</script>

<style lang="scss">
.demo {
  width: 100%;
  // padding-top: 10px;
  display: flex;
  flex-direction: column;
  justify-content: center; /* 水平居中 */
}
.top {
  display: flex;
  margin-bottom: 10px;
  justify-content: center;
  width: 100%;
}

.font16 {
  font-size: 16px;
}
.mr10 {
  margin-right: 10px;
}

.wrapper {
  margin: 0 auto;
  background-size:
    21px 21px,
    21px 21px;
  border: 1px solid #dadadc;
}
.whitewrapper {
  background-color: #fafafc;
  background-image: linear-gradient(#fafafc 20px, transparent 0),
    linear-gradient(90deg, transparent 20px, #373739 0);
}
.blackwrapper {
  background-color: #18181c;
  background-image: linear-gradient(#18181c 20px, transparent 0),
    linear-gradient(90deg, transparent 20px, #86909c 0);
}

.button {
  bottom: 100%;
}

.img-style {
  width: 100%;
  height: 100%;
}
.btns {
  position: absolute;
  display: flex;
  bottom: 20px;
  right: 40px;
  z-index: 999;
}

/* Switch开关样式 */
/* 必须是input为 checkbox class 添加 switch 才能实现以下效果 */
input[type='checkbox'].switch {
  outline: none;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  position: relative;
  width: 40px;
  height: 20px;
  background: #ccc;
  border-radius: 10px;
  transition:
    border-color 0.3s,
    background-color 0.3s;
}

input[type='checkbox'].switch::after {
  content: '';
  display: inline-block;
  width: 1rem;
  height: 1rem;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0, 0, 2px, #999;
  transition: 0.4s;
  top: 2px;
  position: absolute;
  left: 2px;
}

input[type='checkbox'].switch:checked {
  background: rgb(19, 206, 102);
}
/* 当input[type=checkbox]被选中时：伪元素显示下面样式 位置发生变化 */
input[type='checkbox'].switch:checked::after {
  content: '';
  position: absolute;
  left: 55%;
  top: 2px;
}
</style>

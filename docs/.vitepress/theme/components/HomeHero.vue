<template>
  <div class="figmint-hero">
    <!-- ===== HERO SECTION ===== -->
    <div class="hero-content">
      <div class="text-section">
        <p class="eyebrow">DATAWHALE 开源教程</p>
        <h1 class="headline">Hello,<br/>Generic Agent.</h1>
        <p class="subtext">
          从零开始，系统学习通用 AI Agent 的构建方法。<br/>
          理论筑基 × 实战驱动 × 开源共建
        </p>
        <div class="hero-buttons">
          <a class="btn-primary" :href="'/hello-generic-agent/part1/chapter1/'" >开始学习</a>
          <a class="btn-secondary" href="https://github.com/datawhalechina/hello-generic-agent" target="_blank">GitHub ↗</a>
        </div>
      </div>

      <div class="computer-section">
        <div class="scene" id="scene">
        <div class="computer-unit">

        <div class="face front">
        <div class="screen-inset">
        <div class="crt">
        <div class="crt-glow">
        <div class="mascot-screen">
        <img :src="withBase('/logo.png')" alt="mascot" class="mascot-img" />
        </div>
        </div>
        </div>
        </div>

        <div class="logo-badge"></div>
        <div class="floppy-slot"></div>


        <div class="sticker sticker-ball"></div>
        <div class="sticker sticker-star"></div>
        <div class="sticker sticker-text">MACHINE<br>INTELLIGENCE</div>

        <div class="grill">
        <div class="vent"></div><div class="vent"></div><div class="vent"></div><div class="vent"></div>
        <div class="vent"></div><div class="vent"></div><div class="vent"></div><div class="vent"></div>
        </div>
        </div>
        <div class="face back"></div>
        <div class="face left"></div>
        <div class="face right"></div>
        <div class="face top"></div>
        <div class="face bottom"></div>


        <div class="keyboard-assembly">
        <div class="kb-base">
        <div class="keys-grid">

        <div class="key"></div><div class="key"></div><div class="key"></div><div class="key"></div>
        <div class="key"></div><div class="key"></div><div class="key"></div><div class="key"></div>
        <div class="key"></div><div class="key"></div><div class="key"></div><div class="key"></div>

        <div class="key wide"></div><div class="key"></div><div class="key"></div><div class="key"></div>
        <div class="key"></div><div class="key"></div><div class="key"></div><div class="key"></div>
        <div class="key"></div><div class="key wide"></div>

        <div class="key"></div><div class="key"></div><div class="key space"></div><div class="key"></div><div class="key"></div><div class="key"></div>
        </div>
        </div>
        <div class="kb-front"></div>
        <div class="kb-back"></div>
        <div class="kb-left"></div>
        <div class="kb-right"></div>
        <div class="kb-shadow"></div>
        </div>
        </div>
        </div>
      </div>
    </div>

    <!-- ===== CHAPTER CAROUSEL ===== -->
    <div class="carousel-section">
      <div class="carousel-track" ref="carouselTrack">
        <a
          v-for="(ch, idx) in doubledChapters"
          :key="idx"
          :href="'/hello-generic-agent' + ch.link"
          class="carousel-card"
        >
          <span class="carousel-tag" :class="ch.tag === '应用篇' ? 'tag-app' : 'tag-theory'">{{ ch.tag }}</span>
          <h4 class="carousel-title">{{ ch.name }}</h4>
          <p class="carousel-desc">{{ ch.desc }}</p>
        </a>
      </div>
    </div>

    <!-- ===== WHAT YOU WILL LEARN ===== -->
    <div class="learn-section">
      <h2 class="section-title">这套教程能带你做什么</h2>
      <div class="learn-grid">
        <div class="learn-card" v-for="(item, idx) in learnItems" :key="idx">
          <span class="learn-icon">{{ item.icon }}</span>
          <h3>{{ item.title }}</h3>
          <p>{{ item.desc }}</p>
        </div>
      </div>
    </div>

    <!-- ===== JUMP SECTION ===== -->
    <div class="jump-section">
      <h2 class="section-title">快速跳转</h2>
      <div class="jump-cta-row">
        <a class="jump-card" :href="item.external ? item.link : '/hello-generic-agent' + item.link" :target="item.external ? '_blank' : '_self'" v-for="(item, idx) in jumpLinks" :key="idx">
          <span class="jump-icon">{{ item.icon }}</span>
          <div>
            <h4>{{ item.title }}</h4>
            <p>{{ item.desc }}</p>
          </div>
        </a>
      </div>
    </div>

    <!-- ===== TEAM ===== -->
    <div class="team-section">
      <h2 class="section-title">贡献者</h2>
      <p class="team-desc">本教程由 Datawhale 开源社区成员共同编写维护</p>
      <div class="team-grid">
        <a class="team-avatar" v-for="(m, i) in teamMembers" :key="i" :href="'https://github.com/' + m.github" target="_blank" :title="m.name">
          <img :src="'https://github.com/' + m.github + '.png'" :alt="m.name" />
          <span>{{ m.name }}</span>
        </a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { withBase } from 'vitepress'

/* ===== Typewriter ===== */
const typeText = `class GenericAgent:
    def __init__(self):
        self.memory = Memory()
        self.tools = ToolKit()
        self.planner = Planner()

    def run(self, task: str):
        plan = self.planner.plan(task)
        for step in plan:
            result = self.tools.execute(step)
            self.memory.store(result)
        return self.memory.summarize()`

onMounted(() => {
  const target = document.getElementById('typewriter')
  if (!target) return
  let i = 0
  const speed = 60
  function type() {
    if (i < typeText.length) {
      target.textContent += typeText.charAt(i)
      i++
      setTimeout(type, speed + Math.random() * 40)
    } else {
      setTimeout(() => { target.textContent = ''; i = 0; type() }, 3000)
    }
  }
  type()

  /* Mouse parallax */
  const scene = document.getElementById('scene')
  if (scene) {
    const handler = (e) => {
      const rect = scene.parentElement.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width - 0.5
      const y = (e.clientY - rect.top) / rect.height - 0.5
      scene.style.transform = `rotateY(${-15 + x * 15}deg) rotateX(${5 - y * 10}deg)`
    }
    const parent = scene.parentElement
    parent.addEventListener('mousemove', handler)
    parent.addEventListener('mouseleave', () => {
      scene.style.transform = 'rotateY(-15deg) rotateX(5deg)'
    })
  }
})

/* ===== Carousel ===== */
const chapters = [
  { name: '第1章：安装与环境配置', tag: '应用篇', desc: '10 分钟搭好环境，和你的第一个 GA 说句话', link: '/part1/chapter1/' },
  { name: '第2章：浏览器能力解锁', tag: '应用篇', desc: '装一个插件，让 GA 帮你操控浏览器', link: '/part1/chapter2/' },
  { name: '第3章：基础使用', tag: '应用篇', desc: '熟悉界面、解锁视觉能力，掌握多轮对话技巧', link: '/part1/chapter3/' },
  { name: '第4章：记忆与 Skill 系统', tag: '应用篇', desc: '教会 GA 一次，它就能永久记住并复用你的经验', link: '/part1/chapter4/' },
  { name: '第5章：聊天平台接入', tag: '应用篇', desc: '接入微信/飞书/钉钉，用手机随时给 GA 下任务', link: '/part1/chapter5/' },
  { name: '第6章：进阶玩法', tag: '应用篇', desc: '自主行动、定时任务、子代理——解锁 GA 的全部潜力', link: '/part1/chapter6/' },
  { name: '第7章：上下文信息密度', tag: '原理篇', desc: '为什么上下文越长表现越差？理解 GA 的第一性原理', link: '/part2/chapter7/' },
  { name: '第8章：系统全貌', tag: '原理篇', desc: '鸟瞰 GenericAgent 全架构，建立你的系统地图', link: '/part2/chapter8/' },
  { name: '第9章：最小原子工具集', tag: '原理篇', desc: '只用 9 个工具覆盖完整能力环——不要瑞士军刀，要乐高积木', link: '/part2/chapter9/' },
  { name: '第10章：分层记忆架构', tag: '原理篇', desc: '四层记忆如何让 GA 记住更多却不爆上下文', link: '/part2/chapter10/' },
  { name: '第11章：上下文截断与压缩', tag: '原理篇', desc: '主动管理每一轮的信息预算，50 轮对话也不崩', link: '/part2/chapter11/' },
  { name: '第12章：自我进化', tag: '原理篇', desc: '从用完即忘到越用越强——经验蒸馏的三阶段进化路径', link: '/part2/chapter12/' },
]
const doubledChapters = [...chapters, ...chapters]
const carouselTrack = ref(null)

/* ===== Learn Items ===== */
const learnItems = [
  { icon: '🚀', title: '从零跑通你的第一个 GA', desc: '安装环境、配好密钥、解锁浏览器与视觉能力——10 分钟拥有一个能干活的本地 Agent' },
  { icon: '⚡', title: '沿着最佳实践快速养成 GA 核心能力', desc: 'Skill 沉淀、平台接入、进阶用法——跟着教程一步步做完，你的 GA 就从"刚装好"直接进化到"开箱即用"' },
  { icon: '🔍', title: '读懂 GA 背后的设计原理', desc: '信息密度、最小工具集、分层记忆、自我进化——知其然更知其所以然，真正掌握 Agent 的底层逻辑' },
  { icon: '🧠', title: '理解 Agent 设计的第一性原理', desc: '从"上下文越长表现越差"这个反直觉事实出发，掌握信息密度最大化的核心设计哲学' },
  { icon: '🔧', title: '拆解 GA 的四大核心机制', desc: '最小原子工具集、分层记忆架构、上下文截断压缩、自我进化——逐一看懂每个机制为什么这样设计' },
  { icon: '✨', title: '理解复杂能力如何从简单原语中涌现', desc: '没有专用调度器、没有事件总线——看 9 个工具 + 3 个运行时原语如何组合出子代理、看门狗、定时任务等高级功能' },
]

/* ===== Jump Links ===== */
const jumpLinks = [
  { icon: '🚀', title: '快速开始', desc: '10 分钟搭好环境', link: '/part1/chapter1/', external: false },
  { icon: '📖', title: '应用篇', desc: '从安装到实战', link: '/part1/chapter1/', external: false },
  { icon: '⚙️', title: '原理篇', desc: '深入设计哲学', link: '/part2/chapter7/', external: false },
  { icon: '🐙', title: 'GitHub', desc: '查看GA源码，记得Star！', link: 'https://github.com/lsdefine/GenericAgent', external: true },
  { icon: '📥', title: 'PDF 下载', desc: '离线阅读', link: 'https://github.com/AspasZhang/hello-generic-agent/releases', external: true },
  { icon: '💬', title: '提 Issue', desc: '反馈与讨论', link: 'https://github.com/AspasZhang/hello-generic-agent/issues', external: true },
]

/* ===== Team ===== */
const teamMembers = [
  { name: 'ZZJ', github: 'zzj0402' },
  { name: 'Member2', github: 'datawhalechina' },
  { name: 'Member3', github: 'datawhalechina' },
]
</script>

<style>
:root {
--beige-light: #F0EDE0;
--beige-main: #E0DCCF;
--beige-dark: #C4C0B3;
--beige-shadow: #A09C8F;
--screen-black: #222529;
--screen-glow: #3E434C;
--crt-green: #33ff00;
--accent-blue: #2B6CB0;
--accent-orange: #C05621;
--ink-black: #0f0f0f;
--font-serif: 'EB Garamond', serif;
--font-mono: 'VT323', monospace;
}

.figmint-hero {
  --accent: #c45e3a;
  --font-serif: 'EB Garamond', 'Georgia', serif;
  --font-mono: 'VT323', 'Courier New', monospace;
  font-family: var(--font-serif);
  color: #2a2a2a;
}

/* ===== Hero ===== */
.hero-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1200px;
  margin: 0 auto;
  padding: 80px 40px 40px;
  gap: 40px;
}
.text-section { flex: 1; max-width: 520px; }
.eyebrow {
  font-size: 0.75rem; letter-spacing: 3px; text-transform: uppercase;
  color: var(--accent); margin-bottom: 12px; font-weight: 600;
}
.headline {
  font-size: 4rem; line-height: 1.05; font-weight: 700;
  margin: 0 0 20px; font-family: var(--font-serif);
}
.subtext { font-size: 1.1rem; line-height: 1.7; color: #555; margin-bottom: 28px; }
.hero-buttons { display: flex; gap: 14px; }
.btn-primary {
  padding: 12px 32px; background: var(--accent); color: #fff;
  border-radius: 8px; font-weight: 600; text-decoration: none; font-size: 1rem;
  transition: background 0.2s;
}
.btn-primary:hover { background: #a84828; }
.btn-secondary {
  padding: 12px 24px; border: 2px solid #ccc; color: #555;
  border-radius: 8px; font-weight: 600; text-decoration: none; font-size: 1rem;
  transition: border-color 0.2s, color 0.2s;
}
.btn-secondary:hover { border-color: var(--accent); color: var(--accent); }

/* ===== 3D Computer (Original Fig Mint) ===== */
.computer-section {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  perspective: 2000px;
  min-height: 520px;
  position: relative;
  transform: scale(0.82);
}

.scene {
position: relative;
transform-style: preserve-3d;
transform: rotateY(-15deg) rotateX(5deg);
transition: transform 0.5s ease-out;
}

.product-col:hover .scene {
transform: rotateY(-5deg) rotateX(2deg);
}

.computer-unit {
position: relative;
width: 360px;
height: 440px;
transform-style: preserve-3d;
}

.face {
position: absolute;
background: var(--beige-main);
border: 1px solid rgba(0,0,0,0.05);
}

.front {
width: 360px;
height: 440px;
transform: translateZ(100px);
background: linear-gradient(135deg, var(--beige-light) 0%, var(--beige-main) 100%);
border-radius: 0;
box-shadow: 
inset 2px 2px 5px rgba(255,255,255,0.8),
inset -5px -5px 15px rgba(0,0,0,0.1);
display: flex;
flex-direction: column;
align-items: center;
padding-top: 40px;
}

.back {
width: 360px;
height: 440px;
transform: translateZ(-100px) rotateY(180deg);
background: var(--beige-dark);
border-radius: 0;
}

.left {
width: 200px;
height: 440px;
transform: rotateY(-90deg) translateZ(100px);
background: var(--beige-main);
border-radius: 0;
box-shadow: inset 10px 0 20px rgba(0,0,0,0.05);
}

.right {
width: 200px;
height: 440px;
transform: rotateY(90deg) translateZ(260px);
background: var(--beige-dark);
border-radius: 0;
box-shadow: inset 10px 0 20px rgba(0,0,0,0.1);
}

.top {
width: 360px;
height: 200px;
transform: rotateX(90deg) translateZ(100px);
background: var(--beige-light);
border-radius: 0;
}

.bottom {
width: 360px;
height: 200px;
transform: rotateX(-90deg) translateZ(340px);
background: var(--beige-shadow);
border-radius: 0;
box-shadow: 0 50px 80px rgba(0,0,0,0.3); 
}


.screen-inset {
width: 280px;
height: 220px;
background: #D1CEC7;
border-radius: 16px;
box-shadow: 
inset 2px 2px 8px rgba(0,0,0,0.2),
inset -2px -2px 8px rgba(255,255,255,0.5);
display: flex;
align-items: center;
justify-content: center;
margin-bottom: 30px;
position: relative;
}

.crt {
width: 260px;
height: 200px;
background: var(--screen-black);
border-radius: 40% 40% 40% 40% / 10% 10% 10% 10%; 
position: relative;
overflow: hidden;
box-shadow: inset 0 0 20px rgba(0,0,0,1);
}

.crt::before {
content: '';
position: absolute;
top: 0; left: 0; right: 0; bottom: 0;
background: 
linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%),
linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06));
background-size: 100% 2px, 3px 100%;
z-index: 5;
pointer-events: none;
border-radius: 12px;
}

.crt-glow {
position: absolute;
top: 0; left: 0; right: 0; bottom: 0;
display: flex;
align-items: center;
justify-content: center;
overflow: hidden;
border-radius: 12px;
}

.mascot-screen {
width: 100%;
height: 100%;
display: flex;
align-items: center;
justify-content: center;
overflow: hidden;
}

.mascot-img {
width: 100%;
height: 100%;
object-fit: cover;
border-radius: 12px;
}


.floppy-slot {
width: 140px;
height: 12px;
background: #333;
border-radius: 6px;
box-shadow: inset 2px 2px 5px rgba(0,0,0,0.5);
margin-left: 100px; 
position: relative;
}

.logo-badge {
position: absolute;
bottom: 30px;
left: 30px;
width: 20px;
height: 26px;
border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
background: linear-gradient(180deg, #63B548 0%, #63B548 16.6%, #F6C829 16.6%, #F6C829 33.3%, #E57D25 33.3%, #E57D25 50%, #D83335 50%, #D83335 66.6%, #9C4595 66.6%, #9C4595 83.3%, #468CCF 83.3%, #468CCF 100%);
box-shadow: inset 1px 1px 2px rgba(0,0,0,0.2);
}
.logo-badge::before {
content: "";
position: absolute;
top: -6px;
left: 50%;
transform: translateX(-50%);
width: 3px;
height: 7px;
background: #5a3e28;
border-radius: 1px;
}


.sticker {
position: absolute;
z-index: 5;
box-shadow: 1px 1px 2px rgba(0,0,0,0.2);
transform-style: flat;
}

.sticker-ball {
width: 40px;
height: 40px;
background: var(--accent-orange);
border-radius: 50%;
bottom: 88px;
left: 20px;
background-image: 
radial-gradient(circle at 10px 10px, rgba(255,255,255,0.2) 2px, transparent 3px),
linear-gradient(45deg, transparent 40%, rgba(0,0,0,0.2) 40%, rgba(0,0,0,0.2) 45%, transparent 45%);
transform: translateZ(101px) rotate(-10deg);
}

.sticker-star {
width: 45px;
height: 45px;
background: #fff;
border-radius: 8px;
bottom: 98px;
left: 50px;
transform: translateZ(102px) rotate(15deg);
border: 2px solid #fff;
display: flex;
align-items: center;
justify-content: center;
}
.sticker-star::after {
content: '★';
color: var(--accent-blue);
font-size: 24px;
}

.sticker-text {
width: 60px;
height: 30px;
background: #8B0000;
color: #F0E68C;
font-family: 'Courier New', courier, monospace;
font-size: 6px;
line-height: 1.3;
display: flex;
align-items: center;
justify-content: center;
text-align: center;
font-weight: bold;
letter-spacing: 0.5px;
bottom: 64px;
left: 100px;
transform: translateZ(101px) rotate(-2deg);
box-shadow: 1px 1px 1px rgba(0,0,0,0.3);
border: 1px solid rgba(255,255,255,0.2);
}


.grill {
position: absolute;
bottom: 25px;
right: 25px;
display: grid;
grid-template-columns: repeat(4, 1fr);
gap: 2px;
width: 30px;
height: 20px;
}
.vent {
background: #333;
border-radius: 1px;
box-shadow: inset 1px 1px 1px rgba(0,0,0,0.5);
}


.keyboard-assembly {
position: absolute;
width: 360px;
height: 140px;
bottom: -118px;
transform-style: preserve-3d;
transform-origin: top center;
--kb-angle: 66deg;
transform: translateZ(164px) rotateX(var(--kb-angle));
--kb-thickness: 18px;
}

.kb-base {
position: absolute;
width: 100%;
height: 100%;
background: var(--beige-main);
border-radius: 0;
box-shadow: 
inset 1px 1px 2px rgba(255,255,255,0.5),
inset -5px -5px 15px rgba(0,0,0,0.1);
transform: translateZ(calc(var(--kb-thickness) / 2));
overflow: hidden;
}

.kb-front,
.kb-back {
position: absolute;
left: 0;
width: 100%;
height: var(--kb-thickness);
}

.kb-front {
bottom: 0;
background: linear-gradient(180deg, #cdc9bb 0%, #b5b1a3 100%);
transform-origin: bottom center;
transform: translateZ(calc(var(--kb-thickness) / 2)) rotateX(90deg);
border-radius: 0;
}

.kb-back {
top: 0;
background: linear-gradient(180deg, #e5e1d4 0%, #c9c5b8 100%);
transform-origin: top center;
transform: translateZ(calc(var(--kb-thickness) / 2)) rotateX(-90deg);
border-radius: 0;
}

.kb-left,
.kb-right {
position: absolute;
top: 0;
width: var(--kb-thickness);
height: 100%;
background: linear-gradient(180deg, #d1cdbf 0%, #b7b3a6 100%);
}

.kb-left {
left: 0;
transform-origin: left center;
transform: translateZ(calc(var(--kb-thickness) / 2)) rotateY(90deg);
border-radius: 0;
}

.kb-right {
right: 0;
transform-origin: right center;
transform: translateZ(calc(var(--kb-thickness) / 2)) rotateY(-90deg);
border-radius: 0;
}

.kb-shadow {
position: absolute;
width: 100%;
height: 100%;
top: 0;
left: 0;
background: transparent;
transform-origin: top center;
transform: rotateX(calc(-90deg - var(--kb-angle))) translateZ(20px);
box-shadow: 
0 40px 70px rgba(0,0,0,0.25),
0 20px 30px rgba(0,0,0,0.15);
pointer-events: none;
border-radius: 12px;
}

.keys-grid {
display: grid;
grid-template-columns: repeat(12, 1fr);
gap: 6px;
padding: 15px;
transform: translateZ(8px);
transform-style: preserve-3d;
}

.key {
height: 27px;
background: #ECE8DA;
border-radius: 4px;
box-shadow: 
0 6px 0 #C4C0B3,
0 8px 7px rgba(0,0,0,0.2);
transform: translateZ(1px);
transition: transform 0.05s;
}

.key.wide { grid-column: span 2; }
.key.space { grid-column: span 6; }

@keyframes typeKey {
0%, 100% { transform: translateZ(1px) translateY(0); box-shadow: 0 6px 0 #C4C0B3, 0 8px 7px rgba(0,0,0,0.2); }
50% { transform: translateZ(-2px) translateY(5px); box-shadow: 0 1px 0 #C4C0B3, 0 1px 2px rgba(0,0,0,0.05); }
}

.key:nth-child(3n+1) { animation: typeKey 1.5s infinite 0.2s; }
.key:nth-child(7n) { animation: typeKey 2.1s infinite 0.5s; }
.key:nth-child(2n+4) { animation: typeKey 1.8s infinite 0.9s; }
.key:nth-child(5n) { animation: typeKey 2.5s infinite 1.2s; }
.key:nth-child(4n+2) { animation: typeKey 1.2s infinite 0s; }

.cursor {
display: inline-block;
width: 8px;
height: 15px;
background: #fff;
animation: blink 1s step-end infinite;
vertical-align: middle;
}

@keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }

.type-content {
white-space: pre-wrap;
}


.crt-ui {
display: flex;
height: 100%;
}
.sidebar {
width: 30%;
border-right: 1px solid rgba(255,255,255,0.2);
padding: 10px;
font-size: 10px;
color: #ccc;
}
.main-area {
flex: 1;
padding: 10px;
display: flex;
flex-direction: column;
}
.window {
background: #fff;
color: #000;
border-radius: 2px;
padding: 5px;
margin-top: 10px;
box-shadow: 2px 2px 0 rgba(0,0,0,0.5);
font-family: var(--font-mono);
font-size: 10px;
}
.window-header {
border-bottom: 1px dotted #000;
margin-bottom: 5px;
font-weight: bold;
display: flex;
justify-content: space-between;
}

.icon-list div {
margin-bottom: 6px;
display: flex;
align-items: center;
gap: 4px;
}
.icon-circle { width: 8px; height: 8px; border-radius: 50%; background: #555; }
.icon-circle.blue { background: #468CCF; }
.icon-circle.orange { background: #E57D25; }

.typing-container {
font-family: var(--font-mono);
font-size: 12px;
line-height: 1.2;
color: #333;
}



.computer-section:hover .scene {
transform: rotateY(-5deg) rotateX(2deg);
}

/* ===== Carousel ===== */
.carousel-section {
  overflow: hidden;
  padding: 20px 0 30px;
  max-width: 1200px;
  margin: 0 auto;
}
.carousel-track {
  display: flex;
  gap: 18px;
  animation: scroll-carousel 30s linear infinite;
  width: max-content;
  padding: 0 40px;
}
@keyframes scroll-carousel {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}
.carousel-card {
  flex-shrink: 0;
  width: 220px;
  background: #fff;
  border: 1px solid #e8e4da;
  border-radius: 12px;
  padding: 20px;
  text-decoration: none;
  color: inherit;
  transition: box-shadow 0.2s, transform 0.2s;
}
.carousel-card:hover { box-shadow: 0 6px 24px rgba(0,0,0,0.08); transform: translateY(-3px); }
.carousel-tag {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 1px;
  width: fit-content;
}
.tag-app { background: rgba(196,94,58,0.12); color: var(--accent); }
.tag-theory { background: rgba(59,130,246,0.1); color: #3b82f6; }
.carousel-title {
  font-size: 1rem;
  font-weight: 700;
  margin: 0;
  line-height: 1.4;
}
.carousel-desc {
  font-size: 0.85rem;
  color: #777;
  margin: 0;
  line-height: 1.5;
}

/* ===== LEARN SECTION ===== */
.learn-section {
  max-width: 1100px;
  margin: 0 auto;
  padding: 50px 40px 40px;
}
.section-title {
  font-family: var(--font-serif);
  font-size: 1.8rem;
  font-weight: 700;
  margin-bottom: 30px;
  text-align: center;
}
.learn-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}
.learn-card {
  background: #fff;
  border: 1px solid #e8e4da;
  border-radius: 14px;
  padding: 28px 24px;
  text-align: center;
  transition: box-shadow 0.2s, transform 0.2s;
}
.learn-card:hover { box-shadow: 0 8px 30px rgba(0,0,0,0.07); transform: translateY(-4px); }
.learn-icon { font-size: 2rem; display: block; margin-bottom: 12px; }
.learn-card h3 { font-size: 1.05rem; margin: 0 0 8px; font-weight: 700; }
.learn-card p { font-size: 0.9rem; color: #666; margin: 0; line-height: 1.6; }

/* ===== JUMP SECTION ===== */
.jump-section {
  max-width: 1100px;
  margin: 0 auto;
  padding: 30px 40px 50px;
}
.jump-cta-row { display: flex; gap: 20px; flex-wrap: wrap; justify-content: center; }
.jump-card {
  display: flex;
  align-items: center;
  gap: 14px;
  background: #fff;
  border: 1px solid #e8e4da;
  border-radius: 12px;
  padding: 20px 24px;
  text-decoration: none;
  color: inherit;
  flex: 1;
  min-width: 240px;
  max-width: 340px;
  transition: box-shadow 0.2s, transform 0.2s;
}
.jump-card:hover { box-shadow: 0 6px 24px rgba(0,0,0,0.08); transform: translateY(-2px); }
.jump-icon { font-size: 1.8rem; }
.jump-card h4 { font-size: 0.95rem; margin: 0 0 4px; font-weight: 700; }
.jump-card p { font-size: 0.8rem; color: #777; margin: 0; }

/* ===== TEAM ===== */
.team-section {
  max-width: 1100px;
  margin: 0 auto;
  padding: 30px 40px 60px;
  text-align: center;
}
.team-desc { color: #777; font-size: 0.95rem; margin-bottom: 24px; }
.team-grid { display: flex; gap: 24px; justify-content: center; flex-wrap: wrap; }
.team-avatar {
  display: flex; flex-direction: column; align-items: center; gap: 6px;
  text-decoration: none; color: inherit; transition: transform 0.2s;
}
.team-avatar:hover { transform: translateY(-3px); }
.team-avatar img {
  width: 56px; height: 56px; border-radius: 50%;
  border: 2px solid #e8e4da; object-fit: cover;
}
.team-avatar span { font-size: 0.8rem; color: #555; }

/* ===== Responsive ===== */
@media (max-width: 768px) {
  .hero-content { flex-direction: column; padding: 40px 20px 20px; }
  .text-section { max-width: 100%; }
  .headline { font-size: 3rem; }
  .computer-section { min-height: 400px; transform: scale(0.7); }
  .learn-grid { grid-template-columns: 1fr; }
  .learn-section { padding: 30px 20px; }
  .jump-section { padding: 20px 20px 40px; }
  .jump-cta-row { flex-direction: column; align-items: center; }
}
</style>

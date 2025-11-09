<template>
  <section class="section objectives-section">
    <div class="content-wrapper">
      <div class="tag">Map Control</div>
      <h2 class="section-title">Objective Mastery</h2>

      <div class="objectives-grid">
        <div class="objective-card epic">
          <div class="objective-icon">🐉</div>
          <div class="objective-value">{{ data.dragon_takedowns }}</div>
          <div class="objective-label">Dragons Slain</div>
          <div class="objective-detail">{{ (data.dragon_takedowns / 129).toFixed(1) }} per game</div>
        </div>

        <div class="objective-card epic">
          <div class="objective-icon">👁️</div>
          <div class="objective-value">{{ data.team_baron_kills }}</div>
          <div class="objective-label">Barons Secured</div>
          <div class="objective-detail">{{ (data.team_baron_kills / 129 * 100).toFixed(0) }}% of games</div>
        </div>

        <div class="objective-card steal">
          <div class="objective-icon">🏆</div>
          <div class="objective-value">{{ data.epic_monster_steals }}</div>
          <div class="objective-label">Epic Steals</div>
          <div class="objective-detail">Legendary</div>
        </div>
      </div>

      <div class="vision-section">
        <h3 class="vision-title">Vision Game</h3>
        <div class="vision-grid">
          <div class="vision-card">
            <div class="vision-circle">
              <svg viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="50" class="vision-bg"></circle>
                <circle cx="60" cy="60" r="50" class="vision-progress" :style="{ strokeDashoffset: getVisionOffset() }"></circle>
              </svg>
              <div class="vision-center">
                <div class="vision-score">{{ data.visionScore_avg.toFixed(0) }}</div>
                <div class="vision-label">Avg Vision</div>
              </div>
            </div>
          </div>

          <div class="vision-stats">
            <div class="vision-stat">
              <div class="stat-icon">👁️</div>
              <div>
                <div class="stat-number">{{ data.wards_placed }}</div>
                <div class="stat-text">Wards Placed</div>
                <div class="stat-avg">{{ data.wards_placed_avg.toFixed(1) }} per game</div>
              </div>
            </div>
            <div class="vision-stat">
              <div class="stat-icon">🔍</div>
              <div>
                <div class="stat-number">{{ data.wards_killed }}</div>
                <div class="stat-text">Wards Destroyed</div>
                <div class="stat-avg">{{ data.wards_killed_avg.toFixed(1) }} per game</div>
              </div>
            </div>
            <div class="vision-stat">
              <div class="stat-icon">📊</div>
              <div>
                <div class="stat-number">{{ data.visionScore }}</div>
                <div class="stat-text">Total Vision Score</div>
                <div class="stat-avg">{{ getVisionRating() }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="fun-fact">
        <div class="fact-icon">💡</div>
        <p class="fact-text">
          You placed <span class="highlight">{{ data.wards_placed }}</span> wards this year.
          That's enough to light up <span class="highlight">{{ (data.wards_placed / 10).toFixed(0) }}</span> full maps!
        </p>
      </div>
    </div>
  </section>
</template>

<script setup>
const props = defineProps({
  data: {
    type: Object,
    required: true
  }
})

const getVisionOffset = () => {
  // Map vision score to circular progress (30+ vision = 100%)
  const percentage = Math.min(props.data.visionScore_avg / 30, 1)
  const circumference = 2 * Math.PI * 50
  return circumference * (1 - percentage)
}

const getVisionRating = () => {
  const avg = props.data.visionScore_avg
  if (avg >= 30) return 'Exceptional'
  if (avg >= 20) return 'Great'
  if (avg >= 15) return 'Good'
  return 'Needs Work'
}
</script>

<style scoped>
.objectives-section {
  background: radial-gradient(circle at 50% 80%, rgba(3, 151, 171, 0.05) 0%, transparent 50%);
}

.content-wrapper {
  max-width: 1200px;
  width: 100%;
}

.tag {
  display: inline-block;
  background: linear-gradient(135deg, var(--lol-blue), var(--lol-green));
  color: white;
  padding: 0.5rem 1.5rem;
  border-radius: 50px;
  font-weight: 700;
  font-size: 0.9rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  margin-bottom: 2rem;
  box-shadow: 0 5px 15px rgba(3, 151, 171, 0.3);
}

.section-title {
  font-size: clamp(2.5rem, 5vw, 4rem);
  font-weight: 900;
  margin-bottom: 3rem;
  background: linear-gradient(135deg, var(--lol-blue), var(--lol-green));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.objectives-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  margin-bottom: 4rem;
}

.objective-card {
  background: linear-gradient(135deg, rgba(30, 35, 40, 0.8), rgba(10, 20, 40, 0.6));
  border: 3px solid rgba(3, 151, 171, 0.3);
  border-radius: 25px;
  padding: 2.5rem 2rem;
  text-align: center;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.objective-card::after {
  content: '';
  position: absolute;
  top: -50%;
  right: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(3, 151, 171, 0.1) 0%, transparent 60%);
  animation: rotate 10s linear infinite;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.objective-card:hover {
  transform: translateY(-10px) scale(1.02);
  border-color: var(--lol-blue);
  box-shadow: 0 20px 50px rgba(3, 151, 171, 0.4);
}

.objective-card.epic {
  border-color: var(--lol-gold);
}

.objective-card.epic:hover {
  border-color: var(--lol-gold-light);
  box-shadow: 0 20px 50px rgba(200, 155, 60, 0.4);
}

.objective-card.steal {
  background: linear-gradient(135deg, rgba(200, 155, 60, 0.2), rgba(3, 151, 171, 0.15));
  border-color: var(--lol-green);
}

.objective-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  position: relative;
  z-index: 1;
}

.objective-value {
  font-size: clamp(3.5rem, 5vw, 4.5rem);
  font-weight: 900;
  color: var(--lol-blue);
  margin-bottom: 0.5rem;
  position: relative;
  z-index: 1;
}

.objective-card.epic .objective-value {
  color: var(--lol-gold);
}

.objective-card.steal .objective-value {
  color: var(--lol-green);
}

.objective-label {
  font-size: 1.1rem;
  color: var(--lol-gold-light);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 0.5rem;
  font-weight: 600;
  position: relative;
  z-index: 1;
}

.objective-detail {
  font-size: 0.9rem;
  color: var(--lol-blue);
  font-weight: 600;
  position: relative;
  z-index: 1;
}

.vision-section {
  margin-top: 4rem;
}

.vision-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--lol-gold);
  margin-bottom: 2rem;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.vision-grid {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 3rem;
  align-items: center;
  background: linear-gradient(135deg, rgba(30, 35, 40, 0.6), rgba(10, 20, 40, 0.4));
  border: 2px solid rgba(200, 155, 60, 0.2);
  border-radius: 20px;
  padding: 3rem;
  margin-bottom: 3rem;
}

.vision-card {
  display: flex;
  justify-content: center;
}

.vision-circle {
  position: relative;
  width: 180px;
  height: 180px;
}

.vision-circle svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.vision-bg {
  fill: none;
  stroke: rgba(200, 155, 60, 0.2);
  stroke-width: 10;
}

.vision-progress {
  fill: none;
  stroke: var(--lol-blue);
  stroke-width: 10;
  stroke-linecap: round;
  stroke-dasharray: 314;
  transition: stroke-dashoffset 2s ease;
}

.vision-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.vision-score {
  font-size: 3rem;
  font-weight: 900;
  color: var(--lol-blue);
}

.vision-label {
  font-size: 0.9rem;
  color: var(--lol-gold-light);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.vision-stats {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.vision-stat {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.stat-icon {
  font-size: 2.5rem;
  flex-shrink: 0;
}

.stat-number {
  font-size: 2rem;
  font-weight: 900;
  color: var(--lol-gold);
}

.stat-text {
  font-size: 1rem;
  color: var(--lol-gold-light);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-top: 0.25rem;
}

.stat-avg {
  font-size: 0.85rem;
  color: var(--lol-blue);
  margin-top: 0.25rem;
}

.fun-fact {
  background: linear-gradient(135deg, rgba(3, 151, 171, 0.1), rgba(200, 155, 60, 0.05));
  border: 2px solid rgba(200, 155, 60, 0.3);
  border-radius: 15px;
  padding: 2rem;
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.fact-icon {
  font-size: 3rem;
  flex-shrink: 0;
}

.fact-text {
  font-size: 1.2rem;
  line-height: 1.6;
  color: var(--lol-gold-light);
}

.highlight {
  color: var(--lol-gold);
  font-weight: 700;
}

@media (max-width: 968px) {
  .vision-grid {
    grid-template-columns: 1fr;
    text-align: center;
  }

  .vision-stats {
    align-items: center;
  }

  .vision-stat {
    flex-direction: column;
    text-align: center;
  }
}

@media (max-width: 768px) {
  .objectives-grid {
    grid-template-columns: 1fr;
  }

  .fun-fact {
    flex-direction: column;
    text-align: center;
  }
}
</style>

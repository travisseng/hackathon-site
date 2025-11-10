<template>
  <section class="section game-history-section">
    <div class="content-wrapper">
      <h2 class="section-title">Game History</h2>
      <p class="section-subtitle">Click on any game to see detailed analysis</p>

      <div class="games-list">
        <div
          v-for="game in displayGames"
          :key="game.matchId"
          class="game-card"
          :class="{ victory: game.player.win, defeat: !game.player.win }"
        >
          <div class="game-result-bar">
            <div class="result-info">
              <span class="result-text">{{ game.player.win ? 'Victory' : 'Defeat' }}</span>
              <span class="game-date">{{ formatGameDate(game.gameCreation) }}</span>
            </div>
            <span class="game-duration">{{ formatDuration(game.duration_min) }}</span>
          </div>

          <div class="game-content">
            <div class="champion-info">
              <img :src="getChampionIcon(game.player.champion)" :alt="game.player.champion" class="champion-icon" />
              <div class="champion-details">
                <div class="champion-name">{{ game.player.champion }}</div>
                <div class="champion-role">{{ getLaneFromContext(game) }}</div>
              </div>
            </div>

            <div class="game-stats">
              <div class="kda-display">
                <span class="kda-numbers">{{ game.player.stats.Kills }}/{{ game.player.stats.Deaths }}/{{ game.player.stats.Assists }}</span>
                <span class="kda-ratio">{{ calculateKDA(game.player.stats.Kills, game.player.stats.Deaths, game.player.stats.Assists) }} KDA</span>
              </div>
              <div class="stats-row">
                <div class="stat-item">
                  <span class="stat-icon">💰</span>
                  <span class="stat-value">{{ formatGold(game.player.stats.Gold) }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-icon">🌾</span>
                  <span class="stat-value">{{ game.player.stats.CS }} CS ({{ calculateCSPerMin(game.player.stats.CS, game.duration_min) }}/min)</span>
                </div>
                <div class="stat-item">
                  <span class="stat-icon">👁️</span>
                  <span class="stat-value">{{ game.player.stats['Vision Score'] }} Vision</span>
                </div>
              </div>
            </div>

            <div class="opponent-info" v-if="game.opponent">
              <div class="opponent-header">
                <div class="vs-label">VS</div>
                <img :src="getChampionIcon(game.opponent.champion)" :alt="game.opponent.champion" class="opponent-icon" />
                <div class="opponent-details">
                  <div class="opponent-name">{{ game.opponent.name }}</div>
                  <div class="opponent-champion">{{ game.opponent.champion }}</div>
                </div>
              </div>

              <div class="opponent-stats" v-if="game.opponent.stats">
                <div class="opponent-kda">
                  <span class="opponent-kda-numbers">{{ game.opponent.stats.Kills }}/{{ game.opponent.stats.Deaths }}/{{ game.opponent.stats.Assists }}</span>
                  <span class="opponent-kda-ratio">{{ calculateKDA(game.opponent.stats.Kills, game.opponent.stats.Deaths, game.opponent.stats.Assists) }}</span>
                </div>
                <div class="opponent-mini-stats">
                  <span class="opponent-stat">💰 {{ formatGold(game.opponent.stats.Gold) }}</span>
                  <span class="opponent-stat">🌾 {{ game.opponent.stats.CS }}</span>
                  <span class="opponent-stat">👁️ {{ game.opponent.stats['Vision Score'] }}</span>
                </div>
              </div>
            </div>

            <div class="game-actions">
              <button class="analyze-btn" @click="analyzeGame(game.matchId)">
                <span class="btn-icon">📊</span>
                Analyze Game
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, defineProps, defineEmits } from 'vue'

const props = defineProps({
  games: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['analyze'])

// Mock data if no games provided
const mockGames = [
  {
    matchId: "EUW1_MOCK_1",
    gameMode: "CLASSIC",
    gameCreation: Date.now() - (1000 * 60 * 60 * 24), // 1 day ago
    duration_min: 25,
    player: {
      name: "Reive",
      champion: "Azir",
      win: true,
      stats: {
        Kills: 8,
        Deaths: 7,
        Assists: 6,
        CS: 172,
        Gold: 13500,
        "Vision Score": 24
      }
    },
    opponent: {
      name: "EnemyPlayer",
      champion: "Zed",
      win: false,
      stats: {
        Kills: 5,
        Deaths: 8,
        Assists: 4,
        CS: 145,
        Gold: 11200,
        "Vision Score": 18
      }
    },
    context: [
      {
        name: "Reive",
        champion: "Azir",
        lane: "MIDDLE"
      }
    ]
  },
  {
    matchId: "EUW1_MOCK_2",
    gameMode: "CLASSIC",
    gameCreation: Date.now() - (1000 * 60 * 60 * 24 * 3), // 3 days ago
    duration_min: 32,
    player: {
      name: "Reive",
      champion: "Syndra",
      win: false,
      stats: {
        Kills: 5,
        Deaths: 9,
        Assists: 8,
        CS: 215,
        Gold: 11200,
        "Vision Score": 18
      }
    },
    opponent: {
      name: "MidLaner",
      champion: "Yasuo",
      win: true,
      stats: {
        Kills: 12,
        Deaths: 5,
        Assists: 7,
        CS: 198,
        Gold: 14800,
        "Vision Score": 22
      }
    },
    context: [
      {
        name: "Reive",
        champion: "Syndra",
        lane: "MIDDLE"
      }
    ]
  }
]

// Use provided games or fallback to mock
const displayGames = computed(() => {
  return props.games.length > 0 ? props.games : mockGames
})

const getChampionIcon = (championName) => {
  const cleanName = championName.replace(/[^a-zA-Z]/g, '')
  return `https://ddragon.leagueoflegends.com/cdn/15.22.1/img/champion/${cleanName}.png`
}

const calculateKDA = (kills, deaths, assists) => {
  if (deaths === 0) {
    return 'Perfect'
  }
  return ((kills + assists) / deaths).toFixed(1)
}

const calculateCSPerMin = (cs, duration) => {
  return (cs / duration).toFixed(1)
}

const formatDuration = (minutes) => {
  return `${Math.floor(minutes)}:${String(Math.round((minutes % 1) * 60)).padStart(2, '0')}`
}

const formatGold = (gold) => {
  if (gold >= 1000) {
    return `${(gold / 1000).toFixed(1)}k`
  }
  return gold.toString()
}

const formatGameDate = (timestamp) => {
  if (!timestamp) return 'Unknown date'

  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now - date
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  // If today
  if (diffDays === 0) {
    return 'Today'
  }
  // If yesterday
  if (diffDays === 1) {
    return 'Yesterday'
  }
  // If within last 7 days
  if (diffDays < 7) {
    return `${diffDays} days ago`
  }
  // Otherwise show date
  const options = { month: 'short', day: 'numeric', year: 'numeric' }
  return date.toLocaleDateString('en-US', options)
}

const getLaneFromContext = (game) => {
  // Find player in context to get lane info
  const playerInContext = game.context?.find(p => p.name === game.player.name)
  if (playerInContext?.lane) {
    const laneMap = {
      'TOP': 'Top',
      'JUNGLE': 'Jungle',
      'MIDDLE': 'Mid',
      'BOTTOM': 'ADC',
      'UTILITY': 'Support'
    }
    return laneMap[playerInContext.lane] || playerInContext.lane
  }
  return 'Unknown'
}

const analyzeGame = (matchId) => {
  emit('analyze', matchId)
}
</script>

<style scoped>
.game-history-section {
  background: radial-gradient(circle at 50% 50%, rgba(3, 151, 171, 0.08) 0%, transparent 60%);
  min-height: 100vh;
  padding: 4rem 2rem;
}

.content-wrapper {
  max-width: 900px;
  margin: 0 auto;
}

.section-title {
  font-size: clamp(2rem, 4vw, 2.5rem);
  font-weight: 900;
  text-align: center;
  margin-bottom: 1rem;
  background: linear-gradient(135deg, var(--lol-blue), var(--lol-gold));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.section-subtitle {
  text-align: center;
  color: var(--lol-gold-light);
  margin-bottom: 3rem;
  font-size: 1rem;
}

.games-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.game-card {
  background: rgba(10, 20, 40, 0.8);
  border-radius: 15px;
  overflow: hidden;
  border: 2px solid rgba(200, 155, 60, 0.3);
  transition: all 0.3s ease;
}

.game-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 40px rgba(200, 155, 60, 0.3);
  border-color: var(--lol-gold);
}

.game-card.victory {
  border-left: 4px solid #00d4aa;
}

.game-card.defeat {
  border-left: 4px solid #ff4655;
}

.game-result-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 1.5rem;
  font-size: 0.85rem;
  font-weight: 700;
}

.victory .game-result-bar {
  background: rgba(0, 212, 170, 0.15);
}

.defeat .game-result-bar {
  background: rgba(255, 70, 85, 0.15);
}

.result-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.victory .result-text {
  color: #00d4aa;
}

.defeat .result-text {
  color: #ff4655;
}

.game-date {
  color: var(--lol-gold-light);
  opacity: 0.7;
  font-size: 0.75rem;
  font-weight: 600;
}

.game-duration {
  color: var(--lol-gold-light);
  opacity: 0.8;
}

.game-content {
  display: grid;
  grid-template-columns: 200px 1fr 200px auto;
  gap: 1.5rem;
  padding: 1.5rem;
  align-items: center;
}

.champion-info {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.champion-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  border: 2px solid var(--lol-gold);
}

.champion-details {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.champion-name {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--lol-gold-light);
}

.champion-role {
  font-size: 0.85rem;
  color: var(--lol-gold);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.game-stats {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.kda-display {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.kda-numbers {
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--lol-gold-light);
}

.kda-ratio {
  font-size: 0.85rem;
  color: var(--lol-gold);
  font-weight: 600;
}

.stats-row {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
}

.stat-icon {
  font-size: 1rem;
}

.stat-value {
  color: var(--lol-gold-light);
  opacity: 0.9;
}

/* Opponent Info */
.opponent-info {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  padding: 1rem;
  background: rgba(255, 70, 85, 0.1);
  border: 1px solid rgba(255, 70, 85, 0.3);
  border-radius: 10px;
}

.opponent-header {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.vs-label {
  font-size: 0.75rem;
  font-weight: 900;
  color: #ff4655;
  letter-spacing: 0.1em;
}

.opponent-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid rgba(255, 70, 85, 0.5);
}

.opponent-details {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.opponent-name {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--lol-gold-light);
}

.opponent-champion {
  font-size: 0.75rem;
  color: #ff4655;
  font-weight: 600;
}

.opponent-stats {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding-left: 0.5rem;
  border-left: 2px solid rgba(255, 70, 85, 0.3);
}

.opponent-kda {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
}

.opponent-kda-numbers {
  font-size: 0.95rem;
  font-weight: 700;
  color: #ff4655;
}

.opponent-kda-ratio {
  font-size: 0.75rem;
  color: var(--lol-gold-light);
  opacity: 0.8;
}

.opponent-mini-stats {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.opponent-stat {
  font-size: 0.75rem;
  color: var(--lol-gold-light);
  opacity: 0.8;
}

.game-actions {
  display: flex;
  align-items: center;
}

.analyze-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.8rem 1.5rem;
  background: linear-gradient(135deg, var(--lol-blue), var(--lol-gold));
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.analyze-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 5px 20px rgba(3, 151, 171, 0.4);
}

.btn-icon {
  font-size: 1.2rem;
}

@media (max-width: 768px) {
  .game-result-bar {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.3rem;
    padding: 0.7rem 1rem;
  }

  .result-info {
    width: 100%;
    justify-content: space-between;
  }

  .game-date {
    font-size: 0.7rem;
  }

  .game-content {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .opponent-info {
    width: 100%;
  }

  .opponent-header {
    justify-content: flex-start;
  }

  .opponent-mini-stats {
    gap: 0.5rem;
  }

  .opponent-stat {
    font-size: 0.7rem;
  }

  .game-actions {
    justify-content: center;
  }

  .analyze-btn {
    width: 100%;
    justify-content: center;
  }

  .stats-row {
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: space-around;
  }

  .stat-item {
    font-size: 0.8rem;
  }
}
</style>

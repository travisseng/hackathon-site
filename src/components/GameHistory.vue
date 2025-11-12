<template>
  <section class="section game-history-section">
    <div class="content-wrapper">
      <h2 class="section-title">Game History</h2>
      <p class="section-subtitle">Click on any game to see detailed analysis</p>

      <div class="games-list">
        <div
          v-for="game in paginatedGames"
          :key="game.matchId"
          class="game-card"
          :class="{ victory: game.player.win, defeat: !game.player.win }"
        >
          <div class="game-result-bar">
            <div class="result-info">
              <span class="result-text">{{ game.player.win ? 'Victory' : 'Defeat' }}</span>
              <span class="game-date">{{ formatGameDate(game.gameCreation) }}</span>
            </div>
            <span class="game-duration">{{ formatDuration(game.duration) }}</span>
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
                <span class="kda-numbers">{{ game.player.stats.kills }}/{{ game.player.stats.deaths }}/{{ game.player.stats.assists }}</span>
                <span class="kda-ratio">{{ calculateKDA(game.player.stats.kills, game.player.stats.deaths, game.player.stats.assists) }} KDA</span>
              </div>
              <div class="stats-row">
                <div class="stat-item">
                  <span class="stat-icon">💰</span>
                  <span class="stat-value">{{ formatGold(game.player.stats.goldEarned) }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-icon">🌾</span>
                  <span class="stat-value">{{ game.player.stats.totalMinionsKilled + game.player.stats.neutralMinionsKilled }} CS ({{ calculateCSPerMin(game.player.stats.totalMinionsKilled + game.player.stats.neutralMinionsKilled, game.duration) }}/min)</span>
                </div>
                <div class="stat-item">
                  <span class="stat-icon">👁️</span>
                  <span class="stat-value">{{ game.player.stats.visionScore }} Vision Score</span>
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
                  <span class="opponent-kda-numbers">{{ game.opponent.stats.kills }}/{{ game.opponent.stats.deaths }}/{{ game.opponent.stats.assists }}</span>
                  <span class="opponent-kda-ratio">{{ calculateKDA(game.opponent.stats.kills, game.opponent.stats.deaths, game.opponent.stats.assists) }} KDA</span>
                </div>
                <div class="opponent-mini-stats">
                  <span class="opponent-stat">💰 {{ formatGold(game.opponent.stats.goldEarned) }}</span>
                  <span class="opponent-stat">🌾 {{ game.opponent.stats.totalMinionsKilled + game.opponent.stats.neutralMinionsKilled}} CS ({{ calculateCSPerMin(game.opponent.stats.totalMinionsKilled + game.opponent.stats.neutralMinionsKilled, game.duration) }}/min)</span>
                  <span class="opponent-stat">👁️ {{ game.opponent.stats.visionScore }}</span>
                </div>
              </div>
            </div>

            <!-- Score Summary Section -->
            <div class="score-summary" v-if="props.scoreSummaries[game.matchId]">
              <div v-if="props.loadingScores[game.matchId]" class="score-loading">
                <span class="loading-spinner">⏳</span>
                <span>Loading analysis...</span>
              </div>

              <div v-else-if="!props.scoreSummaries[game.matchId].error" class="score-content">
                <div class="score-header">
                  <div class="score-badge">
                    <span class="score-label">Performance Score</span>
                    <span class="score-value" :class="getScoreClass(props.scoreSummaries[game.matchId].score)">
                      {{ props.scoreSummaries[game.matchId].score }}/10
                    </span>
                  </div>
                </div>

                <div class="score-summary-text">
                  <p class="summary-label">Analysis Summary</p>
                  <p class="summary-content">{{ props.scoreSummaries[game.matchId].summary }}</p>
                </div>
              </div>

              <div v-else class="score-error">
                <span class="error-icon">ℹ️</span>
                <span>No analysis available for this match yet</span>
              </div>
            </div>

            <div class="game-actions">
              <button class="analyze-btn" @click="analyzeGame(game.matchId)">
                <span class="btn-icon">📊</span>
                {{ props.scoreSummaries[game.matchId] && !props.scoreSummaries[game.matchId].error ? 'See Details' : 'Analyze Game' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination Controls -->
      <div class="pagination" v-if="totalPages > 1">
        <button
          class="pagination-btn"
          :disabled="currentPage === 1"
          @click="prevPage"
        >
          <span>←</span>
          <span class="btn-text">Previous</span>
        </button>

        <div class="pagination-info">
          <span class="page-numbers">
            Page <span class="current-page">{{ currentPage }}</span> of <span class="total-pages">{{ totalPages }}</span>
          </span>
          <span class="games-count">
            Showing {{ (currentPage - 1) * gamesPerPage + 1 }}-{{ Math.min(currentPage * gamesPerPage, displayGames.length) }} of {{ displayGames.length }} games
          </span>
        </div>

        <button
          class="pagination-btn"
          :disabled="currentPage === totalPages"
          @click="nextPage"
        >
          <span class="btn-text">Next</span>
          <span>→</span>
        </button>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, defineProps, defineEmits, watch, onMounted } from 'vue'

const props = defineProps({
  games: {
    type: Array,
    default: () => []
  },
  gameTag: {
    type: String,
    default: 'EUW'
  },
  scoreSummaries: {
    type: Object,
    default: () => ({})
  },
  loadingScores: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['analyze', 'update-score', 'update-loading'])

// Pagination state
const currentPage = ref(1)
const gamesPerPage = 10

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

// Paginated games - only show games for current page
const paginatedGames = computed(() => {
  const startIndex = (currentPage.value - 1) * gamesPerPage
  const endIndex = startIndex + gamesPerPage
  return displayGames.value.slice(startIndex, endIndex)
})

// Total pages
const totalPages = computed(() => {
  return Math.ceil(displayGames.value.length / gamesPerPage)
})

// Pagination controls
const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    // Scroll to top of game list
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

const nextPage = () => {
  goToPage(currentPage.value + 1)
}

const prevPage = () => {
  goToPage(currentPage.value - 1)
}

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
  return (cs / (duration / 60)).toFixed(1)
}

const formatDuration = (seconds) => {
  const minutes = Math.floor(seconds / 60)
  seconds = seconds % 60
  return `${minutes}:${String(seconds).padStart(2, '0')}`
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

// Get CSS class based on score value
const getScoreClass = (score) => {
  if (score >= 8) return 'score-excellent'
  if (score >= 7) return 'score-good'
  if (score >= 5) return 'score-average'
  return 'score-poor'
}

// Fetch score summary for a specific match
const fetchScoreSummary = async (matchId, gameName, gameTag) => {
  if (!matchId || !gameName || !gameTag) return

  // Skip if already loaded or loading
  if (props.scoreSummaries[matchId] || props.loadingScores[matchId]) {
    return
  }

  try {
    emit('update-loading', matchId, true)
    const url = `https://xe653skfef.execute-api.eu-west-3.amazonaws.com/getScoreSummary?gamename=${gameName}&gametag=${gameTag}&match_id=${matchId}`

    const response = await fetch(url)
    const data = await response.json()

    if (data.error) {
      emit('update-score', matchId, { error: true })
    } else {
      emit('update-score', matchId, {
        score: data.score,
        summary: data.summary,
        error: false
      })
    }
  } catch (error) {
    console.error(`Error fetching score for ${matchId}:`, error)
    emit('update-score', matchId, { error: true })
  } finally {
    emit('update-loading', matchId, false)
  }
}

// Fetch score summaries only for the current page
const fetchAllScoreSummaries = () => {
  const gamesToFetch = paginatedGames.value
  gamesToFetch.forEach(game => {
    const gameName = game.player.name
    fetchScoreSummary(game.matchId, gameName, props.gameTag)
  })
}

// Watch for changes in current page and fetch scores for new page
watch(currentPage, () => {
  if (props.gameTag) {
    fetchAllScoreSummaries()
  }
})

// Watch for changes in games or gameTag
watch([() => props.games, () => props.gameTag], () => {
  if (props.games.length > 0 && props.gameTag) {
    // Reset to page 1 when games change
    currentPage.value = 1
    fetchAllScoreSummaries()
  }
}, { immediate: false })

// Fetch summaries on mount if using mock data or when real data is provided
onMounted(() => {
  if (displayGames.value.length > 0 && props.gameTag) {
    fetchAllScoreSummaries()
  }
})

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
  grid-template-columns: 200px 1fr 200px;
  grid-template-areas:
    "champion stats opponent"
    "score score score"
    "actions actions actions";
  gap: 1.5rem;
  padding: 1.5rem;
}

.champion-info {
  grid-area: champion;
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
  grid-area: stats;
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
  grid-area: opponent;
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
  grid-area: actions;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Score Summary Styles */
.score-summary {
  grid-area: score;
  width: 100%;
  margin-top: 0.5rem;
}

.score-loading {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  background: rgba(3, 151, 171, 0.1);
  border: 1px solid rgba(3, 151, 171, 0.3);
  border-radius: 10px;
  color: var(--lol-blue);
  font-size: 0.9rem;
}

.loading-spinner {
  font-size: 1.2rem;
  animation: spin 2s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.score-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.5rem;
  background: rgba(3, 151, 171, 0.08);
  border: 1px solid rgba(3, 151, 171, 0.3);
  border-radius: 10px;
}

.score-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.score-badge {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.score-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--lol-gold);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.score-value {
  font-size: 1.8rem;
  font-weight: 900;
  padding: 0.3rem 1rem;
  border-radius: 8px;
  background: rgba(10, 20, 40, 0.6);
  border: 2px solid;
}

.score-excellent {
  color: #00d4aa;
  border-color: #00d4aa;
  box-shadow: 0 0 15px rgba(0, 212, 170, 0.3);
}

.score-good {
  color: #0ac8b9;
  border-color: #0ac8b9;
  box-shadow: 0 0 15px rgba(10, 200, 185, 0.3);
}

.score-average {
  color: var(--lol-gold);
  border-color: var(--lol-gold);
  box-shadow: 0 0 15px rgba(200, 155, 60, 0.3);
}

.score-poor {
  color: #ff4655;
  border-color: #ff4655;
  box-shadow: 0 0 15px rgba(255, 70, 85, 0.3);
}

.score-summary-text {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.summary-label {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--lol-gold);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0;
}

.summary-content {
  font-size: 0.9rem;
  line-height: 1.6;
  color: var(--lol-gold-light);
  margin: 0;
  text-align: justify;
}

.score-error {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  color: var(--lol-gold-light);
  opacity: 0.7;
  font-size: 0.85rem;
}

.error-icon {
  font-size: 1.2rem;
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
    grid-template-areas:
      "champion"
      "stats"
      "opponent"
      "score"
      "actions";
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

  .score-value {
    font-size: 1.5rem;
  }

  .summary-content {
    font-size: 0.85rem;
    text-align: left;
  }

  .score-badge {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .pagination {
    flex-direction: column;
    gap: 1rem;
  }

  .pagination-info {
    order: -1;
    margin-bottom: 0.5rem;
  }

  .pagination-btn {
    flex: 1;
  }
}

/* Pagination Styles */
.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 2rem;
  padding: 1.5rem;
  background: rgba(10, 20, 40, 0.6);
  border-radius: 15px;
  border: 2px solid rgba(200, 155, 60, 0.2);
}

.pagination-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.8rem 1.5rem;
  background: linear-gradient(135deg, var(--lol-gold), var(--lol-gold-light));
  color: var(--lol-dark);
  border: none;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.pagination-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 20px rgba(200, 155, 60, 0.4);
}

.pagination-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  transform: none;
}

.pagination-btn span:first-child,
.pagination-btn span:last-child {
  font-size: 1.2rem;
}

.pagination-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.3rem;
}

.page-numbers {
  font-size: 1rem;
  font-weight: 700;
  color: var(--lol-gold-light);
}

.current-page {
  color: var(--lol-gold);
  font-size: 1.2rem;
}

.total-pages {
  color: var(--lol-gold);
}

.games-count {
  font-size: 0.85rem;
  color: rgba(240, 230, 210, 0.7);
  font-weight: 600;
}
</style>

<template>
  <section class="section chart-section">
    <div class="content-wrapper">
      <div class="tag">Activity Timeline</div>
      <h2 class="section-title">Your Journey Through the Year</h2>
      <div class="chart-container">
        <canvas ref="chartCanvas"></canvas>
      </div>
      <p class="chart-description">
        Your most active month: <span class="highlight">{{ mostActiveMonth }}</span> with {{ mostActiveGames }} games
      </p>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

const props = defineProps({
  data: {
    type: Object,
    required: true
  }
})

const chartCanvas = ref(null)
let chartInstance = null

const mostActiveMonth = computed(() => {
  const entries = Object.entries(props.data)
  const maxEntry = entries.reduce((max, entry) => entry[1] > max[1] ? entry : max)
  return maxEntry[0]
})

const mostActiveGames = computed(() => {
  return Math.max(...Object.values(props.data))
})

onMounted(() => {
  if (chartCanvas.value) {
    const ctx = chartCanvas.value.getContext('2d')

    const labels = Object.keys(props.data)
    const values = Object.values(props.data)

    chartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Games Played',
          data: values,
          backgroundColor: (context) => {
            const ctx = context.chart.ctx
            const gradient = ctx.createLinearGradient(0, 0, 0, 400)
            gradient.addColorStop(0, 'rgba(200, 155, 60, 0.8)')
            gradient.addColorStop(1, 'rgba(3, 151, 171, 0.3)')
            return gradient
          },
          borderColor: 'rgba(200, 155, 60, 1)',
          borderWidth: 2,
          borderRadius: 10,
          borderSkipped: false,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        aspectRatio: 2,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: 'rgba(10, 20, 40, 0.95)',
            titleColor: '#f0e6d2',
            bodyColor: '#c89b3c',
            borderColor: '#c89b3c',
            borderWidth: 2,
            padding: 12,
            displayColors: false,
            callbacks: {
              label: function(context) {
                return `${context.parsed.y} games played`
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              color: '#f0e6d2',
              font: {
                size: 12,
                weight: '600'
              }
            },
            grid: {
              color: 'rgba(200, 155, 60, 0.1)',
              drawBorder: false
            }
          },
          x: {
            ticks: {
              color: '#c89b3c',
              font: {
                size: 11,
                weight: '600'
              },
              maxRotation: 45,
              minRotation: 45
            },
            grid: {
              display: false,
              drawBorder: false
            }
          }
        },
        animation: {
          duration: 2000,
          easing: 'easeInOutQuart',
          delay: (context) => {
            return context.dataIndex * 100
          }
        }
      }
    })
  }
})
</script>

<style scoped>
.chart-section {
  background: radial-gradient(circle at 50% 30%, rgba(200, 155, 60, 0.03) 0%, transparent 50%);
}

.content-wrapper {
  max-width: 1200px;
  width: 100%;
}

.tag {
  display: inline-block;
  background: linear-gradient(135deg, var(--lol-gold), var(--lol-blue));
  color: white;
  padding: 0.5rem 1.5rem;
  border-radius: 50px;
  font-weight: 700;
  font-size: 0.9rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  margin-bottom: 2rem;
  box-shadow: 0 5px 15px rgba(200, 155, 60, 0.3);
}

.section-title {
  font-size: clamp(2.5rem, 5vw, 4rem);
  font-weight: 900;
  margin-bottom: 3rem;
  background: linear-gradient(135deg, var(--lol-gold), var(--lol-blue));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.chart-container {
  background: linear-gradient(135deg, rgba(30, 35, 40, 0.8), rgba(10, 20, 40, 0.6));
  border: 2px solid rgba(200, 155, 60, 0.2);
  border-radius: 20px;
  padding: 2rem;
  margin-bottom: 2rem;
  backdrop-filter: blur(10px);
}

.chart-description {
  text-align: center;
  font-size: 1.2rem;
  color: var(--lol-gold-light);
}

.highlight {
  color: var(--lol-gold);
  font-weight: 700;
}

@media (max-width: 768px) {
  .chart-container {
    padding: 1rem;
  }
}
</style>

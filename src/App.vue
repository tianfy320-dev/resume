<template>
  <div class="app">
    <header class="header-clay">
      <div class="header-content">
        <div class="logo-container">
          <span class="logo-icon">✨</span>
          <h1 class="logo">简历优化助手</h1>
        </div>
        <p class="subtitle">智能分析，精准匹配，助您脱颖而出</p>
      </div>
    </header>
    
    <main class="main-content">
      <div class="container">
        <div class="layout-grid">
          <div class="left-panel">
            <div class="card">
              <div class="card-title">
                <span class="title-icon">👤</span>
                身份选择
              </div>
              <div class="radio-group">
                <div class="radio-item" :class="{ active: identity === 'fresh' }">
                  <input 
                    type="radio" 
                    id="fresh" 
                    value="fresh" 
                    v-model="identity"
                  />
                  <label for="fresh">应届生</label>
                </div>
                <div class="radio-item" :class="{ active: identity === 'experienced' }">
                  <input 
                    type="radio" 
                    id="experienced" 
                    value="experienced" 
                    v-model="identity"
                  />
                  <label for="experienced">职场人士</label>
                </div>
              </div>
            </div>

            <div class="card">
              <div class="card-title">
                <span class="title-icon">📝</span>
                简历内容
              </div>
              <textarea 
                v-model="resume"
                placeholder="请粘贴您的简历内容...&#10;&#10;建议包含：&#10;• 个人基本信息&#10;• 教育背景&#10;• 工作/实习经历&#10;• 项目经验&#10;• 专业技能"
                rows="10"
              ></textarea>
            </div>

            <div class="card">
              <div class="card-title">
                <span class="title-icon">🎯</span>
                目标岗位JD
              </div>
              <textarea 
                v-model="jobDescription"
                placeholder="请粘贴目标岗位的职位描述...&#10;&#10;建议包含：&#10;• 岗位职责&#10;• 任职要求&#10;• 技能要求&#10;• 加分项"
                rows="8"
              ></textarea>
            </div>

            <button 
              class="btn btn-primary btn-full" 
              @click="handleAnalyze"
              :disabled="!canAnalyze || loading"
            >
              <span v-if="loading" class="loading-dot">分析中</span>
              <span v-else>🚀 开始优化分析</span>
            </button>
          </div>

          <div class="right-panel">
            <div v-if="!hasResult && !loading && !error" class="empty-state">
              <div class="empty-state-icon">📋</div>
              <p class="empty-title">填写左侧信息后点击"开始优化分析"</p>
              <p class="empty-hint">系统将为您生成专业诊断报告</p>
            </div>

            <div v-if="loading" class="loading">
              <div class="loading-spinner"></div>
              <p class="loading-text">正在智能分析中...</p>
            </div>

            <div v-if="error && !loading" class="error-state">
              <div class="error-icon">❌</div>
              <p class="error-title">分析失败</p>
              <p class="error-message">{{ error }}</p>
              <button class="btn btn-primary" @click="clearError">重新尝试</button>
            </div>

            <div v-if="hasResult && !loading && !error" class="result-section">
              <div class="card result-card">
                <div class="section-title">
                  <span class="section-icon">🔍</span>
                  问题诊断
                </div>
                <div class="issue-list">
                  <div 
                    v-for="(item, index) in result.diagnosis" 
                    :key="index"
                    class="issue-item"
                  >
                    <span class="item-icon">💡</span>
                    {{ item.content }}
                  </div>
                </div>
              </div>

              <div class="card result-card">
                <div class="section-title">
                  <span class="section-icon">✨</span>
                  优化后的简历
                </div>
                <div class="resume-content">{{ result.optimizedResume }}</div>
              </div>

              <div class="card result-card">
                <div class="section-title">
                  <span class="section-icon">🎯</span>
                  职位匹配建议
                </div>
                <div class="suggestion-list">
                  <div 
                    v-for="(item, index) in result.matchSuggestions" 
                    :key="index"
                    :class="['suggestion-item', `suggestion-${item.type}`]"
                  >
                    <span class="item-icon">{{ getSuggestionIcon(item.type) }}</span>
                    {{ item.content }}
                  </div>
                </div>
              </div>

              <div class="card result-card">
                <div class="section-title">
                  <span class="section-icon">💬</span>
                  打招呼话术
                </div>
                <div class="greeting-content">
                  <div 
                    v-for="(line, index) in result.greetingMessage.split('\n').filter(line => line.trim())" 
                    :key="index"
                    class="greeting-item"
                  >
                    <span class="item-icon">💭</span>
                    {{ line }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { analyzeResume } from './api/resume.js'

const identity = ref('fresh')
const resume = ref('')
const jobDescription = ref('')
const loading = ref(false)
const result = ref(null)
const error = ref(null)

const canAnalyze = computed(() => {
  return resume.value.trim() && jobDescription.value.trim()
})

const hasResult = computed(() => {
  return result.value !== null
})

function getSuggestionIcon(type) {
  const icons = {
    success: '✅',
    warning: '⚠️',
    info: 'ℹ️',
    error: '❌'
  }
  return icons[type] || '💡'
}

function clearError() {
  error.value = null
}

async function handleAnalyze() {
  if (!canAnalyze.value) return
  
  loading.value = true
  result.value = null
  error.value = null
  
  try {
    result.value = await analyzeResume(identity.value, resume.value, jobDescription.value)
  } catch (err) {
    console.error('分析失败:', err)
    error.value = err.message || '分析过程中出现错误，请稍后重试'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.header-clay {
  background: linear-gradient(145deg, var(--lavender), var(--lavender-dark));
  border-radius: 0 0 32px 32px;
  box-shadow: 
    0 12px 40px rgba(166, 166, 200, 0.25),
    inset 0 -2px 0 rgba(255, 255, 255, 0.5);
  padding: 40px 0;
  margin-bottom: 40px;
  position: relative;
  overflow: hidden;
}

.header-clay::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 60%);
  pointer-events: none;
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px;
  text-align: center;
  position: relative;
  z-index: 1;
}

.logo-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-bottom: 12px;
}

.logo-icon {
  font-size: 40px;
  filter: drop-shadow(4px 4px 8px rgba(166, 166, 200, 0.3));
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

.logo {
  font-size: 36px;
  font-weight: 700;
  background: linear-gradient(135deg, var(--text-primary), var(--baby-blue-dark));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-family: 'Quicksand', sans-serif;
  letter-spacing: -0.5px;
}

.subtitle {
  font-size: 16px;
  color: var(--text-secondary);
  font-weight: 500;
  font-family: 'Quicksand', sans-serif;
}

.main-content {
  flex: 1;
  padding: 0 0 40px 0;
}

.layout-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
}

.left-panel {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.right-panel {
  min-height: 600px;
}

.title-icon {
  font-size: 20px;
  filter: drop-shadow(2px 2px 4px rgba(166, 166, 200, 0.2));
}

.radio-item {
  flex: 1;
  justify-content: center;
}

.radio-item.active {
  background: linear-gradient(145deg, var(--mint-light), var(--mint));
  box-shadow: var(--shadow-pressed);
}

.result-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.result-card {
  animation: slideIn 0.5s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.section-icon {
  font-size: 22px;
  margin-right: 8px;
  filter: drop-shadow(2px 2px 4px rgba(166, 166, 200, 0.2));
}

.item-icon {
  margin-right: 8px;
  font-size: 16px;
}

.empty-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.loading-text {
  margin-top: 20px;
  font-size: 16px;
  color: var(--text-secondary);
  font-weight: 500;
  font-family: 'Quicksand', sans-serif;
}

.error-state {
  text-align: center;
  padding: 60px 40px;
  background: linear-gradient(145deg, #FFE4E1, #FFD5D5);
  border-radius: 24px;
  box-shadow: var(--shadow-soft);
}

.error-icon {
  font-size: 56px;
  margin-bottom: 20px;
  filter: drop-shadow(4px 4px 8px rgba(200, 100, 100, 0.2));
}

.error-title {
  font-size: 20px;
  font-weight: 600;
  color: #C44444;
  margin-bottom: 12px;
}

.error-message {
  font-size: 15px;
  color: #8B4444;
  margin-bottom: 24px;
  line-height: 1.6;
}

.loading-dot::after {
  content: '';
  animation: dots 1.5s infinite;
}

@keyframes dots {
  0%, 20% { content: '.'; }
  40% { content: '..'; }
  60%, 100% { content: '...'; }
}

.greeting-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.greeting-item {
  padding: 12px 16px;
  background: linear-gradient(145deg, var(--baby-blue-light), var(--baby-blue));
  border-radius: 16px;
  box-shadow: var(--shadow-soft);
  line-height: 1.4;
  transition: transform 0.2s ease;
}

.greeting-item:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-pressed);
}

@media (max-width: 1024px) {
  .layout-grid {
    grid-template-columns: 1fr;
  }
  
  .right-panel {
    min-height: auto;
  }
  
  .logo {
    font-size: 28px;
  }
  
  .header-clay {
    padding: 28px 0;
  }
}
</style>

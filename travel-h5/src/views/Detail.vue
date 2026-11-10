<template>
  <div class="page-container">
    <div class="page-header">
      <van-nav-bar
        :title="pageTitle"
        left-text="返回"
        left-arrow
        @click-left="onBack"
        fixed
        placeholder
      />
    </div>

    <div class="page-content">
      <div v-if="isLoading" class="loading-container">
        <van-loading type="spinner" size="48px">正在生成旅游规划...</van-loading>
      </div>

      <div v-else-if="error" class="card error-card">
        <van-empty :description="error">
          <van-button type="primary" size="small" @click="retry">重试</van-button>
        </van-empty>
      </div>

      <template v-else-if="tripData && tripData.success !== false">
        <div class="card overview-card">
          <div class="trip-header">
            <h2>{{ tripData.city }} · {{ tripData.days }}天行程</h2>
            <div class="trip-budget">预算: ¥{{ tripData.totalBudget || formData.budget }}</div>
          </div>
        </div>

        <van-collapse v-model="activeDays" accordion class="trip-collapse">
          <van-collapse-item
            v-for="day in tripData.dailyItinerary"
            :key="day.day"
            :title="`第${day.day}天 · ${day.date}`"
            :name="day.day"
          >
            <div class="day-schedule">
              <div class="schedule-section">
                <div class="section-label morning">上午</div>
                <SpotItem :data="day.morning" />
              </div>
              <div class="schedule-section">
                <div class="section-label afternoon">下午</div>
                <SpotItem :data="day.afternoon" />
              </div>
              <div class="schedule-section">
                <div class="section-label evening">晚上</div>
                <SpotItem :data="day.evening" />
              </div>
            </div>
          </van-collapse-item>
        </van-collapse>

        <div class="card budget-card" v-if="tripData.budgetBreakdown">
          <div class="section-title">预算明细</div>
          <BudgetTable :data="tripData.budgetBreakdown" :total="tripData.totalBudget" />
        </div>

        <div class="card tips-card" v-if="tripData.tips && tripData.tips.length">
          <div class="section-title">温馨提示</div>
          <ul class="tips-list">
            <li v-for="(tip, index) in tripData.tips" :key="index">{{ tip }}</li>
          </ul>
        </div>

        <div class="card warnings-card" v-if="tripData.warnings && tripData.warnings.length">
          <div class="section-title">注意事项</div>
          <ul class="warnings-list">
            <li v-for="(warning, index) in tripData.warnings" :key="index">{{ warning }}</li>
          </ul>
        </div>
      </template>

      <div v-else class="card error-card">
        <van-empty description="暂无规划数据">
          <van-button type="primary" size="small" @click="goHome">去首页</van-button>
        </van-empty>
      </div>
    </div>

    <div class="detail-footer" v-if="tripData && tripData.success !== false">
      <van-button type="primary" size="large" round @click="goToChat" class="primary-button">
        咨询 AI 助手
      </van-button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showToast } from 'vant'
import { post } from '@/utils/request'
import SpotItem from '@/components/SpotItem.vue'
import BudgetTable from '@/components/BudgetTable.vue'

const router = useRouter()
const route = useRoute()

const formData = reactive({
  city: '',
  budget: 0,
  days: 0
})

// 行程数据，存储从API获取的行程规划信息
const tripData = ref(null)
// 加载状态，用于显示加载动画
const isLoading = ref(false)
// 错误信息，用于显示请求失败时的提示
const error = ref('')
// 活跃天数，用于标识当前选中的行程天数
const activeDays = ref([])

// 页面标题，根据城市名称动态生成
const pageTitle = computed(() => {
  if (formData.city) {
    return `${formData.city}行程规划`
  }
  return '行程详情'
})

onMounted(() => {
  formData.city = route.query.city || ''
  formData.budget = Number(route.query.budget) || 0
  formData.days = Number(route.query.days) || 0

  if (formData.city && formData.budget && formData.days) {
    fetchTripData()
  } else {
    const savedParams = localStorage.getItem('tripParams')
    if (savedParams) {
      const params = JSON.parse(savedParams)
      formData.city = params.city
      formData.budget = params.budget
      formData.days = params.days
      fetchTripData()
    } else {
      error.value = '缺少行程参数'
    }
  }
})

const fetchTripData = async () => {
  isLoading.value = true
  error.value = ''

  try {
    const response = await post('/travel/recommend', {
      city: formData.city,
      budget: formData.budget,
      days: formData.days
    })

    if (response && response.success !== false) {
      tripData.value = response
    } else {
      error.value = response.error || '无法获取规划数据'
    }
  } catch (err) {
    error.value = err.message || '请求失败，请重试'
  } finally {
    isLoading.value = false
  }
}

const retry = () => {
  fetchTripData()
}

const goHome = () => {
  router.push('/')
}

const onBack = () => {
  router.back()
}

const goToChat = () => {
  router.push({
    path: '/chat',
    query: { scene: 'detail', city: formData.city }
  })
}
</script>

<style scoped>
.overview-card {
  margin-bottom: 16px;
}

.trip-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.trip-header h2 {
  font-size: 20px;
  color: #323233;
  margin: 0;
}

.trip-budget {
  font-size: 16px;
  color: #ee0a24;
  font-weight: 600;
}

.trip-collapse {
  margin-bottom: 16px;
}

.day-schedule {
  padding: 8px 0;
}

.schedule-section {
  margin-bottom: 16px;
}

.schedule-section:last-child {
  margin-bottom: 0;
}

.section-label {
  font-size: 14px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 4px;
  display: inline-block;
  margin-bottom: 8px;
}

.section-label.morning {
  background: #fff7e6;
  color: #fa8c16;
}

.section-label.afternoon {
  background: #e6f7ff;
  color: #1890ff;
}

.section-label.evening {
  background: #f6ffed;
  color: #52c41a;
}

.budget-card,
.tips-card,
.warnings-card {
  margin-bottom: 16px;
}

.tips-list,
.warnings-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.tips-list li,
.warnings-list li {
  padding: 8px 0;
  color: #666;
  font-size: 14px;
  border-bottom: 1px solid #f5f5f5;
}

.tips-list li:last-child,
.warnings-list li:last-child {
  border-bottom: none;
}

.detail-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 12px 16px;
  background: #fff;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.05);
  max-width: 750px;
  margin: 0 auto;
}

.error-card {
  text-align: center;
  padding: 40px 16px;
}
</style>
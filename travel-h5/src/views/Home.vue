<template>
  <div class="page-container">
    <div class="page-header">
      <van-nav-bar
        title="智能旅游助手"
        fixed
        placeholder
      />
    </div>

    <div class="page-content">
      <van-notice-bar
        text="基于 AI 的智能景点介绍与行程规划系统"
        left-icon="info-o"
        :scrollable="false"
        style="margin-bottom: 16px;"
      />

      <div class="card search-card">
        <div class="section-title">规划你的旅程</div>

        <van-field
          v-model="formData.city"
          label="目的地"
          placeholder="请选择或输入城市"
          readonly
          is-link
          @click="showCityPicker = true"
          :border="false"
          style="background: #f7f8fa; border-radius: 8px; margin-bottom: 12px;"
        />

        <van-field
          v-model.number="formData.budget"
          type="number"
          label="预算(元)"
          placeholder="请输入预算金额"
          :border="false"
          style="background: #f7f8fa; border-radius: 8px; margin-bottom: 12px;"
        />

        <van-field
          v-model.number="formData.days"
          type="digit"
          label="天数"
          placeholder="请输入旅行天数"
          :border="false"
          style="background: #f7f8fa; border-radius: 8px; margin-bottom: 16px;"
        />

        <van-button
          type="primary"
          size="large"
          round
          :loading="isLoading"
          @click="handleRecommend"
          class="primary-button"
        >
          开始规划
        </van-button>
      </div>

      <div class="card quick-actions">
        <div class="section-title">快捷入口</div>
        <van-grid :column-num="2" :gutter="12">
          <van-grid-item @click="goToChat" icon="chat-o" text="AI 对话" />
          <van-grid-item @click="goToProfile" icon="user-o" text="我的" />
        </van-grid>
      </div>

      <div class="card popular-destinations">
        <div class="section-title">热门目的地</div>
        <van-grid :column-num="4" :gutter="8">
          <van-grid-item
            v-for="city in popularCities"
            :key="city"
            @click="quickSelectCity(city)"
          >
            <div class="city-tag" :class="{ active: formData.city === city }">
              {{ city }}
            </div>
          </van-grid-item>
        </van-grid>
      </div>
    </div>
    
    <van-popup v-model:show="showCityPicker" position="bottom" round>
      <van-picker
        title="选择目的地"
        :columns="cityColumns"
        @confirm="onCityConfirm"
        @cancel="showCityPicker = false"
      />
    </van-popup>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showLoadingToast, closeToast } from 'vant'
import { post } from '@/utils/request'

const router = useRouter()

const formData = reactive({
  city: '',
  budget: null,
  days: null
})

const isLoading = ref(false)
const showCityPicker = ref(false)

const popularCities = [
  '北京', '上海', '广州', '深圳',
  '成都', '杭州', '西安', '重庆'
]

const allCities = [
  '北京', '上海', '广州', '深圳', '成都', '杭州', '西安', '重庆',
  '南京', '武汉', '苏州', '长沙', '天津', '郑州', '济南', '青岛',
  '大连', '沈阳', '哈尔滨', '长春', '福州', '厦门', '南昌', '合肥',
  '昆明', '贵阳', '南宁', '桂林', '海口', '三亚', '丽江', '大理',
  '西安', '兰州', '乌鲁木齐', '拉萨', '呼和浩特', '太原', '石家庄'
]

const cityColumns = allCities.map(city => ({ text: city, value: city }))

const quickSelectCity = (city) => {
  formData.city = city
}

const onCityConfirm = ({ selectedOptions }) => {
  formData.city = selectedOptions[0].text
  showCityPicker.value = false
}

const handleRecommend = async () => {
  if (!formData.city) {
    showToast('请选择目的地')
    return
  }
  if (!formData.budget || formData.budget < 100) {
    showToast('预算不能低于100元')
    return
  }
  if (!formData.days || formData.days < 1 || formData.days > 30) {
    showToast('天数必须在1-30天之间')
    return
  }

  isLoading.value = true
  showLoadingToast({ message: '规划中...', forbidClick: true, duration: 0 })

  try {
    localStorage.setItem('tripParams', JSON.stringify({
      city: formData.city,
      budget: formData.budget,
      days: formData.days
    }))

    router.push({
      path: '/detail',
      query: {
        city: formData.city,
        budget: formData.budget,
        days: formData.days
      }
    })
  } catch (error) {
    showToast('规划失败，请重试')
  } finally {
    isLoading.value = false
    closeToast()
  }
}

const goToChat = () => {
  router.push('/chat')
}

const goToProfile = () => {
  router.push('/profile')
}
</script>

<style scoped>
.search-card {
  margin-bottom: 16px;
}

.quick-actions {
  margin-bottom: 16px;
}

.city-tag {
  padding: 8px 12px;
  border-radius: 16px;
  font-size: 14px;
  color: #666;
  background: #f7f8fa;
  transition: all 0.3s;
}

.city-tag.active {
  background: #22c55e;
  color: #fff;
}
</style>
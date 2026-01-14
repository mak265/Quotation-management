<template>
  <q-page padding class="bg-app">
    <div class="row q-col-gutter-md">
      <div class="col-12">
        <q-card class="glass-card header-card">
          <q-card-section class="row items-center justify-between dashboard-hero">
            <div>
              <div class="text-h5 text-weight-bold gradient-text">Coffee Shop Dashboard</div>
              <div class="text-subtitle2 text-grey-8">
                Good {{ timeGreeting }}, Admin! Here's your business overview
              </div>
            </div>

            <div class="row q-gutter-sm">
              <q-btn flat color="primary" icon="refresh" @click="refreshData" round dense>
                <q-tooltip>Refresh Data</q-tooltip>
              </q-btn>
              <q-btn-dropdown color="primary" icon="cloud_download" label="Export" flat dense no-caps>
                <q-list>
                  <q-item clickable v-close-popup @click="openExportDialog">
                    <q-item-section avatar>
                      <q-icon name="filter_alt" color="positive" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>Export Sales Report</q-item-label>
                      <q-item-label caption>Filter by days</q-item-label>
                    </q-item-section>
                  </q-item>

                  <q-item clickable v-close-popup @click="downloadInventoryReport">
                    <q-item-section avatar>
                      <q-icon name="inventory" color="info" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>Export Inventory</q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-btn-dropdown>
              <q-btn color="grey-9" flat icon="logout" label="Logout" no-caps @click="logout" dense />
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-3">
        <q-card class="text-white glass-card metric-card bg-gradient-primary">
          <q-card-section>
            <div class="row items-start justify-between">
              <div>
                <div class="text-subtitle2 text-blue-1">Today's Sales</div>
                <div class="text-h5 text-weight-bold q-mt-sm">{{ formatCurrency(todaySales) }}</div>
              </div>
              <q-icon name="payments" size="20px" class="opacity-50" />
            </div>
            <div class="text-caption q-mt-md text-blue-1">
              <q-icon :name="salesComparison >= 0 ? 'trending_up' : 'trending_down'" />
              {{ salesComparison > 0 ? '+' : '' }}{{ salesComparison }}% vs yesterday
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-3">
        <q-card class="text-white glass-card metric-card bg-gradient-success">
          <q-card-section>
            <div class="row items-start justify-between">
              <div>
                <div class="text-subtitle2 text-green-1">Orders Today</div>
                <div class="text-h5 text-weight-bold q-mt-sm">{{ todayOrders }}</div>
              </div>
              <q-icon name="shopping_bag" size="20px" class="opacity-50" />
            </div>
            <div class="text-caption q-mt-md text-green-1">
              Avg. {{ formatCurrency(averageOrderValue) }} per order
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-3">
        <q-card class="text-white glass-card metric-card bg-gradient-warning">
          <q-card-section>
            <div class="row items-start justify-between">
              <div>
                <div class="text-subtitle2 text-orange-1">Low Stock Items</div>
                <div class="text-h5 text-weight-bold q-mt-sm">{{ lowStockItems }}</div>
              </div>
              <q-icon name="inventory_2" size="20px" class="opacity-50" />
            </div>
            <div class="text-caption q-mt-md text-orange-1">
              {{ criticalStockItems }} items critical
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-3">
        <q-card class="text-white glass-card metric-card bg-gradient-info">
          <q-card-section>
            <div class="row items-start justify-between">
              <div>
                <div class="text-subtitle2 text-cyan-1">Active Tables</div>
                <div class="text-h5 text-weight-bold q-mt-sm">{{ activeTables }}</div>
              </div>
              <q-icon name="table_restaurant" size="20px" class="opacity-50" />
            </div>
            <div class="text-caption q-mt-md text-cyan-1">
              {{ occupiedTables }} of {{ totalTables }} occupied
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-8">
        <q-card class="glass-card chart-card">
          <q-card-section>
            <div class="row items-center justify-between">
              <div>
                <div class="text-h6 text-weight-bold">Sales Performance</div>
                <div class="text-caption text-grey-7">
                  {{ selectedPeriod.label }} performance metrics
                </div>
              </div>

              <div class="row items-center q-gutter-sm">
                <q-btn-group unelevated class="period-selector">
                  <q-btn
                    v-for="period in timePeriods"
                    :key="period.value"
                    :label="period.label"
                    :color="selectedPeriod.value === period.value ? 'primary' : 'grey-2'"
                    :text-color="selectedPeriod.value === period.value ? 'white' : 'grey-8'"
                    @click="changePeriod(period)"
                    size="sm"
                    padding="xs md"
                  />
                </q-btn-group>

                <q-btn-dropdown
                  :label="chartTypes.find((t) => t.value === chartType).label"
                  flat
                  dense
                  no-caps
                  size="sm"
                  color="grey-8"
                >
                  <q-list>
                    <q-item
                      v-for="type in chartTypes"
                      :key="type.value"
                      clickable
                      v-close-popup
                      @click="chartType = type.value"
                    >
                      <q-item-section avatar>
                        <q-icon :name="type.icon" size="xs" />
                      </q-item-section>
                      <q-item-section>{{ type.label }}</q-item-section>
                    </q-item>
                  </q-list>
                </q-btn-dropdown>
              </div>
            </div>
          </q-card-section>

          <q-separator color="grey-2" />

          <q-card-section>
            <div class="row q-col-gutter-sm q-mb-md justify-center">
              <div class="col-6 col-md-3">
                <div class="text-center q-pa-sm bg-grey-1 rounded-borders">
                  <div class="text-subtitle1 text-primary text-weight-bolder">
                    {{ formatCurrency(periodStats.totalSales) }}
                  </div>
                  <div class="text-caption text-grey-7" style="font-size: 0.7rem; line-height: 1;">
                    Sales
                  </div>
                </div>
              </div>

              <div class="col-6 col-md-3">
                <div class="text-center q-pa-sm bg-grey-1 rounded-borders">
                  <div class="text-subtitle1 text-primary text-weight-bolder">
                    {{ periodStats.totalOrders }}
                  </div>
                  <div class="text-caption text-grey-7" style="font-size: 0.7rem; line-height: 1;">
                    Orders
                  </div>
                </div>
              </div>

              <div class="col-6 col-md-3">
                <div class="text-center q-pa-sm bg-grey-1 rounded-borders">
                  <div class="text-subtitle1 text-primary text-weight-bolder">
                    {{ formatCurrency(periodStats.avgOrderValue, true) }}
                  </div>
                  <div class="text-caption text-grey-7" style="font-size: 0.7rem; line-height: 1;">
                    Avg. Value
                  </div>
                </div>
              </div>

              <div class="col-6 col-md-3">
                <div class="text-center q-pa-sm bg-grey-1 rounded-borders">
                  <div class="text-subtitle1 text-positive text-weight-bolder">
                    {{ periodStats.growth >= 0 ? '+' : '' }}{{ periodStats.growth }}%
                  </div>
                  <div class="text-caption text-grey-7" style="font-size: 0.7rem; line-height: 1;">
                    Growth
                  </div>
                </div>
              </div>
            </div>

            <div style="height: 300px" class="q-px-sm">
              <div v-if="chartType === 'bar'" style="height: 100%">
                <div class="row items-end" style="height: 85%">
                  <div
                    v-for="(data, index) in chartData"
                    :key="index"
                    class="col text-center"
                    style="height: 100%"
                  >
                    <div class="flex column items-center justify-end" style="height: 100%">
                      <div
                        class="chart-bar q-mx-xs shadow-1"
                        :style="{
                          height: `${getChartBarHeight(data.amount)}%`,
                          width: '60%',
                          'background': isLastBar(index) ? 'linear-gradient(to top, #1976D2, #64B5F6)' : '#E3F2FD',
                          'border-radius': '8px 8px 0 0'
                        }"
                        @mouseenter="hoveredData = data"
                        @mouseleave="hoveredData = null"
                      >
                        <q-tooltip
                          v-if="hoveredData === data"
                          anchor="top middle"
                          self="bottom middle"
                          class="bg-grey-9 text-subtitle2"
                        >
                          <div class="text-bold">{{ data.label }}</div>
                          <div>Sales: {{ formatCurrency(data.amount) }}</div>
                          <div>Orders: {{ data.orders }}</div>
                        </q-tooltip>
                      </div>
                      <div class="text-caption text-grey-6 q-mt-sm">{{ data.label }}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div v-if="chartType === 'line'" style="height: 100%">
                <div class="relative-position" style="height: 100%">
                  <div class="absolute-full column justify-between">
                    <q-separator v-for="n in 5" :key="n" color="grey-2" />
                  </div>

                  <div class="absolute" style="left: 0; top: 0; bottom: 0; width: 50px">
                    <div
                      v-for="(label, index) in yAxisLabels"
                      :key="index"
                      class="absolute text-caption text-grey-5"
                      :style="{ top: `${index * 25}%` }"
                    >
                      {{ formatCurrency(label, true) }}
                    </div>
                  </div>

                  <div class="absolute" style="left: 60px; right: 0; top: 0; bottom: 0">
                    <svg width="100%" height="100%" style="overflow: visible">
                      <path
                        :d="getLinePath()"
                        fill="none"
                        stroke="#1976D2"
                        stroke-width="3"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        class="chart-path"
                      />
                      <circle
                        v-for="(point, index) in lineChartPoints"
                        :key="index"
                        :cx="point.x"
                        :cy="point.y"
                        r="5"
                        fill="white"
                        stroke="#1976D2"
                        stroke-width="2.5"
                        @mouseenter="hoveredData = chartData[index]"
                        @mouseleave="hoveredData = null"
                        style="cursor: pointer"
                      />
                    </svg>
                  </div>

                  <div class="absolute" style="left: 60px; right: 0; bottom: 0">
                    <div class="row">
                      <div v-for="(data, index) in chartData" :key="index" class="col text-center">
                        <div class="text-caption text-grey-6">{{ data.label }}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div v-if="chartType === 'area'" style="height: 100%">
                <div class="relative-position" style="height: 100%">
                  <div class="absolute-full column justify-between">
                    <q-separator v-for="n in 5" :key="n" color="grey-2" />
                  </div>

                  <div class="absolute" style="left: 0; top: 0; bottom: 0; width: 50px">
                    <div
                      v-for="(label, index) in yAxisLabels"
                      :key="index"
                      class="absolute text-caption text-grey-5"
                      :style="{ top: `${index * 25}%` }"
                    >
                      {{ formatCurrency(label, true) }}
                    </div>
                  </div>

                  <div class="absolute" style="left: 60px; right: 0; top: 0; bottom: 0">
                    <svg width="100%" height="100%" style="overflow: visible">
                      <defs>
                        <linearGradient id="areaGradient" x1="0" x2="0" y1="0" y2="1">
                          <stop offset="0%" stop-color="#1976D2" stop-opacity="0.3" />
                          <stop offset="100%" stop-color="#1976D2" stop-opacity="0" />
                        </linearGradient>
                      </defs>
                      <path
                        :d="getAreaPath()"
                        fill="url(#areaGradient)"
                        stroke="#1976D2"
                        stroke-width="2"
                        class="chart-area"
                      />
                      <circle
                        v-for="(point, index) in lineChartPoints"
                        :key="index"
                        :cx="point.x"
                        :cy="point.y"
                        r="4"
                        fill="#1976D2"
                        stroke="white"
                        stroke-width="2"
                      />
                    </svg>
                  </div>

                  <div class="absolute" style="left: 60px; right: 0; bottom: 0">
                    <div class="row">
                      <div v-for="(data, index) in chartData" :key="index" class="col text-center">
                        <div class="text-caption text-grey-6">{{ data.label }}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </q-card-section>

          <q-card-actions align="right" class="q-pa-md">
            <q-btn
              flat
              color="primary"
              label="Detailed Analytics"
              icon-right="arrow_forward"
              to="/analytics"
              no-caps
            />
          </q-card-actions>
        </q-card>
      </div>

      <div class="col-12 col-md-4">
        <q-card class="glass-card full-height">
          <q-card-section>
            <div class="text-h6 text-weight-bold">Recent Orders</div>
            <div class="text-caption text-grey-7">Last 5 transactions</div>
          </q-card-section>

          <q-list separator>
            <q-item v-for="order in recentOrders" :key="order.id" class="q-py-md">
              <q-item-section avatar>
                 <q-avatar color="blue-1" text-color="primary" icon="receipt_long" />
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-weight-bold">Order #{{ order.id }}</q-item-label>
                <q-item-label caption>
                  {{ formatTime(order.createdAt || order.time || order.date) }} • {{ order.itemCount || (Array.isArray(order.items) ? order.items.length : 0) }} items
                </q-item-label>
              </q-item-section>

              <q-item-section side>
                <div class="text-right">
                  <div class="text-subtitle2 text-weight-bold">{{ formatCurrency(orderTotal(order)) }}</div>
                  <q-badge :color="getOrderStatusColor(order.status)" :label="order.status" outline class="q-mt-xs" />
                </div>
              </q-item-section>
            </q-item>
          </q-list>

          <q-card-actions align="center" class="q-pa-md">
            <q-btn outline color="primary" label="View All Orders" to="/orders" class="full-width" no-caps />
          </q-card-actions>
        </q-card>
      </div>
    </div>

    <q-dialog v-model="showExportDialog">
      <q-card style="min-width: 350px" class="glass-card">
        <q-card-section>
          <div class="text-h6">Export Sales Report</div>
          <div class="text-caption text-grey-7">Select date range for export</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-date v-model="exportDateRange" range flat bordered class="full-width" />

          <div class="q-mt-md">
            <div class="text-subtitle2 q-mb-xs">Export Format</div>
            <q-option-group
              v-model="exportFormat"
              :options="formatOptions"
              color="primary"
              inline
            />
          </div>

          <div class="q-mt-md">
            <div class="text-subtitle2 q-mb-xs">Include Data</div>
            <div class="column">
              <q-checkbox v-model="includeDetails" label="Order Details" dense />
              <q-checkbox v-model="includeInventory" label="Inventory Levels" dense />
              <q-checkbox v-model="includeAnalytics" label="Sales Analytics" dense />
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md bg-grey-1">
          <q-btn flat label="Cancel" color="grey-8" v-close-popup no-caps />
          <q-btn
            unelevated
            label="Export Report"
            color="primary"
            icon="download"
            @click="executeExportCSV"
            no-caps
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { signOut } from 'firebase/auth'
import { auth } from 'src/services/firebase'
import { useOrderStore } from 'src/stores/orderStore'
import { useProductStore } from 'src/stores/productStore'

const selectedPeriod = ref({ label: '7 Days', value: '7days', type: 'daily', days: 7 })
const chartType = ref('bar')
const hoveredData = ref(null)

const timePeriods = ref([
  { label: '7 Days', value: '7days', type: 'daily', days: 7 },
  { label: 'Monthly', value: 'monthly', type: 'monthly', months: 12 },
  { label: 'Yearly', value: 'yearly', type: 'yearly', years: 5 },
])

const chartTypes = ref([
  { label: 'Bar', value: 'bar', icon: 'bar_chart' },
  { label: 'Line', value: 'line', icon: 'show_chart' },
  { label: 'Area', value: 'area', icon: 'area_chart' },
])

const orderStore = useOrderStore()
const productStore = useProductStore()
const todaySales = ref(0)
const todayOrders = ref(0)
const lowStockItems = ref(0)
const criticalStockItems = ref(0)
const activeTables = ref(0)
const occupiedTables = ref(0)
const totalTables = ref(0)

const recentOrders = computed(() => {
  const list = orderStore.orders || []
  return [...list]
    .sort((a, b) => {
      const da = getDateFromOrder(a)
      const db = getDateFromOrder(b)
      return db - da
    })
    .slice(0, 5)
})

const showExportDialog = ref(false)
const exportDateRange = ref({ from: '2024-01-01', to: '2024-01-07' })
const exportFormat = ref('csv')
const includeDetails = ref(true)
const includeInventory = ref(false)
const includeAnalytics = ref(true)
const formatOptions = [
  { label: 'CSV', value: 'csv' },
  { label: 'Excel', value: 'excel' },
  { label: 'PDF', value: 'pdf' },
]

const chartData = ref([])
const previousPeriodData = ref([])

const timeGreeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Morning'
  if (hour < 18) return 'Afternoon'
  return 'Evening'
})

const salesComparison = computed(() => {
  const len = chartData.value.length
  if (len < 2) return 0
  const last = chartData.value[len - 1]?.amount || 0
  const prev = chartData.value[len - 2]?.amount || 0
  const change = prev > 0 ? ((last - prev) / prev) * 100 : 0
  return Math.round(change * 10) / 10
})

const averageOrderValue = computed(() => {
  return todayOrders.value > 0 ? todaySales.value / todayOrders.value : 0
})

const periodStats = computed(() => {
  const totalSales = chartData.value.reduce((sum, item) => sum + item.amount, 0)
  const totalOrders = chartData.value.reduce((sum, item) => sum + item.orders, 0)
  const avgOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0
  const prevTotalSales = previousPeriodData.value.reduce((sum, item) => sum + item.amount, 0)
  const growth = prevTotalSales > 0 ? ((totalSales - prevTotalSales) / prevTotalSales) * 100 : 0

  return {
    totalSales,
    totalOrders,
    avgOrderValue: Math.round(avgOrderValue * 100) / 100,
    growth: Math.round(growth * 10) / 10,
  }
})

const yAxisLabels = computed(() => {
  if (chartData.value.length === 0) return []

  const maxAmount = Math.max(...chartData.value.map((d) => d.amount), 100)
  const minAmount = 0

  const range = maxAmount - minAmount
  const step = range / 4

  return [
    Math.ceil(maxAmount),
    Math.ceil(maxAmount - step),
    Math.ceil(maxAmount - step * 2),
    Math.ceil(maxAmount - step * 3),
    0,
  ]
})

const lineChartPoints = computed(() => {
  if (chartData.value.length === 0) return []

  const maxAmount = Math.max(...chartData.value.map((d) => d.amount), 10)
  const minAmount = 0
  const range = maxAmount - minAmount

  const containerWidth = 100
  const pointSpacing = containerWidth / (chartData.value.length - 1 || 1)

  return chartData.value.map((item, index) => {
    const x = index * pointSpacing
    const y = 100 - ((item.amount - minAmount) / range) * 100
    return { x: `${x}%`, y: `${y}%` }
  })
})

const changePeriod = (period) => {
  selectedPeriod.value = period
  loadChartData()
}

const getDateFromOrder = (o) => {
  if (o.createdAt && typeof o.createdAt.toDate === 'function') {
    return o.createdAt.toDate()
  } else if (o.date) {
    return new Date(o.date)
  }
  return new Date()
}

const loadChartData = () => {
  const period = timePeriods.value.find((p) => p.value === selectedPeriod.value.value)
  const orders = orderStore.orders || []

  if (period.type === 'daily') {
    chartData.value = buildDailyData(orders, period.days, 0)
    previousPeriodData.value = buildDailyData(orders, period.days, period.days)
  } else if (period.type === 'monthly') {
    chartData.value = buildMonthlyData(orders, period.months)
    previousPeriodData.value = []
  } else if (period.type === 'yearly') {
    chartData.value = buildYearlyData(orders, period.years)
    previousPeriodData.value = []
  }
}

const buildDailyData = (orders, days, offsetDays) => {
  const data = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const start = new Date(today)
  start.setDate(today.getDate() - (days + offsetDays - 1))

  for (let i = 0; i < days; i++) {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    const label = days <= 7
        ? d.toLocaleDateString('en-US', { weekday: 'short' })
        : `${d.getMonth() + 1}/${d.getDate()}`
    data.push({ date: d, label, amount: 0, orders: 0, sortKey: d.getTime() })
  }

  orders.forEach((o) => {
    const orderDate = getDateFromOrder(o)
    const diffTime = orderDate - start
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays >= 0 && diffDays < days) {
      data[diffDays].amount += Number(o.total || o.totalAmount || 0)
      data[diffDays].orders += 1
    }
  })

  return data.map((x) => ({ ...x, amount: Math.round(x.amount * 100) / 100 }))
}

const buildMonthlyData = (orders, months) => {
    const data = []
    const today = new Date()

    for (let i = months - 1; i >= 0; i--) {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1)
        const monthLabel = d.toLocaleString('default', { month: 'short' })
        const key = `${d.getFullYear()}-${d.getMonth()}`

        data.push({
            label: monthLabel,
            key: key,
            amount: 0,
            orders: 0
        })
    }

    orders.forEach(o => {
        const date = getDateFromOrder(o)
        const key = `${date.getFullYear()}-${date.getMonth()}`
        const bucket = data.find(b => b.key === key)
        if (bucket) {
            bucket.amount += Number(o.total || o.totalAmount || 0)
            bucket.orders += 1
        }
    })

    return data.map((x) => ({ ...x, amount: Math.round(x.amount * 100) / 100 }))
}

const buildYearlyData = (orders, years) => {
    const data = []
    const currentYear = new Date().getFullYear()

    for (let i = years - 1; i >= 0; i--) {
        const year = currentYear - i
        data.push({
            label: year.toString(),
            key: year,
            amount: 0,
            orders: 0
        })
    }

    orders.forEach(o => {
        const date = getDateFromOrder(o)
        const year = date.getFullYear()
        const bucket = data.find(b => b.key === year)
        if (bucket) {
            bucket.amount += Number(o.total || o.totalAmount || 0)
            bucket.orders += 1
        }
    })

    return data.map((x) => ({ ...x, amount: Math.round(x.amount * 100) / 100 }))
}

const getChartBarHeight = (amount) => {
  if (chartData.value.length === 0) return 0
  const maxAmount = Math.max(...chartData.value.map((d) => d.amount), 1)
  return Math.max((amount / maxAmount) * 80, 5)
}

const getLinePath = () => {
  if (lineChartPoints.value.length === 0) return ''
  const points = lineChartPoints.value
  let path = `M ${points[0].x} ${points[0].y}`
  for (let i = 1; i < points.length; i++) {
    path += ` L ${points[i].x} ${points[i].y}`
  }
  return path
}

const getAreaPath = () => {
  if (lineChartPoints.value.length === 0) return ''
  const points = lineChartPoints.value
  let path = `M ${points[0].x} ${points[0].y}`
  for (let i = 1; i < points.length; i++) {
    path += ` L ${points[i].x} ${points[i].y}`
  }
  path += ` L ${points[points.length - 1].x} 100`
  path += ` L ${points[0].x} 100`
  path += ' Z'
  return path
}

const isLastBar = (index) => {
  return index === chartData.value.length - 1
}

const formatCurrency = (amount, compact = false) => {
  if (isNaN(amount)) return '₱0.00'
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: compact ? 0 : 2,
    maximumFractionDigits: 2,
    notation: compact ? 'compact' : 'standard'
  }).format(amount)
}

const formatTime = (dateInput) => {
  if (!dateInput) return ''
  const date =
    dateInput && typeof dateInput.toDate === 'function' ? dateInput.toDate() : new Date(dateInput)

  return date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })
}

const getOrderStatusColor = (status) => {
  const colors = {
    Completed: 'positive',
    Preparing: 'warning',
    Pending: 'info',
    Cancelled: 'negative',
  }
  return colors[status] || 'grey'
}

const orderTotal = (order) => {
  const t = order.totalAmount ?? order.total
  if (typeof t === 'number') return t
  const items = Array.isArray(order.items) ? order.items : []
  const subtotal = items.reduce((s, i) => s + Number(i.unitPrice ?? i.price ?? i.productPrice ?? 0) * Number(i.quantity ?? 1), 0)
  const tax = Number(order.taxAmount ?? 0)
  const discount = Number(order.discountAmount ?? 0)
  return subtotal + tax - discount
}

const refreshData = async () => {
  await orderStore.fetchOrders()
  loadChartData()
}

const openExportDialog = () => {
  showExportDialog.value = true
}
const executeExportCSV = () => {
  showExportDialog.value = false
}
const downloadInventoryReport = () => {}

const router = useRouter()
const logout = async () => {
  try {
    await signOut(auth)
    router.push('/login')
  } catch (error) {
    console.error('Logout error', error)
  }
}

onMounted(async () => {
  await Promise.all([orderStore.fetchOrders(), productStore.fetchProducts()])

  const orders = orderStore.orders || []
  todayOrders.value = orders.length
  todaySales.value = orders.reduce((s, o) => s + Number(o.total || o.totalAmount || 0), 0)
  lowStockItems.value = productStore.products.filter((p) => (p.stock ?? 0) <= 5).length

  loadChartData()
})
</script>

<style scoped>
.glass-card {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.6);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  border-radius: 16px;
  transition: all 0.3s ease;
}

.glass-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12);
}

.metric-card {
  overflow: hidden;
  position: relative;
}

.metric-card .q-card__section {
    position: relative;
    z-index: 2;
}

.bg-gradient-primary {
  background: linear-gradient(135deg, #1976d2 0%, #0d47a1 100%);
}

.bg-gradient-success {
  background: linear-gradient(135deg, #26a69a 0%, #00695c 100%);
}

.bg-gradient-warning {
  background: linear-gradient(135deg, #f2c037 0%, #e65100 100%);
}

.bg-gradient-info {
  background: linear-gradient(135deg, #26c6da 0%, #0097a7 100%);
}

.opacity-50 {
  opacity: 0.5;
}

.gradient-text {
  background: linear-gradient(45deg, #1976d2, #26a69a);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.rounded-borders {
  border-radius: 12px;
}

.chart-bar {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.chart-bar:hover {
  opacity: 0.8;
  transform: scaleY(1.02);
}

.chart-path {
  animation: draw 1.5s ease-out forwards;
}

.chart-area {
  animation: fadeIn 1.5s ease-out forwards;
}

@keyframes draw {
  from { stroke-dasharray: 1000; stroke-dashoffset: 1000; }
  to { stroke-dashoffset: 0; }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>

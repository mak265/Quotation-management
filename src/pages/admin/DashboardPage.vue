<template>
  <q-page padding>
    <div class="row q-col-gutter-md">
      <div class="col-12">
        <q-card>
          <q-card-section class="row items-center justify-between">
            <div>
              <div class="text-h5">Welcome to FAMS Cloud Dashboard</div>
              <div class="text-subtitle2 text-grey-7">
                Get insights into your business operations
              </div>
            </div>

            <q-btn-dropdown color="primary" icon="cloud_download" label="Export" outline>
              <q-list>
                <q-item clickable v-close-popup @click="openExportDialog">
                  <q-item-section avatar>
                    <q-icon name="filter_alt" color="positive" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>Export Data (CSV)</q-item-label>
                    <q-item-label caption>Filter by days</q-item-label>
                  </q-item-section>
                </q-item>

                <q-item clickable v-close-popup @click="downloadChartImage">
                  <q-item-section avatar>
                    <q-icon name="image" color="info" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>Save Chart (PNG)</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-btn-dropdown>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-3">
        <q-card class="bg-primary text-white">
          <q-card-section>
            <div class="row items-center">
              <div class="col">
                <div class="text-h4">{{ totalOrders }}</div>
                <div class="text-subtitle2">Total Orders</div>
              </div>
              <div class="col-auto"><q-icon name="shopping_cart" size="48px" /></div>
            </div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-md-3">
        <q-card class="bg-positive text-white">
          <q-card-section>
            <div class="row items-center">
              <div class="col">
                <div class="text-h4">{{ totalRevenue }}</div>
                <div class="text-subtitle2">Total Revenue</div>
              </div>
              <div class="col-auto"><q-icon name="attach_money" size="48px" /></div>
            </div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-md-3">
        <q-card class="bg-warning text-white">
          <q-card-section>
            <div class="row items-center">
              <div class="col">
                <div class="text-h4">{{ lowStockItems }}</div>
                <div class="text-subtitle2">Low Stock Items</div>
              </div>
              <div class="col-auto"><q-icon name="warning" size="48px" /></div>
            </div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-md-3">
        <q-card class="bg-info text-white">
          <q-card-section>
            <div class="row items-center">
              <div class="col">
                <div class="text-h4">{{ pendingOrders }}</div>
                <div class="text-subtitle2">Pending Orders</div>
              </div>
              <div class="col-auto"><q-icon name="pending" size="48px" /></div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-8">
        <q-card>
          <q-card-section>
            <div class="text-h6">Recent Orders</div>
            <div class="text-subtitle2 text-grey-7">Last 7 days</div>
          </q-card-section>
          <q-card-section class="bg-white">
            <canvas id="ordersChart" width="400" height="200"></canvas>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-4">
        <q-card>
          <q-card-section>
            <div class="text-h6">Quick Actions</div>
          </q-card-section>
          <q-list>
            <q-item clickable to="/inventory">
              <q-item-section avatar><q-icon name="inventory" color="primary" /></q-item-section>
              <q-item-section>
                <q-item-label>Manage Inventory</q-item-label>
              </q-item-section>
            </q-item>
            <q-item clickable to="/ordering">
              <q-item-section avatar
                ><q-icon name="shopping_cart" color="positive"
              /></q-item-section>
              <q-item-section>
                <q-item-label>Process Orders</q-item-label>
              </q-item-section>
            </q-item>
            <q-item clickable>
              <q-item-section avatar><q-icon name="assessment" color="warning" /></q-item-section>
              <q-item-section>
                <q-item-label>Generate Reports</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card>
      </div>
    </div>

    <q-dialog v-model="showExportDialog">
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">Export Options</div>
          <div class="text-caption">Select days to include in CSV</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <div class="q-gutter-sm">
            <q-checkbox v-model="selectAll" label="Select All" @update:model-value="toggleAll" />
          </div>

          <q-separator class="q-my-sm" />

          <q-option-group
            v-model="selectedExportDays"
            :options="dayOptions"
            color="primary"
            type="checkbox"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="primary" v-close-popup />
          <q-btn
            unelevated
            label="Download CSV"
            color="primary"
            icon="download"
            @click="executeExportCSV"
            :disable="selectedExportDays.length === 0"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { exportFile, useQuasar } from 'quasar'

const $q = useQuasar()

// --- Data ---
const totalOrders = ref(156)
const totalRevenue = ref('$24,350')
const lowStockItems = ref(12)
const pendingOrders = ref(8)

const chartData = {
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  datasets: [
    {
      label: 'Orders',
      data: [12, 19, 15, 25, 22, 30, 18],
      backgroundColor: 'rgba(33, 150, 243, 0.2)',
      borderColor: 'rgba(33, 150, 243, 1)',
    },
  ],
}

// --- Export Filter State ---
const showExportDialog = ref(false)
const selectedExportDays = ref([])
const selectAll = ref(true)

// Create checkbox options from chart labels
const dayOptions = chartData.labels.map((day) => ({
  label: day,
  value: day,
}))

// --- Methods ---

const openExportDialog = () => {
  // Reset to select all by default when opening
  selectedExportDays.value = [...chartData.labels]
  selectAll.value = true
  showExportDialog.value = true
}

const toggleAll = (val) => {
  if (val) {
    selectedExportDays.value = [...chartData.labels]
  } else {
    selectedExportDays.value = []
  }
}

const executeExportCSV = () => {
  // 1. Filter Data based on selection
  const indicesToInclude = []
  chartData.labels.forEach((day, index) => {
    if (selectedExportDays.value.includes(day)) {
      indicesToInclude.push(index)
    }
  })

  // Calculate stats specific to the selected filtered data
  let filteredOrderCount = 0
  const rows = []

  indicesToInclude.forEach((index) => {
    const day = chartData.labels[index]
    const val = chartData.datasets[0].data[index]
    filteredOrderCount += val
    rows.push(`${day},${val}`)
  })

  // 2. Build CSV Content
  let content = `Report Generated,${new Date().toLocaleDateString()}\n`
  content += `Filter Applied,${selectedExportDays.value.join(' | ')}\n\n`

  content += `SELECTED PERIOD STATISTICS\n`
  content += `Total Orders (Filtered),${filteredOrderCount}\n`
  // Note: Revenue is estimated here as we don't have per-day revenue in the simple chart data
  content += `Global Pending Orders,${pendingOrders.value}\n\n`

  content += `DAILY BREAKDOWN\n`
  content += `Day,Orders Count\n`
  content += rows.join('\n')

  // 3. Download
  const status = exportFile('fams-filtered-report.csv', content, 'text/csv')

  if (!status) {
    $q.notify({ message: 'Browser denied download...', color: 'negative' })
  } else {
    $q.notify({ message: 'Export successful', color: 'positive', icon: 'check' })
    showExportDialog.value = false
  }
}

const downloadChartImage = () => {
  const canvas = document.getElementById('ordersChart')
  if (!canvas) return

  const link = document.createElement('a')
  link.download = `fams-chart-${Date.now()}.png`
  link.href = canvas.toDataURL('image/png')
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// --- Chart Rendering (Same as before) ---
onMounted(() => {
  const canvas = document.getElementById('ordersChart')
  if (canvas) {
    const ctx = canvas.getContext('2d')
    const width = canvas.width
    const height = canvas.height
    const padding = 40
    const data = chartData.datasets[0].data
    const maxValue = Math.max(...data)

    ctx.clearRect(0, 0, width, height)
    ctx.fillStyle = 'white' // White bg for export
    ctx.fillRect(0, 0, width, height)

    ctx.strokeStyle = '#e0e0e0'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(padding, padding)
    ctx.lineTo(padding, height - padding)
    ctx.lineTo(width - padding, height - padding)
    ctx.stroke()

    ctx.strokeStyle = chartData.datasets[0].borderColor
    ctx.lineWidth = 2
    ctx.beginPath()

    data.forEach((value, index) => {
      const x = padding + (index * (width - 2 * padding)) / (data.length - 1)
      const y = height - padding - (value / maxValue) * (height - 2 * padding)
      if (index === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    })
    ctx.stroke()

    // Points and Labels
    data.forEach((value, index) => {
      const x = padding + (index * (width - 2 * padding)) / (data.length - 1)
      const y = height - padding - (value / maxValue) * (height - 2 * padding)
      ctx.fillStyle = chartData.datasets[0].borderColor
      ctx.beginPath()
      ctx.arc(x, y, 4, 0, 2 * Math.PI)
      ctx.fill()
    })

    ctx.fillStyle = '#666'
    ctx.font = '12px Arial'
    ctx.textAlign = 'center'
    chartData.labels.forEach((label, index) => {
      const x = padding + (index * (width - 2 * padding)) / (data.length - 1)
      ctx.fillText(label, x, height - padding + 20)
    })
  }
})
</script>

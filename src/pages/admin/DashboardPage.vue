<template>
  <!-- Template remains exactly the same -->
  <q-page padding>
    <div class="row q-col-gutter-md">
      <!-- Header -->
      <div class="col-12">
        <q-card>
          <q-card-section class="row items-center justify-between">
            <div>
              <div class="text-h5">Coffee Shop Dashboard</div>
              <div class="text-subtitle2 text-grey-7">
                Good {{ timeGreeting }}, Admin! Here's your business overview
              </div>
            </div>

            <div class="row q-gutter-sm">
              <q-btn color="primary" icon="refresh" @click="refreshData" round>
                <q-tooltip>Refresh Data</q-tooltip>
              </q-btn>
              <q-btn-dropdown color="primary" icon="cloud_download" label="Export" outline>
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
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Key Metrics -->
      <div class="col-12 col-md-3">
        <q-card class="bg-primary text-white">
          <q-card-section>
            <div class="row items-center">
              <div class="col">
                <div class="text-h4">{{ formatCurrency(todaySales) }}</div>
                <div class="text-subtitle2">Today's Sales</div>
              </div>
              <div class="col-auto"><q-icon name="attach_money" size="48px" /></div>
            </div>
            <q-linear-progress 
              :value="salesProgress" 
              color="white" 
              class="q-mt-sm"
              size="10px"
            />
            <div class="text-caption q-mt-xs">
              {{ salesComparison > 0 ? '+' : '' }}{{ salesComparison }}% vs yesterday
            </div>
          </q-card-section>
        </q-card>
      </div>
      
      <div class="col-12 col-md-3">
        <q-card class="bg-positive text-white">
          <q-card-section>
            <div class="row items-center">
              <div class="col">
                <div class="text-h4">{{ todayOrders }}</div>
                <div class="text-subtitle2">Orders Today</div>
              </div>
              <div class="col-auto"><q-icon name="shopping_cart" size="48px" /></div>
            </div>
            <q-linear-progress 
              :value="ordersProgress" 
              color="white" 
              class="q-mt-sm"
              size="10px"
            />
            <div class="text-caption q-mt-xs">
              Avg. {{ formatCurrency(averageOrderValue) }} per order
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
            <div class="text-caption q-mt-xs">
              {{ criticalStockItems }} items critical
            </div>
          </q-card-section>
        </q-card>
      </div>
      
      <div class="col-12 col-md-3">
        <q-card class="bg-info text-white">
          <q-card-section>
            <div class="row items-center">
              <div class="col">
                <div class="text-h4">{{ activeTables }}</div>
                <div class="text-subtitle2">Active Tables</div>
              </div>
              <div class="col-auto"><q-icon name="table_restaurant" size="48px" /></div>
            </div>
            <div class="text-caption q-mt-xs">
              {{ occupiedTables }} of {{ totalTables }} occupied
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Main Content Area -->
      <div class="col-12 col-md-8">
        <!-- Enhanced Daily Sales Overview with Graph -->
        <q-card class="q-mb-md">
          <q-card-section>
            <div class="row items-center justify-between">
              <div>
                <div class="text-h6">Sales Performance</div>
                <div class="text-subtitle2 text-grey-7">
                  {{ selectedPeriod.label }} performance metrics
                </div>
              </div>
              
              <div class="row items-center q-gutter-sm">
                <!-- Period Selector -->
                <q-btn-group push>
                  <q-btn 
                    v-for="period in timePeriods" 
                    :key="period.value"
                    :label="period.label"
                    :outline="selectedPeriod.value !== period.value"
                    :color="selectedPeriod.value === period.value ? 'primary' : 'grey-6'"
                    @click="changePeriod(period)"
                    size="sm"
                  />
                </q-btn-group>
                
                <!-- Chart Type Selector -->
                <q-btn-dropdown 
                  :label="chartTypes.find(t => t.value === chartType).label" 
                  outline 
                  size="sm"
                  color="primary"
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
                        <q-icon :name="type.icon" />
                      </q-item-section>
                      <q-item-section>{{ type.label }}</q-item-section>
                    </q-item>
                  </q-list>
                </q-btn-dropdown>
              </div>
            </div>
          </q-card-section>
          
          <q-separator />
          
          <q-card-section>
            <!-- Summary Stats -->
            <div class="row q-col-gutter-md q-mb-lg">
              <div class="col-6 col-md-3">
                <div class="text-center">
                  <div class="text-h6 text-primary">{{ formatCurrency(periodStats.totalSales) }}</div>
                  <div class="text-caption text-grey-7">Total Sales</div>
                </div>
              </div>
              <div class="col-6 col-md-3">
                <div class="text-center">
                  <div class="text-h6 text-positive">{{ periodStats.totalOrders }}</div>
                  <div class="text-caption text-grey-7">Total Orders</div>
                </div>
              </div>
              <div class="col-6 col-md-3">
                <div class="text-center">
                  <div class="text-h6 text-warning">{{ formatCurrency(periodStats.avgOrderValue) }}</div>
                  <div class="text-caption text-grey-7">Avg Order Value</div>
                </div>
              </div>
              <div class="col-6 col-md-3">
                <div class="text-center">
                  <div class="text-h6" :class="periodStats.growth >= 0 ? 'text-positive' : 'text-negative'">
                    {{ periodStats.growth >= 0 ? '+' : '' }}{{ periodStats.growth }}%
                  </div>
                  <div class="text-caption text-grey-7">Growth</div>
                </div>
              </div>
            </div>
            
            <!-- Chart Area -->
            <div style="height: 300px">
              <!-- Bar Chart -->
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
                        class="chart-bar q-mx-xs"
                        :style="{ 
                          height: `${getChartBarHeight(data.amount)}%`,
                          width: '70%',
                          'background-color': isCurrentPeriod(data) ? '#1976D2' : '#90CAF9'
                        }"
                        @mouseenter="hoveredData = data"
                        @mouseleave="hoveredData = null"
                      >
                        <q-tooltip v-if="hoveredData === data" anchor="top middle" self="bottom middle">
                          <div class="text-bold">{{ data.label }}</div>
                          <div>Sales: {{ formatCurrency(data.amount) }}</div>
                          <div>Orders: {{ data.orders }}</div>
                        </q-tooltip>
                      </div>
                      <div class="text-caption text-grey-7 q-mt-xs">{{ data.label }}</div>
                    </div>
                  </div>
                </div>
                <q-separator class="q-mt-md" />
                <div class="row q-mt-xs">
                  <div class="col text-center">
                    <div class="text-caption text-grey-7">Sales Amount</div>
                  </div>
                </div>
              </div>
              
              <!-- Line Chart -->
              <div v-if="chartType === 'line'" style="height: 100%">
                <div class="relative-position" style="height: 100%">
                  <!-- Grid Lines -->
                  <div class="absolute-full column justify-between">
                    <q-separator v-for="n in 5" :key="n" />
                  </div>
                  
                  <!-- Y-axis labels -->
                  <div class="absolute" style="left: 0; top: 0; bottom: 0; width: 50px">
                    <div 
                      v-for="(label, index) in yAxisLabels" 
                      :key="index"
                      class="absolute text-caption text-grey-7"
                      :style="{ top: `${index * 25}%` }"
                    >
                      {{ formatCurrency(label) }}
                    </div>
                  </div>
                  
                  <!-- Line Chart -->
                  <div class="absolute" style="left: 60px; right: 0; top: 0; bottom: 0">
                    <svg width="100%" height="100%" style="overflow: visible">
                      <!-- Line path -->
                      <path 
                        :d="getLinePath()" 
                        fill="none" 
                        stroke="#1976D2" 
                        stroke-width="3"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                      
                      <!-- Data points -->
                      <circle 
                        v-for="(point, index) in lineChartPoints" 
                        :key="index"
                        :cx="point.x" 
                        :cy="point.y" 
                        r="4" 
                        fill="#1976D2"
                        stroke="white"
                        stroke-width="2"
                        @mouseenter="hoveredData = chartData[index]"
                        @mouseleave="hoveredData = null"
                      >
                        <title>
                          {{ chartData[index].label }}: {{ formatCurrency(chartData[index].amount) }}
                        </title>
                      </circle>
                    </svg>
                  </div>
                  
                  <!-- X-axis labels -->
                  <div class="absolute" style="left: 60px; right: 0; bottom: 0">
                    <div class="row">
                      <div 
                        v-for="(data, index) in chartData" 
                        :key="index"
                        class="col text-center"
                      >
                        <div class="text-caption text-grey-7">{{ data.label }}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Area Chart -->
              <div v-if="chartType === 'area'" style="height: 100%">
                <div class="relative-position" style="height: 100%">
                  <!-- Grid Lines -->
                  <div class="absolute-full column justify-between">
                    <q-separator v-for="n in 5" :key="n" />
                  </div>
                  
                  <!-- Y-axis labels -->
                  <div class="absolute" style="left: 0; top: 0; bottom: 0; width: 50px">
                    <div 
                      v-for="(label, index) in yAxisLabels" 
                      :key="index"
                      class="absolute text-caption text-grey-7"
                      :style="{ top: `${index * 25}%` }"
                    >
                      {{ formatCurrency(label) }}
                    </div>
                  </div>
                  
                  <!-- Area Chart -->
                  <div class="absolute" style="left: 60px; right: 0; top: 0; bottom: 0">
                    <svg width="100%" height="100%" style="overflow: visible">
                      <!-- Area path -->
                      <path 
                        :d="getAreaPath()" 
                        fill="rgba(25, 118, 210, 0.2)" 
                        stroke="#1976D2" 
                        stroke-width="2"
                      />
                      
                      <!-- Data points -->
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
                  
                  <!-- X-axis labels -->
                  <div class="absolute" style="left: 60px; right: 0; bottom: 0">
                    <div class="row">
                      <div 
                        v-for="(data, index) in chartData" 
                        :key="index"
                        class="col text-center"
                      >
                        <div class="text-caption text-grey-7">{{ data.label }}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Legend -->
            <div class="row justify-center q-mt-md">
              <div class="col-auto">
                <div class="row items-center q-gutter-md">
                  <div class="row items-center">
                    <div class="legend-color q-mr-xs" style="background-color: #1976D2;"></div>
                    <div class="text-caption">Current Period</div>
                  </div>
                  <div class="row items-center">
                    <div class="legend-color q-mr-xs" style="background-color: #90CAF9;"></div>
                    <div class="text-caption">Previous Period</div>
                  </div>
                </div>
              </div>
            </div>
          </q-card-section>
          
          <q-separator />
          
          <q-card-actions align="right">
            <q-btn flat color="primary" icon="insights" label="Detailed Analytics" to="/analytics" />
          </q-card-actions>
        </q-card>

        <!-- Top Selling Items -->
        <q-card>
          <q-card-section>
            <div class="row items-center justify-between">
              <div>
                <div class="text-h6">Top Selling Items</div>
                <div class="text-subtitle2 text-grey-7">Today's popular choices</div>
              </div>
              <q-btn flat color="primary" icon="more_horiz">
                <q-menu>
                  <q-list style="min-width: 100px">
                    <q-item clickable v-close-popup>
                      <q-item-section>View All</q-item-section>
                    </q-item>
                    <q-item clickable v-close-popup>
                      <q-item-section>Export List</q-item-section>
                    </q-item>
                  </q-list>
                </q-menu>
              </q-btn>
            </div>
          </q-card-section>
          
          <q-list bordered separator>
            <q-item v-for="item in topSellingItems" :key="item.id" clickable>
              <q-item-section avatar>
                <q-avatar :color="getItemColor(item.category)" text-color="white">
                  {{ item.name.charAt(0) }}
                </q-avatar>
              </q-item-section>
              
              <q-item-section>
                <q-item-label>{{ item.name }}</q-item-label>
                <q-item-label caption>{{ item.category }}</q-item-label>
              </q-item-section>
              
              <q-item-section side>
                <div class="text-right">
                  <div class="text-subtitle2">{{ item.quantity }} sold</div>
                  <div class="text-caption text-grey-7">{{ formatCurrency(item.revenue) }}</div>
                </div>
              </q-item-section>
              
              <q-item-section side>
                <q-badge :color="getTrendColor(item.trend)" :label="item.trend + '%'" />
              </q-item-section>
            </q-item>
          </q-list>
        </q-card>
      </div>

      <!-- Sidebar -->
      <div class="col-12 col-md-4">
        <!-- Quick Actions -->
        <q-card class="q-mb-md">
          <q-card-section>
            <div class="text-h6">Quick Actions</div>
          </q-card-section>
          
          <q-list separator>
            <q-item clickable to="/pos" class="text-primary">
              <q-item-section avatar>
                <q-icon name="point_of_sale" color="primary" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Open POS</q-item-label>
                <q-item-label caption>Start new transaction</q-item-label>
              </q-item-section>
            </q-item>
            
            <q-item clickable to="/inventory" class="text-positive">
              <q-item-section avatar>
                <q-icon name="inventory" color="positive" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Manage Inventory</q-item-label>
                <q-item-label caption>{{ lowStockItems }} items need attention</q-item-label>
              </q-item-section>
            </q-item>
            
            <q-item clickable to="/ordering" class="text-warning">
              <q-item-section avatar>
                <q-icon name="local_shipping" color="warning" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Place Order</q-item-label>
                <q-item-label caption>Restock supplies</q-item-label>
              </q-item-section>
            </q-item>
            
            <q-item clickable to="/reports" class="text-info">
              <q-item-section avatar>
                <q-icon name="assessment" color="info" />
              </q-item-section>
              <q-item-section>
                <q-item-label>View Reports</q-item-label>
                <q-item-label caption>Sales & analytics</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card>

        <!-- Recent Orders -->
        <q-card>
          <q-card-section>
            <div class="text-h6">Recent Orders</div>
            <div class="text-subtitle2 text-grey-7">Last 5 transactions</div>
          </q-card-section>
          
          <q-list bordered separator>
            <q-item v-for="order in recentOrders" :key="order.id">
              <q-item-section>
                <q-item-label>Order #{{ order.id }}</q-item-label>
                <q-item-label caption>
                  {{ formatTime(order.time) }} • {{ order.items }} items
                </q-item-label>
              </q-item-section>
              
              <q-item-section side>
                <div class="text-right">
                  <div class="text-subtitle2">{{ formatCurrency(order.amount) }}</div>
                  <q-badge :color="getOrderStatusColor(order.status)" :label="order.status" />
                </div>
              </q-item-section>
            </q-item>
          </q-list>
          
          <q-card-actions align="right">
            <q-btn flat color="primary" label="View All" to="/orders" />
          </q-card-actions>
        </q-card>
      </div>

      <!-- Inventory Alerts (Bottom Section) -->
      <div class="col-12">
        <q-card>
          <q-card-section>
            <div class="row items-center">
              <div class="col">
                <div class="text-h6">Inventory Alerts</div>
                <div class="text-subtitle2 text-grey-7">Items that need attention</div>
              </div>
              <q-btn flat color="primary" icon="notifications" @click="markAllAsRead">
                <q-badge v-if="unreadAlerts > 0" color="red" floating>{{ unreadAlerts }}</q-badge>
              </q-btn>
            </div>
          </q-card-section>
          
          <q-card-section class="q-pt-none">
            <div class="row q-col-gutter-md">
              <div v-for="alert in inventoryAlerts" :key="alert.id" class="col-12 col-md-4">
                <q-card 
                  :class="['alert-card', { 'unread': !alert.read }]"
                  flat
                  bordered
                >
                  <q-card-section>
                    <div class="row items-center">
                      <div class="col-auto">
                        <q-icon 
                          :name="alert.icon" 
                          :color="alert.severity" 
                          size="24px"
                        />
                      </div>
                      <div class="col q-pl-sm">
                        <div class="text-subtitle2">{{ alert.item }}</div>
                        <div class="text-caption text-grey-7">
                          Current: {{ alert.current }} {{ alert.unit }} • 
                          Min: {{ alert.minimum }} {{ alert.unit }}
                        </div>
                      </div>
                      <div class="col-auto">
                        <q-btn 
                          flat 
                          round 
                          icon="add" 
                          color="primary" 
                          size="sm"
                          @click="restockItem(alert)"
                        >
                          <q-tooltip>Quick Restock</q-tooltip>
                        </q-btn>
                      </div>
                    </div>
                  </q-card-section>
                </q-card>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Export Dialog -->
    <q-dialog v-model="showExportDialog">
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">Export Sales Report</div>
          <div class="text-caption">Select date range for export</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-date v-model="exportDateRange" range />
          
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
            <q-checkbox v-model="includeDetails" label="Order Details" />
            <q-checkbox v-model="includeInventory" label="Inventory Levels" />
            <q-checkbox v-model="includeAnalytics" label="Sales Analytics" />
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="primary" v-close-popup />
          <q-btn
            unelevated
            label="Export Report"
            color="primary"
            icon="download"
            @click="executeExportCSV"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'

// --- Chart Configuration ---
const selectedPeriod = ref({ label: '7 Days', value: '7days' })
const chartType = ref('bar')
const hoveredData = ref(null)

const timePeriods = ref([
  { label: '7 Days', value: '7days', days: 7 },
  { label: '30 Days', value: '30days', days: 30 },
  { label: '3 Months', value: '3months', days: 90 },
  { label: '6 Months', value: '6months', days: 180 },
  { label: '1 Year', value: '1year', days: 365 },
])

const chartTypes = ref([
  { label: 'Bar Chart', value: 'bar', icon: 'bar_chart' },
  { label: 'Line Chart', value: 'line', icon: 'show_chart' },
  { label: 'Area Chart', value: 'area', icon: 'area_chart' },
])

// --- Original Data State ---
const todaySales = ref(2456.75)
const todayOrders = ref(42)
const lowStockItems = ref(7)
const criticalStockItems = ref(3)
const activeTables = ref(8)
const occupiedTables = ref(6)
const totalTables = ref(12)
const unreadAlerts = ref(3)

// Weekly Sales Data
const weeklySales = ref([
  { day: 'Mon', date: '2024-01-01', amount: 2100, orders: 35 },
  { day: 'Tue', date: '2024-01-02', amount: 1980, orders: 32 },
  { day: 'Wed', date: '2024-01-03', amount: 2345, orders: 38 },
  { day: 'Thu', date: '2024-01-04', amount: 2678, orders: 41 },
  { day: 'Fri', date: '2024-01-05', amount: 3120, orders: 45 },
  { day: 'Sat', date: '2024-01-06', amount: 2890, orders: 43 },
  { day: 'Sun', date: '2024-01-07', amount: 2456.75, orders: 42 }
])

// Top Selling Items
const topSellingItems = ref([
  { id: 1, name: 'Espresso', category: 'Coffee', quantity: 78, revenue: 546, trend: 12 },
  { id: 2, name: 'Cappuccino', category: 'Coffee', quantity: 65, revenue: 682.5, trend: 8 },
  { id: 3, name: 'Croissant', category: 'Pastry', quantity: 42, revenue: 252, trend: 15 },
  { id: 4, name: 'Green Tea', category: 'Tea', quantity: 38, revenue: 228, trend: 5 },
  { id: 5, name: 'Chocolate Cake', category: 'Dessert', quantity: 25, revenue: 250, trend: 20 }
])

// Recent Orders
const recentOrders = ref([
  { id: '1001', time: new Date(), items: 3, amount: 28.50, status: 'Completed' },
  { id: '1002', time: new Date(Date.now() - 300000), items: 2, amount: 18.75, status: 'Completed' },
  { id: '1003', time: new Date(Date.now() - 600000), items: 4, amount: 42.25, status: 'Preparing' },
  { id: '1004', time: new Date(Date.now() - 900000), items: 1, amount: 5.50, status: 'Completed' },
  { id: '1005', time: new Date(Date.now() - 1200000), items: 2, amount: 22.80, status: 'Pending' }
])

// Inventory Alerts
const inventoryAlerts = ref([
  { id: 1, item: 'Coffee Beans', current: 2, minimum: 5, unit: 'kg', severity: 'negative', icon: 'local_cafe', read: false },
  { id: 2, item: 'Milk', current: 3, minimum: 10, unit: 'L', severity: 'warning', icon: 'local_drink', read: false },
  { id: 3, item: 'Paper Cups', current: 200, minimum: 500, unit: 'pcs', severity: 'warning', icon: 'takeout_dining', read: true },
  { id: 4, item: 'Sugar', current: 1, minimum: 3, unit: 'kg', severity: 'negative', icon: 'kitchen', read: false },
  { id: 5, item: 'Chocolate Syrup', current: 0.5, minimum: 2, unit: 'L', severity: 'negative', icon: 'waterfall_chart', read: true },
  { id: 6, item: 'Napkins', current: 800, minimum: 1000, unit: 'pcs', severity: 'warning', icon: 'clean_hands', read: true }
])

// Export State
const showExportDialog = ref(false)
const exportDateRange = ref({ from: '2024-01-01', to: '2024-01-07' })
const exportFormat = ref('csv')
const includeDetails = ref(true)
const includeInventory = ref(false)
const includeAnalytics = ref(true)
const formatOptions = [
  { label: 'CSV', value: 'csv' },
  { label: 'Excel', value: 'excel' },
  { label: 'PDF', value: 'pdf' }
]

// --- Chart Data ---
const chartData = ref([])
const previousPeriodData = ref([])

// --- Computed Properties ---
const timeGreeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Morning'
  if (hour < 18) return 'Afternoon'
  return 'Evening'
})

const salesProgress = computed(() => {
  const maxSales = Math.max(...weeklySales.value.map(d => d.amount))
  return todaySales.value / maxSales
})

const ordersProgress = computed(() => {
  const maxOrders = Math.max(...weeklySales.value.map(d => d.orders))
  return todayOrders.value / maxOrders
})

const salesComparison = computed(() => {
  const yesterdayIndex = weeklySales.value.length - 2
  const yesterdaySales = weeklySales.value[yesterdayIndex]?.amount || 0
  const change = ((todaySales.value - yesterdaySales) / yesterdaySales) * 100
  return Math.round(change * 10) / 10
})

const averageOrderValue = computed(() => {
  return todaySales.value / todayOrders.value
})

const periodStats = computed(() => {
  const totalSales = chartData.value.reduce((sum, item) => sum + item.amount, 0)
  const totalOrders = chartData.value.reduce((sum, item) => sum + item.orders, 0)
  const avgOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0
  
  // Calculate growth compared to previous period
  const prevTotalSales = previousPeriodData.value.reduce((sum, item) => sum + item.amount, 0)
  const growth = prevTotalSales > 0 ? ((totalSales - prevTotalSales) / prevTotalSales) * 100 : 0
  
  return {
    totalSales,
    totalOrders,
    avgOrderValue: Math.round(avgOrderValue * 100) / 100,
    growth: Math.round(growth * 10) / 10
  }
})

const yAxisLabels = computed(() => {
  if (chartData.value.length === 0) return []
  
  const maxAmount = Math.max(...chartData.value.map(d => d.amount))
  const minAmount = Math.min(...chartData.value.map(d => d.amount))
  
  const range = maxAmount - minAmount
  const step = range / 4
  
  return [
    Math.ceil(maxAmount),
    Math.ceil(maxAmount - step),
    Math.ceil(maxAmount - step * 2),
    Math.ceil(maxAmount - step * 3),
    Math.ceil(minAmount)
  ]
})

const lineChartPoints = computed(() => {
  if (chartData.value.length === 0) return []
  
  const maxAmount = Math.max(...chartData.value.map(d => d.amount))
  const minAmount = Math.min(...chartData.value.map(d => d.amount))
  const range = maxAmount - minAmount || 1
  
  const containerWidth = 100 // percentage
  const pointSpacing = containerWidth / (chartData.value.length - 1)
  
  return chartData.value.map((item, index) => {
    const x = index * pointSpacing
    const y = 100 - ((item.amount - minAmount) / range) * 100
    
    return { x: `${x}%`, y: `${y}%` }
  })
})

// --- Methods ---
const changePeriod = (period) => {
  selectedPeriod.value = period
  loadChartData()
}

const loadChartData = () => {
  const period = timePeriods.value.find(p => p.value === selectedPeriod.value.value)
  const days = period.days
  
  chartData.value = generateChartData(days)
  previousPeriodData.value = generateChartData(days, true)
}

const generateChartData = (days, isPrevious = false) => {
  const data = []
  const baseAmount = 1500
  const variation = 800
  
  for (let i = 0; i < days; i++) {
    const date = new Date()
    date.setDate(date.getDate() - (days - i - 1))
    
    let label
    if (days <= 7) {
      label = date.toLocaleDateString('en-US', { weekday: 'short' })
    } else if (days <= 30) {
      label = `${date.getDate()}/${date.getMonth() + 1}`
    } else if (days <= 90) {
      label = `Week ${Math.floor(i / 7) + 1}`
    } else {
      label = date.toLocaleDateString('en-US', { month: 'short' })
    }
    
    const amount = baseAmount + Math.sin(i * 0.5) * variation + Math.random() * 200
    const orders = Math.floor(20 + Math.sin(i * 0.3) * 10 + Math.random() * 8)
    
    data.push({
      date,
      label,
      amount: Math.round(amount * 100) / 100,
      orders,
      isCurrent: !isPrevious
    })
  }
  
  return data
}

const getChartBarHeight = (amount) => {
  if (chartData.value.length === 0) return 0
  
  const maxAmount = Math.max(...chartData.value.map(d => d.amount))
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
  
  // Close the area path
  path += ` L ${points[points.length - 1].x} 100`
  path += ` L ${points[0].x} 100`
  path += ' Z'
  
  return path
}

const isCurrentPeriod = (data) => {
  if (!data.date) return true
  const today = new Date()
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
  return data.date >= weekAgo
}

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: amount < 1 ? 2 : 0,
    maximumFractionDigits: 2
  }).format(amount)
}

const formatTime = (date) => {
  return new Date(date).toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  })
}

const getItemColor = (category) => {
  const colors = {
    'Coffee': 'brown',
    'Tea': 'green',
    'Pastry': 'orange',
    'Dessert': 'pink',
    'Sandwich': 'blue'
  }
  return colors[category] || 'grey'
}

const getTrendColor = (trend) => {
  if (trend > 10) return 'positive'
  if (trend > 0) return 'warning'
  return 'negative'
}

const getOrderStatusColor = (status) => {
  const colors = {
    'Completed': 'positive',
    'Preparing': 'warning',
    'Pending': 'info',
    'Cancelled': 'negative'
  }
  return colors[status] || 'grey'
}

// Original methods for other functionality
const refreshData = () => {
  // Simulate data refresh
  setTimeout(() => {
    todaySales.value += Math.random() * 100 - 50
    todayOrders.value += Math.floor(Math.random() * 5) - 2
  }, 500)
}

const openExportDialog = () => {
  showExportDialog.value = true
}

const executeExportCSV = () => {
  showExportDialog.value = false
}

const downloadInventoryReport = () => {
  // Export functionality placeholder
  console.log('Download inventory report')
}

const restockItem = (alert) => {
  alert.current += 5
  alert.read = true
}

const markAllAsRead = () => {
  inventoryAlerts.value.forEach(alert => {
    alert.read = true
  })
  unreadAlerts.value = 0
}

// Watch for chart type changes
watch(chartType, (newType) => {
  if (newType === 'line' || newType === 'area') {
    // Ensure we have enough data points for line/area charts
    if (selectedPeriod.value.value === '7days') {
      selectedPeriod.value = timePeriods.value[1] // Switch to 30 days
      loadChartData()
    }
  }
})

// Initialize
onMounted(() => {
  loadChartData()
  // Update unread alerts count
  unreadAlerts.value = inventoryAlerts.value.filter(alert => !alert.read).length
})
</script>

<style scoped>
.sales-bar {
  width: 100%;
  border-radius: 4px;
  transition: height 0.3s ease;
}

.alert-card {
  transition: all 0.3s ease;
}

.alert-card.unread {
  border-left: 4px solid #ff6b6b;
  background-color: rgba(255, 107, 107, 0.05);
}

.alert-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.chart-bar {
  border-radius: 4px 4px 0 0;
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
}

.chart-bar:hover {
  transform: scaleY(1.05);
  opacity: 0.9;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 2px;
}

/* Custom tooltip styling */
.q-tooltip {
  font-size: 12px;
  padding: 8px 12px;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* Smooth transitions for chart switching */
.chart-container {
  transition: opacity 0.3s ease;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .chart-bar {
    width: 85% !important;
  }
  
  .time-period-selector .q-btn {
    padding: 4px 8px;
    font-size: 12px;
  }
}

/* Animation for chart bars */
@keyframes barGrow {
  from {
    height: 0;
  }
  to {
    height: var(--target-height);
  }
}

.chart-bar {
  animation: barGrow 0.8s ease-out;
}
</style>
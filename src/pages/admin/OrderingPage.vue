<template>
  <div class="row q-col-gutter-md">
    <div class="col-12">
      <q-card>
        <q-card-section>
          <div class="text-h6">Order Management</div>
          <div class="text-subtitle2">Process and track customer orders</div>
        </q-card-section>

        <q-separator />

        <q-card-section>
          <div class="row q-col-gutter-md q-mb-md">
            <div class="col-12 col-md-4">
              <q-select
                v-model="statusFilter"
                :options="statusOptions"
                outlined
                dense
                label="Filter by Status"
              />
            </div>
            <div class="col-12 col-md-4">
              <q-input v-model="searchQuery" outlined dense placeholder="Search orders...">
                <template v-slot:prepend>
                  <q-icon name="search" />
                </template>
              </q-input>
            </div>
            <div class="col-12 col-md-4">
              <q-btn
                color="primary"
                icon="point_of_sale"
                label="Open POS"
                class="full-width"
                @click="showPOSDialog = true"
              />
            </div>
          </div>

          <q-table
            :rows="filteredOrders"
            :columns="columns"
            row-key="id"
            :loading="orderStore.loading"
            flat
            bordered
          >
            <template v-slot:body-cell-status="props">
              <q-td :props="props">
                <q-chip :color="getStatusColor(props.row.status)" text-color="white" dense>
                  {{ props.row.status }}
                </q-chip>
              </q-td>
            </template>
            <template v-slot:body-cell-total="props">
              <q-td :props="props"> ${{ Number(props.row.total || 0).toFixed(2) }} </q-td>
            </template>
            <template v-slot:body-cell-actions="props">
              <q-td :props="props">
                <q-btn
                  flat
                  round
                  dense
                  icon="delete"
                  color="negative"
                  @click="confirmDelete(props.row)"
                />
              </q-td>
            </template>
          </q-table>
        </q-card-section>
      </q-card>
    </div>

    <POSOrderDialog
      v-model="showPOSDialog"
      :products="productStore.products"
      @create="handleCreateOrder"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useOrderStore } from '../../stores/orderStore.js'
import { useProductStore } from '../../stores/productStore.js'
import { useQuasar } from 'quasar'
import POSOrderDialog from 'src/components/admin/POSOrderingDialog.vue' // Adjust path if needed

const $q = useQuasar()
const orderStore = useOrderStore()
const productStore = useProductStore()

const searchQuery = ref('')
const statusFilter = ref('All')
const showPOSDialog = ref(false)
const statusOptions = ['All', 'Pending', 'Paid', 'Shipped', 'Cancelled']

const columns = [
  { name: 'id', label: 'Order ID', field: 'id', align: 'left' },
  { name: 'customerName', label: 'Customer', field: 'customerName', align: 'left', sortable: true },
  { name: 'status', label: 'Status', field: 'status', align: 'center', sortable: true },
  { name: 'total', label: 'Total', field: 'total', align: 'right', sortable: true },
  { name: 'actions', label: 'Actions', field: 'actions', align: 'center' },
]

onMounted(async () => {
  await orderStore.fetchOrders()
  await productStore.fetchProducts()
})

const filteredOrders = computed(() => {
  let list = orderStore.orders
  if (statusFilter.value !== 'All') list = list.filter((o) => o.status === statusFilter.value)
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(
      (o) => o.customerName.toLowerCase().includes(q) || o.id.toLowerCase().includes(q),
    )
  }
  return list
})

const getStatusColor = (status) => {
  const map = { Pending: 'orange', Paid: 'positive', Shipped: 'blue', Cancelled: 'negative' }
  return map[status] || 'grey'
}

// Handler for the Event emitted by the Child Component
const handleCreateOrder = async (orderData) => {
  try {
    const payload = {
      ...orderData,
      date: new Date().toISOString(),
    }
    await orderStore.addOrder(payload)
    $q.notify({ color: 'positive', message: 'Order created via POS' })
    showPOSDialog.value = false
  } catch (err) {
    console.error(err)
    $q.notify({ color: 'negative', message: 'Failed to create order' })
  }
}

const confirmDelete = (order) => {
  $q.dialog({
    title: 'Delete Order',
    message: 'Are you sure?',
    cancel: true,
  }).onOk(async () => {
    await orderStore.deleteOrder(order.id)
  })
}
</script>

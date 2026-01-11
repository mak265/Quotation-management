<template>
  <q-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    maximized
    transition-show="slide-up"
    transition-hide="slide-down"
  >
    <q-layout view="hHh lpR fFf" container class="bg-grey-2">
      <q-header class="bg-gradient-primary text-white shadow-2">
        <q-toolbar>
          <q-btn flat round dense icon="close" v-close-popup size="sm" />
          <q-toolbar-title class="text-weight-bold row items-center">
            <q-icon name="point_of_sale" size="32px" class="q-mr-sm" />
            <div>
              <div>POS Terminal</div>
              <div class="text-caption text-blue-1">V.2.0 • Premium Edition</div>
            </div>
          </q-toolbar-title>
          
          <div class="row items-center q-gutter-x-lg">
            <div class="text-center">
              <div class="text-caption text-blue-1">Current Session</div>
              <div class="text-subtitle1">{{ currentDate }}</div>
            </div>
            <q-separator vertical dark />
            <div class="text-center">
              <div class="text-caption text-blue-1">Operator</div>
              <div class="text-subtitle1">Admin</div>
            </div>
            <q-btn round flat icon="notifications" size="sm">
              <q-badge color="red" floating rounded>3</q-badge>
            </q-btn>
          </div>
        </q-toolbar>
      </q-header>

      <q-page-container>
        <q-page class="row no-wrap fit">
          
          <!-- Left Column - Products -->
          <div class="col-8 column q-pa-md">
            <!-- Top Controls -->
            <div class="row q-col-gutter-md q-mb-md">
              <div class="col-12 col-md-6">
                <div class="bg-white rounded-borders shadow-1 q-pa-sm">
                  <q-tabs
                    v-model="selectedCategory"
                    active-color="primary"
                    indicator-color="primary"
                    align="justify"
                    dense
                    class="text-grey-7"
                  >
                    <q-tab v-for="cat in categories" :key="cat" :name="cat" :label="cat" />
                  </q-tabs>
                </div>
              </div>
              
              <div class="col-12 col-md-6">
                <div class="row q-col-gutter-sm">
                  <div class="col-8">
                    <q-input
                      v-model="search"
                      outlined
                      dense
                      placeholder="Search products..."
                      bg-color="white"
                      class="shadow-1"
                    >
                      <template v-slot:prepend>
                        <q-icon name="search" color="primary" />
                      </template>
                      <template v-slot:append v-if="search">
                        <q-icon name="close" class="cursor-pointer" @click="search = ''" />
                      </template>
                    </q-input>
                  </div>
                  <div class="col-4">
                    <q-select
                      v-model="sortBy"
                      :options="sortOptions"
                      outlined
                      dense
                      bg-color="white"
                      class="shadow-1"
                      label="Sort by"
                    />
                  </div>
                </div>
              </div>
            </div>

            <!-- Products Grid -->
            <q-scroll-area class="col q-pr-sm">
              <div class="row q-col-gutter-md">
                <div
                  v-for="product in sortedProducts"
                  :key="product.id"
                  class="col-12 col-sm-6 col-md-4 col-xl-3"
                >
                  <product-card :product="product" @add-to-cart="addToCart" />
                </div>
              </div>
            </q-scroll-area>
          </div>

          <!-- Right Column - Cart & Checkout -->
          <div class="col-4 bg-white column shadow-3-left">
            
            <!-- Customer Info -->
            <customer-details v-model="customer" class="q-pa-md" />
            
            <q-separator />

            <!-- Cart Items -->
            <cart-items 
              :items="cart" 
              @update-quantity="updateQuantity"
              @remove-item="removeItem"
            />

            <!-- Checkout Summary -->
            <checkout-summary
              :subtotal="subtotal"
              :tax-rate="taxRate"
              :discount-rate="discountRate"
              :cart-length="cart.length"
              :customer-name="customer.name"
              @clear-cart="clearCart"
              @pay-now="submitOrder"
              @save-draft="saveAsDraft"
            />
          </div>
        </q-page>
      </q-page-container>
    </q-layout>
  </q-dialog>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from 'vue'
import { date, useQuasar } from 'quasar'
import { useOrderStore } from 'src/stores/orderStore'
import ProductCard from 'src/components/admin/ProductCard.vue'
import CustomerDetails from 'src/components/admin/CustomerDetails.vue'
import CartItems from 'src/components/admin/CartItems.vue'
import CheckoutSummary from 'src/components/admin/CheckoutSummary.vue'

// Initialize
const $q = useQuasar()
const orderStore = useOrderStore()

// Props & Emits
defineProps({
  modelValue: Boolean,
})
const emit = defineEmits(['update:modelValue', 'create'])

// State
const search = ref('')
const selectedCategory = ref('All')
const sortBy = ref('name')
const cart = ref([])
const customer = reactive({ 
  name: '', 
  email: '',
  phone: '' 
})

// Constants
const taxRate = 0.08
const discountRate = 0.05
const categories = ['All', 'Hot Coffee', 'Iced Coffee', 'Pastries', 'Beans', 'Merchandise']

const sortOptions = [
  { label: 'Name A-Z', value: 'name' },
  { label: 'Price Low-High', value: 'price-asc' },
  { label: 'Price High-Low', value: 'price-desc' },
  { label: 'Category', value: 'category' }
]

// Products data
const products = ref([
  {
    id: 1,
    sku: 'COF-001',
    name: 'Espresso',
    description: 'Rich, concentrated coffee served in a small cup.',
    category: 'Hot Coffee',
    price: 3.50,
    originalPrice: null,
    image: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=400',
    stock: 100,
  },
  {
    id: 2,
    sku: 'COF-002',
    name: 'Cappuccino',
    description: 'Espresso with steamed milk and a thick layer of foam.',
    category: 'Hot Coffee',
    price: 4.50,
    originalPrice: 5.00,
    image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400',
    stock: 85,
  },
  
 
  
 
  {
    id: 7,
    sku: 'PAS-002',
    name: 'Chocolate Muffin',
    description: 'Rich chocolate muffin with chocolate chips.',
    category: 'Pastries',
    price: 3.75,
    originalPrice: 4.25,
    image: 'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=400',
    stock: 18,
  },
  {
    id: 8,
    sku: 'BEA-001',
    name: 'Signature Blend Beans',
    description: 'Our house signature blend, medium roast.',
    category: 'Beans',
    price: 15.00,
    originalPrice: 18.00,
    image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400',
    stock: 30,
  },
  {
    id: 9,
    sku: 'MER-001',
    name: 'Ceramic Mug',
    description: 'Classic white ceramic mug with our logo.',
    category: 'Merchandise',
    price: 12.50,
    originalPrice: null,
    image: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=400',
    stock: 50,
  },
])

// Computed
const currentDate = computed(() => {
  return date.formatDate(Date.now(), 'ddd, DD MMM YYYY • hh:mm A')
})

const filteredProducts = computed(() => {
  let list = products.value

  if (selectedCategory.value !== 'All') {
    list = list.filter(p => p.category === selectedCategory.value)
  }

  if (search.value) {
    const q = search.value.toLowerCase()
    list = list.filter(p => 
      p.name.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    )
  }
  return list
})

const sortedProducts = computed(() => {
  const list = [...filteredProducts.value]
  switch(sortBy.value) {
    case 'price-asc': return list.sort((a, b) => a.price - b.price)
    case 'price-desc': return list.sort((a, b) => b.price - a.price)
    case 'category': return list.sort((a, b) => a.category.localeCompare(b.category))
    default: return list.sort((a, b) => a.name.localeCompare(b.name))
  }
})

const subtotal = computed(() => {
  return cart.value.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
})

// Methods
const addToCart = (product) => {
  const existing = cart.value.find(item => item.product.id === product.id)
  if (existing) {
    existing.quantity++
  } else {
    cart.value.push({ product: { ...product }, quantity: 1 })
  }
  
  $q.notify({
    message: `${product.name} added`,
    color: 'positive',
    icon: 'add_shopping_cart',
    position: 'top-right',
    timeout: 1000
  })
}

const updateQuantity = (index, delta) => {
  const item = cart.value[index]
  item.quantity += delta
  
  if (item.quantity <= 0) {
    cart.value.splice(index, 1)
  }
}

const removeItem = (index) => {
  cart.value.splice(index, 1)
}

const clearCart = () => {
  $q.dialog({
    title: 'Clear Cart',
    message: 'Clear all items?',
    cancel: true,
  }).onOk(() => {
    cart.value = []
    customer.name = ''
    customer.email = ''
    customer.phone = ''
  })
}

const saveAsDraft = () => {
  $q.notify({
    message: 'Order saved as draft',
    color: 'info',
    icon: 'save',
    position: 'top-right'
  })
}

const submitOrder = async () => {
  if (!customer.name) {
    $q.notify({
      type: 'warning',
      message: 'Please enter customer name',
      icon: 'warning'
    })
    return
  }

  const taxAmount = subtotal.value * taxRate
  const discountAmount = subtotal.value * discountRate
  const totalAmount = subtotal.value + taxAmount - discountAmount

  const orderData = {
    customer,
    status: 'Paid',
    subtotal: subtotal.value,
    taxAmount,
    discountAmount,
    totalAmount,
    items: cart.value.map(item => ({
      ...item.product,
      quantity: item.quantity
    })),
    orderNumber: `ORD-${Date.now().toString().slice(-6)}`
  }

  try {
    await orderStore.addOrder(orderData)

    $q.notify({
      type: 'positive',
      message: `Order #${orderData.orderNumber} placed!`,
      caption: `Total: $${totalAmount.toFixed(2)}`,
      icon: 'check_circle',
      position: 'top-right',
      timeout: 3000
    })

    clearCart()
    emit('update:modelValue', false)

  } catch (error) {
    console.error('POS Error:', error)
    $q.notify({
      type: 'negative',
      message: 'Failed to place order',
      icon: 'error'
    })
  }
}

onMounted(() => {
  // Initialization if needed
})
</script>

<style scoped>
.bg-gradient-primary {
  background: linear-gradient(135deg, #1976d2 0%, #0d47a1 100%);
}

.shadow-3-left {
  box-shadow: -4px 0 20px rgba(0, 0, 0, 0.08);
}
</style>
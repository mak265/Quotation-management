<template>
  <q-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    maximized
    transition-show="slide-up"
    transition-hide="slide-down"
  >
    <q-layout view="hHh lpR fFf" container class="bg-grey-2">
      <q-header class="bg-white text-primary bordered-bottom">
        <q-toolbar>
          <q-btn flat round dense icon="close" v-close-popup />
          <q-toolbar-title class="text-weight-bold">New POS Order</q-toolbar-title>
          <div class="text-subtitle1 text-grey-8 q-mr-md">
            {{ currentDate }}
          </div>
        </q-toolbar>
      </q-header>

      <q-page-container>
        <q-page class="row no-wrap">
          <div class="col-8 column q-pa-md">
            <div class="row q-col-gutter-sm q-mb-md">
              <div class="col-12 col-md-8">
                <q-tabs
                  v-model="selectedCategory"
                  active-color="primary"
                  indicator-color="primary"
                  align="left"
                  dense
                  class="text-grey-7 bg-white rounded-borders"
                >
                  <q-tab name="All" label="All Items" />
                  <q-tab name="Electronics" label="Electronics" />
                  <q-tab name="Clothing" label="Clothing" />
                  <q-tab name="Books" label="Books" />
                </q-tabs>
              </div>
              <div class="col-12 col-md-4">
                <q-input
                  v-model="search"
                  outlined
                  dense
                  placeholder="Search products..."
                  bg-color="white"
                >
                  <template v-slot:prepend>
                    <q-icon name="search" />
                  </template>
                </q-input>
              </div>
            </div>

            <q-scroll-area class="col">
              <div class="row q-col-gutter-md">
                <div
                  v-for="product in filteredProducts"
                  :key="product.id"
                  class="col-12 col-sm-6 col-md-4 col-lg-3"
                >
                  <q-card
                    class="cursor-pointer full-height hover-effect"
                    @click="addToCart(product)"
                    v-ripple
                  >
                    <q-img :src="product.image" :ratio="4 / 3">
                      <div class="absolute-bottom text-subtitle2 text-center">
                        ${{ product.price }}
                      </div>
                    </q-img>
                    <q-card-section>
                      <div class="text-weight-medium ellipsis">{{ product.name }}</div>
                      <div class="text-caption text-grey">{{ product.category }}</div>
                    </q-card-section>
                  </q-card>
                </div>
              </div>
            </q-scroll-area>
          </div>

          <div class="col-4 bg-white column shadow-2">
            <div class="q-pa-md bg-grey-1">
              <div class="text-h6 q-mb-sm">Customer Details</div>
              <q-input
                v-model="customer.name"
                label="Customer Name"
                outlined
                dense
                class="q-mb-xs bg-white"
              />
              <q-input
                v-model="customer.email"
                label="Email (Optional)"
                outlined
                dense
                class="bg-white"
              />
            </div>

            <q-separator />

            <q-scroll-area class="col q-px-sm">
              <q-list separator>
                <q-item v-if="cart.length === 0" class="text-grey text-center q-pa-lg">
                  <q-item-section>
                    <q-icon name="shopping_cart" size="4em" color="grey-4" />
                    <div class="q-mt-sm">Cart is empty</div>
                    <div class="text-caption">Select items from the left</div>
                  </q-item-section>
                </q-item>

                <transition-group name="list">
                  <q-item v-for="(item, index) in cart" :key="item.product.id">
                    <q-item-section avatar>
                      <q-avatar rounded size="40px">
                        <img :src="item.product.image" />
                      </q-avatar>
                    </q-item-section>

                    <q-item-section>
                      <q-item-label>{{ item.product.name }}</q-item-label>
                      <q-item-label caption>
                        ${{ item.product.price }} x {{ item.quantity }}
                      </q-item-label>
                    </q-item-section>

                    <q-item-section side>
                      <div class="row items-center">
                        <q-btn
                          round
                          flat
                          dense
                          icon="remove_circle_outline"
                          color="grey-7"
                          @click.stop="updateQuantity(index, -1)"
                        />
                        <span
                          class="text-body1 q-mx-sm text-weight-bold"
                          style="width: 20px; text-align: center"
                        >
                          {{ item.quantity }}
                        </span>
                        <q-btn
                          round
                          flat
                          dense
                          icon="add_circle_outline"
                          color="primary"
                          @click.stop="updateQuantity(index, 1)"
                        />
                      </div>
                      <div class="text-subtitle2 text-primary q-mt-xs text-right">
                        ${{ (item.product.price * item.quantity).toFixed(2) }}
                      </div>
                    </q-item-section>
                  </q-item>
                </transition-group>
              </q-list>
            </q-scroll-area>

            <div class="q-pa-md bg-grey-1 bordered-top">
              <div class="row justify-between q-mb-xs">
                <span class="text-grey-8">Subtotal</span>
                <span class="text-weight-bold">${{ totalAmount.toFixed(2) }}</span>
              </div>
              <div class="row justify-between q-mb-md">
                <span class="text-grey-8">Tax (0%)</span>
                <span>$0.00</span>
              </div>

              <q-separator class="q-mb-md" />

              <div class="row justify-between items-center q-mb-lg">
                <span class="text-h5 text-weight-bold">Total</span>
                <span class="text-h4 text-primary text-weight-bold"
                  >${{ totalAmount.toFixed(2) }}</span
                >
              </div>

              <div class="row q-col-gutter-md">
                <div class="col-6">
                  <q-btn
                    outline
                    color="negative"
                    label="Clear"
                    class="full-width"
                    @click="clearCart"
                  />
                </div>
                <div class="col-6">
                  <q-btn
                    unelevated
                    color="primary"
                    label="Pay & Save"
                    class="full-width"
                    size="lg"
                    @click="submitOrder"
                    :disable="cart.length === 0 || !customer.name"
                  />
                </div>
              </div>
            </div>
          </div>
        </q-page>
      </q-page-container>
    </q-layout>
  </q-dialog>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { date } from 'quasar'

const props = defineProps({
  modelValue: Boolean,
  products: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['update:modelValue', 'create'])

// State
const search = ref('')
const selectedCategory = ref('All')
const cart = ref([])
const customer = reactive({ name: '', email: '' })
const currentDate = date.formatDate(Date.now(), 'DD MMM YYYY')

// Mock Data Enhancement (Adding images/categories to your raw products)
// In a real app, these fields should come from the DB
const enhancedProducts = computed(() => {
  return props.products.map((p, i) => ({
    ...p,
    // Assign random images based on name or index for demo purposes
    image: p.image || `https://picsum.photos/seed/${p.id}/300/200`,
    category: p.category || ['Electronics', 'Clothing', 'Books'][i % 3],
  }))
})

// Filtering Logic
const filteredProducts = computed(() => {
  let list = enhancedProducts.value

  if (selectedCategory.value !== 'All') {
    list = list.filter((p) => p.category === selectedCategory.value)
  }

  if (search.value) {
    const q = search.value.toLowerCase()
    list = list.filter((p) => p.name.toLowerCase().includes(q))
  }
  return list
})

const totalAmount = computed(() => {
  return cart.value.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
})

// Actions
const addToCart = (product) => {
  const existing = cart.value.find((item) => item.product.id === product.id)
  if (existing) {
    existing.quantity++
  } else {
    cart.value.push({
      product: product,
      quantity: 1,
    })
  }
}

const updateQuantity = (index, delta) => {
  const item = cart.value[index]
  const newQty = item.quantity + delta

  if (newQty <= 0) {
    cart.value.splice(index, 1)
  } else {
    item.quantity = newQty
  }
}

const clearCart = () => {
  cart.value = []
  customer.name = ''
  customer.email = ''
}

const submitOrder = () => {
  // Format data to match parent expectation
  const orderData = {
    customerName: customer.name,
    customerEmail: customer.email,
    status: 'Paid', // POS orders usually imply immediate payment
    items: cart.value.map((item) => ({
      product: item.product, // Or just item.product.id depending on backend
      quantity: item.quantity,
    })),
    total: totalAmount.value,
  }

  emit('create', orderData)
  clearCart()
}
</script>

<style scoped>
.hover-effect:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.2s;
}
.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>

<script setup lang="ts">
import type { RealtimeSubscription } from '@supabase/supabase-js'


import {
  range as _range,
  random as _random,
  get as _get,
  pull as _pull,
  findIndex as _findIndex,
  concat as _concat,
} from "lodash";

const route = useRoute();

// Auth
// profile attrs
type ProfileAttrs = {
  username?: string;
  website?: string;
  avatar_url?: string;
};
const allowedIds = ["7100edbc-1590-4244-b595-c2dac0f7f2cb"];
const allowedEmails = [
  "kjoeveer@gmail.com",
  "alexaus2002@gmail.com",
  "Freddy.Jakobson@gmail.com",
  "goodmenmedia@gmail.com",
  "avainaru@gmail.com",
  "aureliakene@gmail.com",
];
const user = useSupabaseUser();
const client = useSupabaseClient();

let subscription: RealtimeSubscription

async function signOut() {
  const { error } = await client.auth.signOut();
  navigateTo("/login");
}

// Meta
useHead({
  bodyAttrs: {
    class: "bg-secondary",
  },
});

// Get Data
const { data: menuData } = await useAsyncData("menu", async () => {
  const { data } = await client
    .from("menu")
    .select("id, type, name, description, price, vegan, alcohol");

  return data;
});
const { data: orderData, refresh: refreshOrder } = await useAsyncData("orders", async () => {
  const { data } = await client
    .from("orders")
    .select("id, source, created_at, done_by")
    .eq("id", route.params.id)
    .single();
  return data;
});
onMounted(() => {
  subscription = client.from('orders').on('*', () => {
    refreshOrder()
  }).subscribe()
})
onUnmounted(() => {
  client.removeSubscription(subscription)
})

if(orderData.value == null) {
  navigateTo('/')
}


const { data: orderItemsData } = await useAsyncData("order_items", async () => {
  const { data } = await client
    .from("order_items")
    .select("id, menu_id")
    .eq("order_id", route.params.id);
  return data;
});
const { data: profileData } = await useAsyncData("profiles", async () => {
  if (user.value) {
    const { data } = await client
      .from("profiles")
      .select("id, username, avatar_url, website, updated_at, admin")
      .eq("id", user.value.id);
    return data;
  }
  return false;
});
const menu = reactive(menuData);

const order = reactive({
  pasta: [],
  pizza: [],
  lemonade: [],
  beer: [],
  wine: [],
  all: [],
});

// Methods

function removeAllItems() {
  order.pasta.length = 0;
  order.pizza.length = 0;
  order.lemonade.length = 0;
  order.wine.length = 0;
  order.beer.length = 0;
  order.all.length = 0;
  menu.value.forEach(function(item) {
    item.quantity = 0;
  });
}

function countArrayElements(arr) {
  const count = {};
  arr.forEach((element) => {
    count[element] = (count[element] || 0) + 1;
  });
  return count;
}

let orderItems = {};
let orderList = [];
orderItemsData.value.forEach((element) => {
  orderItems[element.menu_id] = (orderItems[element.menu_id] || 0) + 1;
});
for (const [key, value] of Object.entries(orderItems)) {
  orderList.push({
    item_id: key,
    quantity: value,
  });
}

menu.value.forEach((item) => {
  item.quantity = 0;
  orderList.forEach((order) => {
    if (order.item_id == item.id) {
      item.quantity = order.quantity;
    }
  });
});

// Computed
const totalPrice = computed(() => {
  let price = 0;
  menu.value.forEach((item) => {
    price = price + item.price * item.quantity;
  });
  return price;
});
</script>
<template>
  <!-- Hero -->
  <section
    class="pt-24 md:mt-0 h-screen flex flex-col-reverse justify-center text-center md:text-left md:flex-row md:justify-between md:items-center lg:px-48 md:px-12 px-4 bg-secondary"
  >
    <div v-if="orderData" class=" md:flex-1 md:mr-10">
      <div
        v-if="orderData?.done_by"
        class="flex justify-center md:justify-start md:items-center"
      >
        <h1 class="xl:text-4xl text-2xl font-bold mb-7 text-left">
          Toit on valmis! Tule ja naudi! :)
        </h1>
      </div>
      <div v-else class="flex justify-center md:justify-start md:items-center">
        <h1 class="xl:text-4xl text-2xl font-bold mb-7 text-left">
          Toit on valmimas! :)
        </h1>
      </div>
      <p class="font-normal">
        <b>Sinu tellimus:</b>
      </p>
      <div v-for="item in menu" :key="item">
        <p v-if="item?.quantity > 0">
          <b>{{ item.quantity }}x</b>
          {{ item.name }}<br />
        </p>
      </div>
    </div>
    <div class="mx-auto justify-around lg:m-auto md:m-0 md:flex-1">
      <div class="relative">
        <img
          src="/Highlight1.svg"
          alt=""
          class="absolute -top-14 -left-10 hidden lg:block"
        />
      </div>
      <img
        v-if="orderData?.done_by"
        class="m-auto w-32 mb-10 md:w-full md:m-2 max-w-xs xl:max-w-lg 2xl:max-w-xl"
        src="/pastaljano-pizza-pug.svg"
        alt="pastaljano-pizza-pug"
      />
      <img
        v-else
        class="m-auto w-32 mb-10 md:w-full md:m-2 max-w-xs xl:max-w-lg 2xl:max-w-xl"
        src="/pastaljano-lifestyle-pug.svg"
        alt="pastaljano-lifestyle-pug"
      />
      <div class="relative">
        <img
          src="/Highlight2.svg"
          alt=""
          class="absolute -bottom-10 -right-6 hidden lg:block"
        />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import {
  range as _range,
  random as _random,
  get as _get,
  pull as _pull,
  findIndex as _findIndex,
  concat as _concat,
} from "lodash";
import QRCode from 'qrcode'
import TimeAgo from 'javascript-time-ago'
import en from 'javascript-time-ago/locale/en'
import type { RealtimeSubscription } from '@supabase/supabase-js'

const orderUrlOrigin = "https://pastaljano.surge.sh/order/"

const route = useRoute()
const user = useSupabaseUser();
const client = useSupabaseClient();
const router = useRouter();

let subscription: RealtimeSubscription
const qrId = ref('')
const clientName = ref("");
const buttonsLoading = ref(false);
const order = reactive({
  pasta: [],
  pizza: [],
  lemonade: [],
  beer: [],
  wine: [],
  all: [],
});

type ProfileAttrs = {
  username?: string;
  website?: string;
  avatar_url?: string;
};

async function getQRCode(message: string) {
  const finalURL = orderUrlOrigin.concat(message)
  const response = await QRCode.toDataURL(finalURL)
  .catch(err => {
    return null
  })
  qrId.value = response;
  return response
}


TimeAgo.setDefaultLocale(en.locale)
TimeAgo.addLocale(en)
const timeAgo = new TimeAgo('en-US')


// Auth
const allowedIds = ["7100edbc-1590-4244-b595-c2dac0f7f2cb"];
const allowedEmails = [
  "kjoeveer@gmail.com",
  "yabodo@vivaldi.net",
  "pastaljano@gmail.com",
  "alexaus2002@gmail.com",
  "Freddy.Jakobson@gmail.com",
  "goodmenmedia@gmail.com",
  "avainaru@gmail.com",
  "aureliakene@gmail.com",
];

watchEffect(() => {
  if (!user.value) {
    router.push("/");
  }
})

async function signOut() {
  const { error } = await client.auth.signOut();
  router.push("/");
}

// Meta
useHead({
  bodyAttrs: {
    class: "bg-secondary",
  },
});

// Get Data
const { data: ordersListData, refresh: refreshOrder } = await useAsyncData("orders", async () => {
  const { data } = await client
    .from("orders")
    .select("id, name, created_at, done_by, source")
    .order("done_by", { ascending: true, nullsFirst: true })
    .order("created_at", { ascending: true })
  .is('done_by', null);

  return data;
});
const orderList = reactive(ordersListData);

const { data: menuData } = await useAsyncData("menu", async () => {
  const { data } = await client
    .from("menu")
    .select("id, type, name, shortname, description, price, vegan, alcohol")
    .order("shortname", { ascending: true, nullsFirst: false });
  return data;
});
menuData.value.forEach(function(element) {
  element.quantity = 0;
});

async function createOrderItems(orderId: String) {
  let payload = [];
  order.all.forEach((item) => {
    console.log(item);
    payload.push({
      order_id: orderId,
      menu_id: item,
    });
  });
  const response = await client.from("order_items").insert(payload);
  if (response.error) return response.error;
  return response;
}

async function createOrder() {
  const { data, error } = await client
    .from("orders")
    .insert([{ source: "website", name: clientName.value }]);
  if (error) return error;
  return { id: data[0].id, error };
}

async function submitOrder() {
  let onlyDrinks = (this.order.pasta.length+this.order.pizza.length) == 0
  if(onlyDrinks) clientName.value = "Drinker"
  if (
    this.order?.all?.length > 0 &&
    clientName.value != "" &&
    !buttonsLoading.value
  ) {
    buttonsLoading.value = true;
    const response = await createOrder();
    if (response.error) return response.error;
    else {
      console.log(response.id);
      const items = await createOrderItems(response.id);
      clientName.value = "";
      if(onlyDrinks) orderDelivered(response.id)
      else getQRCode(response.id);

      removeAllItems();
      //router.push("/order/${response.id}");
      buttonsLoading.value = false;
    }
  }
}

async function orderDelivered(id: String) {
  const { data, error } = await client
    .from("orders")
    .update({ done_by: ((new Date()).toISOString()) })
    .eq('id', id)
  if (error) return error;
  return { id: data[0].id, error };
}

const menu = reactive(menuData);

// Methods
function addItem(type: String, itemId: number) {
  this.menu[itemId].quantity++;

  _get(this.order, [type]).push(this.menu[itemId].id);

  this.order.all.push(this.menu[itemId].id);
}

function removeItem(type: String, itemId: number) {
  if (this.menu[itemId].quantity > 0)
    this.menu[itemId].quantity = this.menu[itemId].quantity - 1;

  let typeIndex = _get(this.order, [type]).indexOf(this.menu[itemId].id);
  if (typeIndex > -1) {
    _get(this.order, [type]).splice(typeIndex, 1);
  }

  let allIndex = this.order.all.indexOf(this.menu[itemId].id);
  if (allIndex > -1) {
    this.order.all.splice(allIndex, 1);
  }
}

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

// Computed
const totalPrice = computed(() => {
  let price = 0;
  menu.value.forEach((item) => {
    price = price + item.price * item.quantity;
  });
  return price;
});

// Mounted
onMounted(() => {
  subscription = client.from('orders').on('*', () => {
    refreshOrder()
  }).subscribe()
})
onUnmounted(() => {
  client.removeSubscription(subscription)
})
</script>

<template>
  <section class="text-grey-700 body-font">
    <!-- Dashboard -->
    <div
      class="container px-5 py-6 mx-auto flex-col justify-center items-center w-fit"
    >
      <div v-if="qrId != ''">
        <img class="mx-auto mb-4" @click="qrId = ''" :src="qrId" alt="" />
      </div>
      <div class="flex">
        <div class="w-fit">
          <div
            class="w-48 text-grey-900 bg-white border border-grey-200 rounded-lg mb-2"
          >
            <button
              aria-current="true"
              type="button"
              class="w-full px-4 py-2 font-medium text-left text-white bg-blue-700 border-b border-grey-200 rounded-t-lg cursor-pointer focus:outline-none"
            >
              Pasta
            </button>
            <div class="relative" v-for="(item, i) in menu" :key="i">
              <div v-if="item?.type == 'pasta'">
                <button
                  @click="addItem(item?.type, i)"
                  type="button"
                  class="relative inline-flex items-center w-full px-4 py-2 text-sm font-medium border-b text-grey-900 border-grey-200 rounded-t-lg hover:bg-grey-100 hover:text-blue-700 focus:text-blue-700"
                >
                  <div v-if="item.quantity > 0" class="mr-2">
                    <b>{{ item.quantity }}x</b>
                  </div>
                  {{ item.shortname }}
                </button>
                <button
                  v-if="item.quantity > 0"
                  @click="removeItem(item?.type, i)"
                  class="pl-2 py-2 absolute top-1/2 -translate-y-1/2 right-2 text-blue-600"
                >
                  <svg
                    class="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>
          <div
            class="w-48 text-grey-900 bg-white border border-grey-200 rounded-lg mb-2"
          >
            <button
              aria-current="true"
              type="button"
              class="w-full px-4 py-2 font-medium text-left text-white bg-blue-700 border-b border-grey-200 rounded-t-lg cursor-pointer focus:outline-none"
            >
              Pitsa
            </button>
            <div class="relative" v-for="(item, i) in menu" :key="i">
              <div v-if="item?.type == 'pizza'">
                <button
                  @click="addItem(item?.type, i)"
                  type="button"
                  class="relative inline-flex items-center w-full px-4 py-2 text-sm font-medium border-b text-grey-900 border-grey-200 rounded-t-lg hover:bg-grey-100 hover:text-blue-700 focus:text-blue-700"
                >
                  <div v-if="item.quantity > 0" class="mr-2">
                    <b>{{ item.quantity }}x</b>
                  </div>
                  {{ item.shortname }}
                </button>
                <button
                  v-if="item.quantity > 0"
                  @click="removeItem(item?.type, i)"
                  class="pl-2 py-2 absolute top-1/2 -translate-y-1/2 right-2 text-blue-600"
                >
                  <svg
                    class="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>
          <div
            class="w-48 text-grey-900 bg-white border border-grey-200 rounded-lg"
          >
            <button
              aria-current="true"
              type="button"
              class="w-full px-4 py-2 font-medium text-left text-white bg-blue-700 border-b border-grey-200 rounded-t-lg cursor-pointer focus:outline-none"
            >
              Joogid
            </button>
            <div class="relative" v-for="(item, i) in menu" :key="i">
              <div
                v-if="
                  item?.type != 'pizza' && item?.type != 'pasta' && item?.type
                "
              >
                <button
                  @click="addItem(item?.type, i)"
                  type="button"
                  class="relative inline-flex items-center w-full px-4 py-2 text-sm font-medium border-b text-grey-900 border-grey-200 rounded-t-lg hover:bg-grey-100 hover:text-blue-700 focus:text-blue-700"
                >
                  <div v-if="item.quantity > 0" class="mr-2">
                    <b>{{ item.quantity }}x</b>
                  </div>
                  {{ item.shortname }}
                </button>
                <button
                  v-if="item.quantity > 0"
                  @click="removeItem(item?.type, i)"
                  class="pl-2 py-2 absolute top-1/2 -translate-y-1/2 right-2 text-blue-600"
                >
                  <svg
                    class="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>
          <div>
            <form autocomplete="off" @submit.prevent="submitOrder()">
              <input
                v-model="clientName"
                type="text"
                id="website-admin"
                class="rounded bg-grey-50 border border-grey-300 text-grey-900 focus:ring-blue-500 focus:border-blue-500 block flex-1 min-w-0 w-full text-sm p-2.5"
                placeholder="Satoshi Nakamoto"
              />
            </form>
          </div>
          <div class="flex my-3 items-center justify-between w-full">
            <buttonTrash @click="removeAllItems()" />
            <div>
              <b>€{{ totalPrice }}</b>
            </div>
            <buttonFire @click="submitOrder()" />
          </div>
        </div>
        <div class="max-h-fit overflow-y-auto mx-2">
          <div class="relative overflow-x-auto shadow-md">
            <table
              class="w-full text-sm text-left text-grey-500 bg-blue-700 border border-grey-200 rounded-xl"
            >
              <thead class="text-white">
                <tr>
                  <th scope="col" class="px-6 text-base font-medium p-2">
                    Tellimused
                  </th>
                </tr>
              </thead>
              <tbody v-if="orderList">
                <tr
                  v-for="(item, i) in orderList"
                  :key="i"
                  class="bg-white border-b hover:bg-grey-50"
                >
                  <th
                    scope="row"
                    class="px-6 py-2 font-medium text-grey-900 whitespace-nowrap"
                  >
                    {{ item.name }}
                  </th>
                  <td
                    @click="orderDelivered(item.id)"
                    class="px-3 py-2 text-right cursor-pointer"
                  >
                    <div class="font-medium text-blue-600 hover:underline">
                      <svg
                        class="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        ></path>
                      </svg>
                    </div>
                  </td>
                  <td @click="getQRCode(item.id)" class="px-3 py-2 text-right">
                    <div class="font-medium text-blue-600 hover:underline">
                      <svg
                        class="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                        ></path>
                      </svg>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

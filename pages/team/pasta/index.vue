<script setup lang="ts">
import TimeAgo from "javascript-time-ago";
import en from "javascript-time-ago/locale/en";
import type { RealtimeSubscription } from '@supabase/supabase-js'

TimeAgo.setDefaultLocale(en.locale);
TimeAgo.addLocale(en);
const timeAgo = new TimeAgo("en-US");

const client = useSupabaseClient();
let subscription: RealtimeSubscription

const { data: orderItems, refresh: refreshOrder } = await useAsyncData("order_items", async () => {
  const { data } = await client
    .from("order_items")
    .select("id, menu_id, created_at, menu!inner( id, name )")
    .order("created_at", { ascending: true })
    .is("prepared_by", null)
    .eq("menu.type", "pasta")
    .limit(10);
  return data;
});
const dishes = reactive(orderItems);

async function dishDelivered(id) {
  const { data, error } = await client
    .from("order_items")
    .update({ prepared_by: new Date().toISOString() })
    .eq("id", id);
  if (error) return error;
  refreshOrder()
  return { id: data[0].id, error };
}

// Mounted
onMounted(() => {
  subscription = client.from('order_items').on('*', () => {
    refreshOrder()
  }).subscribe()
})
onUnmounted(() => {
  client.removeSubscription(subscription)
})
</script>

<template>
  <div class="max-w-xl min-h-screen px-4 mx-auto sm:px-6 lg:px-8">
    <div class="min-h-screen -mt-[50px] flex items-center justify-center">
      <div
        class="min-h-full flex flex-col justify-center py-12 sm:px-6 lg:px-8"
      >
        <NuxtLink
          to="/team"
          class="my-6 text-center text-3xl font-extrabold u-text-white cursor-pointer"
        >
          🧠 Pastajumal 🧠
        </NuxtLink>
        <div class="max-h-fit overflow-y-auto mx-2">
          <div class="relative overflow-x-auto shadow-md">
            <table
              class="w-full text-sm text-left text-grey-500 bg-blue-700 border border-grey-200 rounded-xl"
            >
              <thead class="text-white">
                <tr>
                  <th
                    @click="refreshOrder()"
                    scope="col"
                    class="px-6 text-base font-medium p-2 cursor-pointer"
                  >
                    Tellimused
                  </th>
                </tr>
              </thead>
              <tbody v-if="dishes?.length != 0">
                <tr
                  v-for="(dish, i) in dishes"
                  :key="i"
                  class="bg-white border-b hover:bg-grey-50"
                >
                  <th
                    v-if="dish?.id"
                    scope="row"
                    class="px-6 py-4 font-medium text-grey-900 whitespace-nowrap"
                  >
                    <p>
                      {{ dish.menu.name }}({{
                        timeAgo.format(Date.parse(dish.created_at), "twitter")
                      }})
                    </p>
                  </th>
                  <td
                    v-if="dish?.id"
                    class="px-3 py-2 text-right cursor-pointer"
                  >
                    <div
                      @click="dishDelivered(dish.id)"
                      class="font-medium text-blue-600 hover:underline"
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
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        ></path>
                      </svg>
                    </div>
                  </td>
                </tr>
              </tbody>
              <tbody v-if="dishes?.length == 0">
                <tr class="bg-white border-b hover:bg-grey-50">
                  <th
                    scope="row"
                    class="px-6 py-2 font-medium text-grey-900 whitespace-nowrap"
                  >
                    <p>
                      Tee houmidele pastat! ❤️
                    </p>
                  </th>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  name: String,
  quantity: Number,
});
</script>

<template>
  <div class="relative">
    <div
      @click="$emit('add')"
      class="items    border border-grey-400 rounded-lg pl-4 py-2 m-2 pr-20 cursor-pointer select-none"
    >
      <div>
        <div class="flex items-center">
          <div
            class="w-10 h-10 inline-flex items-center justify-center rounded-full bg-indigo-100 text-indigo-500"
          >
            {{ quantity }}
          </div>
          <h2 class="text-lg text-grey-800 font-medium title-font ml-4">
            {{ name }}
          </h2>
        </div>
      </div>
    </div>
    <p
      v-if="quantity > 0"
      class="text-sm text-red-800 font-medium cursor-pointer select-none title-font mx-4 py-6 z-10 absolute right-0 top-1/2 -translate-y-1/2"
      @click="$emit('remove')"
    >
      Eemalda
    </p>
  </div>
</template>

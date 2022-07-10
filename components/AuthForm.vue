<template>
  <form @submit.prevent="submit">
    <div
      v-if="err.tryAgain"
      class="p-4 mb-4 text-sm text-yellow-700 bg-yellow-100 rounded-lg dark:bg-yellow-200 dark:text-yellow-800"
      role="alert"
    >
      <span class="font-medium">🤔 Hmm..</span> Change a few things up and try
      again.
    </div>
    <fieldset>
      <div class="field">
        <label for="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          v-model="form.email"
          placeholder="Your email"
        />
      </div>
      <div class="field">
        <label for="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          v-model="form.password"
          placeholder="Your password"
        />
      </div>
      <button
        @click="submit"
        type="button"
        class="w-full text-grey-900 bg-[#F7BE38] hover:bg-[#F7BE38]/90 focus:ring-4 focus:outline-none focus:ring-[#F7BE38]/50 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:focus:ring-[#F7BE38]/50 mr-2 mb-2"
      >
        <svg
          class="w-5 h-5 mr-2 -ml-1"
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"
          ></path>
          <path
            d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"
          ></path>
        </svg>
        Sign in with Email
      </button>
    </fieldset>
  </form>
</template>

<script lang="ts" setup>
import type { UserCredentials } from '@supabase/supabase-js'
import { ref, reactive, watch } from 'vue'
const err = reactive({tryAgain: false})
const form = reactive<UserCredentials>({
    email: '',
    password: ''
})
const { $alert } = useNuxtApp()
const { resetOnSubmit } = withDefaults(defineProps<{
    resetOnSubmit?: boolean
}>(), {
    resetOnSubmit: true,
})
const emit = defineEmits<{
    (e: 'submit', creds: UserCredentials, isSignIn: true): void
}>()

const submit = function() {
        err.tryAgain = false
    // BYOV - Bring your own validation!
    if(!form.email) {
        err.tryAgain = true
        return
    }
    if(!form.email.match(/^\S+@\S+$/)) {
        err.tryAgain = true
        return
    }
    const { email, password } = form
    emit('submit', { email, password } , true)
    if(resetOnSubmit) {
        form.email = ''
        form.password = ''
    }
}
</script>

<style lang="postcss">
.field {
  @apply w-full mb-4;
}
label {
  @apply block font-semibold text-grey-800 text-base;
}
input {
  @apply w-full font-normal text-sm border border-grey-600 py-2 px-4 text-grey-700 focus:bg-grey-100 hover:border-indigo-500 rounded-md focus:outline-none;
}
.poles-apart {
  @apply flex justify-between items-center;
}
</style>

<script setup lang="ts">
import date from "date-and-time";

const user = useSupabaseUser();
const client = useSupabaseClient();

const { data: eventData } = await useAsyncData("events", async () => {
  const { data } = await client
    .from("events")
    .select("id, start_date, end_date, name, place, aeg_eesti_keeles")
    .order("start_date", { ascending: true, nullsFirst: false });

  return data;
});
</script>

<template>
  <div>
    <header class="text-grey-700 body-font">
      <div
        class="container mx-auto flex flex-wrap p-5 flex-col md:flex-row items-center"
      >
        <a
          class="flex title-font font-medium items-center text-grey-900 mb-4 md:mb-0"
        >
          <img
            class="h-10"
            src="/pastaljano-transparent-logo.png"
            alt="Pastaljano"
          />
        </a>
        <nav
          class="md:ml-auto flex flex-wrap items-center text-base justify-center"
        >
          <NuxtLink class="mr-5 hover:text-grey-900" v-if="user" to="/team"
            >Tiim</NuxtLink
          >
        </nav>

        <a href="#contact">
          <button
            class="inline-flex items-center bg-[#ec5e24]/20 border-0 py-1 px-3 focus:outline-none hover:bg-[#ec5e24]/90 hover:text-white rounded text-base mt-4 md:mt-0"
          >
            Kontakt
            <svg
              fill="none"
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              class="w-4 h-4 ml-1"
              viewBox="0 0 24 24"
            >
              <path d="M5 12h14M12 5l7 7-7 7"></path>
            </svg></button
        ></a>
      </div>
    </header>
    <section class="text-grey-700 body-font">
      <div
        class="container mx-auto flex px-5 lg:pt-24 flex-col-reverse lg:flex-row items-center"
      >
        <div
          class="lg:flex-grow md:w-1/2 lg:pr-24 flex flex-col lg:items-start lg:text-left md:mb-0 items-center text-center"
        >
          <h1
            class="title-font sm:text-4xl text-3xl mb-4 font-medium text-grey-900"
          >
            2022 oli pitsa ja päikese aasta!
          </h1>
          <p class="mb-8 leading-relaxed">
            Ehk oled meist juba varemgi kuulnud? 2021. aastal tutvustasime
            rahvale oma pastabussist autentset käsitööpastat ja võitsime
            auhindu. Sel aastal kütsid rahvast käima lisaks ka värsked
            käsitööpitsad! Tule järgmine suvi uuesti ja tule üksi, sõprade 
            või perega, sest meie toidud meeldivad kõigile!
          </p>
        </div>
        <div class="lg:max-w-lg lg:w-full md:w-1/3 w-1/3">
          <img
            class="object-cover object-center rounded"
            src="/cool-slice.svg"
            alt=""
          />
        </div>
      </div>
    </section>
    <section id="contact" class="text-grey-700 body-font">
      <div
        class="container mx-auto flex mb-20 px-5 lg:pt-24 flex-col lg:flex-row items-center lg:items-start"
      >
        <div
          class="mb-8 lg:flex-grow md:w-1/2 lg:pr-24 flex flex-col lg:items-start lg:text-left lg:mb-0 items-center text-center"
        >
          <h1 class="xl:text-4xl text-2xl font-bold mb-7 text-left">
            Selle suve üritused olid
          </h1>
          <div
            v-if="eventData?.length > 0"
            class="relative w-full overflow-x-auto shadow-md sm:rounded-lg"
          >
            <table class="w-full text-sm text-left text-grey-500">
              <thead class="text-xs text-grey-700 uppercase bg-[#ec5e24]/30">
                <tr>
                  <th scope="col" class="px-6 py-3">
                    Toimumisaeg
                  </th>
                  <th scope="col" class="px-6 py-3">
                    Ürituse nimi
                  </th>
                  <th scope="col" class="px-6 py-3">
                    Toimumiskoht
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="event in eventData"
                  :key="event.id"
                  class="border-b odd:bg-[#ec5e24]/20 even:bg-[#ec5e24]/10"
                >
                  <td class="px-6 py-4 text-grey-900 whitespace-nowrap">
                    {{ event.aeg_eesti_keeles }}
                  </td>
                  <th scope="row" class="px-6 py-4 text-grey-900 ">
                    {{ event.name }}
                  </th>
                  <td class="px-6 py-4 text-grey-900 ">
                    {{ event.place }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <form
          action="https://formspree.io/f/xdobjzbd"
          method="POST"
          class="mb-8 lg:flex-grow md:w-1/2 lg:pr-24 flex flex-col lg:items-start lg:text-left lg:mb-0 items-center text-center"
        >
          <h1 class="xl:text-4xl text-2xl font-bold mb-7 text-left">
            Võta ühendust!
          </h1>

          <div class="flex w-full mb-4">
            <div class="mr-4 w-full">
              <label
                for="form-name"
                class="block mb-2 text-sm font-medium text-grey-900"
                >Nimi</label
              >
              <div class="flex">
                <span
                  class="inline-flex items-center px-3 text-sm text-grey-900 bg-grey-200 border border-r-0 border-grey-300 rounded-l-md"
                >
                  @
                </span>
                <input
                  type="text"
                  name="name"
                  id="form-name"
                  class="rounded-none rounded-r-lg bg-grey-50 border border-grey-300 text-grey-900 focus:ring-blue-500 focus:border-blue-500 block flex-1 min-w-0 w-full text-sm p-2.5"
                  placeholder="Satoshi Nakamoto"
                />
              </div>
            </div>
            <div class="w-full">
              <label
                for="form-email"
                class="block mb-2 text-sm font-medium text-grey-900"
                >E-posti aadress</label
              >
              <div class="flex">
                <span
                  class="inline-flex items-center px-3 text-sm text-grey-900 bg-grey-200 border border-r-0 border-grey-300 rounded-l-md"
                >
                  @
                </span>
                <input
                  type="email"
                  required
                  id="form-email"
                  name="email"
                  class="rounded-none rounded-r-lg bg-grey-50 border border-grey-300 text-grey-900 focus:ring-blue-500 focus:border-blue-500 block flex-1 min-w-0 w-full text-sm p-2.5"
                  placeholder="kontakt@pastaljano.ee"
                />
              </div>
            </div>
          </div>
          <div class="mb-4 w-full">
            <label
              for="form-message"
              class="block mb-2 text-sm font-medium text-grey-900"
              >Sõnum</label
            >
            <textarea
              id="form-message"
              name="message"
              rows="4"
              class="rounded-lg bg-grey-50 border border-grey-300 text-grey-900 focus:ring-blue-500 focus:border-blue-500 focus:border block flex-1 min-w-0 w-full text-sm p-2.5"
              placeholder="Lisa oma sõnum..."
            ></textarea>
          </div>
          <button
            class="relative inline-flex items-center justify-center p-0.5 mb-2 mr-2 overflow-hidden text-sm font-medium text-grey-900 rounded-lg group bg-gradient-to-br from-purple-600 to-blue-500 group-hover:from-purple-600 group-hover:to-blue-500 hover:text-white  focus:outline-none focus:ring-blue-300"
          >
            <span
              class="relative font-semibold px-5 py-2.5 transition-all ease-in duration-75 bg-white rounded-md group-hover:bg-opacity-0"
            >
              Saada kiri
            </span>
          </button>
        </form>
      </div>
    </section>
  </div>
</template>
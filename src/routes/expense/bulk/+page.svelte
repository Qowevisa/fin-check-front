<script lang="ts">
  import { onMount } from "svelte";
  import { type Card,type Expense, type ExpenseBulk, type Type, } from "$lib/entities";
  import { selectedDate } from "$lib/stores/dateStore";
  import { NumberToFPA } from "$lib/util/fpa";
  import Toggle from "$lib/components/Toggle.svelte";

  let mutateDate = $state($selectedDate);
  let selectedTime = $state("00:00:00");
  let cards: Card[] = $state([]);
  let types: Type[] = $state([]);
  let error: string | null = $state(null);
  let newExpense: Partial<ExpenseBulk> = $state({
    propagate_card_id: false,
    card_id: 0,
    propagate_type_id: false,
    type_id: 0,
    propagate_value: false,
    value: 0,
    propagate_comment: false,
    comment: "",
    propagate_date: false,
    date: "2024-11-25T23:44:55Z",
    children: [],
  });

  onMount(async () => {
    await fetchCards(true);
    await fetchTypes();
  });

  async function fetchTypes() {
    const result = await fetch("/api/type/all");
    if (!result.ok) {
      const obj = await result.json();
      error = obj.message;
    } else {
      types = await result.json();
    }
  }
  async function fetchCards(preloadCurrencies = false) {
    const queryParams = new URLSearchParams({
      preload_currencies: preloadCurrencies.toString(),
    });

    const result = await fetch(`/api/card/all?${queryParams}`);
    if (!result.ok) {
      const obj = await result.json();
      error = obj.message;
    } else {
      cards = await result.json();
    }
  }

  async function sendBulk() {
    const endpoint = "/api/expense/bulk_create";
    const method = "POST";

    const data = {
      ...currentExpense,
      card_id: Number(currentExpense.card_id),
      value: Number(currentExpense.value),
      date: constructedTime,
      children: currentExpense.children?.map(old => {return {...old, date: `${old.date}:00Z`}})
    };
    const response = await fetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const { message } = await response.json();
      error = message;
    } else {
      newExpense = {
    propagate_card_id: false,
    card_id: 0,
    propagate_type_id: false,
    type_id: 0,
    propagate_value: false,
    value: 0,
    propagate_comment: false,
    comment: "",
    propagate_date: false,
    date: "2024-11-25T23:44:55Z",
    children: [],
      };
    }
  }

  let valueRef: HTMLInputElement | null = $state(null);
  function handleValueInput(
    event: Event & { currentTarget: EventTarget & HTMLInputElement },
  ): void {
    const target = event.target as HTMLInputElement;
    const rawValue = target.value.replace(/[^0-9]/g, "");
    currentExpense.value = parseInt(rawValue || "0");
    target.value = NumberToFPA(currentExpense.value);
  }

  function getBalanceOfSelectedCardAfterExpense(): string {
    if (currentExpense.card_id == 0 || currentExpense.value == 0) {
      return "";
    }
    const selectedCard = cards.find(
      (card) => card.id == currentExpense.card_id,
    );
    return `Value of ${selectedCard?.display_name} after expense${Number(currentExpense.children?.length) > 1 ? "s" : ""} = `+
      `${NumberToFPA(Number(selectedCard?.balance) - (Number(currentExpense.value)*Number(currentExpense.children?.length)))}`;
  }

  function createHandler(expenseChild: Partial<Expense>) {
    return function handlePriceInput(event: Event & { currentTarget: EventTarget & HTMLInputElement }) {
      const target = event.target as HTMLInputElement;
      const rawValue = target.value.replace(/[^0-9]/g, "");
      expenseChild.value = parseInt(rawValue || "0");
      target.value = NumberToFPA(expenseChild.value);
    };
  }


  const constructedTime = $derived(`${mutateDate}T${selectedTime}Z`);
  const currentExpense = $derived(newExpense);
  const selectedType = $derived(
    types.find((type) => type.id == currentExpense.type_id) || {
      color: "#000",
    },
  );
  $inspect(currentExpense);
  $inspect("constructedTime = ", constructedTime);
</script>

{#if error}
  <p class="bg-red-100 text-red-700 p-4 rounded">{error}</p>
{/if}

<div class="container mx-auto my-8 p-6 bg-gray-100 rounded-lg shadow-lg">
  <div class="flex flex-row justify-center mb-4">
    <button
      class="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
    >
      <a href="/expense">back</a>
    </button>
  <h1 class="text-2xl font-bold text-center">Manage Expenses in Bulk</h1>
  </div>

  <div class="mb-8 p-6 bg-white rounded-lg shadow-md">
    <h2 class="text-xl font-semibold mb-4">Add New Root Expense</h2>
    <form onsubmit={sendBulk} class="space-y-4">
      <Toggle
        changeField={currentExpense.propagate_card_id}
        onChangeFunc={() => {
          currentExpense.propagate_card_id = !currentExpense.propagate_card_id;
          currentExpense.card_id = 0;
        }}
        title={"Set parent card_id"}
      />
      {#if currentExpense.propagate_card_id}
        <label class="block">
          <span class="text-gray-700">Card:</span>
          <select
            bind:value={currentExpense.card_id}
            class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-indigo-200 focus:border-indigo-500"
          >
            {#each cards as card}
              <option value={card.id}>{card.display_name}</option>
            {/each}
          </select>
        </label>
      {/if}

      <Toggle
        changeField={currentExpense.propagate_type_id}
        onChangeFunc={() => {
          currentExpense.propagate_type_id = !currentExpense.propagate_type_id;
          currentExpense.type_id = 0;
        }}
        title={"Set parent type_id"}
      />
      {#if currentExpense.propagate_type_id}
        <label class="block">
          <span class="text-gray-700">Type:</span>
          <select
            bind:value={currentExpense.type_id}
            style="color: {selectedType.color};"
            class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-indigo-200 focus:border-indigo-500"
          >
            {#each types as type}
              <option value={type.id}>{type.name}</option>
            {/each}
          </select>
        </label>
      {/if}

      <Toggle
        changeField={currentExpense.propagate_value}
        onChangeFunc={() => {
          currentExpense.propagate_value = !currentExpense.propagate_value;
          currentExpense.value = 0;
        }}
        title={"Set parent value"}
      />
      {#if currentExpense.propagate_value}
        <label class="block">
          <span class="text-gray-700">Value:</span>
          <input
            type="text"
            oninput={handleValueInput}
            bind:this={valueRef}
            required
            class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-indigo-200 focus:border-indigo-500"
          />
        </label>
      <span>{getBalanceOfSelectedCardAfterExpense()}</span>
      {/if}

      <Toggle
        changeField={currentExpense.propagate_comment}
        onChangeFunc={() => {
          currentExpense.propagate_comment = !currentExpense.propagate_comment;
          currentExpense.comment = "";
        }}
        title={"Set parent comment"}
      />
      {#if currentExpense.propagate_comment}
        <label class="block">
          <span class="text-gray-700">Comment:</span>
          <input
            type="text"
            bind:value={currentExpense.comment}
            required
            class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-indigo-200 focus:border-indigo-500"
          />
        </label>
      {/if}

      <Toggle
        changeField={currentExpense.propagate_date}
        onChangeFunc={() => {
          currentExpense.propagate_date = !currentExpense.propagate_date;
          currentExpense.date = "";
        }}
        title={"Set parent date"}
      />
      {#if currentExpense.propagate_date}
        <div class="flex items-center space-x-4">
          <label>
            Date:
            <input
              type="date"
              bind:value={mutateDate}
              class="bg-gray-800 text-white p-2 rounded-md border border-gray-700"
            />
          </label>

          <label>
            Time:
            <input
              type="time"
              bind:value={selectedTime}
              class="bg-gray-800 text-white p-2 rounded-md border border-gray-700"
            />
          </label>
        </div>
      {/if}

      {#each (currentExpense.children as Partial<Expense>[])  as child, index}
        <div class="p-4 bg-white mb-4 rounded-lg shadow-md">
          <h4 class="text-gray-900 font-bold mb-2">Expense {index + 1}</h4>
          <!-- CARD_ID -->
          {#if !currentExpense.propagate_card_id}
            <label class="block">
              <span class="text-gray-700">Card_id:</span>
              <select
                bind:value={child.card_id}
                class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-indigo-200 focus:border-indigo-500"
              >
                {#each cards as card}
                  <option value={card.id}>{card.display_name}</option>
                {/each}
              </select>
            </label>
          {/if}
          <!-- TYPE_ID -->
          {#if !currentExpense.propagate_type_id}
            <label class="block">
              <span class="text-gray-700">Type_id:</span>
              <select
                bind:value={child.type_id}
                style="color: {types.find((type) => type.id == child.type_id)?.color};"
                class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-indigo-200 focus:border-indigo-500"
              >
                {#each types as type}
                  <option value={type.id}>{type.name}</option>
                {/each}
              </select>
            </label>
          {/if}
          <!-- VALUE -->
          {#if !currentExpense.propagate_value}
            <label class="block">
              <span class="text-gray-700">Value:</span>
              <input
                type="text"
                oninput={createHandler(child)}
                required
                class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-indigo-200 focus:border-indigo-500"
              />
            </label>
          {/if}
          <!-- COMMENT -->
          {#if !currentExpense.propagate_comment}
            <label class="block">
              <span class="text-gray-700">Comment:</span>
              <input
                type="text"
                bind:value={child.comment}
                required
                class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-indigo-200 focus:border-indigo-500"
              />
            </label>
          {/if}
          <!-- DATE -->
          {#if !currentExpense.propagate_date}
            <div class="flex items-center space-x-4">
              <label>
                Date:
                <input
                  type="date"
                  oninput={(event: Event & { currentTarget: EventTarget & HTMLInputElement }) => {
                    const target = event.target as HTMLInputElement;
                    const timePart = child.date?.split("T")[1] || "00:00:00Z";
                    const newDate = target.value;
                    child.date = `${newDate}T${timePart}`;
                  }}
                  class="bg-gray-800 text-white p-2 rounded-md border border-gray-700"
                />
              </label>

              <label>
                Time:
                <input
                  type="time"
                  oninput={(event: Event & { currentTarget: EventTarget & HTMLInputElement }) => {
                    const target = event.target as HTMLInputElement;
                    const datePart = child.date?.split("T")[0] || "2024-01-01";
                    const newTime = target.value;
                    child.date = `${datePart}T${newTime}`;
                  }}
                  class="bg-gray-800 text-white p-2 rounded-md border border-gray-700"
                />
              </label>
            </div>
          {/if}
        </div>
      {/each}

      <button
        type="button"
        class="mb-4 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
        onclick={() => {
          currentExpense.children?.push({
            id: 0,
            card_id: 0,
            type_id: 0,
            value: 0,
            comment: "",
            date: "",
            show_value: "",
          });
        }}
      >
        + Add Item
      </button>

      <div class="flex space-x-2">
        <button
          type="submit"
          class="px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600"
        >
          Add Expense
        </button>
      </div>
    </form>
  </div>
</div>

<script lang="ts">
  import { onMount } from "svelte";
  import { type Card, type Income, type Type } from "$lib/entities";
  import { selectedDate } from "$lib/stores/dateStore";
  import { NumberToFPA } from "$lib/util/fpa";

  let mutateDate = $state($selectedDate);
  let selectedTime = $state("00:00:00");
  let incomes: Income[] = $state([]);
  let cards: Card[] = $state([]);
  let types: Type[] = $state([]);
  let error: string | null = $state(null);
  let editingIncome: Income | null = $state(null);
  let newIncome: Partial<Income> = $state({
    card_id: 0,
    value: 0,
    comment: "",
    date: "2006-01-02T15:04:05Z",
  });

  onMount(async () => {
    await fetchCategories();
    await fetchCards();
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
  async function fetchCards() {
    const result = await fetch("/api/card/all");
    if (!result.ok) {
      const obj = await result.json();
      error = obj.message;
    } else {
      cards = await result.json();
    }
  }
  async function fetchCategories() {
    const result = await fetch("/api/income/all");
    if (!result.ok) {
      const obj = await result.json();
      error = obj.message;
    } else {
      incomes = await result.json();
    }
  }

  async function saveIncome() {
    const endpoint = editingIncome
      ? `/api/income/update`
      : "/api/income/create";
    const method = editingIncome ? "PUT" : "POST";

    const data = {
      ...currentIncome,
      card_id: Number(currentIncome.card_id),
      value: Number(currentIncome.value),
      date: constructedTime,
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
      await fetchCategories();
      if (editingIncome) {
        editingIncome = null;
      } else {
        newIncome = {
          card_id: 0,
          value: 0,
          comment: "",
          date: "",
        };
      }
    }
  }

  function editIncome(income: Income) {
    editingIncome = { ...income };
    const parts = income.date.split("T");
    mutateDate = parts[0];
    selectedTime = parts[1].split("Z")[0];
    if (valueRef) {
      valueRef.value = NumberToFPA(income.value);
    }
  }

  async function deleteIncome(id: number) {
    const response = await fetch(`/api/income/delete`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (!response.ok) {
      const { message } = await response.json();
      error = message;
    } else {
      await fetchCategories();
    }
  }

  // Helper function to get the name of the parent category
  function getCardName(cardId: number) {
    if (cardId === 0) return "None";
    const card = cards.find((card) => card.id === cardId);
    return card ? card.name : "Unknown";
  }

  let valueRef: HTMLInputElement | null = $state(null);
  function handleValueInput(
    event: Event & { currentTarget: EventTarget & HTMLInputElement },
  ): void {
    const target = event.target as HTMLInputElement;
    const rawValue = target.value.replace(/[^0-9]/g, "");
    currentIncome.value = parseInt(rawValue || "0");
    target.value = NumberToFPA(currentIncome.value);
  }

  const constructedTime = $derived(`${mutateDate}T${selectedTime}Z`);
  const currentIncome = $derived(editingIncome ?? newIncome);
  $inspect(currentIncome);
  $inspect("constructedTime = ", constructedTime);
</script>

{#if error}
  <p class="bg-red-100 text-red-700 p-4 rounded">{error}</p>
{/if}

<div class="container mx-auto my-8 p-6 bg-gray-100 rounded-lg shadow-lg">
  <h1 class="text-2xl font-bold mb-4 text-center">Manage Incomes</h1>

  <div class="mb-8 p-6 bg-white rounded-lg shadow-md">
    <h2 class="text-xl font-semibold mb-4">
      {editingIncome ? "Edit Income" : "Add New Income"}
    </h2>
    <form onsubmit={saveIncome} class="space-y-4">
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

      <label class="block">
        <span class="text-gray-700">Card:</span>
        <select
          bind:value={currentIncome.card_id}
          class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-indigo-200 focus:border-indigo-500"
        >
          {#each cards as card}
            <option value={card.id}>{card.name}</option>
          {/each}
        </select>
      </label>

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

      <div class="flex space-x-2">
        <button
          type="submit"
          class="px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600"
        >
          {editingIncome ? "Update Income" : "Add Income"}
        </button>
        {#if editingIncome}
          <button
            type="button"
            onclick={() => (editingIncome = null)}
            class="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
          >
            Cancel
          </button>
        {/if}
      </div>
    </form>
  </div>

  <h2 class="text-xl font-semibold mb-4 text-center">Incomes List</h2>
  <ul class="space-y-4">
    {#each incomes as income}
      <li
        class="bg-white p-4 rounded-lg shadow-md flex justify-between items-center"
      >
        <div>
          <strong class="block text-lg">{NumberToFPA(income.value)}</strong>
          <div class="text-sm text-gray-600">
            <span class="font-bold">Card:</span>
            {getCardName(income.card_id)}
            <span class="font-bold">Date:</span>
            {income.date}
          </div>
        </div>
        <div class="flex space-x-2">
          <button
            onclick={() => editIncome(income)}
            class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Edit
          </button>
          <button
            onclick={() => deleteIncome(income.id)}
            class="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
          >
            Delete
          </button>
        </div>
      </li>
    {/each}
  </ul>
</div>

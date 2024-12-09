<script lang="ts">
  import { onMount } from "svelte";
  import { type Card, type Expense, type Type } from "$lib/entities";
  import { selectedDate } from "$lib/stores/dateStore";
  import { NumberToFPA } from "$lib/util/fpa";

  let mutateDate = $state($selectedDate);
  let selectedTime = $state("00:00:00");
  let expenses: Expense[] = $state([]);
  let cards: Card[] = $state([]);
  let types: Type[] = $state([]);
  let error: string | null = $state(null);
  let editingExpense: Expense | null = $state(null);
  let newExpense: Partial<Expense> = $state({
    card_id: 0,
    value: 0,
    comment: "",
    date: "2006-01-02T15:04:05Z",
  });

  onMount(async () => {
    await fetchCategories();
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
  async function fetchCategories() {
    const result = await fetch("/api/expense/all");
    if (!result.ok) {
      const obj = await result.json();
      error = obj.message;
    } else {
      expenses = await result.json();
    }
  }

  async function saveExpense() {
    const endpoint = editingExpense
      ? `/api/expense/update`
      : "/api/expense/create";
    const method = editingExpense ? "PUT" : "POST";

    const data = {
      ...currentExpense,
      card_id: Number(currentExpense.card_id),
      value: Number(currentExpense.value),
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
      if (editingExpense) {
        editingExpense = null;
      } else {
        newExpense = {
          card_id: 0,
          value: 0,
          comment: "",
          date: "",
        };
      }
    }
  }

  function editExpense(expense: Expense) {
    editingExpense = { ...expense };
    const parts = expense.date.split("T");
    mutateDate = parts[0];
    selectedTime = parts[1].split("Z")[0];
    if (valueRef) {
      valueRef.value = NumberToFPA(expense.value);
    }
  }

  async function deleteExpense(id: number) {
    const response = await fetch(`/api/expense/delete`, {
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
  function getTypeColor(typeId: number) {
    if (typeId === 0) return "None";
    const type = types.find((card) => card.id === typeId);
    return type ? type.color : "#000";
  }
  function getTypeName(typeId: number) {
    if (typeId === 0) return "None";
    const type = types.find((card) => card.id === typeId);
    return type ? type.name : "Unknown";
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
    return `Value of ${selectedCard?.display_name} after expense = ${NumberToFPA(Number(selectedCard?.balance) - Number(currentExpense.value))}`;
  }

  const constructedTime = $derived(`${mutateDate}T${selectedTime}Z`);
  const currentExpense = $derived(editingExpense ?? newExpense);
  const selectedType = $derived(
    types.find((type) => type.id == currentExpense.type_id) || {
      color: "#fff",
    },
  );
  $inspect(currentExpense);
  $inspect("constructedTime = ", constructedTime);
</script>

{#if error}
  <p class="bg-red-100 text-red-700 p-4 rounded">{error}</p>
{/if}

<div class="container mx-auto my-8 p-6 bg-gray-100 rounded-lg shadow-lg">
  <div class="flex flex-row mb-4 justify-center">
    <h1 class="text-2xl font-bold text-center">Manage Expenses</h1>
    <button
      class="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
    >
      <a href="/expense/bulk">bulk</a>
    </button>
  </div>

  <div class="mb-8 p-6 bg-white rounded-lg shadow-md">
    <h2 class="text-xl font-semibold mb-4">
      {editingExpense ? "Edit Expense" : "Add New Expense"}
    </h2>
    <form onsubmit={saveExpense} class="space-y-4">
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
        <span class="text-gray-700">Comment:</span>
        <input
          type="text"
          bind:value={currentExpense.comment}
          required
          class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-indigo-200 focus:border-indigo-500"
        />
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
      <span>{getBalanceOfSelectedCardAfterExpense()}</span>

      <div class="flex space-x-2">
        <button
          type="submit"
          class="px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600"
        >
          {editingExpense ? "Update Expense" : "Add Expense"}
        </button>
        {#if editingExpense}
          <button
            type="button"
            onclick={() => (editingExpense = null)}
            class="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
          >
            Cancel
          </button>
        {/if}
      </div>
    </form>
  </div>

  <h2 class="text-xl font-semibold mb-4 text-center">Expenses List</h2>
  <ul class="space-y-4">
    {#each expenses as expense}
      <li
        class="bg-white p-4 rounded-lg shadow-md flex justify-between items-center"
      >
        <div>
          <strong class="block text-lg">{expense.show_value}</strong>
          <div class="text-sm text-gray-600">
            <span class="font-bold">Card:</span>
            {expense.card.display_name}
            <span class="font-bold">Type:</span>
            <span style="color: {getTypeColor(expense.type_id)};"
              >{getTypeName(expense.type_id)}</span
            >
            <span class="font-bold">Date:</span>
            {expense.date}
          </div>
        </div>
        <div class="flex space-x-2">
          <button
            onclick={() => editExpense(expense)}
            class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Edit
          </button>
          <button
            onclick={() => deleteExpense(expense.id)}
            class="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
          >
            Delete
          </button>
        </div>
      </li>
    {/each}
  </ul>
</div>

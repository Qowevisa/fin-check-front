<script lang="ts">
  import { onMount } from "svelte";
  import { type Card } from "$lib/entities";

  let cards: Card[] = $state([]);
  let error: string | null = $state(null);
  let editingCard: Card | null = $state(null);
  let newCard: Partial<Card> = $state({
    balance: 0,
    credit_line: 0,
    have_credit_line: false,
    name: "",
  });

  // Fetch all cards on page load
  onMount(async () => {
    await fetchCards();
  });

  async function fetchCards() {
    const result = await fetch("/api/card/all");
    if (!result.ok) {
      const obj = await result.json();
      error = obj.message;
    } else {
      cards = await result.json();
    }
  }

  async function saveCard() {
    const endpoint = editingCard ? `/api/card/update` : "/api/card/create";
    const method = editingCard ? "PUT" : "POST";

    const response = await fetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editingCard || newCard),
    });

    if (!response.ok) {
      const { message } = await response.json();
      error = message;
    } else {
      await fetchCards();
      if (editingCard) {
        editingCard = null;
      } else {
        newCard = {
          balance: 0,
          credit_line: 0,
          have_credit_line: false,
          name: "",
        };
      }
    }
  }

  function editCard(card: Card) {
    editingCard = { ...card };
  }

  async function deleteCard(id: number) {
    const response = await fetch(`/api/card/delete`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (!response.ok) {
      const { message } = await response.json();
      error = message;
    } else {
      await fetchCards();
    }
  }

  const currentCard = $derived(editingCard ?? newCard);
</script>

{#if error}
  <p class="bg-red-100 text-red-700 p-4 rounded">{error}</p>
{/if}

<div class="container mx-auto my-8 p-6 bg-gray-100 rounded-lg shadow-lg">
  <h1 class="text-2xl font-bold mb-4 text-center">Manage Cards</h1>

  <div class="mb-8 p-6 bg-white rounded-lg shadow-md">
    <h2 class="text-xl font-semibold mb-4">
      {editingCard ? "Edit Card" : "Add New Card"}
    </h2>
    <form onsubmit={saveCard} class="space-y-4">
      <label class="block">
        <span class="text-gray-700">Name:</span>
        <input
          type="text"
          bind:value={currentCard.name}
          required
          class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-indigo-200 focus:border-indigo-500"
        />
      </label>
      <label class="block">
        <span class="text-gray-700">Balance:</span>
        <input
          type="number"
          bind:value={currentCard.balance}
          required
          class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-indigo-200 focus:border-indigo-500"
        />
      </label>
      {#if currentCard.have_credit_line}
        <label class="block">
          <span class="text-gray-700">Credit Line:</span>
          <input
            type="number"
            bind:value={currentCard.credit_line}
            class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-indigo-200 focus:border-indigo-500"
          />
        </label>
      {/if}
      <label class="flex items-center">
        <input
          type="checkbox"
          bind:checked={currentCard.have_credit_line}
          class="form-checkbox"
        />
        <span class="ml-2 text-gray-700">Have Credit Line</span>
      </label>
      <div class="flex space-x-2">
        <button
          type="submit"
          class="px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600"
        >
          {editingCard ? "Update Card" : "Add Card"}
        </button>
        {#if editingCard}
          <button
            type="button"
            onclick={() => (editingCard = null)}
            class="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
          >
            Cancel
          </button>
        {/if}
      </div>
    </form>
  </div>

  <h2 class="text-xl font-semibold mb-4 text-center">Cards List</h2>
  <ul class="space-y-4">
    {#each cards as card}
      <li
        class="bg-white p-4 rounded-lg shadow-md flex justify-between items-center"
      >
        <div>
          <strong class="block text-lg">{card.name}</strong>
          <div class="text-sm text-gray-600">
            Balance: {card.balance}, Credit Line: {card.credit_line},{" "}
            Have Credit Line: {card.have_credit_line ? "Yes" : "No"}
          </div>
        </div>
        <div class="flex space-x-2">
          <button
            onclick={() => editCard(card)}
            class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Edit
          </button>
          <button
            onclick={() => deleteCard(card.id)}
            class="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
          >
            Delete
          </button>
        </div>
      </li>
    {/each}
  </ul>
</div>

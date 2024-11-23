<script lang="ts">
  import { onMount } from "svelte";
  import { type Card, type Transfer } from "$lib/entities";
  import { selectedDate } from "$lib/stores/dateStore";
  import { NumberToFPA } from "$lib/util/fpa";

  let mutateDate = $state($selectedDate);
  let selectedTime = $state("00:00:00");
  let transfers: Transfer[] = $state([]);
  let cards: Card[] = $state([]);
  let error: string | null = $state(null);
  let editingTransfer: Transfer | null = $state(null);
  let newTransfer: Partial<Transfer> = $state({
    from_card_id: 0,
    to_card_id: 0,
    card_id: 0,
    value: 0,
    to_value: 0,
    from_value: 0,
    date: "2006-01-02T15:04:05Z",
  });

  onMount(async () => {
    await fetchCategories();
    await fetchCards(true);
  });

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
    const result = await fetch("/api/transfer/all");
    if (!result.ok) {
      const obj = await result.json();
      error = obj.message;
    } else {
      transfers = await result.json();
    }
  }

  async function saveTransfer() {
    const endpoint = editingTransfer
      ? `/api/transfer/update`
      : "/api/transfer/create";
    const method = editingTransfer ? "PUT" : "POST";

    const data = {
      ...currentTransfer,
      from_card_id: Number(currentTransfer.from_card_id),
      to_card_id: Number(currentTransfer.to_card_id),
      value: Number(currentTransfer.value),
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
      if (editingTransfer) {
        editingTransfer = null;
      } else {
        newTransfer = {
          from_card_id: 0,
          to_card_id: 0,
          value: 0,
          to_value: 0,
          from_value: 0,
          date: "",
        };
      }
    }
  }

  function editTransfer(transfer: Transfer) {
    editingTransfer = { ...transfer };
    const parts = transfer.date.split("T");
    mutateDate = parts[0];
    selectedTime = parts[1].split("Z")[0];
    if (valueRef) {
      valueRef.value = NumberToFPA(transfer.value);
    }
  }

  async function deleteTransfer(id: number) {
    const response = await fetch(`/api/transfer/delete`, {
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
  function doesCurrentTransferHasSameCurrencies(): boolean {
    if (currentTransfer.from_card_id == 0 || currentTransfer.to_card_id == 0) {
      return true;
    }
    return (
      cards.find((card) => card.id == currentTransfer.from_card_id)
        ?.currency_id ==
      cards.find((card) => card.id == currentTransfer.to_card_id)?.currency_id
    );
  }

  let valueRef: HTMLInputElement | null = $state(null);
  function createHandleValueInput(field: "value" | "from_value" | "to_value") {
    return function (
      event: Event & { currentTarget: EventTarget & HTMLInputElement },
    ): void {
      const target = event.target as HTMLInputElement;
      const rawValue = target.value.replace(/[^0-9]/g, "");
      const parsedValue = parseInt(rawValue || "0");
      currentTransfer[field] = parsedValue;
      target.value = NumberToFPA(parsedValue);
    };
  }

  const constructedTime = $derived(`${mutateDate}T${selectedTime}Z`);
  const currentTransfer = $derived(editingTransfer ?? newTransfer);
  $inspect(currentTransfer);
  $inspect("constructedTime = ", constructedTime);
</script>

{#if error}
  <p class="bg-red-100 text-red-700 p-4 rounded">{error}</p>
{/if}

<div class="container mx-auto my-8 p-6 bg-gray-100 rounded-lg shadow-lg">
  <h1 class="text-2xl font-bold mb-4 text-center">Manage Transfers</h1>

  <div class="mb-8 p-6 bg-white rounded-lg shadow-md">
    <h2 class="text-xl font-semibold mb-4">
      {editingTransfer ? "Edit Transfer" : "Add New Transfer"}
    </h2>
    <form onsubmit={saveTransfer} class="space-y-4">
      <label class="block">
        <span class="text-gray-700">From:</span>
        <select
          bind:value={currentTransfer.from_card_id}
          class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-indigo-200 focus:border-indigo-500"
        >
          {#each cards as card}
            {#if card.id != currentTransfer.to_card_id}
              <option value={card.id}>{card.name}</option>
            {/if}
          {/each}
        </select>
      </label>

      <label class="block">
        <span class="text-gray-700">To:</span>
        <select
          bind:value={currentTransfer.to_card_id}
          class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-indigo-200 focus:border-indigo-500"
        >
          {#each cards as card}
            {#if card.id != currentTransfer.from_card_id}
              <option value={card.id}>{card.name}</option>
            {/if}
          {/each}
        </select>
      </label>

      {#if doesCurrentTransferHasSameCurrencies()}
        <label class="block">
          <span class="text-gray-700">Value:</span>
          <input
            type="text"
            oninput={createHandleValueInput("value")}
            bind:this={valueRef}
            required
            class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-indigo-200 focus:border-indigo-500"
          />
        </label>
      {:else}
        <label class="block">
          <span class="text-gray-700">From Value:</span>
          <input
            type="text"
            oninput={createHandleValueInput("from_value")}
            bind:this={valueRef}
            required
            class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-indigo-200 focus:border-indigo-500"
          />
        </label>
        <label class="block">
          <span class="text-gray-700">To Value:</span>
          <input
            type="text"
            oninput={createHandleValueInput("to_value")}
            bind:this={valueRef}
            required
            class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-indigo-200 focus:border-indigo-500"
          />
        </label>
      {/if}

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
          {editingTransfer ? "Update Transfer" : "Add Transfer"}
        </button>
        {#if editingTransfer}
          <button
            type="button"
            onclick={() => (editingTransfer = null)}
            class="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
          >
            Cancel
          </button>
        {/if}
      </div>
    </form>
  </div>

  <h2 class="text-xl font-semibold mb-4 text-center">Transfers List</h2>
  <ul class="space-y-4">
    {#each transfers as transfer}
      <li
        class="bg-white p-4 rounded-lg shadow-md flex justify-between items-center"
      >
        <div>
          <strong class="block text-lg">{transfer.show_value}</strong>
          <div class="text-sm text-gray-600">
            <span class="font-bold">From:</span>
            {transfer.from_card.display_name}
            <span class="font-bold">To:</span>
            {transfer.to_card.display_name}
            <span class="font-bold">Date:</span>
            {transfer.date}
          </div>
        </div>
        <div class="flex space-x-2">
          <button
            onclick={() => editTransfer(transfer)}
            class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Edit
          </button>
          <button
            onclick={() => deleteTransfer(transfer.id)}
            class="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
          >
            Delete
          </button>
        </div>
      </li>
    {/each}
  </ul>
</div>

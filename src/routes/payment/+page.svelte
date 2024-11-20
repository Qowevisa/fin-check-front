<script lang="ts">
  import { onMount } from "svelte";
  import { type Metric, type Payment, type Item, type ItemBought, type Card, type Type, type Category, type ItemFilter } from "$lib/entities";
  import { selectedDate } from "$lib/stores/dateStore";
  import { NumberToFPA } from "$lib/util/fpa";

  let mutateDate = $state($selectedDate);
  let selectedTime = $state("00:00:00");
  let selectableItems: Item[] = $state([]);
  let payments: Payment[] = $state([]);
  let cards: Card[] = $state([]);
  let types: Type[] = $state([]);
  let categories: Category[] = $state([]);
  let metrics: Metric[] = $state([]);
  let error: string | null = $state(null);
  let editingPayment: Payment | null = $state(null);
  const newPayment: Partial<Payment> = $state({
    card_id: 0,
    category_id: 0,
    title: "",
    descr: "",
    note: "",
    date: new Date().toISOString().slice(0, 10), // Default to today
    items: [] as ItemBought[],
  });

  onMount(async () => {
    await fetchPayments();
    await fetchCards();
    await fetchTypes();
    await fetchCategories();
    await fetchMetrics();
  });

  const fetchCategories = async () => {
    const res = await fetch("/api/category/all");
    if (!res.ok) {
      error = "Failed to fetch payments";
    } else {
      categories = await res.json();
    }
  };
  const fetchPayments = async () => {
    const res = await fetch("/api/payment/all");
    if (!res.ok) {
      error = "Failed to fetch payments";
    } else {
      payments = await res.json();
    }
  };
  async function fetchCards() {
    const result = await fetch("/api/card/all");
    if (!result.ok) {
      const obj = await result.json();
      error = obj.message;
    } else {
      cards = await result.json();
    }
  }
  async function fetchTypes() {
    const result = await fetch("/api/type/all");
    if (!result.ok) {
      const obj = await result.json();
      error = obj.message;
    } else {
      types = await result.json();
    }
  }
  async function fetchMetrics() {
    const result = await fetch("/api/metric/all");
    if (!result.ok) {
      const obj = await result.json();
      error = obj.message;
    } else {
      metrics = await result.json();
    }
  }

  const savePayment = async () => {
    let url = editingPayment
      ? `/api/payment/update/${editingPayment.id}`
      : "/api/payment/create";
    let method = editingPayment ? "PUT" : "POST";

    const data = {
      ...currentPayment,
      card_id: Number(currentPayment.card_id),
      category_id: Number(currentPayment.category_id),
      date: constructedTime,
    };

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      error = "Failed to save payment";
    } else {
      fetchPayments();
      editingPayment = null;
    }
  };

  function editPayment(payment: Payment) {
    editingPayment = { ...payment };
  }

  async function deletePayment(id: number) {
    const response = await fetch(`/api/payment/delete`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (!response.ok) {
      const { message } = await response.json();
      console.log(message)
      error = message;
    } else {
      await fetchPayments();
    }
  }

  function getCardName(cardId: number) {
    if (cardId === 0) return "None";
    const card = cards.find((card) => card.id === cardId);
    return card ? card.name : "Unknown";
  }
  function getTypeColor(typeId: number) {
    if (typeId === 0) return "None";
    const type = types.find((type) => type.id === typeId);
    return type ? type.color : "#000";
  }
  function getTypeName(typeId: number) {
    if (typeId === 0) return "None";
    const type = types.find((card) => card.id === typeId);
    return type ? type.name : "Unknown";
  }

  // let priceRefs: Map<number,  = new Map();
  function createHandler(item: ItemBought) {
    return function handlePriceInput(event: Event & { currentTarget: EventTarget & HTMLInputElement }) {
      const target = event.target as HTMLInputElement;
      const rawValue = target.value.replace(/[^0-9]/g, "");
      item.price = parseInt(rawValue || "0");
      target.value = NumberToFPA(item.price);
    };
  }

  async function filterItemsBasedOnCategoryID(categoryID: number) {
    const data : ItemFilter = {
      category_id: categoryID,
      type_id: 0,
    }
    const response = await fetch(`/api/item/filter`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const { message } = await response.json();
      console.log(message)
      error = message;
    } else {
      selectableItems = await response.json();
    }
  }

  function handleCategoryChange(
    event: Event & { currentTarget: EventTarget & HTMLSelectElement},) {
    const target = event.target as HTMLSelectElement;
    const categoryID = parseInt(target.value);
    if (currentPayment.items && currentPayment.items.length > 0) {
      const confirmDeleteItems = confirm(
        `Changing the category to ${categoryID} will clear all items in payment. Do you want to proceed?`
      )
      if (confirmDeleteItems) {
      currentPayment.items = []
      }
    }
    filterItemsBasedOnCategoryID(categoryID)
  }


  const constructedTime = $derived(`${mutateDate}T${selectedTime}Z`);
  const currentPayment = $derived(editingPayment ?? newPayment);
  $inspect("currentPayment", currentPayment)
  $inspect("items", currentPayment.items)
</script>

<div class="container mx-auto my-8 p-6 bg-gray-100 rounded-lg shadow-lg">
  <h1 class="text-2xl font-bold mb-4 text-center">Manage Payments</h1>

  <!-- Error Message -->
  {#if $error}
    <p class="bg-red-100 text-red-700 p-4 rounded">{$error}</p>
  {/if}

  <!-- Form for Adding/Editing Payment -->
  <form onsubmit={savePayment} class="mb-8 p-6 bg-white rounded-lg shadow-md">
    <h2 class="text-xl font-semibold mb-4">
      {editingPayment ? "Edit Payment" : "Add New Payment"}
    </h2>


    <!-- Card -->
    <label class="block">
      <span class="text-gray-700">Card:</span>
      <select
        bind:value={currentPayment.card_id}
        class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-indigo-200 focus:border-indigo-500"
      >
        {#each cards as card}
          <option value={card.id}>{card.name}</option>
        {/each}
      </select>
    </label>

    <!-- Category -->
    <label class="block">
      <span class="text-gray-700">Category:</span>
      <select
        bind:value={currentPayment.category_id}
        onchange={handleCategoryChange}
        class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-indigo-200 focus:border-indigo-500"
      >
        {#each categories as category}
          <option value={category.id}>{category.name}</option>
        {/each}
      </select>
    </label>

    <!-- Title -->
    <label class="block">
      <span class="text-gray-700">Title:</span>
      <input
        type="text"
        bind:value={currentPayment.title}
        class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-indigo-200 focus:border-indigo-500"
        required
      />
    </label>

    <!-- Description -->
    <label class="block">
      <span class="text-gray-700">Description:</span>
      <textarea
        bind:value={currentPayment.descr}
        class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-indigo-200 focus:border-indigo-500"
      ></textarea>
    </label>

    <!-- Note -->
    <label class="block">
      <span class="text-gray-700">Note:</span>
      <textarea
        bind:value={currentPayment.note}
        class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-indigo-200 focus:border-indigo-500"
      ></textarea>
    </label>

    <!-- Date -->
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

    <!-- {{{ ITEM BLOCK-->
    <!-- Items -->
    <div class="block">
      <h3 class="text-gray-700 text-lg mb-2">Items:</h3>

      <!-- Add Item Button -->
      <button
        type="button"
        class="mb-4 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
        onclick={() => {
          currentPayment.items?.push({
            id: 0,
            new_name: "",
            new_comment: "",
            price: 0,
            item_id: -1,
            payment_id: 0,
            type_id: 0,
            quantity: 1,
            total_cost: 0,
            metric_type: 0,
            metric_value: 0,
          });
        }}
      >
        + Add Item
      </button>

      {#each (currentPayment.items as ItemBought[])  as itemBought, index}
        <div class="p-4 bg-white mb-4 rounded-lg shadow-md">
          <h4 class="text-gray-600 mb-2">Item {index + 1}</h4>

          <label class="block">
            <span class="text-gray-700">Select or Enter Item:</span>
            <div class="relative">
              <!-- Select Existing Item -->
              <select
                bind:value={itemBought.item_id}
                onchange={() => {
                  itemBought.item_id = Number(itemBought.item_id);
                }}
                class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-indigo-200 focus:border-indigo-500"
              >
                <option value="" disabled selected>Select an item</option>
                {#each selectableItems as selectableItem}
                  <option value={selectableItem.id}
                    >{selectableItem.name}</option
                  >
                {/each}
                <option value={0}>+ Add New Item</option>
              </select>

              {#if itemBought.item_id == 0}
                <!-- Input for New Item Name -->
                <input
                  type="text"
                  bind:value={itemBought.new_name}
                  placeholder="Enter new item name"
                  class="mt-2 block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-indigo-200 focus:border-indigo-500"
                />
                <!-- Input for New Item Comment-->
                <input
                  type="text"
                  bind:value={itemBought.new_comment}
                  placeholder="Enter new item comment"
                  class="mt-2 block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-indigo-200 focus:border-indigo-500"
                />
              {/if}
            </div>
          </label>

          <!-- Type -->
          <label class="block">
            <span class="text-gray-700">Type:</span>
            <select
              bind:value={itemBought.type_id}
              style="color: {getTypeColor(itemBought.type_id)};"
              class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-indigo-200 focus:border-indigo-500"
              >
              {#each types as type}
                <option style="color: {type.color};" value={type.id}>{type.name}</option>
              {/each}
            </select>
          </label>

          <!-- Price -->
          <label class="block mt-4">
            <span class="text-gray-700">Price:</span>
            <input
              type="number"
              oninput={createHandler(itemBought)}
              min="0"
              step="0.01"
              class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-indigo-200 focus:border-indigo-500"
              required
            />
          </label>

          <!-- Quantity -->
          <label class="block mt-4">
            <span class="text-gray-700">Quantity:</span>
            <input
              type="number"
              bind:value={itemBought.quantity}
              min="1"
              class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-indigo-200 focus:border-indigo-500"
              required
            />
          </label>


          <!-- Total Cost -->
          <div class="block mt-4">
            <span class="text-gray-700">Total Cost:</span>
            <span>{NumberToFPA(itemBought.price*itemBought.quantity) || ""}</span>
          </div>

          <!-- Metric Type -->
          <label class="block mt-4">
            <span class="text-gray-700">Metric Type:</span>
            <select
              bind:value={itemBought.metric_type}
              class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-indigo-200 focus:border-indigo-500"
              >
              {#each metrics as metric}
                <option value={metric.value}>{metric.name}</option>
              {/each}
            </select>
          </label>

          {#if itemBought.metric_type != 0}
          <!-- Metric Value -->
          <label class="block mt-4">
            <span class="text-gray-700">Metric Value:</span>
            <input
              type="number"
              bind:value={itemBought.metric_value}
              class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-indigo-200 focus:border-indigo-500"
            />
          </label>
          {/if}

          <!-- Remove Item Button -->
          <button
            type="button"
            class="mt-4 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
            onclick={() => currentPayment.items?.splice(index, 1)}
          >
            Remove Item
          </button>
        </div>
      {/each}
    </div>

    <!-- }}}-->
    <!-- Buttons -->
    <div class="flex space-x-2 mt-4">
      <button
        type="submit"
        class="px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600"
      >
        {editingPayment ? "Update Payment" : "Add Payment"}
      </button>
      {#if editingPayment}
        <button
          type="button"
          onclick={() => {
            editingPayment = null;
          }}
          class="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
        >
          Cancel
        </button>
      {/if}
    </div>
  </form>

  <!-- Payments List -->
  <h2 class="text-xl font-semibold mb-4 text-center">Payments List</h2>
  <ul class="space-y-4">
    {#each payments as payment}
      <li
        class="bg-white p-4 rounded-lg shadow-md flex justify-between items-center"
      >
        <div>
          <strong class="block text-lg">{payment.title}</strong>
          <p>{payment.descr}</p>
          <div class="text-sm text-gray-600">
            <span class="font-bold">Card:</span>
            {payment.card_id}
            <span class="font-bold">Category:</span>
            {payment.category_id}
            <span class="font-bold">Date:</span>
            {payment.date}
          </div>
        </div>
        <div class="flex space-x-2">
          <button
            onclick={() => editPayment(payment)}
            class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Edit
          </button>
          <button
            onclick={() => deletePayment(payment.id)}
            class="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
          >
            Delete
          </button>
        </div>
      </li>
    {/each}
  </ul>
</div>

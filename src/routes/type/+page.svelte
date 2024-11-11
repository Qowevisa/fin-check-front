<script lang="ts">
  import { onMount } from "svelte";
  import { type Type } from "$lib/entities";
  import ColorPicker from "$lib/components/ColorPicker.svelte";

  let types: Type[] = $state([]);
  let error: string | null = $state(null);
  let editingType: Type | null = $state(null);
  let newType: Partial<Type> = $state({
    name: "",
    color: "",
    comment: "",
  });

  // Fetch all types on page load
  onMount(async () => {
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

  async function saveType() {
    const endpoint = editingType ? `/api/type/update` : "/api/type/create";
    const method = editingType ? "PUT" : "POST";

    const response = await fetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editingType || newType),
    });

    if (!response.ok) {
      const { message } = await response.json();
      error = message;
    } else {
      await fetchTypes();
      if (editingType) {
        editingType = null;
      } else {
        newType = {
          name: "",
          comment: "",
          color: "",
        };
      }
    }
  }

  function editType(type: Type) {
    editingType = { ...type };
  }

  async function deleteType(id: number) {
    const response = await fetch(`/api/type/delete`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (!response.ok) {
      const { message } = await response.json();
      error = message;
    } else {
      await fetchTypes();
    }
  }

  function handleColorChange(event: CustomEvent) {
    currentType.color = event.detail;
  }

  const currentType = $derived(editingType ?? newType);
  $inspect(currentType);
</script>

{#if error}
  <p class="bg-red-100 text-red-700 p-4 rounded">{error}</p>
{/if}

<div class="container mx-auto my-8 p-6 bg-gray-100 rounded-lg shadow-lg">
  <h1 class="text-2xl font-bold mb-4 text-center">Manage Types</h1>

  <div class="mb-8 p-6 bg-white rounded-lg shadow-md">
    <h2 class="text-xl font-semibold mb-4">
      {editingType ? "Edit Type" : "Add New Type"}
    </h2>
    <form onsubmit={saveType} class="space-y-4">
      <label class="block">
        <span class="text-gray-700">Name:</span>
        <input
          type="text"
          bind:value={currentType.name}
          required
          class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-indigo-200 focus:border-indigo-500"
        />
      </label>
      <label class="block">
        <span class="text-gray-700">Comment:</span>
        <input
          type="text"
          bind:value={currentType.comment}
          required
          class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-indigo-200 focus:border-indigo-500"
        />
      </label>
      <label class="block">
        <span class="text-gray-700">Color:</span>
        <ColorPicker
          on:change={handleColorChange}
          bind:color={currentType.color}
          borderRadius="50%"
        />
      </label>
      <div class="flex space-x-2">
        <button
          type="submit"
          class="px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600"
        >
          {editingType ? "Update Type" : "Add Type"}
        </button>
        {#if editingType}
          <button
            type="button"
            onclick={() => (editingType = null)}
            class="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
          >
            Cancel
          </button>
        {/if}
      </div>
    </form>
  </div>

  <h2 class="text-xl font-semibold mb-4 text-center">Types List</h2>
  <ul class="space-y-4">
    {#each types as type}
      <li
        class="bg-white p-4 rounded-lg shadow-md flex justify-between items-center"
      >
        <div>
          <strong class="block text-lg" style="color: {type.color};"
            >{type.name}</strong
          >
          <div class="text-sm text-gray-600">
            Color: {type.color}, Comment: {type.comment}
          </div>
        </div>
        <div class="flex space-x-2">
          <button
            onclick={() => editType(type)}
            class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Edit
          </button>
          <button
            onclick={() => deleteType(type.id)}
            class="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
          >
            Delete
          </button>
        </div>
      </li>
    {/each}
  </ul>
</div>

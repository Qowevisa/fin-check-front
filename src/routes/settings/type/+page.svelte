<script lang="ts">
  import { onMount } from "svelte";
  import { type SettingsTypeFilter, type Type } from "$lib/entities";
  import Toggle from "$lib/components/Toggle.svelte";

  let { data } = $props();
  $inspect("props = ", data);
  let types: Type[] = $state(data.types);
  let storedFilters: SettingsTypeFilter[] = $state(data.storedFilters);
  let typeFilters: SettingsTypeFilter[] = $state([]);
  let changes: SettingsTypeFilter[] = $state([]);
  let error: string | null = $state(null);

  // Fetch all types on page load
  onMount(async () => {
    await updateStoredFilters();
    await createTypeFilterForUser();
  });

  async function forseNewFetchTypeFilters() {
    const result = await fetch("/api/settings/type/all");
    if (!result.ok) {
      const obj = await result.json();
      error = obj.message;
    } else {
      storedFilters = await result.json();
    }
  }

  // NOTE: This function should be called after fetchTypes as it requires types
  //  to be loaded for UI stuff
  async function updateStoredFilters() {
    storedFilters = storedFilters ?? [];
    if (storedFilters.length > 0) {
      storedFilters = storedFilters.map((filter) => {
        for (let i = 0; i < types.length; i++) {
          const type = types[i];
          if (type.id == filter.type_id) {
            return {
              ...filter,
              color: type.color,
              comment: type.comment,
              name: type.name,
            };
          }
        }
        return filter;
      });
    }
  }

  // NOTE: This function should be called only after types and storedFilters
  //  are fetched
  async function createTypeFilterForUser() {
    typeFilters = types.map((type) => {
      for (let i = 0; i < storedFilters.length; i++) {
        if (storedFilters[i].type_id == type.id) {
          return {
            ...storedFilters[i],
            filter_this: true,
          };
        }
      }
      return {
        filter_this: false,
        type_id: type.id,
        name: type.name,
        color: type.color,
        comment: type.comment,
      };
    });
  }

  async function updateSettings() {
    const endpoint = "/api/settings/type/update";
    const method = "PUT";

    const data = changes;
    const response = await fetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const { message } = await response.json();
      error = message;
    } else {
      changes = [];
      await forseNewFetchTypeFilters();
      await updateStoredFilters();
      await createTypeFilterForUser();
    }
  }

  $inspect(typeFilters);
  $inspect(types);
</script>

{#if error}
  <p class="bg-red-100 text-red-700 p-4 rounded">{error}</p>
{/if}

<div class="container mx-auto my-8 p-6 bg-gray-100 rounded-lg shadow-lg">
  <h1 class="text-2xl font-bold mb-4 text-center">Manage Types</h1>

  <div class="mb-8 p-6 bg-white rounded-lg shadow-md">
    <h2 class="text-xl font-semibold mb-4">Changes</h2>
    {#each changes as type}
      <li class="bg-white p-4 rounded-lg shadow-md flex items-start space-x-2">
        <strong class="block text-lg" style="color: {type.color};"
          >{type.name}</strong
        >
        <div class="text-sm text-gray-600">
          Color: {type.color}, Comment: {type.comment}
        </div>
      </li>
    {/each}
    {#if changes.length > 0}
      <button
        class="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
        onclick={updateSettings}
        >Update settings
      </button>
    {/if}
  </div>

  <h2 class="text-xl font-semibold mb-4 text-center">Types List</h2>
  <ul class="space-y-4">
    {#each typeFilters as type}
      <li class="bg-white p-4 rounded-lg shadow-md flex items-start space-x-2">
        <div class="block text-lg">
          <Toggle
            title="Filter out"
            changeField={type.filter_this}
            onChangeFunc={() => {
              type.filter_this = !type.filter_this;
              for (let i = 0; i < changes.length; i++) {
                if (changes[i].type_id == type.type_id) {
                  changes.splice(i, 1);
                  return;
                }
              }
              changes.push(type);
            }}
          />
        </div>
        <div>
          <strong class="block text-lg" style="color: {type.color};"
            >{type.name}</strong
          >
          <div class="text-sm text-gray-600">
            Color: {type.color}, Comment: {type.comment}
          </div>
        </div>
      </li>
    {/each}
  </ul>
</div>

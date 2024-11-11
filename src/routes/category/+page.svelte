<script lang="ts">
  import { onMount } from "svelte";
  import { type Category } from "$lib/entities";

  let categories: Category[] = $state([]);
  let error: string | null = $state(null);
  let editingCategory: Category | null = $state(null);
  let newCategory: Partial<Category> = $state({
    name: "",
    parent_id: 0,
  });

  onMount(async () => {
    await fetchCategories();
  });

  async function fetchCategories() {
    const result = await fetch("/api/category/all");
    if (!result.ok) {
      const obj = await result.json();
      error = obj.message;
    } else {
      categories = await result.json();
    }
  }

  async function saveCategory() {
    const endpoint = editingCategory
      ? `/api/category/update`
      : "/api/category/create";
    const method = editingCategory ? "PUT" : "POST";

    const data = {
      ...currentCategory,
      parent_id: Number(currentCategory.parent_id),
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
      if (editingCategory) {
        editingCategory = null;
      } else {
        newCategory = {
          name: "",
          parent_id: 0,
        };
      }
    }
  }

  function editCategory(category: Category) {
    editingCategory = { ...category };
  }

  async function deleteCategory(id: number) {
    const response = await fetch(`/api/category/delete`, {
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
  function getParentCategoryName(parentId: number) {
    if (parentId === 0) return "None";
    const parentCategory = categories.find(
      (category) => category.id === parentId,
    );
    return parentCategory ? parentCategory.name : "Unknown";
  }

  const currentCategory = $derived(editingCategory ?? newCategory);
  $inspect(currentCategory);
</script>

{#if error}
  <p class="bg-red-100 text-red-700 p-4 rounded">{error}</p>
{/if}

<div class="container mx-auto my-8 p-6 bg-gray-100 rounded-lg shadow-lg">
  <h1 class="text-2xl font-bold mb-4 text-center">Manage Categories</h1>

  <div class="mb-8 p-6 bg-white rounded-lg shadow-md">
    <h2 class="text-xl font-semibold mb-4">
      {editingCategory ? "Edit Category" : "Add New Category"}
    </h2>
    <form onsubmit={saveCategory} class="space-y-4">
      <label class="block">
        <span class="text-gray-700">Name:</span>
        <input
          type="text"
          bind:value={currentCategory.name}
          required
          class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-indigo-200 focus:border-indigo-500"
        />
      </label>

      <label class="block">
        <span class="text-gray-700">Parent Category:</span>
        <select
          bind:value={currentCategory.parent_id}
          class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-indigo-200 focus:border-indigo-500"
        >
          <option value="0">None</option>
          {#each categories as parentCategory}
            {#if parentCategory.id != currentCategory.id}
              <option value={parentCategory.id}>{parentCategory.name}</option>
            {/if}
          {/each}
        </select>
      </label>

      <div class="flex space-x-2">
        <button
          type="submit"
          class="px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600"
        >
          {editingCategory ? "Update Category" : "Add Category"}
        </button>
        {#if editingCategory}
          <button
            type="button"
            onclick={() => (editingCategory = null)}
            class="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
          >
            Cancel
          </button>
        {/if}
      </div>
    </form>
  </div>

  <h2 class="text-xl font-semibold mb-4 text-center">Categories List</h2>
  <ul class="space-y-4">
    {#each categories as category}
      <li
        class="bg-white p-4 rounded-lg shadow-md flex justify-between items-center"
      >
        <div>
          <strong class="block text-lg">{category.name}</strong>
          <div class="text-sm text-gray-600">
            Parent: {getParentCategoryName(category.parent_id)}
          </div>
        </div>
        <div class="flex space-x-2">
          <button
            onclick={() => editCategory(category)}
            class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Edit
          </button>
          <button
            onclick={() => deleteCategory(category.id)}
            class="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
          >
            Delete
          </button>
        </div>
      </li>
    {/each}
  </ul>
</div>

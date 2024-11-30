<script lang="ts">
	import '../app.css';
	let { children } = $props();
  import { page } from '$app/stores';
  const currentPath = $derived($page.url.pathname);
  import {selectedDate} from "$lib/stores/dateStore"
  import UserIcon from '$lib/icons/UserIcon.svelte';

  const paths = [
    {
    Path: "/",
    Name: "Home",
    },
    {
    Path: "/card",
    Name: "Cards",
    },
    {
    Path: "/type",
    Name: "Types",
    },
    {
    Path: "/category",
    Name: "Categories",
    },
    {
    Path: "/expense",
    Name: "Expense",
    },
    {
    Path: "/income",
    Name: "Income",
    },
    {
    Path: "/transfer",
    Name: "Transfer",
    },
    {
    Path: "/payment",
    Name: "Payment",
    }
  ]
</script>

{#if $page.url.pathname != "/login"}
  <nav class="bg-gray-900 p-4 flex justify-between items-center">
    <div class="flex flex-col space-y-2 w-full">
      <div class="flex text-white space-x-4">
        {#each paths as path}
          <a class="button-link {currentPath === path.Path ? 'onPath' : ''}" href="{path.Path}">{path.Name}</a>
        {/each}
      </div>
    </div>
    <div class="flex items-center space-x-4">
      <label class="text-white">
        Select Date:
        <input
          type="date"
          bind:value={$selectedDate}
          class="bg-gray-800 text-white p-2 rounded-md border border-gray-700"
        />
      </label>
      <a href="/settings" class="bg-gray-700 text-white p-2 rounded-full">
        <UserIcon width="1.5em" height="1.5em" color="#f0f0f0"/>
      </a>
    </div>
  </nav>
{/if}

<style>
  .button-link {
    background-color: #4f46e5; /* Indigo-600 */
    color: white;
    padding: 0.5rem 1rem; /* Tailwind's py-2 and px-4 */
    border-radius: 0.5rem; /* Rounded-lg */
    text-align: center;
    display: inline-block;
    transition: background-color 0.2s;
  }
  
  .button-link:hover {
    background-color: #4338ca; /* Indigo-700 */
  }
  
  .button-link:focus {
    outline: none;
    box-shadow: 0 0 0 2px #c7d2fe; /* Tailwind's ring color */
  }

  .onPath {
    background-color: #aaa;
  }
</style>

{@render children()}

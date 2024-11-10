<script lang="ts">
	import '../app.css';
	let { children } = $props();
  import { page } from '$app/stores';
  const currentPath = $derived($page.url.pathname);
  // import { goto } from '$app/navigation';

  // $effect(()=>{
  //   if (!isAuthenticated && $page.url.pathname != "/login"){ 
  //     // goto("/login")
  //   }
  // });
  const paths = [
    {
    Path: "/ping",
    Name: "ping",
    },
    {
    Path: "/test",
    Name: "test",
    },
    {
    Path: "/test2",
    Name: "test2",
    },
    {
    Path: "/card",
    Name: "Cards",
    }
  ]
</script>

{#if $page.url.pathname != "/login"}
  <nav class="bg-gray-900 p-4 flex justify-between items-center">
    <div class="flex flex-col space-y-2 w-full">
      <!-- <div class="flex flex-grow justify-center px-4"> -->
      <!--   <input type="text" placeholder="Search" class="w-2/5 bg-gray-800 text-gray-400 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"> -->
      <!-- </div> -->
      <!-- <div class="border-t border-gray-700 my-2"></div> -->
      <div class="flex text-white space-x-4">
        {#each paths as path}
          <a class="button-link {currentPath === path.Path ? 'onPath' : ''}" href="{path.Path}">{path.Name}</a>
        {/each}
      </div>
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

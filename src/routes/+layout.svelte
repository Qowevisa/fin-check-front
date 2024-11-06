<script lang="ts">
	import '../app.css';
	let { children } = $props();
  import { page } from '$app/stores';
  // import { goto } from '$app/navigation';

  // $effect(()=>{
  //   if (!isAuthenticated && $page.url.pathname != "/login"){ 
  //     // goto("/login")
  //   }
  // });
</script>

{#if $page.url.pathname != "/login"}
  <nav>
    <a href="/ping">ping</a>
    <a href="/test">test</a>
    <a href="/test2">test2</a>
    <a href="/login">login</a>
  </nav>
{/if}

{@render children()}

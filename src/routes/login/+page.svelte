<script>
  import { goto } from "$app/navigation";
  import { addSuccessToast } from "$lib/components/store";
  import Toasts from "$lib/components/Toasts.svelte";
  let username = $state("");
  let password = $state("");
  let error = $state("");

  // Simulate form submission (replace with real login logic)
  async function handleLogin() {
    error = "";
    if (!username || !password) {
      error = "Please fill in both fields";
      return;
    }
    try {
      const resp = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "App-Token": import.meta.env.VITE_AUTH_APP_TOKEN,
        },
        body: JSON.stringify({ username, password }),
        credentials: "include", // Important to send cookies with requests
      });
      addSuccessToast("Login successful!");
      goto("/");
      console.log(resp);
    } catch (err) {
      if (err instanceof Error) {
        error = "Login error: " + err.message;
      } else {
        error = "An unknown error occurred";
      }
    }
  }
</script>

<Toasts />
<div class="flex justify-center items-center min-h-screen bg-gray-100">
  <div class="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
    <h1 class="text-2xl font-bold text-center mb-6">Login</h1>
    {#if error}
      <p class="text-red-500 text-center mb-4">{error}</p>
    {/if}
    <form onsubmit={handleLogin} class="space-y-4">
      <div>
        <label for="email" class="block text-sm font-medium text-gray-700">
          Username:
        </label>
        <input
          type="text"
          id="username"
          bind:value={username}
          class="w-full mt-1 p-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-300"
          placeholder="user@example.com"
        />
      </div>
      <div>
        <label for="password" class="block text-sm font-medium text-gray-700">
          Password:
        </label>
        <input
          type="password"
          id="password"
          bind:value={password}
          class="w-full mt-1 p-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-300"
          placeholder="••••••••"
        />
      </div>
      <button
        type="submit"
        class="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 rounded-md focus:outline-none focus:ring focus:ring-blue-300"
      >
        Login
      </button>
    </form>
  </div>
</div>

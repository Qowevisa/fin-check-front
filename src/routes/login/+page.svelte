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
      const url =
        selected == "login" ? "/api/auth/login" : "/api/auth/register";
      const resp = await fetch(url, {
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
  let selected = $state("login");
</script>

<Toasts />
<div class="flex justify-center items-center min-h-screen bg-gray-100">
  <div class="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
    <div class="toggle-container">
      <!-- Toggle Button -->
      <div class="toggle">
        <button
          class:active={selected === "login"}
          class="toggle-option"
          onclick={() => (selected = "login")}
        >
          Login
        </button>
        <button
          class:active={selected === "register"}
          class="toggle-option"
          onclick={() => (selected = "register")}
        >
          Register
        </button>
      </div>
    </div>
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
      <div class="flex flex-row justify-center">
        <button
          type="submit"
          class="submit-btn w-2/4 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 rounded-md focus:outline-none focus:ring focus:ring-blue-300"
        >
          {selected == "login" ? "Login" : "Register"}
        </button>
      </div>
    </form>
  </div>
</div>

<style>
  .toggle-container {
    margin: 10px;
  }

  .toggle {
    display: flex;
    justify-content: center;
    align-items: center;
    border: 2px solid #ccc;
    border-radius: 9999px;
    overflow: hidden;
    margin-bottom: 20px;
  }

  .toggle-option {
    flex: 1;
    text-align: center;
    padding: 10px;
    cursor: pointer;
    background-color: #f3f4f6; /* Default gray */
    transition:
      background-color 0.3s,
      color 0.3s;
  }

  .toggle-option.active {
    background-color: #3b82f6; /* Blue when selected */
    color: white;
  }

  .submit-btn {
    border-radius: 9999px;
  }
</style>

<script>
  import { addSuccessToast } from "$lib/components/store";
  import Toasts from "$lib/components/Toasts.svelte";

  function testNotification() {
    console.log("Tested!");
    addSuccessToast("Test string", false);
  }

  async function test2() {
    addSuccessToast("Test string", false);
    const resp = await fetch("https://api.fin.qowevisa.click/api/ping");
    // const resp = await fetch("http://localhost:3000/api/ping");
    if (resp.ok) {
      console.log(await resp.json());
    }
  }

  async function test3() {
    fetch("http://localhost:3000/api/ping")
      .then((response) => response.json())
      .then(console.log)
      .catch(console.error);
  }
</script>

<Toasts />
<div class="flex justify-center items-center min-h-screen bg-gray-100">
  <button
    onclick={testNotification}
    class="w-1/6 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 rounded-md focus:outline-none focus:ring focus:ring-blue-300"
  >
    Click Me!
  </button>
  <button
    onclick={test2}
    class="w-1/6 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 rounded-md focus:outline-none focus:ring focus:ring-blue-300"
  >
    Click Me2!
  </button>
  <button
    onclick={test3}
    class="w-1/6 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 rounded-md focus:outline-none focus:ring focus:ring-blue-300"
  >
    Click Me3!
  </button>
</div>

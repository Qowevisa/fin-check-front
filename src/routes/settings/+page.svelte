<script>
  const settingTypes = [
    {
      name: "Manage Type Filters",
      path: "/settings/type",
    },
  ];
</script>

<div class="container mx-auto my-8 p-6 bg-gray-100 rounded-lg shadow-lg">
  <h1 class="text-2xl font-bold mb-4 text-center">User settings</h1>
  <div class="flex flex-col space-y-6">
    {#each settingTypes as path}
      <div class="flex items-center justify-center">
        <a
          href={path.path}
          class="p-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          {path.name}
        </a>
      </div>
    {/each}
  </div>
</div>

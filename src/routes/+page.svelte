<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import {
    Chart,
    DoughnutController,
    ArcElement,
    Tooltip,
    Legend,
    type ChartConfiguration,
  } from "chart.js";
  import type { StatsTypeCurrencyChart } from "$lib/entities";
  import { NumberToFPA } from "$lib/util/fpa";

  Chart.register(DoughnutController, ArcElement, Tooltip, Legend);

  let { data } = $props();
  $inspect(data);
  let error: string | null = $state(null);
  let { expensesData }: { expensesData: StatsTypeCurrencyChart[] } =
    $state(data);
  $inspect("expensesData =", expensesData);

  // let expensesData: StatsTypeCurrencyChart[] = $state(data.expensesData);
  let canvases: HTMLCanvasElement[] = [];
  let charts: Chart[] = [];
  let configs: ChartConfiguration[] = $derived(
    expensesData.map((chart) => ({
      type: "doughnut",
      data: {
        labels: chart.elements.map((type) => type.name),
        datasets: [
          {
            label: chart.label,
            data: chart.elements.map((type) => type.value / 100),
            backgroundColor: chart.elements.map((type) => type.color),
          },
        ],
      },
    })),
  );

  function createTypeCharts() {
    charts.forEach((chart) => chart.destroy());
    charts = configs.map((config, index) => new Chart(canvases[index], config));
  }

  onMount(() => {
    if (expensesData && canvases.length > 0) {
      createTypeCharts();
    }
  });

  onDestroy(() => {
    charts.forEach((chart) => chart.destroy());
  });
</script>

{#if error}
  <p class="bg-red-100 text-red-700 p-4 rounded">{error}</p>
{/if}

<!-- Render canvas elements for charts -->
<div class="container mx-auto my-8 bg-gray-100 p-6">
  <h2 class="text-2xl mb-4 font-bold text-center block">
    Expenses doughnut charts
  </h2>
  <div class="flex items-center justify-center">
    <div
      class="{configs.length > 4
        ? 'grid-cols-4'
        : 'grid-cols-2'} w-fit grid gap-4"
    >
      {#each configs as _, index}
        <div class="flex flex-col">
          <div class="type-chart">
            <canvas bind:this={canvases[index]}></canvas>
            <span class="flex justify-center"
              >{`Total: ${NumberToFPA(expensesData[index].total)} ${expensesData[index].label}`}</span
            >
          </div>
        </div>
      {/each}
    </div>
  </div>
</div>

<style lang="postcss">
  .type-chart {
    width: 20vw;
    height: 20vw;
  }
</style>

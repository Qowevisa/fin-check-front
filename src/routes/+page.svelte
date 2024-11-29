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

  Chart.register(DoughnutController, ArcElement, Tooltip, Legend);

  let error: string | null = null;
  let data: StatsTypeCurrencyChart[] = [];
  let configs: ChartConfiguration[] = [];
  let charts: Chart[] = [];
  let canvases: HTMLCanvasElement[] = [];

  async function fetchChartStats() {
    try {
      const result = await fetch("/api/statistics/type");
      if (!result.ok) {
        const obj = await result.json();
        error = obj.message;
      } else {
        data = await result.json();

        configs = data.map((chart) => ({
          type: "doughnut",
          data: {
            labels: chart.elements.map((type) => type.name),
            datasets: [
              {
                label: "Chart Dataset",
                data: chart.elements.map((type) => type.value / 100),
                backgroundColor: chart.elements.map((type) => type.color),
              },
            ],
          },
        }));
      }
    } catch (e) {
      console.error("Error fetching data:", e);
      error = "Failed to fetch chart data.";
    }
  }

  function createTypeCharts() {
    charts.forEach((chart) => chart.destroy());
    charts = configs.map((config, index) => new Chart(canvases[index], config));
  }
  onMount(async () => {
    await fetchChartStats();
    createTypeCharts();
  });

  onDestroy(() => {
    charts.forEach((chart) => chart.destroy());
  });
</script>

{#if error}
  <p class="bg-red-100 text-red-700 p-4 rounded">{error}</p>
{/if}

<!-- Render canvas elements for charts -->
<div class="w-1/2 grid grid-cols-2 gap-4">
  {#each configs as _, index}
    <div class="flex flex-col">
      <div class="type-chart">
        <canvas bind:this={canvases[index]}></canvas>
        <span class="flex justify-center">{data[index].label}</span>
      </div>
    </div>
  {/each}
</div>

<style lang="postcss">
  .type-chart {
    width: 20vw;
    height: 20vw;
  }
</style>

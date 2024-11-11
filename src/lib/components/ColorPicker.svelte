<script lang="ts">
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();
  export let color = "#ff0000";

  function handleColorChange(event: Event) {
    const target = event.target as HTMLInputElement;
    color = target.value;
    dispatch("change", color);
  }
  export let borderRadius;
  const actualBorderRadius = borderRadius || "50%";
</script>

<div class="color-picker" style="border-radius: {actualBorderRadius};">
  <label style="border-radius: inherit;">
    <input type="color" bind:value={color} on:input={handleColorChange} />
    <div
      class="color-circle"
      style="background-color: {color || '#000'};"
    ></div>
  </label>
</div>

<style>
  .color-picker {
    position: relative;
    display: inline-block;
  }

  .color-picker input[type="color"] {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    opacity: 0;
    cursor: pointer;
    border-radius: inherit;
  }

  .color-picker .color-circle {
    width: var(--color-picker-size, 40px);
    height: var(--color-picker-size, 40px);
    border-radius: inherit;
    display: flex;
    align-items: center;
    justify-content: center;
  }
</style>

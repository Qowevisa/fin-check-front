import { writable } from 'svelte/store';

function createDateStore() {
  const storedDate = typeof localStorage !== 'undefined' ? localStorage.getItem('selectedDate') : null;
  const initialDate = storedDate ? storedDate : new Date().toISOString().split('T')[0];

  const { subscribe, set } = writable(initialDate);

  return {
    subscribe,
    set: (newDate: string) => {
      localStorage.setItem('selectedDate', newDate);
      set(newDate);
    }
  };
}

export const selectedDate = createDateStore();

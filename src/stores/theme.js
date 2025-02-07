import { writable } from 'svelte/store';

// Check if user has a theme preference in localStorage, default to 'dark' if none
const userTheme = typeof window !== 'undefined' ? localStorage.getItem('theme') : 'dark';
const initialTheme = userTheme || 'dark';  // Changed default to dark

export const theme = writable(initialTheme);

// Update localStorage and document class when theme changes
theme.subscribe(value => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('theme', value);
    document.documentElement.setAttribute('data-theme', value);
    console.log('Current theme:', value);
  }
}); 
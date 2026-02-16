/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // GDS Color palette
        'gds-blue': '#1d70b8',
        'gds-dark-blue': '#003078',
        'gds-light-blue': '#5694ca',
        'gds-green': '#00703c',
        'gds-dark-green': '#004e2a',
        'gds-red': '#d4351c',
        'gds-dark-red': '#942514',
        'gds-yellow': '#ffdd00',
        'gds-black': '#0b0c0c',
        'gds-dark-grey': '#505a5f',
        'gds-mid-grey': '#b1b4b6',
        'gds-light-grey': '#f3f2f1',
        'gds-white': '#ffffff',
      },
      maxWidth: {
        'gds-container': '960px',
      },
    },
  },
  plugins: [],
}

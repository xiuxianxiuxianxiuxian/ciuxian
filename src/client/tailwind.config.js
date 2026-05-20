export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'erosion-gray': '#2D3436',
        'erosion-crimson': '#C0392B',
        'erosion-pale': '#BDC3C7',
        'erosion-dark': '#1A1A2E',
        'erosion-glow': '#E74C3C'
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif']
      }
    }
  },
  plugins: []
}

import { ThemeSwitcher } from './components/ThemeSwitcher';

function App() {
  return (
    <div className="min-h-screen transition-colors">
      <ThemeSwitcher />

      <div className="max-w-4xl mx-auto px-4 py-16">
        {/* Header */}
        <header className="text-center mb-16">
          <h1 className="text-3xl font-bold mb-4">VibesApp V2</h1>
          <p className="text-lg opacity-70">
            Rebuilt with Vite + React + TypeScript + Tailwind CSS
          </p>
        </header>

        {/* Demo Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {/* Card 1 - Brand Color */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dim:border-gray-600 dark:border-gray-700 transition-all hover:shadow-lg hover:-translate-y-1">
            <div className="w-12 h-12 rounded-full bg-brand flex items-center justify-center mb-4">
              <span className="text-white text-xl font-bold">🎨</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Brand Colors</h3>
            <p className="text-sm opacity-70 mb-4">
              Custom brand color palette with proper contrast
            </p>
            <button
              type="button"
              className="w-full px-4 py-2 bg-brand text-white rounded-lg font-medium hover:bg-brand-600 active:scale-95 transition-all"
            >
              Brand Button
            </button>
          </div>

          {/* Card 2 - Vibes Positive */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dim:border-gray-600 dark:border-gray-700 transition-all hover:shadow-lg hover:-translate-y-1">
            <div className="w-12 h-12 rounded-full bg-vibe-positive flex items-center justify-center mb-4">
              <span className="text-white text-xl font-bold">👍</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Positive Vibes</h3>
            <p className="text-sm opacity-70 mb-4">Green color for likes and positive actions</p>
            <button
              type="button"
              className="w-full px-4 py-2 bg-vibe-positive text-white rounded-lg font-medium hover:bg-vibe-positive-hover active:scale-95 transition-all"
            >
              Like
            </button>
          </div>

          {/* Card 3 - Vibes Negative */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dim:border-gray-600 dark:border-gray-700 transition-all hover:shadow-lg hover:-translate-y-1">
            <div className="w-12 h-12 rounded-full bg-vibe-negative flex items-center justify-center mb-4">
              <span className="text-white text-xl font-bold">👎</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Negative Vibes</h3>
            <p className="text-sm opacity-70 mb-4">
              Red color for dislikes and destructive actions
            </p>
            <button
              type="button"
              className="w-full px-4 py-2 bg-vibe-negative text-white rounded-lg font-medium hover:bg-vibe-negative-hover active:scale-95 transition-all"
            >
              Dislike
            </button>
          </div>
        </div>

        {/* Typography Demo */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 border border-gray-200 dim:border-gray-600 dark:border-gray-700 mb-16">
          <h2 className="text-2xl font-semibold mb-6">Typography Scale</h2>
          <div className="space-y-4">
            <div>
              <span className="text-xs opacity-50 font-mono">text-3xl</span>
              <h1 className="text-3xl font-bold">Heading 1 - 32px</h1>
            </div>
            <div>
              <span className="text-xs opacity-50 font-mono">text-2xl</span>
              <h2 className="text-2xl font-semibold">Heading 2 - 24px</h2>
            </div>
            <div>
              <span className="text-xs opacity-50 font-mono">text-xl</span>
              <h3 className="text-xl font-semibold">Heading 3 - 20px</h3>
            </div>
            <div>
              <span className="text-xs opacity-50 font-mono">text-base</span>
              <p className="text-base">Body text - 16px with comfortable line height</p>
            </div>
            <div>
              <span className="text-xs opacity-50 font-mono">text-sm</span>
              <p className="text-sm opacity-70">Small text - 14px for metadata and timestamps</p>
            </div>
            <div>
              <span className="text-xs opacity-50 font-mono">text-xs</span>
              <p className="text-xs opacity-60">Tiny text - 12px for labels and badges</p>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 border border-gray-200 dim:border-gray-600 dark:border-gray-700">
          <h2 className="text-2xl font-semibold mb-4">✅ Phase 0.2 Complete!</h2>
          <div className="space-y-3 text-sm opacity-80">
            <p>✅ Tailwind CSS configured with custom theme</p>
            <p>✅ Three themes implemented: Light, Dim, Dark</p>
            <p>✅ Custom color palette (brand, vibes, themes)</p>
            <p>✅ Typography scale (xs to 3xl)</p>
            <p>✅ Spacing system configured</p>
            <p>✅ Theme switcher component working</p>
          </div>
          <div className="mt-6 p-4 bg-brand/10 rounded-lg">
            <p className="text-sm font-medium text-brand">
              👆 Try the theme switcher in the top-right corner!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;

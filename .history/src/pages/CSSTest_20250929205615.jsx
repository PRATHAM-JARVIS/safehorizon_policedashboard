import React from 'react';

const CSSTest = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-4xl font-bold text-blue-600 mb-8">CSS Test Page</h1>
        
        {/* Test basic Tailwind classes */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Basic Tailwind Test</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-red-500 text-white p-4 rounded">Red Box</div>
            <div className="bg-green-500 text-white p-4 rounded">Green Box</div>
            <div className="bg-blue-500 text-white p-4 rounded">Blue Box</div>
          </div>
        </div>

        {/* Test custom CSS variables */}
        <div className="bg-card border border-border p-6 rounded-lg">
          <h2 className="text-2xl font-semibold text-foreground mb-4">Custom Variables Test</h2>
          <div className="space-y-4">
            <div className="bg-primary text-primary-foreground p-4 rounded">Primary Color</div>
            <div className="bg-secondary text-secondary-foreground p-4 rounded">Secondary Color</div>
            <div className="bg-muted text-muted-foreground p-4 rounded">Muted Color</div>
            <div className="bg-destructive text-destructive-foreground p-4 rounded">Destructive Color</div>
          </div>
        </div>

        {/* Test responsive design */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Responsive Test</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-purple-400 text-white p-4 rounded text-center">
              <div className="text-sm">Responsive</div>
              <div className="text-xs opacity-75">1 col mobile, 2 tablet, 4 desktop</div>
            </div>
            <div className="bg-indigo-400 text-white p-4 rounded text-center">
              <div className="text-sm">Grid</div>
              <div className="text-xs opacity-75">Auto adjusts</div>
            </div>
            <div className="bg-pink-400 text-white p-4 rounded text-center">
              <div className="text-sm">Layout</div>
              <div className="text-xs opacity-75">Based on screen</div>
            </div>
            <div className="bg-yellow-400 text-white p-4 rounded text-center">
              <div className="text-sm">Test</div>
              <div className="text-xs opacity-75">Size</div>
            </div>
          </div>
        </div>

        {/* Test form elements */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Form Elements Test</h2>
          <div className="space-y-4">
            <input 
              type="text" 
              placeholder="Test input field"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors">
              Test Button
            </button>
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="test-checkbox" className="rounded" />
              <label htmlFor="test-checkbox" className="text-sm">Test checkbox</label>
            </div>
          </div>
        </div>

        {/* Test dark mode */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Dark Mode Test</h2>
          <p className="text-gray-600 dark:text-gray-300">
            This should change appearance in dark mode. Toggle dark mode in the app to test.
          </p>
          <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-700 rounded">
            <p className="text-gray-800 dark:text-gray-200">Nested dark mode content</p>
          </div>
        </div>

        {/* Test animations */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Animation Test</h2>
          <div className="space-y-4">
            <div className="w-16 h-16 bg-blue-500 rounded animate-spin mx-auto"></div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{width: '75%'}}></div>
            </div>
            <button className="bg-green-500 hover:bg-green-600 transform hover:scale-105 transition-all duration-200 text-white py-2 px-4 rounded">
              Hover to scale
            </button>
          </div>
        </div>

        <div className="text-center text-gray-500 mt-8">
          <p>If you can see styled content above, Tailwind CSS is working correctly!</p>
          <p className="text-xs mt-2">Check browser developer tools for any CSS loading errors.</p>
        </div>
      </div>
    </div>
  );
};

export default CSSTest;
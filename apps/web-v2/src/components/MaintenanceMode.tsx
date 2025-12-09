/**
 * Maintenance Mode Page
 * Shows when VITE_MAINTENANCE_MODE=true
 */

export function MaintenanceMode() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-white dim:bg-gray-900 dark:bg-gray-900">
      {/* VibesApp Logo */}
      <div className="mb-8 animate-pulse">
        <svg
          className="w-24 h-24 text-black dim:text-white dark:text-white"
          viewBox="0 0 302 302"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
          aria-label="VibesApp maintenance mode"
          role="img"
        >
          <title>VibesApp Under Maintenance</title>
          <g transform="translate(0,302) scale(0.1,-0.1)">
            <path
              d="M1680 2649 c123 -72 258 -206 330 -329 138 -233 170 -552 81 -804
-52 -148 -174 -305 -300 -385 -76 -48 -61 -53 64 -21 201 51 346 195 421 415
22 64 28 107 34 210 3 72 9 123 13 115 46 -104 71 -359 47 -493 -43 -246 -182
-465 -373 -590 -135 -89 -259 -127 -418 -127 -264 0 -477 148 -529 368 -31
131 37 318 160 443 75 76 154 115 261 129 166 21 263 74 339 185 80 116 92
280 31 409 -62 129 -187 230 -356 287 -64 22 -87 24 -250 24 -171 0 -184 -2
-260 -28 -133 -46 -220 -102 -326 -207 -186 -185 -274 -394 -286 -680 -4 -114
-2 -151 16 -239 37 -178 78 -275 177 -426 60 -91 217 -249 304 -306 122 -81
287 -149 435 -181 91 -19 332 -16 435 6 340 72 637 306 795 625 89 180 127
393 105 589 -16 147 -42 240 -104 367 -84 173 -217 336 -374 455 -118 90 -332
183 -492 214 -33 7 -31 5 20 -25z m-150 -521 c128 -65 104 -247 -38 -284 -64
-17 -152 37 -173 106 -29 97 42 194 146 199 12 1 41 -9 65 -21z"
            />
            <path
              d="M1410 1274 c-77 -33 -114 -98 -108 -185 11 -147 176 -217 289 -122
59 50 77 148 40 221 -24 47 -50 70 -98 88 -49 17 -80 17 -123 -2z"
            />
          </g>
        </svg>
      </div>

      {/* Heading */}
      <h1 className="text-4xl font-bold text-gray-900 dim:text-white dark:text-white mb-3 text-center">
        Under Maintenance
      </h1>

      {/* Subheading */}
      <p className="text-lg text-gray-600 dim:text-gray-300 dark:text-gray-300 mb-8 text-center max-w-md">
        We'll be back soon!
      </p>

      {/* Optional: Status indicator */}
      <div className="flex items-center gap-2 text-sm text-gray-500 dim:text-gray-400 dark:text-gray-400">
        <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></div>
        <span>Deployment in progress</span>
      </div>
    </div>
  );
}

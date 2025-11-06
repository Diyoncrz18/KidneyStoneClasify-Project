// src/app/model/page.tsx
export default function ModelOverviewPage() {
  return (
    <main className="flex-1 overflow-y-auto p-8">
      <div className="flex flex-col gap-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="flex flex-col gap-2 rounded-2xl border border-border-dark bg-surface-dark/30 p-6 shadow-md transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
            <p className="text-text-secondary text-sm font-medium leading-normal">Current Model</p>
            <p className="text-text-main tracking-light text-2xl font-bold leading-tight">EfficientNet B0</p>
          </div>
          <div className="flex flex-col gap-2 rounded-2xl border border-border-dark bg-surface-dark/30 p-6 shadow-md transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
            <p className="text-text-secondary text-sm font-medium leading-normal">Accuracy</p>
            <p className="text-text-main tracking-light text-2xl font-bold leading-tight">95.4%</p>
          </div>
          <div className="flex flex-col gap-2 rounded-2xl border border-border-dark bg-surface-dark/30 p-6 shadow-md transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
            <p className="text-text-secondary text-sm font-medium leading-normal">Last Retrain</p>
            <p className="text-text-main tracking-light text-2xl font-bold leading-tight">2025-11-01</p>
          </div>
        </div>

        {/* Charts Section */}
        <div className="flex flex-col gap-6 rounded-2xl border border-border-dark bg-surface-dark/30 p-6 shadow-md">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-text-main text-lg font-bold leading-normal">Model Performance</h3>
              <p className="text-text-secondary text-sm font-normal leading-normal">Metrics over the last 6 months</p>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-primary"></div>
                <span className="text-text-secondary">Accuracy</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-[#0bda62]"></div>
                <span className="text-text-secondary">Precision</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-[#f87171]"></div>
                <span className="text-text-secondary">Recall</span>
              </div>
            </div>
          </div>
          <div className="flex min-h-[250px] flex-1 flex-col gap-4 py-4">
            <div className="relative h-full w-full">
              <svg
                className="h-full w-full"
                fill="none"
                preserveAspectRatio="none"
                viewBox="0 0 472 150"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M0 109C18.1538 109 18.1538 21 36.3077 21C54.4615 21 54.4615 41 72.6154 41C90.7692 41 90.7692 93 108.923 93C127.077 93 127.077 33 145.231 33C163.385 33 163.385 101 181.538 101C199.692 101 199.692 61 217.846 61C236 61 236 45 254.154 45C272.308 45 272.308 121 290.462 121C308.615 121 308.615 149 326.769 149C344.923 149 344.923 1 363.077 1C381.231 1 381.231 81 399.385 81C417.538 81 417.538 129 435.692 129C453.846 129 453.846 25 472 25"
                  stroke="#2463eb"
                  strokeLinecap="round"
                  strokeWidth="3"
                ></path>
                <path
                  d="M0 135C19.6667 135 19.6667 101.4 39.3333 101.4C59 101.4 59 74.2 78.6667 74.2C98.3333 74.2 98.3333 33.4 118 33.4C137.667 33.4 137.667 76.6 157.333 76.6C177 76.6 177 105.4 196.667 105.4C216.333 105.4 216.333 149 236 149C255.667 149 255.667 65.8 275.333 65.8C295 65.8 295 43 314.667 43C334.333 43 334.333 91 354 91C373.667 91 373.667 19 393.333 19C413 19 413 85 432.667 85C452.333 85 452.333 55 472 55"
                  stroke="#0bda62"
                  strokeLinecap="round"
                  strokeWidth="3"
                ></path>
                <path
                  d="M0 25C18.1538 25 18.1538 129 36.3077 129C54.4615 129 54.4615 81 72.6154 81C90.7692 81 90.7692 1 108.923 1C127.077 1 127.077 149 145.231 149C163.385 149 163.385 121 181.538 121C199.692 121 199.692 45 217.846 45C236 45 236 61 254.154 61C272.308 61 272.308 101 290.462 101C308.615 101 308.615 33 326.769 33C344.923 33 344.923 93 363.077 93C381.231 93 381.231 41 399.385 41C417.538 41 417.538 21 435.692 21C453.846 21 453.846 109 472 109"
                  stroke="#f87171"
                  strokeLinecap="round"
                  strokeWidth="3"
                ></path>
              </svg>
            </div>
            <div className="flex justify-around border-t border-border-dark pt-3">
              <p className="text-text-secondary text-xs font-bold leading-normal tracking-[0.015em]">Jan</p>
              <p className="text-text-secondary text-xs font-bold leading-normal tracking-[0.015em]">Feb</p>
              <p className="text-text-secondary text-xs font-bold leading-normal tracking-[0.015em]">Mar</p>
              <p className="text-text-secondary text-xs font-bold leading-normal tracking-[0.015em]">Apr</p>
              <p className="text-text-secondary text-xs font-bold leading-normal tracking-[0.015em]">May</p>
              <p className="text-text-secondary text-xs font-bold leading-normal tracking-[0.015em]">Jun</p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex pt-4">
          <button className="flex h-12 min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-primary px-6 text-base font-bold leading-normal tracking-[0.015em] text-white shadow-md transition-all duration-300 hover:bg-primary/90 hover:shadow-lg">
            <span className="truncate">Check for Updates</span>
          </button>
        </div>
      </div>
    </main>
  );
}
// src/app/page.tsx
export default function DashboardPage() {
  return (
    <>
      {/* Main Content */}
      <div className="flex-1 p-10 space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-start justify-between rounded-xl p-6 bg-white dark:bg-slate-800 shadow-md">
            <div className="flex flex-col gap-1">
              <p className="text-text-muted-light dark:text-text-muted-dark text-sm font-medium">
                Total Dataset
              </p>
              <p className="text-text-light dark:text-text-dark text-3xl font-bold">
                123
              </p>
            </div>
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <span className="material-symbols-outlined">inventory</span>
            </div>
          </div>
          <div className="flex items-start justify-between rounded-xl p-6 bg-white dark:bg-slate-800 shadow-md">
            <div className="flex flex-col gap-1">
              <p className="text-text-muted-light dark:text-text-muted-dark text-sm font-medium">
                Healthy Detected
              </p>
              <p className="text-text-light dark:text-text-dark text-3xl font-bold">
                1
              </p>
            </div>
            <div className="p-2 bg-green-500/10 rounded-lg text-green-500">
              <span className="material-symbols-outlined">
                health_and_safety
              </span>
            </div>
          </div>
          <div className="flex items-start justify-between rounded-xl p-6 bg-white dark:bg-slate-800 shadow-md">
            <div className="flex flex-col gap-1">
              <p className="text-text-muted-light dark:text-text-muted-dark text-sm font-medium">
                CKD Detected
              </p>
              <p className="text-text-light dark:text-text-dark text-3xl font-bold">
                122
              </p>
            </div>
            <div className="p-2 bg-red-500/10 rounded-lg text-red-500">
              <span className="material-symbols-outlined">warning</span>
            </div>
          </div>
          <div className="flex items-start justify-between rounded-xl p-6 bg-white dark:bg-slate-800 shadow-md">
            <div className="flex flex-col gap-1">
              <p className="text-text-muted-light dark:text-text-muted-dark text-sm font-medium">
                Avg Confidence
              </p>
              <p className="text-text-light dark:text-text-dark text-3xl font-bold">
                99.19%
              </p>
            </div>
            <div className="p-2 bg-yellow-500/10 rounded-lg text-yellow-500">
              <span className="material-symbols-outlined">verified</span>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 flex flex-col gap-4 rounded-xl p-6 bg-white dark:bg-slate-800 shadow-md">
            <p className="text-text-light dark:text-text-dark text-lg font-semibold">
              Classification Accuracy over Time
            </p>
            <div className="flex min-h-[250px] flex-1 flex-col justify-end">
              <svg
                fill="none"
                height="100%"
                preserveAspectRatio="none"
                viewBox="0 0 472 150"
                width="100%"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M0 109C18.1538 109 18.1538 21 36.3077 21C54.4615 21 54.4615 41 72.6154 41C90.7692 41 90.7692 93 108.923 93C127.077 93 127.077 33 145.231 33C163.385 33 163.385 101 181.538 101C199.692 101 199.692 61 217.846 61C236 61 236 45 254.154 45C272.308 45 272.308 121 290.462 121C308.615 121 308.615 149 326.769 149C344.923 149 344.923 1 363.077 1C381.231 1 381.231 81 399.385 81C417.538 81 417.538 129 435.692 129C453.846 129 453.846 25 472 25V149H0V109Z"
                  fill="url(#paint0_linear_chart)"
                ></path>
                <path
                  d="M0 109C18.1538 109 18.1538 21 36.3077 21C54.4615 21 54.4615 41 72.6154 41C90.7692 41 90.7692 93 108.923 93C127.077 93 127.077 33 145.231 33C163.385 33 163.385 101 181.538 101C199.692 101 199.692 61 217.846 61C236 61 236 45 254.154 45C272.308 45 272.308 121 290.462 121C308.615 121 308.615 149 326.769 149C344.923 149 344.923 1 363.077 1C381.231 1 381.231 81 399.385 81C417.538 81 417.538 129 435.692 129C453.846 129 453.846 25 472 25"
                  stroke="#2463eb"
                  strokeLinecap="round"
                  strokeWidth="3"
                ></path>
                <defs>
                  <linearGradient
                    gradientUnits="userSpaceOnUse"
                    id="paint0_linear_chart"
                    x1="236"
                    x2="236"
                    y1="1"
                    y2="149"
                  >
                    <stop stopColor="#2463eb" stopOpacity="0.3"></stop>
                    <stop offset="1" stopColor="#2463eb" stopOpacity="0"></stop>
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>

          <div className="lg:col-span-2 flex flex-col gap-4 rounded-xl p-6 bg-white dark:bg-slate-800 shadow-md">
            <p className="text-text-light dark:text-text-dark text-lg font-semibold">
              Healthy vs CKD distribution
            </p>
            <div className="flex-1 flex items-center justify-center min-h-[250px]">
              <div className="relative size-48">
                <svg className="size-full -rotate-90" viewBox="0 0 36 36">
                  <circle
                    className="stroke-red-500"
                    cx="18"
                    cy="18"
                    fill="none"
                    r="16"
                    strokeDasharray="21.7, 100"
                    strokeWidth="4"
                  ></circle>
                  <circle
                    className="stroke-green-500"
                    cx="18"
                    cy="18"
                    fill="none"
                    r="16"
                    strokeDasharray="78.3, 100"
                    strokeDashoffset="-21.7"
                    strokeWidth="4"
                  ></circle>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-text-light dark:text-text-dark">
                    123
                  </span>
                  <span className="text-sm text-text-muted-light dark:text-text-muted-dark">
                    Total
                  </span>
                </div>
              </div>
            </div>
            <div className="flex justify-center gap-4 text-xs">
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-green-500"></span>
                <span className="text-text-muted-light dark:text-text-muted-dark">
                  Healthy (99.3%)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-red-500"></span>
                <span className="text-text-muted-light dark:text-text-muted-dark">
                  CKD (0.7%)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

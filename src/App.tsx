import { useEffect, useMemo, useRef, useState } from "react";
import {
  calculateProjection,
  type CalculatorInputs,
  type ProjectionPoint,
} from "./calculations";

type Language = "en" | "ms";
type Theme = "dark" | "light";
type IconName = "brand" | "sun" | "moon" | "download" | "arrow" | "close" | "plus" | "minus" | "spark";

type Copy = {
  brand: string;
  subtitle: string;
  languageLabel: string;
  themeToLight: string;
  themeToDark: string;
  exportCsv: string;
  inputsKicker: string;
  projectionKicker: string;
  assumptions: string;
  assumptionIntro: string;
  existingCapital: string;
  existingCapitalContext: string;
  certificateAmount: string;
  perCertificate: string;
  minAmount: string;
  maxAmount: string;
  certificateCount: string;
  identicalNote: string;
  certificate: string;
  certificates: string;
  decreaseCertificates: string;
  increaseCertificates: string;
  financingRate: string;
  asbReturn: string;
  financingTenure: string;
  viewResultsAt: string;
  year: string;
  years: string;
  upfrontFees: string;
  perCertificateFees: string;
  dividendField: string;
  dividendFieldContext: string;
  dividendReinvest: string;
  dividendOffset: string;
  dividendFieldNote: string;
  offsetShare: string;
  offsetShareContext: string;
  assumptionsNote: string;
  projection: string;
  monthlyPayment: string;
  perMonth: string;
  perYear: string;
  acrossCertificates: string;
  dividendsApplied: string;
  dividendsAppliedNote: string;
  topUp: string;
  netWealth: string;
  netWealthNote: string;
  ordinaryAsb: string;
  ordinaryAsbNote: string;
  outOfPocket: string;
  advantage: string;
  advantageNote: string;
  returnsTitle: string;
  metric: string;
  asbf: string;
  netProfit: string;
  totalRoi: string;
  cagr: string;
  irr: string;
  remainingLoan: string;
  returnNote: string;
  dividendAppliedYear: string;
  appliedByThen: string;
  chartTitle: string;
  chartDescription: string;
  selectedYear: string;
  breakdown: string;
  asbBalance: string;
  ordinaryBalance: string;
  cashInvested: string;
  showAllYears: string;
  showFewerYears: string;
  termination: string;
  terminationTitle: string;
  terminationIntro: string;
  terminationYear: string;
  estimatedPayout: string;
  payoutNote: string;
  cashInvestedByThen: string;
  profitLoss: string;
  totalReturn: string;
  terminationNote: string;
  close: string;
  viewResults: string;
  disclaimer: string;
  notAvailable: string;
};

const translations: Record<Language, Copy> = {
  en: {
    brand: "ASBF Strategy Calculator",
    subtitle: "Compare financing with investing the same cash.",
    languageLabel: "Switch to Bahasa Melayu",
    themeToLight: "Switch to light mode",
    themeToDark: "Switch to dark mode",
    exportCsv: "Export CSV",
    inputsKicker: "ASSUMPTIONS",
    projectionKicker: "PROJECTION",
    assumptions: "Your assumptions",
    assumptionIntro: "Set your financing details to compare both strategies on equal cash outlay.",
    existingCapital: "Existing capital",
    existingCapitalContext: "optional — capital you already hold, added to both strategies",
    certificateAmount: "ASB certificate amount",
    perCertificate: "per certificate",
    minAmount: "RM 10,000",
    maxAmount: "RM 200,000",
    certificateCount: "Number of identical certificates",
    identicalNote: "Each certificate uses the same amount, rate, tenure and fees.",
    certificate: "certificate",
    certificates: "certificates",
    decreaseCertificates: "Remove one certificate",
    increaseCertificates: "Add one certificate",
    financingRate: "Financing rate",
    asbReturn: "ASB return",
    financingTenure: "Financing tenure",
    viewResultsAt: "View results at year",
    year: "Year",
    years: "years",
    upfrontFees: "Upfront fees / takaful",
    perCertificateFees: "paid in cash per certificate (RM)",
    dividendField: "Annual dividends",
    dividendFieldContext: "paid out at year end",
    dividendReinvest: "Reinvest",
    dividendOffset: "Repay financing",
    dividendFieldNote: "Dividends compound inside the ASB units unless you use them against the financing.",
    offsetShare: "Share of dividend used to repay",
    offsetShareContext: "the rest keeps compounding inside the units",
    assumptionsNote: "Estimates assume fixed rates, full first-year dividend eligibility, year-end dividends and monthly instalments. Dividends earmarked for the financing service the following year's monthly instalments instead of being reinvested, so the first year is paid entirely from your own cash, the financing keeps its original term, and you only pay the shortfall in later years. Any dividend the instalments cannot absorb stays invested inside the units. Zakat, tax and settlement charges are excluded. Actual ASNB calculations and bank terms may differ.",
    projection: "Projection",
    monthlyPayment: "Monthly financing instalment",
    perMonth: "/ month",
    perYear: "/ year",
    acrossCertificates: "Combined payment for",
    dividendsApplied: "Dividends applied to loan",
    dividendsAppliedNote: "Services instalments, term unchanged",
    topUp: "You still pay",
    netWealth: "ASBF net wealth",
    netWealthNote: "ASB balance minus remaining loan",
    ordinaryAsb: "Ordinary ASB",
    ordinaryAsbNote: "Same cash paid, invested on matching dates",
    outOfPocket: "Total out-of-pocket expense",
    advantage: "ASBF advantage / disadvantage",
    advantageNote: "Difference in net wealth",
    returnsTitle: "Return on your own money",
    metric: "Metric",
    asbf: "ASBF",
    netProfit: "Net profit",
    totalRoi: "Total ROI",
    cagr: "Annualized ROI (CAGR*)",
    irr: "Annualized money-weighted IRR",
    remainingLoan: "Remaining loan",
    returnNote: "*CAGR treats total contributions as if invested at the start. IRR accounts for the timing of monthly payments and is generally the more meaningful annualized figure here. At early horizons, net wealth assumes settlement of the modelled balance; settlement charges are excluded.",
    dividendAppliedYear: "Dividend applied",
    appliedByThen: "Dividends applied by then",
    chartTitle: "Wealth over time",
    chartDescription: "Estimated net wealth at the end of each year.",
    selectedYear: "Selected year",
    breakdown: "Year-by-year breakdown",
    asbBalance: "ASB balance",
    ordinaryBalance: "Ordinary ASB balance",
    cashInvested: "Total cash invested",
    showAllYears: "Show all years",
    showFewerYears: "Show fewer years",
    termination: "Explore early termination",
    terminationTitle: "Want to terminate early?",
    terminationIntro: "Choose a year to estimate the cash you may receive after redeeming the ASB units and settling the financing. Your main projection stays unchanged.",
    terminationYear: "Termination year",
    estimatedPayout: "Estimated payout",
    payoutNote: "After settling the financing and redeeming the ASB units. Settlement charges are excluded.",
    cashInvestedByThen: "Your cash invested by then",
    profitLoss: "Net profit / loss",
    totalReturn: "Total return on your money",
    terminationNote: "This estimate uses the selected year-end modelled balance. Actual settlement figures and charges depend on your bank.",
    close: "Close",
    viewResults: "View results",
    disclaimer: "This calculator provides educational estimates, not a financing quotation or guaranteed return. It uses simplified assumptions for financing, dividends, instalments and settlement. Actual bank terms, ASNB distributions and settlement charges may differ.",
    notAvailable: "N/A",
  },
  ms: {
    brand: "Kalkulator Strategi ASBF",
    subtitle: "Bandingkan pembiayaan dengan pelaburan tunai yang sama.",
    languageLabel: "Tukar ke Bahasa Inggeris",
    themeToLight: "Tukar ke mod cerah",
    themeToDark: "Tukar ke mod gelap",
    exportCsv: "Eksport CSV",
    inputsKicker: "ANDAIAN",
    projectionKicker: "UNJURAN",
    assumptions: "Andaian anda",
    assumptionIntro: "Tetapkan butiran pembiayaan untuk membandingkan kedua-dua strategi dengan aliran tunai yang sama.",
    existingCapital: "Modal sedia ada",
    existingCapitalContext: "pilihan — modal yang anda sudah ada, ditambah pada kedua-dua strategi",
    certificateAmount: "Jumlah sijil ASB",
    perCertificate: "setiap sijil",
    minAmount: "RM 10,000",
    maxAmount: "RM 200,000",
    certificateCount: "Bilangan sijil yang sama",
    identicalNote: "Setiap sijil menggunakan jumlah, kadar, tempoh dan yuran yang sama.",
    certificate: "sijil",
    certificates: "sijil",
    decreaseCertificates: "Kurangkan satu sijil",
    increaseCertificates: "Tambah satu sijil",
    financingRate: "Kadar pembiayaan",
    asbReturn: "Pulangan ASB",
    financingTenure: "Tempoh pembiayaan",
    viewResultsAt: "Lihat keputusan pada tahun",
    year: "Tahun",
    years: "tahun",
    upfrontFees: "Yuran awal / takaful",
    perCertificateFees: "dibayar tunai bagi setiap sijil (RM)",
    dividendField: "Dividen tahunan",
    dividendFieldContext: "dibayar pada hujung tahun",
    dividendReinvest: "Pelabur semula",
    dividendOffset: "Bayar pembiayaan",
    dividendFieldNote: "Dividen akan bercampur di dalam unit ASB melainkan anda menggunakannya untuk bayaran pembiayaan.",
    offsetShare: "Bahagian dividen untuk bayaran balik",
    offsetShareContext: "selebihnya terus berkembang di dalam unit",
    assumptionsNote: "Anggaran mengandaikan kadar tetap, kelayakan dividen tahun pertama penuh, dividen hujung tahun dan ansuran bulanan. Dividen yang diperuntukkan untuk pembiayaan akan digunakan untuk servicing ansuran bulanan tahun berikutnya dan tidak dilabur semula, jadi tahun pertama dibayar sepenuhnya daripada tunai sendiri, pembiayaan mengekalkan tempoh asal, dan anda hanya membayar bakiya pada tahun-tahun berikutnya. Dividen yang tidak dapat ditampung oleh ansuran kekal dilabur di dalam unit. Zakat, cukai dan caj penyelesaian tidak termasuk. Pengiraan ASNB dan terma bank sebenar mungkin berbeza.",
    projection: "Unjuran",
    monthlyPayment: "Ansuran pembiayaan bulanan",
    perMonth: "/ bulan",
    perYear: "/ tahun",
    acrossCertificates: "Jumlah ansuran untuk",
    dividendsApplied: "Dividen ditolak pada pinjaman",
    dividendsAppliedNote: "Melayan ansuran, tempoh kekal",
    topUp: "Anda masih bayar",
    netWealth: "Kekayaan bersih ASBF",
    netWealthNote: "Baki ASB ditolak baki pembiayaan",
    ordinaryAsb: "ASB biasa",
    ordinaryAsbNote: "Tunai yang sama, dilaburkan pada tarikh yang sepadan",
    outOfPocket: "Jumlah perbelanjaan tunai",
    advantage: "Kelebihan / kekurangan ASBF",
    advantageNote: "Perbezaan kekayaan bersih",
    returnsTitle: "Pulangan atas wang anda",
    metric: "Ukuran",
    asbf: "ASBF",
    netProfit: "Untung bersih",
    totalRoi: "Jumlah ROI",
    cagr: "ROI tahunan (CAGR*)",
    irr: "IRR tahunan berwajaran wang",
    remainingLoan: "Baki pembiayaan",
    returnNote: "*CAGR menganggap jumlah caruman dilaburkan pada permulaan. IRR mengambil kira masa ansuran bulanan dan biasanya lebih bermakna sebagai angka tahunan. Bagi tempoh awal, kekayaan bersih mengandaikan baki model diselesaikan; caj penyelesaian tidak termasuk.",
    dividendAppliedYear: "Dividen ditolak",
    appliedByThen: "Dividen ditolak setakat itu",
    chartTitle: "Kekayaan mengikut masa",
    chartDescription: "Anggaran kekayaan bersih pada akhir setiap tahun.",
    selectedYear: "Tahun dipilih",
    breakdown: "Pecahan mengikut tahun",
    asbBalance: "Baki ASB",
    ordinaryBalance: "Baki ASB biasa",
    cashInvested: "Jumlah tunai dilaburkan",
    showAllYears: "Papar semua tahun",
    showFewerYears: "Papar kurang tahun",
    termination: "Teroka penamatan awal",
    terminationTitle: "Ingin tamatkan lebih awal?",
    terminationIntro: "Pilih tahun untuk menganggarkan tunai yang mungkin diterima selepas penebusan unit ASB dan penyelesaian pembiayaan. Unjuran utama tidak berubah.",
    terminationYear: "Tahun penamatan",
    estimatedPayout: "Anggaran bayaran keluar",
    payoutNote: "Selepas penyelesaian pembiayaan dan penebusan unit ASB. Caj penyelesaian tidak termasuk.",
    cashInvestedByThen: "Tunai anda dilaburkan setakat itu",
    profitLoss: "Untung / rugi bersih",
    totalReturn: "Jumlah pulangan atas wang anda",
    terminationNote: "Anggaran ini menggunakan baki model pada hujung tahun yang dipilih. Angka dan caj penyelesaian sebenar bergantung pada bank anda.",
    close: "Tutup",
    viewResults: "Lihat keputusan",
    disclaimer: "Kalkulator ini memberikan anggaran pendidikan, bukan sebut harga pembiayaan atau pulangan terjamin. Andaian pembiayaan, dividen, ansuran dan penyelesaian adalah ringkas. Terma bank, agihan ASNB dan caj penyelesaian sebenar mungkin berbeza.",
    notAvailable: "Tiada data",
  },
};

const initialInputs: CalculatorInputs = {
  existingCapital: 0,
  amount: 100_000,
  certificates: 1,
  financingRate: 4.5,
  asbReturn: 5.25,
  tenure: 30,
  fees: 500,
  dividendMode: "reinvest",
  dividendOffsetShare: 100,
};

function readPreference<T extends string>(key: string, fallback: T, choices: T[]): T {
  try {
    const stored = window.localStorage.getItem(key) as T | null;
    return stored && choices.includes(stored) ? stored : fallback;
  } catch {
    return fallback;
  }
}

function formatMoney(value: number) {
  const sign = value < 0 ? "-" : "";
  const amount = new Intl.NumberFormat("en-MY", { maximumFractionDigits: 0 }).format(Math.abs(value));
  return `${sign}RM ${amount}`;
}

function formatPercent(value: number | null, language: Language, precision = 1) {
  if (value === null || !Number.isFinite(value)) return translations[language].notAvailable;
  return `${value < 0 ? "-" : ""}${Math.abs(value).toFixed(precision)}%`;
}

function formatRate(value: number) {
  return `${Number(value.toFixed(2))}%`;
}

function clampCapital(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(10_000_000, value));
}

function compactMoney(value: number) {
  const sign = value < 0 ? "-" : "";
  const absolute = Math.abs(value);
  if (absolute >= 1_000_000) return `${sign}RM ${(absolute / 1_000_000).toFixed(absolute >= 10_000_000 ? 0 : 1)}m`;
  if (absolute >= 1_000) return `${sign}RM ${Math.round(absolute / 1_000)}k`;
  return `${sign}RM ${Math.round(absolute)}`;
}

function tone(value: number) {
  if (value > 0) return "value-positive";
  if (value < 0) return "value-negative";
  return "";
}

function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true as const,
    focusable: false as const,
  };

  if (name === "brand") {
    return (
      <svg {...common} viewBox="0 0 40 40" stroke="none">
        <rect x="1" y="1" width="38" height="38" rx="13" fill="currentColor" opacity=".14" />
        <path d="M20 8 30.8 14v12L20 32 9.2 26V14L20 8Z" stroke="currentColor" strokeWidth="1.6" />
        <path d="m14.7 24.5 5.3-10 5.3 10M16.9 20.7h6.2" stroke="currentColor" strokeWidth="1.7" />
      </svg>
    );
  }
  if (name === "sun") {
    return <svg {...common}><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" /></svg>;
  }
  if (name === "moon") {
    return <svg {...common}><path d="M20.1 15.3A8.3 8.3 0 0 1 8.7 3.9 8.5 8.5 0 1 0 20.1 15.3Z" /></svg>;
  }
  if (name === "download") {
    return <svg {...common}><path d="M12 3v12m-5-5 5 5 5-5" /><path d="M5 17v3h14v-3" /></svg>;
  }
  if (name === "arrow") {
    return <svg {...common}><path d="M4 12h15m-6-6 6 6-6 6" /></svg>;
  }
  if (name === "close") {
    return <svg {...common}><path d="m6 6 12 12M18 6 6 18" /></svg>;
  }
  if (name === "plus") {
    return <svg {...common}><path d="M12 5v14m-7-7h14" /></svg>;
  }
  if (name === "minus") {
    return <svg {...common}><path d="M5 12h14" /></svg>;
  }
  return <svg {...common}><path d="M12 3 13.8 9.2 20 11l-6.2 1.8L12 19l-1.8-6.2L4 11l6.2-1.8L12 3Z" /><path d="m19 15 .8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15Z" /></svg>;
}

function ProjectionChart({
  points,
  selectedYear,
  labels,
}: {
  points: ProjectionPoint[];
  selectedYear: number;
  labels: { asbf: string; ordinary: string; year: string; selected: string };
}) {
  const width = 720;
  const height = 282;
  const plot = { left: 76, right: 704, top: 18, bottom: 236 };
  const maxYear = Math.max(points[points.length - 1]?.year ?? 1, 1);
  const allWealth = points.flatMap((point) => [point.asbfWealth, point.ordinaryWealth]);
  let minValue = Math.min(...allWealth);
  let maxValue = Math.max(...allWealth);
  if (minValue === maxValue) {
    minValue -= 1;
    maxValue += 1;
  }
  const spread = maxValue - minValue;
  minValue -= spread * 0.08;
  maxValue += spread * 0.08;
  const x = (year: number) => plot.left + (year / maxYear) * (plot.right - plot.left);
  const y = (value: number) => plot.top + ((maxValue - value) / (maxValue - minValue)) * (plot.bottom - plot.top);
  const makePath = (key: "asbfWealth" | "ordinaryWealth") =>
    points.map((point, index) => `${index === 0 ? "M" : "L"}${x(point.year).toFixed(1)},${y(point[key]).toFixed(1)}`).join(" ");
  const selected = points[Math.min(selectedYear, points.length - 1)];
  const yearTicks = [...new Set([0, Math.round(maxYear / 4), Math.round(maxYear / 2), Math.round((maxYear * 3) / 4), maxYear])];

  return (
    <div className="chart-frame">
      <svg
        className="projection-chart"
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={`${labels.asbf} and ${labels.ordinary}`}
      >
        <g className="chart-grid">
          {Array.from({ length: 5 }, (_, index) => {
            const value = maxValue - ((maxValue - minValue) / 4) * index;
            const position = plot.top + ((plot.bottom - plot.top) / 4) * index;
            return (
              <g key={`y-${index}`}>
                <line x1={plot.left} x2={plot.right} y1={position} y2={position} />
                <text x={plot.left - 12} y={position + 4} textAnchor="end">{compactMoney(value)}</text>
              </g>
            );
          })}
          {yearTicks.map((year) => (
            <g key={`x-${year}`}>
              <line className="chart-x-grid" x1={x(year)} x2={x(year)} y1={plot.top} y2={plot.bottom} />
              <text x={x(year)} y={plot.bottom + 24} textAnchor="middle">{year}</text>
            </g>
          ))}
        </g>
        {selected && (
          <g className="chart-selection">
            <line x1={x(selected.year)} x2={x(selected.year)} y1={plot.top} y2={plot.bottom} />
            <circle className="selection-dot selection-dot-asbf" cx={x(selected.year)} cy={y(selected.asbfWealth)} r="4.5" />
            <circle className="selection-dot selection-dot-ordinary" cx={x(selected.year)} cy={y(selected.ordinaryWealth)} r="4.5" />
          </g>
        )}
        <path className="chart-line chart-line-asbf" d={makePath("asbfWealth")} />
        <path className="chart-line chart-line-ordinary" d={makePath("ordinaryWealth")} />
      </svg>
      <div className="chart-axis-labels" aria-hidden="true">
        <span>{labels.year}</span>
        <span>{labels.selected}: {selected?.year ?? 0}</span>
      </div>
    </div>
  );
}

function exportProjection(points: ProjectionPoint[]) {
  const headers = [
    "Year",
    "ASB balance",
    "Remaining financing",
    "Dividend applied to financing",
    "Cumulative dividends applied",
    "ASBF net wealth",
    "Ordinary ASB balance",
    "Total cash invested",
    "ASBF net profit",
    "Ordinary ASB net profit",
    "ASBF total ROI (%)",
    "Ordinary ASB total ROI (%)",
    "ASBF annualized IRR (%)",
    "Ordinary ASB annualized IRR (%)",
  ];
  const rows = points.map((point) => [
    point.year,
    point.asbBalance.toFixed(2),
    point.loanBalance.toFixed(2),
    point.dividendApplied.toFixed(2),
    point.dividendsApplied.toFixed(2),
    point.asbfWealth.toFixed(2),
    point.ordinaryWealth.toFixed(2),
    point.cashInvested.toFixed(2),
    point.asbfProfit.toFixed(2),
    point.ordinaryProfit.toFixed(2),
    point.asbfRoi?.toFixed(2) ?? "",
    point.ordinaryRoi?.toFixed(2) ?? "",
    point.asbfIrr?.toFixed(2) ?? "",
    point.ordinaryIrr?.toFixed(2) ?? "",
  ]);
  const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "asbf-projection.csv";
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function App() {
  const [language, setLanguage] = useState<Language>(() => readPreference<Language>("asbf-language", "en", ["en", "ms"]));
  const [theme, setTheme] = useState<Theme>(() => readPreference<Theme>("asbf-theme", "dark", ["dark", "light"]));
  const [inputs, setInputs] = useState<CalculatorInputs>(initialInputs);
  const [resultYear, setResultYear] = useState(10);
  const [terminationYear, setTerminationYear] = useState(10);
  const [showAllYears, setShowAllYears] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const text = translations[language];

  const results = useMemo(() => calculateProjection(inputs), [inputs]);
  const selected = results.projection[resultYear] ?? results.projection[results.projection.length - 1];
  const scenarioYear = Math.min(terminationYear, inputs.tenure);
  const scenario = results.projection[scenarioYear] ?? selected;
  const advantage = selected.asbfWealth - selected.ordinaryWealth;
  const offsetEnabled = inputs.dividendMode === "offset";
  const visibleYears = showAllYears
    ? results.projection.slice(1)
    : results.projection.slice(1, Math.min(inputs.tenure, 5) + 1);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.lang = language;
    try {
      window.localStorage.setItem("asbf-theme", theme);
      window.localStorage.setItem("asbf-language", language);
    } catch {
      // The calculator remains usable when browser storage is disabled.
    }
  }, [language, theme]);

  const updateInput = <Key extends keyof CalculatorInputs>(key: Key, value: CalculatorInputs[Key]) => {
    setInputs((current) => ({ ...current, [key]: value }));
  };

  const updateTenure = (value: number) => {
    updateInput("tenure", value);
    setResultYear((current) => Math.min(current, value));
    setTerminationYear((current) => Math.min(current, value));
  };

  const changeCertificates = (amount: number) => {
    updateInput("certificates", Math.max(1, Math.min(10, inputs.certificates + amount)));
  };

  const openTermination = () => {
    setTerminationYear(Math.min(resultYear, inputs.tenure));
    dialogRef.current?.showModal();
  };

  const closeTermination = () => dialogRef.current?.close();

  const jumpToResults = () => {
    document.getElementById("results")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const terminationProfit = scenario.asbfWealth - scenario.cashInvested;

  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="brand-lockup">
          <div className="brand-mark"><Icon name="brand" size={42} /></div>
          <div className="brand-copy">
            <h1>
              <span className="full-brand">{text.brand}</span>
              <span className="short-brand">{language === "en" ? "ASBF Calculator" : "Kalkulator ASBF"}</span>
            </h1>
            <p>{text.subtitle}</p>
          </div>
        </div>
        <nav className="header-actions" aria-label="Calculator settings">
          <button
            className="header-button language-button"
            type="button"
            onClick={() => setLanguage((current) => current === "en" ? "ms" : "en")}
            aria-label={text.languageLabel}
            title={text.languageLabel}
          >
            <span>{language === "en" ? "EN" : "BM"}</span>
          </button>
          <button
            className="header-button icon-button"
            type="button"
            onClick={() => setTheme((current) => current === "dark" ? "light" : "dark")}
            aria-label={theme === "dark" ? text.themeToLight : text.themeToDark}
            title={theme === "dark" ? text.themeToLight : text.themeToDark}
          >
            <Icon name={theme === "dark" ? "sun" : "moon"} />
          </button>
          <button className="header-button export-button" type="button" onClick={() => exportProjection(results.projection)}>
            <Icon name="download" size={18} />
            <span>{text.exportCsv}</span>
          </button>
        </nav>
      </header>

      <main className="workspace">
        <section className="panel assumptions-panel" aria-labelledby="assumptions-title">
          <div className="panel-heading">
            <div>
              <span className="section-kicker">01 / {text.inputsKicker}</span>
              <h2 id="assumptions-title">{text.assumptions}</h2>
              <p className="panel-intro">{text.assumptionIntro}</p>
            </div>
            <span className="panel-heading-icon"><Icon name="spark" size={18} /></span>
          </div>

          <div className="form-stack">
            <div className="form-field amount-field">
              <div className="field-heading">
                <label htmlFor="certificate-amount">{text.certificateAmount}</label>
                <span className="field-context">{text.perCertificate}</span>
              </div>
              <div className="amount-readout">
                <strong>{formatMoney(inputs.amount)}</strong>
                <span>{text.perCertificate}</span>
              </div>
              <input
                id="certificate-amount"
                className="range-input"
                type="range"
                min={10_000}
                max={200_000}
                step={5_000}
                value={inputs.amount}
                onChange={(event) => updateInput("amount", Number(event.currentTarget.value))}
                aria-label={text.certificateAmount}
              />
              <div className="range-limits"><span>{text.minAmount}</span><span>{text.maxAmount}</span></div>
            </div>

            <div className="form-field certificates-field">
              <div className="field-heading">
                <span>{text.certificateCount}</span>
                <span className="field-context">1 - 10</span>
              </div>
              <div className="certificate-stepper">
                <div className="stepper-copy">
                  <strong aria-live="polite">{inputs.certificates}</strong>
                  <span>{text.identicalNote}</span>
                </div>
                <div className="stepper-buttons">
                  <button
                    type="button"
                    onClick={() => changeCertificates(-1)}
                    disabled={inputs.certificates <= 1}
                    aria-label={text.decreaseCertificates}
                  ><Icon name="minus" size={18} /></button>
                  <button
                    type="button"
                    onClick={() => changeCertificates(1)}
                    disabled={inputs.certificates >= 10}
                    aria-label={text.increaseCertificates}
                  ><Icon name="plus" size={18} /></button>
                </div>
              </div>
            </div>

            <div className="field-grid rate-grid">
              <div className="form-field range-field">
                <div className="field-heading">
                  <label htmlFor="financing-rate">{text.financingRate}</label>
                  <output htmlFor="financing-rate">{formatRate(inputs.financingRate)}</output>
                </div>
                <input
                  id="financing-rate"
                  className="range-input"
                  type="range"
                  min={0.1}
                  max={10}
                  step={0.05}
                  value={inputs.financingRate}
                  onChange={(event) => updateInput("financingRate", Number(event.currentTarget.value))}
                />
                <div className="range-limits"><span>0.1%</span><span>10%</span></div>
              </div>
              <div className="form-field range-field">
                <div className="field-heading">
                  <label htmlFor="asb-return">{text.asbReturn}</label>
                  <output htmlFor="asb-return">{formatRate(inputs.asbReturn)}</output>
                </div>
                <input
                  id="asb-return"
                  className="range-input"
                  type="range"
                  min={0}
                  max={10}
                  step={0.05}
                  value={inputs.asbReturn}
                  onChange={(event) => updateInput("asbReturn", Number(event.currentTarget.value))}
                />
                <div className="range-limits"><span>0%</span><span>10%</span></div>
              </div>
            </div>

            <div className="field-grid range-grid">
              <div className="form-field range-field">
                <div className="field-heading">
                  <label htmlFor="tenure">{text.financingTenure}</label>
                  <output htmlFor="tenure">{inputs.tenure} {text.years}</output>
                </div>
                <input
                  id="tenure"
                  className="range-input"
                  type="range"
                  min={5}
                  max={40}
                  step={1}
                  value={inputs.tenure}
                  onChange={(event) => updateTenure(Number(event.currentTarget.value))}
                />
                <div className="range-limits"><span>5 {text.years}</span><span>40 {text.years}</span></div>
              </div>
              <div className="form-field range-field">
                <div className="field-heading">
                  <label htmlFor="result-year">{text.viewResultsAt}</label>
                  <output htmlFor="result-year">{resultYear} {text.years}</output>
                </div>
                <input
                  id="result-year"
                  className="range-input"
                  type="range"
                  min={1}
                  max={inputs.tenure}
                  step={1}
                  value={resultYear}
                  onChange={(event) => setResultYear(Number(event.currentTarget.value))}
                />
                <div className="range-limits"><span>1 {text.year.toLowerCase()}</span><span>{inputs.tenure} {text.years}</span></div>
              </div>
            </div>

            <div className="form-field fees-field">
              <label htmlFor="upfront-fees">{text.upfrontFees}</label>
              <div className="fee-input-wrap">
                <span>RM</span>
                <input
                  id="upfront-fees"
                  type="number"
                  min={0}
                  max={10_000}
                  step={50}
                  inputMode="numeric"
                  value={inputs.fees}
                  onChange={(event) => updateInput("fees", Math.max(0, Math.min(10_000, Number(event.currentTarget.value))))}
                  aria-describedby="fee-note"
                />
              </div>
              <span id="fee-note" className="field-context">{text.perCertificateFees}</span>
            </div>

            <div className="form-field capital-field">
              <label htmlFor="existing-capital">{text.existingCapital}</label>
              <div className="fee-input-wrap">
                <span>RM</span>
                <input
                  id="existing-capital"
                  type="number"
                  min={0}
                  max={10_000_000}
                  step={1_000}
                  inputMode="numeric"
                  value={inputs.existingCapital}
                  onChange={(event) => updateInput("existingCapital", clampCapital(Number(event.currentTarget.value)))}
                  aria-describedby="capital-note"
                />
              </div>
              <span id="capital-note" className="field-context">{text.existingCapitalContext}</span>
            </div>

            <div className="form-field dividend-field">
              <div className="field-heading">
                <span id="dividend-mode-label">{text.dividendField}</span>
                <span className="field-context">{text.dividendFieldContext}</span>
              </div>
              <div className="segmented-control" role="group" aria-labelledby="dividend-mode-label">
                <button
                  type="button"
                  aria-pressed={inputs.dividendMode === "reinvest"}
                  onClick={() => updateInput("dividendMode", "reinvest")}
                >{text.dividendReinvest}</button>
                <button
                  type="button"
                  aria-pressed={inputs.dividendMode === "offset"}
                  onClick={() => updateInput("dividendMode", "offset")}
                >{text.dividendOffset}</button>
              </div>
              <span className="field-context">{text.dividendFieldNote}</span>
              {inputs.dividendMode === "offset" && (
                <div className="range-field">
                  <div className="field-heading">
                    <label htmlFor="offset-share">{text.offsetShare}</label>
                    <output htmlFor="offset-share">{inputs.dividendOffsetShare}%</output>
                  </div>
                  <input
                    id="offset-share"
                    className="range-input"
                    type="range"
                    min={0}
                    max={100}
                    step={5}
                    value={inputs.dividendOffsetShare}
                    onChange={(event) => updateInput("dividendOffsetShare", Number(event.currentTarget.value))}
                  />
                  <div className="range-limits"><span>0%</span><span>100%</span></div>
                  <span className="field-context">{text.offsetShareContext}</span>
                </div>
              )}
            </div>
          </div>

          <p className="assumption-note"><span className="note-marker" aria-hidden="true">i</span>{text.assumptionsNote}</p>
        </section>

        <section className="results-column" id="results" aria-labelledby="results-title">
          <div className="results-heading">
            <div>
              <span className="section-kicker">02 / {text.projectionKicker}</span>
              <h2 id="results-title">{text.viewResultsAt} <span>{resultYear}</span></h2>
            </div>
            <button className="termination-button" type="button" onClick={openTermination}>
              <Icon name="spark" size={18} />
              <span>{text.termination}</span>
            </button>
          </div>

          <article className="metric monthly-metric">
            <div className="monthly-copy">
              <span className="metric-label">{text.monthlyPayment}</span>
              <p>{text.acrossCertificates} {inputs.certificates} {inputs.certificates === 1 ? text.certificate : text.certificates}</p>
              {offsetEnabled && (
                <p className="monthly-offset">{text.dividendsApplied}: {formatMoney(selected.dividendApplied)} {text.perYear}</p>
              )}
              {offsetEnabled && (
                <p className="monthly-offset">{text.topUp}: {formatMoney(selected.monthlyTopUp)} {text.perMonth}</p>
              )}
            </div>
            <div className="payment-value"><strong>{formatMoney(results.monthlyPayment)}</strong><span>{text.perMonth}</span></div>
          </article>

          <div className="summary-grid" aria-label={text.projection}>
            <article className="metric summary-metric metric-asbf">
              <span className="metric-label">{text.netWealth}</span>
              <strong className={`metric-value ${tone(selected.asbfWealth)}`}>{formatMoney(selected.asbfWealth)}</strong>
              <span className="metric-note">{text.netWealthNote}</span>
            </article>
            <article className="metric summary-metric metric-ordinary">
              <span className="metric-label">{text.ordinaryAsb}</span>
              <strong className={`metric-value ${tone(selected.ordinaryWealth)}`}>{formatMoney(selected.ordinaryWealth)}</strong>
              <span className="metric-note">{text.ordinaryAsbNote}</span>
            </article>
            <article className="metric summary-metric">
              <span className="metric-label">{text.outOfPocket}</span>
              <strong className="metric-value">{formatMoney(selected.cashInvested)}</strong>
              <span className="metric-note">{resultYear} {text.years}</span>
            </article>
            <article className="metric summary-metric metric-advantage">
              <span className="metric-label">{text.advantage}</span>
              <strong className={`metric-value ${tone(advantage)}`}>{formatMoney(advantage)}</strong>
              <span className="metric-note">{text.advantageNote}</span>
            </article>
          </div>

          <section className="panel returns-panel" aria-labelledby="returns-title">
            <div className="panel-heading compact-heading">
              <div>
                <span className="section-kicker">{resultYear} {text.years.toUpperCase()}</span>
                <h3 id="returns-title">{text.returnsTitle}</h3>
              </div>
              <span className="returns-year">{text.year} {resultYear}</span>
            </div>
            <div className="table-wrap returns-table-wrap">
              <table className="wealth-table returns-table">
                <thead>
                  <tr><th scope="col">{text.metric}</th><th className="asbf-col" scope="col">{text.asbf}</th><th className="ordinary-col" scope="col">{text.ordinaryAsb}</th></tr>
                </thead>
                <tbody>
                  <tr><th scope="row">{text.netProfit}</th><td className={tone(selected.asbfProfit)}>{formatMoney(selected.asbfProfit)}</td><td className={tone(selected.ordinaryProfit)}>{formatMoney(selected.ordinaryProfit)}</td></tr>
                  <tr><th scope="row">{text.totalRoi}</th><td>{formatPercent(selected.asbfRoi, language)}</td><td>{formatPercent(selected.ordinaryRoi, language)}</td></tr>
                  <tr><th scope="row">{text.cagr}</th><td>{formatPercent(selected.asbfCagr, language)}</td><td>{formatPercent(selected.ordinaryCagr, language)}</td></tr>
                  <tr><th scope="row">{text.irr}</th><td>{formatPercent(selected.asbfIrr, language)}</td><td>{formatPercent(selected.ordinaryIrr, language)}</td></tr>
                  {offsetEnabled && (
                    <tr><th scope="row">{text.dividendsApplied}</th><td>{formatMoney(selected.dividendsApplied)}</td><td>{formatMoney(0)}</td></tr>
                  )}
                  <tr><th scope="row">{text.remainingLoan}</th><td>{formatMoney(selected.loanBalance)}</td><td>{formatMoney(0)}</td></tr>
                </tbody>
              </table>
            </div>
            <p className="table-note">{text.returnNote}</p>
          </section>

          <section className="panel chart-panel" aria-labelledby="chart-title">
            <div className="panel-heading compact-heading">
              <div>
                <span className="section-kicker">{text.chartDescription}</span>
                <h3 id="chart-title">{text.chartTitle}</h3>
              </div>
              <span className="chart-year-indicator">{text.year} {resultYear}</span>
            </div>
            <div className="chart-legend" aria-label={`${text.asbf}: ${text.netWealth}; ${text.ordinaryAsb}`}>
              <span><i className="legend-dot legend-asbf" />{text.asbf} | {text.netWealth}</span>
              <span><i className="legend-dot legend-ordinary" />{text.ordinaryAsb}</span>
            </div>
            <ProjectionChart
              points={results.projection}
              selectedYear={resultYear}
              labels={{ asbf: text.asbf, ordinary: text.ordinaryAsb, year: text.year, selected: text.selectedYear }}
            />
          </section>

          <section className="panel breakdown-panel" aria-labelledby="breakdown-title">
            <div className="panel-heading compact-heading breakdown-heading">
              <div>
                <span className="section-kicker">{inputs.tenure} {text.years.toUpperCase()}</span>
                <h3 id="breakdown-title">{text.breakdown}</h3>
              </div>
              <button className="text-button" type="button" onClick={() => setShowAllYears((current) => !current)}>
                {showAllYears ? text.showFewerYears : text.showAllYears}
                <Icon name="arrow" size={16} />
              </button>
            </div>

            <div className="table-wrap projection-table-wrap">
              <table className="wealth-table projection-table">
                <thead>
                  <tr>
                    <th scope="col">{text.year}</th>
                    <th scope="col">{text.asbBalance}</th>
                    <th scope="col">{text.remainingLoan}</th>
                    {offsetEnabled && <th scope="col">{text.dividendAppliedYear}</th>}
                    <th className="asbf-col" scope="col">{text.netWealth}</th>
                    <th className="ordinary-col" scope="col">{text.ordinaryBalance}</th>
                    <th scope="col">{text.cashInvested}</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleYears.map((point) => (
                    <tr key={point.year} className={point.year === resultYear ? "selected-row" : ""}>
                      <th scope="row">{point.year}</th>
                      <td>{formatMoney(point.asbBalance)}</td>
                      <td>{formatMoney(point.loanBalance)}</td>
                      {offsetEnabled && <td>{formatMoney(point.dividendApplied)}</td>}
                      <td className={tone(point.asbfWealth)}>{formatMoney(point.asbfWealth)}</td>
                      <td className={tone(point.ordinaryWealth)}>{formatMoney(point.ordinaryWealth)}</td>
                      <td>{formatMoney(point.cashInvested)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mobile-year-list">
              {visibleYears.map((point) => (
                <details className="year-disclosure" key={point.year} open={point.year === resultYear}>
                  <summary>
                    <span className="year-number">{text.year} {point.year}</span>
                    <span className="year-highlight"><small>{text.asbf}</small><strong className={tone(point.asbfWealth)}>{formatMoney(point.asbfWealth)}</strong></span>
                    <span className="year-highlight"><small>{text.ordinaryAsb}</small><strong>{formatMoney(point.ordinaryWealth)}</strong></span>
                  </summary>
                  <dl className="year-details">
                    <div><dt>{text.asbBalance}</dt><dd>{formatMoney(point.asbBalance)}</dd></div>
                    <div><dt>{text.remainingLoan}</dt><dd>{formatMoney(point.loanBalance)}</dd></div>
                    {offsetEnabled && <div><dt>{text.dividendAppliedYear}</dt><dd>{formatMoney(point.dividendApplied)}</dd></div>}
                    <div><dt>{text.cashInvested}</dt><dd>{formatMoney(point.cashInvested)}</dd></div>
                  </dl>
                </details>
              ))}
            </div>
          </section>
        </section>
      </main>

      <footer className="page-footer"><p>{text.disclaimer}</p></footer>

      <div className="mobile-dock">
        <div className="dock-payment"><span>{text.monthlyPayment}</span><strong>{formatMoney(results.monthlyPayment)}</strong></div>
        <button type="button" onClick={jumpToResults}>{text.viewResults}<Icon name="arrow" size={18} /></button>
      </div>

      <dialog
        className="termination-dialog"
        ref={dialogRef}
        onClick={(event) => {
          if (event.target === event.currentTarget) closeTermination();
        }}
      >
        <div className="dialog-content">
          <div className="dialog-heading">
            <div>
              <span className="section-kicker">{text.projection} / {text.termination}</span>
              <h2>{text.terminationTitle}</h2>
            </div>
            <button className="dialog-close" type="button" onClick={closeTermination} aria-label={text.close}>
              <Icon name="close" size={19} />
            </button>
          </div>
          <p className="dialog-intro">{text.terminationIntro}</p>
          <div className="form-field termination-select-field">
            <label htmlFor="termination-year">{text.terminationYear}</label>
            <select
              id="termination-year"
              value={scenarioYear}
              onChange={(event) => setTerminationYear(Number(event.currentTarget.value))}
            >
              {Array.from({ length: inputs.tenure }, (_, index) => index + 1).map((year) => (
                <option value={year} key={year}>{text.year} {year}</option>
              ))}
            </select>
          </div>
          <div className="scenario-grid">
            <article className="scenario-metric scenario-featured">
              <span>{text.estimatedPayout}</span>
              <strong className={tone(scenario.asbfWealth)}>{formatMoney(scenario.asbfWealth)}</strong>
              <small>{text.payoutNote}</small>
            </article>
            <article className="scenario-metric"><span>{text.cashInvestedByThen}</span><strong>{formatMoney(scenario.cashInvested)}</strong></article>
            {offsetEnabled && (
              <article className="scenario-metric">
                <span>{text.appliedByThen}</span>
                <strong>{formatMoney(scenario.dividendsApplied)}</strong>
                <small>{text.dividendsAppliedNote}</small>
              </article>
            )}
            <article className="scenario-metric"><span>{text.profitLoss}</span><strong className={tone(terminationProfit)}>{formatMoney(terminationProfit)}</strong></article>
            <article className="scenario-metric"><span>{text.totalReturn}</span><strong>{formatPercent(scenario.asbfRoi, language)}</strong></article>
            <article className="scenario-metric"><span>{text.irr}</span><strong>{formatPercent(scenario.asbfIrr, language)}</strong></article>
          </div>
          <p className="dialog-note">{text.terminationNote}</p>
          <button className="dialog-done" type="button" onClick={closeTermination}>{text.close}</button>
        </div>
      </dialog>
    </div>
  );
}

export default App;
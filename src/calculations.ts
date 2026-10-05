export type DividendMode = "reinvest" | "offset";

export type CalculatorInputs = {
  amount: number;
  certificates: number;
  financingRate: number;
  asbReturn: number;
  tenure: number;
  fees: number;
  dividendMode: DividendMode;
  dividendOffsetShare: number;
};

export type ProjectionPoint = {
  year: number;
  asbBalance: number;
  loanBalance: number;
  asbfWealth: number;
  ordinaryWealth: number;
  cashInvested: number;
  monthlyTopUp: number;
  asbfProfit: number;
  ordinaryProfit: number;
  asbfRoi: number | null;
  ordinaryRoi: number | null;
  asbfCagr: number | null;
  ordinaryCagr: number | null;
  asbfIrr: number | null;
  ordinaryIrr: number | null;
  dividendApplied: number;
  dividendsApplied: number;
};

export type CalculatorResults = {
  monthlyPayment: number;
  projection: ProjectionPoint[];
};

function paymentFor(principal: number, monthlyRate: number, months: number) {
  if (monthlyRate === 0) return principal / months;
  const growth = (1 + monthlyRate) ** months;
  return (principal * monthlyRate * growth) / (growth - 1);
}

function remainingLoan(
  principal: number,
  monthlyRate: number,
  payment: number,
  months: number,
) {
  if (months <= 0) return principal;
  if (monthlyRate === 0) return Math.max(0, principal - payment * months);

  const growth = (1 + monthlyRate) ** months;
  return Math.max(0, principal * growth - (payment * (growth - 1)) / monthlyRate);
}

function moneyWeightedReturn(
  fees: number,
  monthlyPayment: number,
  months: number,
  terminalValue: number,
) {
  if (months <= 0 || terminalValue <= 0) return null;

  const netPresentValue = (rate: number) => {
    const discount = (1 + rate) ** -months;
    const annuityFactor = Math.abs(rate) < 1e-8 ? months : (1 - discount) / rate;
    return -fees - monthlyPayment * annuityFactor + terminalValue * discount;
  };

  let low = -0.5;
  let high = 0.5;
  const lowValue = netPresentValue(low);
  let highValue = netPresentValue(high);

  while (highValue > 0 && high < 16) {
    high = high * 2 + 0.5;
    highValue = netPresentValue(high);
  }

  if (lowValue < 0 || highValue > 0) return null;

  for (let iteration = 0; iteration < 90; iteration += 1) {
    const middle = (low + high) / 2;
    if (netPresentValue(middle) > 0) low = middle;
    else high = middle;
  }

  return ((1 + (low + high) / 2) ** 12 - 1) * 100;
}

function returnOnCash(value: number, cashInvested: number, years: number) {
  if (cashInvested <= 0 || years <= 0) return null;
  return ((value - cashInvested) / cashInvested) * 100;
}

function compoundAnnualized(value: number, cashInvested: number, years: number) {
  if (cashInvested <= 0 || value <= 0 || years <= 0) return null;
  return ((value / cashInvested) ** (1 / years) - 1) * 100;
}

export function calculateProjection(inputs: CalculatorInputs): CalculatorResults {
  const principal = inputs.amount * inputs.certificates;
  const upfrontFees = inputs.fees * inputs.certificates;
  const monthlyRate = inputs.financingRate / 1200;
  const annualReturn = inputs.asbReturn / 100;
  const monthsInTerm = inputs.tenure * 12;
  const monthlyPayment = paymentFor(principal, monthlyRate, monthsInTerm);
  const annualInstalment = monthlyPayment * 12;
  const offsetShare =
    inputs.dividendMode === "offset"
      ? Math.max(0, Math.min(100, inputs.dividendOffsetShare)) / 100
      : 0;

  // The ASB return is read as the annual distribution yield. The share earmarked for the
  // financing leaves the units at each year end and services the instalments of the year that
  // follows, so the bank still receives the full instalment and the financing amortises over
  // its original term rather than being cleared early. The first distribution arrives after
  // year one, so year one is always paid in full, and whatever the instalments cannot absorb
  // stays invested inside the units. A zero offset share reproduces the plain reinvestment path.
  let asbBalance = principal;
  let dividendsAppliedToDate = 0;
  let dividendAvailable = 0;

  const asbBalances: number[] = [principal];
  const dividendAppliedByYear: number[] = [0];
  const dividendsAppliedByYear: number[] = [0];
  const cashPaidByYear: number[] = [0];

  for (let year = 1; year <= inputs.tenure; year += 1) {
    const distribution = asbBalance * annualReturn * offsetShare;
    // A distribution credited at the end of the final year lands after the last instalment,
    // so nothing can be serviced with it and it stays invested inside the units.
    const applied = year < inputs.tenure ? Math.min(distribution, annualInstalment) : 0;
    const cashPaid = annualInstalment - dividendAvailable;

    asbBalance = asbBalance * (1 + annualReturn) - applied;

    dividendAvailable = applied;
    dividendsAppliedToDate += applied;

    asbBalances[year] = asbBalance;
    dividendAppliedByYear[year] = applied;
    dividendsAppliedByYear[year] = dividendsAppliedToDate;
    cashPaidByYear[year] = cashPaid;
  }

  const projection: ProjectionPoint[] = [];
  let ordinaryBalance = upfrontFees;
  let cashPaid = 0;

  for (let year = 0; year <= inputs.tenure; year += 1) {
    if (year > 0) {
      const monthlyTopUp = cashPaidByYear[year] / 12;
      ordinaryBalance *= 1 + annualReturn;

      for (let month = 1; month <= 12; month += 1) {
        const fractionOfYear = (12 - month) / 12;
        ordinaryBalance += monthlyTopUp * (1 + annualReturn) ** fractionOfYear;
      }

      cashPaid += cashPaidByYear[year];
    }

    const monthsPaid = year * 12;
    const asbBalanceAtYearEnd = asbBalances[year];
    const loanBalance = remainingLoan(principal, monthlyRate, monthlyPayment, monthsPaid);
    const asbfWealth = asbBalanceAtYearEnd - loanBalance;
    const cashInvested = upfrontFees + cashPaid;
    const ordinaryWealth = ordinaryBalance;
    const averageTopUp = monthsPaid > 0 ? cashPaid / monthsPaid : monthlyPayment;

    projection.push({
      year,
      asbBalance: asbBalanceAtYearEnd,
      loanBalance,
      asbfWealth,
      ordinaryWealth,
      cashInvested,
      monthlyTopUp: monthsPaid > 0 ? cashPaidByYear[year] / 12 : monthlyPayment,
      asbfProfit: asbfWealth - cashInvested,
      ordinaryProfit: ordinaryWealth - cashInvested,
      asbfRoi: returnOnCash(asbfWealth, cashInvested, year),
      ordinaryRoi: returnOnCash(ordinaryWealth, cashInvested, year),
      asbfCagr: compoundAnnualized(asbfWealth, cashInvested, year),
      ordinaryCagr: compoundAnnualized(ordinaryWealth, cashInvested, year),
      asbfIrr: moneyWeightedReturn(
        upfrontFees,
        averageTopUp,
        monthsPaid,
        asbfWealth,
      ),
      ordinaryIrr: moneyWeightedReturn(
        upfrontFees,
        averageTopUp,
        monthsPaid,
        ordinaryWealth,
      ),
      dividendApplied: dividendAppliedByYear[year],
      dividendsApplied: dividendsAppliedByYear[year],
    });
  }

  return { monthlyPayment, projection };
}
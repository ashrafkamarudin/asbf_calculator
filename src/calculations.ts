export type CalculatorInputs = {
  amount: number;
  certificates: number;
  financingRate: number;
  asbReturn: number;
  tenure: number;
  fees: number;
};

export type ProjectionPoint = {
  year: number;
  asbBalance: number;
  loanBalance: number;
  asbfWealth: number;
  ordinaryWealth: number;
  cashInvested: number;
  asbfProfit: number;
  ordinaryProfit: number;
  asbfRoi: number | null;
  ordinaryRoi: number | null;
  asbfCagr: number | null;
  ordinaryCagr: number | null;
  asbfIrr: number | null;
  ordinaryIrr: number | null;
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
  const projection: ProjectionPoint[] = [];
  let ordinaryBalance = upfrontFees;

  for (let year = 0; year <= inputs.tenure; year += 1) {
    if (year > 0) {
      ordinaryBalance *= 1 + annualReturn;

      for (let month = 1; month <= 12; month += 1) {
        const fractionOfYear = (12 - month) / 12;
        ordinaryBalance += monthlyPayment * (1 + annualReturn) ** fractionOfYear;
      }
    }

    const monthsPaid = year * 12;
    const asbBalance = principal * (1 + annualReturn) ** year;
    const loanBalance = remainingLoan(principal, monthlyRate, monthlyPayment, monthsPaid);
    const asbfWealth = asbBalance - loanBalance;
    const cashInvested = upfrontFees + monthlyPayment * monthsPaid;
    const ordinaryWealth = ordinaryBalance;

    projection.push({
      year,
      asbBalance,
      loanBalance,
      asbfWealth,
      ordinaryWealth,
      cashInvested,
      asbfProfit: asbfWealth - cashInvested,
      ordinaryProfit: ordinaryWealth - cashInvested,
      asbfRoi: returnOnCash(asbfWealth, cashInvested, year),
      ordinaryRoi: returnOnCash(ordinaryWealth, cashInvested, year),
      asbfCagr: compoundAnnualized(asbfWealth, cashInvested, year),
      ordinaryCagr: compoundAnnualized(ordinaryWealth, cashInvested, year),
      asbfIrr: moneyWeightedReturn(
        upfrontFees,
        monthlyPayment,
        monthsPaid,
        asbfWealth,
      ),
      ordinaryIrr: moneyWeightedReturn(
        upfrontFees,
        monthlyPayment,
        monthsPaid,
        ordinaryWealth,
      ),
    });
  }

  return { monthlyPayment, projection };
}
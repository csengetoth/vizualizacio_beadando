function AddOptionsToSelectElementById(uniqueElements, selectElementId) {
  let select = document.getElementById(selectElementId);
  for (let index = 0; index < uniqueElements.sort().length; index++) {
    const current = uniqueElements[index];
    select.options.add(new Option(current, current));
  }
}

function getFilteredSortedMappedSalesNumberForEachYear(carsData) {
  const sumSalesByYear = getOverallSalesNumberForEachYear(carsData);
  const salesNumbersSumByYears = Object.entries(sumSalesByYear);    
  const salesNumbersSorted = salesNumbersSumByYears.sort((s, s2) => s[0] - s2[0]);
  return salesNumbersSorted.map(e => [parseTime(e[0]), e[1]]);
}

function getFilteredSortedMappedPricesForEachYear(carsData) {
  const sumPricesByYear = getOverallSalesPriceForEachYear(carsData);
  const salesPricesSumByYears = Object.entries(sumPricesByYear);
  const salesPricesSorted = salesPricesSumByYears.sort((s, s2) => s[0] - s2[0]);
  return salesPricesSorted.map(e => [parseTime(e[0]), e[1]]);
}

function getOverallSalesNumberForEachYear(cars) {
  const result = cars.reduce((acc, cur) => {
    let key = cur.sales_year;
    if (acc[key]) {
      acc[key] += cur.sales_number;
    } else {
      acc[key] = cur.sales_number;
    }
    return acc;
  }, {});

  return result;
}

function getOverallSalesPriceForEachYear(cars) {
  const result = cars.reduce((acc, cur) => {
    let key = cur.sales_year;
    if (acc[key]) {
      acc[key] += cur.sales_price * cur.sales_number;
    } else {
      acc[key] = cur.sales_price * cur.sales_number;
    }
    return acc;
  }, {});

  return result;
}
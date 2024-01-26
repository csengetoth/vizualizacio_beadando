// Global objects
//The countries where the cars were sold
const countries = ['Austria', 'UK', 'France', 'Hungary', 'Spain', 'Italy', 'Portugal', 'Netherlands'];
// light green to dark green
const colors = ['#D0F0C0', '#8F9779', '#3F704D', '#0B6623', '#708238', '#228B22', '#71A92C', '#013220' ];

const parseTime = d3.timeParse("%Y");

let data, scatterplot, barchart, barchartSales, barchartSales2, lineChartSales, lineChartPrices;
let carsData = [];

const dispatcher = d3.dispatch('filterCategories');

/**
 * Load data from CSV file asynchronously and render charts
 */
d3.csv('data/carsdata.csv')
  .then(_data => {
    data = _data
    data.forEach(d => {
      const cm = new CarMaker();

      d.sales_year = +d.sales_year;
      d.sales_number = +d.sales_number;
      d.sales_price =  +d.sales_price;

      cm.car_maker = d.car_maker;
      cm.country = d.country;
      cm.sales_year = +d.sales_year;
      cm.sales_number = +d.sales_number;
      cm.sales_price = +d.sales_price;

      carsData.push(cm);
    });
    
    // Initialize scales
    const colorScale = d3.scaleOrdinal()
        .range(colors) 
        .domain(countries);

    //Initialize the diagrams
    scatterplot = new Scatterplot({ 
      parentElement: '#scatterplot',
      colorScale: colorScale
    }, carsData, colors);
    scatterplot.updateVis();

    barchart = new Barchart({
      parentElement: '#barchart',
      colorScale: colorScale
    }, dispatcher, carsData, countries, colors);
    barchart.updateVis();

    barchartSales = new BarchartSales({
      parentElement: '#barchartSales',
      colorScale: colorScale
    }, carsData, carsData[0].car_maker, countries, colors);

    barchartSales.updateVis();
    
    barchartSales2 = new BarchartSales2({
      parentElement: '#barchartSales2',
      colorScale: colorScale
    }, carsData, carsData[0].sales_year, countries, colors);

    barchartSales2.updateVis();

    const salesResult = getFilteredSortedMappedSalesNumberForEachYear(carsData);
    const pricesResult = getFilteredSortedMappedPricesForEachYear(carsData);

    lineChartSales = new LineChartSales({ parentElement: '#lineChartSales'}, salesResult);
    lineChartSales.updateVis();

    lineChartPrices = new LineChartPrices({ parentElement: '#lineChartPrices'}, pricesResult);
    lineChartPrices.updateVis();

    const uniqueCarMakers = [...new Set(carsData.map(r => r.car_maker))];
    AddOptionsToSelectElementById(uniqueCarMakers, "car-maker-select");

    const uniqueSalesYears = [...new Set(carsData.map(r => r.sales_year))];
    AddOptionsToSelectElementById(uniqueSalesYears, "sales-year-select");
  })
  .catch(error => console.error(error));

  d3.select('#car-maker-select').on('change', function() {
    // Get selected option value
    const currentCarMaker = d3.select(this).property('value');
    
    barchartSales.selectedCarMaker = currentCarMaker;
    barchartSales.updateVis();
  });

  d3.select('#sales-year-select').on('change', function() {
    // Get selected option value
    const currentSalesYear = d3.select(this).property('value');
    
    barchartSales2.selectedYear = Number(currentSalesYear);
    barchartSales2.updateVis();
  });

  d3.select("#start-year-input").on("change", function () {
    // Get selected year
    const minYear = parseInt(d3.select(this).property("value"));
  
    // Filter dataset accordingly
    let filteredData = carsData.filter((c) => c.sales_year >= minYear);
    const salesNumbersSortedMapped = getFilteredSortedMappedSalesNumberForEachYear(filteredData);
    const salesPricesSortedMapped = getFilteredSortedMappedPricesForEachYear(filteredData)
  
    // Update chart
    lineChartSales.filteredCarsData = salesNumbersSortedMapped;
    lineChartSales.updateVis();

     // Update chart
     lineChartPrices.filteredCarsData = salesPricesSortedMapped;
     lineChartPrices.updateVis();
  });
  
/**
 * Dispatcher waits for 'filterCategory' event
 * We filter data based on the selected categories and update the scatterplot
 */
dispatcher.on('filterCategories', selectedCategories => {
  if (selectedCategories.length === 0) {
    scatterplot.carsData = carsData;
  } else {
    scatterplot.carsData = carsData.filter(d => selectedCategories.includes(d.country));
  }
  scatterplot.updateVis();
});
window.onload = function() {

queue()
   .defer(d3.json, "/fitbit/activity")
   .await(makeGraphs);

function makeGraphs(error, activityJson) {

    //Clean projectsJson data
    var fitbitActivity = activityJson;
    var dateFormat = d3.time.format("%d-%m-%Y");
    var displayDate = d3.time.format("%d %b");
    var week = d3.time.format("%U");
    var monthNameFormat = d3.time.format("%b");
    fitbitActivity.forEach(function (d) {
        d.date = dateFormat.parse(d.date);
        d.calories_burned = +d.calories_burned;
        d.steps = +d.steps;
        d.distance = +d.distance;
        d.floors = +d.floors;
        d.minutes_lightly_active = +d.minutes_lightly_active;
        d.minutes_very_active = +d.minutes_very_active;
        d.activity_calories = +d.activity_calories;
        d.value = +d.value;
        d.month = d.date.getMonth();

    });

    //Create a Crossfilter instance
    var ndx = crossfilter(fitbitActivity);


    //Define data dimensions
    var dateDim =ndx.dimension(function(d) {
        return d3.time.day(d.date);
    });
    var monthDim=ndx.dimension(function(d) {
        var month = d.date.getMonth();
        var months= [ 'January-2017', 'February-2017', 'March-2017', 'April-2017', 'May-2017', 'June-2017', 'July-2017', 'August-2017', 'September-2017', 'October-2017', 'November-2017', 'December-2017'];
        months.sort(function(dateA, dateB) {
          return new Date(dateA) - new Date(dateB);
        });
        if (typeof month !== 'undefined' && parseInt(month) > 0 && parseInt(month) < 13) {
          return months[month];
        }
        return undefined;
    });


    var caloriesDim =ndx.dimension(function(d) {
        return d.calories_burned;
    });
    var stepsDim =ndx.dimension(function(d) {
        return d.stps;
    });
    var distanceDim =ndx.dimension(function(d) {
        return d.distance;
    });
    var floorsDim =ndx.dimension(function(d) {
        return d.floors;
    });
    

    // Define Data Groups
    var caloriesGroup = dateDim.group().reduceSum(function (d){
        return d.calories_burned;
    });
    var numberOfStepsTaken = dateDim.group().reduceSum(function (d){
        return d.steps;
    });
    var distanceTravelled = dateDim.group().reduceSum(function (d){
        return d.distance;
    });
    var floorsGroup = dateDim.group().reduceSum(function (d){
        return d.floors;
    });
    var monthGroup = monthDim.group();
    
    var totalCalories = ndx.groupAll().reduceSum(function (d) {
       return d.calories_burned;
   });
    var totalSteps = ndx.groupAll().reduceSum(function (d) {
       return d.steps;
   });
    var totalDistance = ndx.groupAll().reduceSum(function (d) {
      return d.distance;
   });
    var totalFloors = ndx.groupAll().reduceSum(function (d) {
      return d.floors;
    });
    var all = ndx.groupAll();

    

    //Define values (to be used in charts)
    var minDate = dateDim.bottom(1)[0].date;
    var maxDate = dateDim.top(1)[0].date;

    

    // Define Charts
    var caloriesChart = dc.barChart("#calories-burned-chart");
    var caloriesND = dc.numberDisplay("#caloriesND");
    var stepsChart = dc.barChart("#steps-chart");
    var stepsND = dc.numberDisplay("#stepsND");
    var distanceChart = dc.barChart("#distance-chart");
    var distanceND = dc.numberDisplay("#distanceND");
    var floorChart = dc.barChart("#floor-chart");
    var floorND = dc.numberDisplay("#floorND");
    var monthPie = dc.pieChart("#month-pie");
    
    
    // Calculate dimensions for charts
    var chartWidth = $("#main-chart").width();
    var chartSize = 200;
    if(chartWidth >= 480){
            chartSize = 200;
        } else {
            chartSize = chartWidth * 0.3;
        }
    var margin = {top: 30, right: 50, bottom: 25, left: 30};
    var height = 400;

    var x = d3.time.scale().range([0]);
    var y = d3.scale.linear().range([0]);
    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom")
        .tickSize(6.0)
        .tickFormat(d3.time.format("%d"));
    var yAxis = d3.svg.axis().scale(y)
        .orient("left")
        .ticks(8);

    // Month select menu - view data by month

     selectField = dc.selectMenu('#menu-select')
        .dimension(monthDim)
        .group(monthGroup)
        .order();

   //Charts and Number Displays
   monthPie
       .width(chartWidth)
       .height(height)
       .radius(chartSize)
       .cx(400)
       .transitionDuration(1500)
       .colors(d3.scale.ordinal().range(['#BCFF25','#ABE822','#9AD11F','#89BA1B','#78A318','#678C15','#567411','#455D0E','#34460B']))
       .dimension(monthDim)
       .group(monthGroup);
       


   caloriesChart
       .width(chartWidth)
       .height(height)
       .margins(margin)
       .dimension(dateDim)
       .group(caloriesGroup)
       .transitionDuration(2000)
       .brushOn(false)
       .title(function(d){return d.value + " kcal";})
       .x(d3.time.scale().domain([minDate, maxDate]))
       .xUnits(d3.time.days)
       .xAxisLabel("2017")
       .yAxisLabel("Calories Burned Per Day")
       .elasticY(true)
       .elasticX(true)
       .yAxis(yAxis)
       .xAxis(xAxis);

    caloriesND
      .formatNumber(d3.format("d"))
      .valueAccessor(function (d){
        return d;
      })
      .group(totalCalories);

    stepsChart
       .width(chartWidth)
       .height(height)
       .margins(margin)
       .dimension(dateDim)
       .group(numberOfStepsTaken)
       .transitionDuration(2000)
       .brushOn(false)
       .title(function(d){return d.value + " kcal";})
       .x(d3.time.scale().domain([minDate, maxDate]))
       .xUnits(d3.time.days)
       .elasticY(true)
       // .elasticX(true)
       .xAxisLabel("2017")
       .yAxisLabel("Steps Taken")
       .yAxis(yAxis)
       .xAxis(xAxis);

    stepsND
      .formatNumber(d3.format("d"))
      .valueAccessor(function (d){
        return d;
      })
      .group(totalSteps);

    distanceChart
       .width(chartWidth)
       .height(height)
       .margins(margin)
       .dimension(dateDim)
       .group(distanceTravelled)
       .transitionDuration(5000)
       .brushOn(false)
       .title(function(d){return d.value + " km";})
       .x(d3.time.scale().domain([minDate, maxDate]))
       .xUnits(d3.time.days)
       .elasticY(true)
       // .elasticX(true)
       .xAxisLabel("2017")
       .yAxisLabel("Distance Travelled Per Day")
       .yAxis(yAxis)
       .xAxis(xAxis);

    distanceND
      .formatNumber(d3.format("f"))
      .valueAccessor(function (d){
        return d;
      })
      .group(totalDistance);

   floorChart
       .width(chartWidth)
       .height(height)
       .margins(margin)
       .dimension(floorsDim)
       .group(floorsGroup)
       .transitionDuration(5000)
       .brushOn(false)
       .title(function(d){return d.value + " floors";})
       .x(d3.time.scale().domain([minDate, maxDate]))
       .xUnits(d3.time.days)
        // .elasticY(true)
       .elasticX(true)
       .xAxisLabel("2017")
       .yAxisLabel("Floors Climbed Per Day")
       .yAxis(yAxis)
       .xAxis(xAxis);

    floorND
       .formatNumber(d3.format("d"))
       .valueAccessor(function (d){
          return d;
        })
       .group(totalFloors);


    // Make charts responsive
    $(window).resize(function() {
        // Recalculate chart size
        chartWidth = $("#main-chart").width();
        if(chartWidth >= 480){
            chartSize = 200;
        } else {
            chartSize = chartWidth * 0.3;
        }

    // Set new values and redraw charts
        monthPie
            .width(chartWidth)
            .radius(chartSize)
            .redraw();

        caloriesChart
            .width(chartWidth)
            .rescale()
            .redraw();

        stepsChart
            .width(chartWidth)
            .rescale()
            .redraw();

        distanceChart
            .width(chartWidth)
            .rescale()
            .redraw();

        floorChart
            .width(chartWidth)
            .rescale()
            .redraw();   
});
    // Render everything on page
    dc.renderAll();
  }
};
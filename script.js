
(function() {

  var data = {"members" :[
   {"name":"Member 1","contribution_cash":500.00,"joinDate":"10/2/2016","opportunityCost_salary":100000.00,"hoursWorked":30.00, "investedCash":5000.00, "contributedCash":250.00},
   {"name":"Member 2","contribution_cash":600.00,"joinDate":"5/2/2016","opportunityCost_salary":100000.00,"hoursWorked":40.00, "investedCash":0.00, "contributedCash":1000.00},
   {"name":"Member 3","contribution_cash":750.00,"joinDate":"1/29/2017","opportunityCost_salary":100000.00,"hoursWorked":50.00, "investedCash":1000.00, "contributedCash":3000.00},
   {"name":"Member 4","contribution_cash":1000.00,"joinDate":"3/1/2016","opportunityCost_salary":100000.00,"hoursWorked":60.00, "investedCash":0.00, "contributedCash":500.00}
   ]};
  var chart_data = [];

  function loadData(){
   $list = $('#membersTable').find('tbody');
   var total_share= 0;
   var total_share_percent = 0;
   data.members.forEach(function(member){
     var opportunityCost_hour = parseFloat(member.opportunityCost_salary)/52.1429/37.5;
     var contribution = opportunityCost_hour * member.hoursWorked;
     var share = parseFloat(member.contribution_cash) * 4 + contribution;
     total_share += share;
   });

   data.members.forEach(function(member){
     var opportunityCost_hour = parseFloat(member.opportunityCost_salary)/52.1429/37.5;
     var contribution = opportunityCost_hour * member.hoursWorked;
     var share = parseFloat(member.contribution_cash) * 4 + contribution;
     var share_percent = share/total_share * 100;
     chart_data.push({"name":member.name, "share":share, "share_percent":share_percent.toFixed(2)});
     total_share_percent += share_percent;
     var daysOnProject = Math.round(new Date(new Date() - new Date(member.joinDate)) / (1000 * 60 * 60 * 24));
     var joinDate = new Date(member.joinDate);
     var vestedTime = new Date(joinDate.getFullYear(), joinDate.getMonth(), joinDate.getDate()+(365*2));
     var $row = $('<tr>');
     $row.append('<td>' + member.name + '</td>')
     .append('<td>' + formatCurrency(share) + '</td>')
     .append('<td>' + share_percent.toFixed(2) + '%</td>')
     .append('<td>' + formatCurrency(contribution) + '</td>')
     .append('<td>' + formatCurrency(member.contribution_cash) + '</td>')
     .append('<td>' + joinDate.toLocaleDateString("en-US") + '</td>')
     .append('<td>' + daysOnProject + '</td>')
     .append('<td>' + vestedTime.toLocaleDateString("en-US") + '</td>')
     .append('<td>' + formatCurrency(member.opportunityCost_salary) + '</td>')
     .append('<td>' + formatCurrency(opportunityCost_hour) + '</td>')
     .append('<td>' + member.hoursWorked + '</td>')
     .append('<td>' + formatCurrency(member.investedCash) + '</td>')
     .append('<td>' + formatCurrency(member.contributedCash) + '</td>');
     $row.appendTo($list);
   });

   var $totalRow = $('<tr>');
   $totalRow.append('<td>Total</td>')
   .append('<td>'+ formatCurrency(total_share) + '</td>')
   .append('<td>'+ total_share_percent.toFixed(2) + '%</td>')
   $totalRow.appendTo($list);
  }

  function formatCurrency(num) {
    return '$'+ num.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
  }

  function loadBarChart() {
    var color = d3.scaleOrdinal(d3.schemeCategory10);
     var svg = d3.select("body").append("svg")
                  .attr("width", 800)
                  .attr("height", 400);

      var x = d3.scaleLinear()
                    .domain([0,d3.max(chart_data.map(function(d){return d.share}))])
                    .range([0,600]);
      var y = d3.scaleBand()
                .domain(chart_data.map(function(d){return d.name}))
                .range([0, 150]).padding(0.5);

     svg.selectAll("rect")
         .data(chart_data)
         .enter().append("rect")
               .attr("height",y.bandwidth())
               .attr("width",function(d) {return x(d.share);})
               .attr("x",30)
               .attr("y",function(d){return y(d.name);})
               .attr("fill", function(d,i) { return color(i); })
               .text(function(d){ return d;});

       svg.selectAll("text")
         .data(chart_data)
         .enter().append("text")
         .attr("x", function (d) { return x(d.share) + 40;})
         .attr("y", function(d){ return y(d.name) + y.bandwidth()/2 + 4; } )
         .text(function (d) { return formatCurrency(d.share); });

       var xAxis = d3.axisBottom(x);
       var yAxis = d3.axisLeft(y);

       svg.append("g")
       .attr("transform", "translate(30,150)")
       .call(xAxis);

       svg.append("g")
       .attr("transform", "translate(30,0)")
       .call(yAxis);
  }


function loadPieChart() {
  var width = 600,
      height = 400,
      radius = 100;

  var color = d3.scaleOrdinal(d3.schemeCategory10);

  var arc = d3.arc()
      .outerRadius(radius - 10)
      .innerRadius(0);

  var labelArc = d3.arc()
      .outerRadius(radius - 40)
      .innerRadius(radius - 40);

  var pie = d3.pie()
      .sort(null)
      .value(function(d) { return d.share_percent; });

  var svg = d3.select("body").append("svg")
      .attr("width", width)
      .attr("height", height)
    .append("g")
    .attr("transform", "translate(200,90)");

  var g = svg.selectAll(".arc")
      .data(pie(chart_data))
    .enter().append("g")
      .attr("class", "arc");

  g.append("path")
      .attr("d", arc)
      .style("fill", function(d) { return color(d.data.share_percent); });

  g.append("text")
      .attr("transform", function(d) { return "translate(" + labelArc.centroid(d) + ")"; })
      .attr("dy", ".35em")
      .text(function(d) { return d.data.share_percent+'%'; });

  g.append("text")
      .attr("transform", function(d) {
        var d = arc.centroid(d);
        d[0] *= 2.7;
        d[1] *= 2.7;
        return "translate(" + d + ")";})
      .text(function(d) { return d.data.name; });

}


  $('#addFormBtn').on('click', function(e){
    $("#addMemberForm").toggle();
  });

  $( "#addForm" ).submit(function( event ) {
    var formdata = $( this ).serializeArray();
    var reformatedData = formdata.map(function(d) {
      var rObj = {};
      var currencyDataFields = ["contribution_cash","opportunityCost_salary","investedCash","contributedCash"];
      var numberDataFields = ["hoursWorked"];
      var dateDataFields = ["joinDate"];
      if(numberDataFields.indexOf(d.name) >= 0) rObj[d.name] = parseInt(d.value);
      else if (currencyDataFields.indexOf(d.name) >= 0) rObj[d.name] = parseFloat(d.value);
      else if (dateDataFields.indexOf(d.name) >= 0) rObj[d.name] = d.value.replace(/-/g, '\/');
      else rObj[d.name] = d.value;
      return rObj;
    });
    data.members.push(Object.assign(...reformatedData));
    event.preventDefault();
    $('#membersTable').find('tbody').html('');
    $("#addMemberForm").find("input").each(function() {$(this).val('');});
    $("#addMemberForm").hide();
    chart_data = [];
    $("svg").remove();
    loadData();
    loadBarChart();
    loadPieChart();
  });

  function init() {
	   loadData();
     loadBarChart();
     loadPieChart();
  }

  $(init);

}());

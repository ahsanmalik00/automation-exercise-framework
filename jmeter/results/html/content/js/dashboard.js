/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 100.0, "KoPercent": 0.0};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.8378378378378378, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.5, 500, 1500, "S03 - POST /signup (create account form)"], "isController": false}, {"data": [0.0, 500, 1500, "S06 - POST /payment (place order)"], "isController": false}, {"data": [1.0, 500, 1500, "S02 - POST /signup (name + email)"], "isController": false}, {"data": [1.0, 500, 1500, "S05 - GET /checkout (extract CSRF)"], "isController": false}, {"data": [1.0, 500, 1500, "S02 - POST /api/verifyLogin (valid credentials)"], "isController": false}, {"data": [1.0, 500, 1500, "S04 - GET /view_cart (verify cart contents)"], "isController": false}, {"data": [0.8333333333333334, 500, 1500, "S01 - GET / (home - establish session)"], "isController": false}, {"data": [0.8333333333333334, 500, 1500, "S01 - POST /api/createAccount"], "isController": false}, {"data": [1.0, 500, 1500, "S02 - GET /add_to_cart/1 (Blue Top)"], "isController": false}, {"data": [0.5, 500, 1500, "S06 - POST /payment (place order)-0"], "isController": false}, {"data": [1.0, 500, 1500, "S06 - POST /payment (place order)-1"], "isController": false}, {"data": [0.5, 500, 1500, "S01 - GET /login (extract CSRF)"], "isController": false}, {"data": [1.0, 500, 1500, "S04 - GET /add_to_cart/1"], "isController": false}, {"data": [1.0, 500, 1500, "S03 - POST /api/verifyLogin (invalid credentials - negative test)"], "isController": false}, {"data": [1.0, 500, 1500, "S03 - POST /signup (create account form)-1"], "isController": false}, {"data": [1.0, 500, 1500, "S03 - POST /signup (create account form)-0"], "isController": false}, {"data": [1.0, 500, 1500, "S03 - GET /add_to_cart/2 (Men Tshirt)"], "isController": false}, {"data": [0.3333333333333333, 500, 1500, "TC01 - Add Two Products To Cart"], "isController": true}, {"data": [0.8333333333333334, 500, 1500, "S01 - Setup - Create user for login test"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 34, 0, 0.0, 518.2352941176471, 301, 1625, 335.0, 1246.5, 1393.25, 1625.0, 7.23404255319149, 58.69244514627659, 2.8095910904255317], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["S03 - POST /signup (create account form)", 1, 0, 0.0, 801.0, 801, 801, 801.0, 801.0, 801.0, 801.0, 1.2484394506866416, 9.730268804619225, 1.4118094569288389], "isController": false}, {"data": ["S06 - POST /payment (place order)", 1, 0, 0.0, 1625.0, 1625, 1625, 1625.0, 1625.0, 1625.0, 1625.0, 0.6153846153846154, 4.790865384615385, 0.5745192307692307], "isController": false}, {"data": ["S02 - POST /signup (name + email)", 1, 0, 0.0, 310.0, 310, 310, 310.0, 310.0, 310.0, 310.0, 3.225806451612903, 63.70967741935484, 1.742061491935484], "isController": false}, {"data": ["S05 - GET /checkout (extract CSRF)", 1, 0, 0.0, 356.0, 356, 356, 356.0, 356.0, 356.0, 356.0, 2.8089887640449436, 28.745501228932586, 0.9409015098314607], "isController": false}, {"data": ["S02 - POST /api/verifyLogin (valid credentials)", 3, 0, 0.0, 312.3333333333333, 301, 330, 306.0, 330.0, 330.0, 330.0, 2.479338842975207, 2.23802298553719, 0.6811725206611571], "isController": false}, {"data": ["S04 - GET /view_cart (verify cart contents)", 3, 0, 0.0, 390.3333333333333, 361, 406, 404.0, 406.0, 406.0, 406.0, 2.3059185242121445, 25.53249303420446, 0.5899908724058417], "isController": false}, {"data": ["S01 - GET / (home - establish session)", 3, 0, 0.0, 657.3333333333334, 351, 1264, 357.0, 1264.0, 1264.0, 1264.0, 1.2897678417884781, 67.4071635855546, 0.15744236349957008], "isController": false}, {"data": ["S01 - POST /api/createAccount", 3, 0, 0.0, 625.0, 336, 1190, 349.0, 1190.0, 1190.0, 1190.0, 1.4814814814814814, 1.174286265432099, 0.8217592592592593], "isController": false}, {"data": ["S02 - GET /add_to_cart/1 (Blue Top)", 3, 0, 0.0, 322.0, 311, 343, 312.0, 343.0, 343.0, 343.0, 2.2058823529411766, 2.123305376838235, 0.551470588235294], "isController": false}, {"data": ["S06 - POST /payment (place order)-0", 1, 0, 0.0, 1316.0, 1316, 1316, 1316.0, 1316.0, 1316.0, 1316.0, 0.7598784194528876, 0.6478260353343465, 0.4489516052431611], "isController": false}, {"data": ["S06 - POST /payment (place order)-1", 1, 0, 0.0, 308.0, 308, 308, 308.0, 308.0, 308.0, 308.0, 3.246753246753247, 22.50849736201299, 1.112900771103896], "isController": false}, {"data": ["S01 - GET /login (extract CSRF)", 1, 0, 0.0, 1229.0, 1229, 1229, 1229.0, 1229.0, 1229.0, 1229.0, 0.8136696501220504, 6.251112438974776, 0.16845504475183073], "isController": false}, {"data": ["S04 - GET /add_to_cart/1", 1, 0, 0.0, 334.0, 334, 334, 334.0, 334.0, 334.0, 334.0, 2.9940119760479043, 2.44140625, 1.01749625748503], "isController": false}, {"data": ["S03 - POST /api/verifyLogin (invalid credentials - negative test)", 3, 0, 0.0, 310.3333333333333, 304, 314, 313.0, 314.0, 314.0, 314.0, 2.1398002853067046, 1.9280492154065623, 0.5746533969329529], "isController": false}, {"data": ["S03 - POST /signup (create account form)-1", 1, 0, 0.0, 301.0, 301, 301, 301.0, 301.0, 301.0, 301.0, 3.3222591362126246, 22.606935215946844, 1.1355377906976745], "isController": false}, {"data": ["S03 - POST /signup (create account form)-0", 1, 0, 0.0, 496.0, 496, 496, 496.0, 496.0, 496.0, 496.0, 2.0161290322580645, 1.9944713961693548, 1.590851814516129], "isController": false}, {"data": ["S03 - GET /add_to_cart/2 (Men Tshirt)", 3, 0, 0.0, 313.6666666666667, 303, 321, 317.0, 321.0, 321.0, 321.0, 2.4834437086092715, 2.3904762520695364, 0.7275713990066225], "isController": false}, {"data": ["TC01 - Add Two Products To Cart", 3, 0, 0.0, 1683.3333333333333, 1364, 2299, 1387.0, 2299.0, 2299.0, 2299.0, 0.8917954815695601, 58.19923500668847, 0.821253065546968], "isController": true}, {"data": ["S01 - Setup - Create user for login test", 3, 0, 0.0, 583.6666666666666, 326, 1091, 334.0, 1091.0, 1091.0, 1091.0, 1.487357461576599, 1.3106369298463065, 0.7920953148239961], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": []}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 34, 0, "", "", "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});

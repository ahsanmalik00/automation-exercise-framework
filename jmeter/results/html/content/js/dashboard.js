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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.6891891891891891, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 500, 1500, "Signup - name and email"], "isController": false}, {"data": [0.0, 500, 1500, "Place order"], "isController": false}, {"data": [1.0, 500, 1500, "Signup - account details-1"], "isController": false}, {"data": [1.0, 500, 1500, "Verify Login - valid"], "isController": false}, {"data": [0.5, 500, 1500, "Signup - account details-0"], "isController": false}, {"data": [0.16666666666666666, 500, 1500, "Home page"], "isController": false}, {"data": [0.5, 500, 1500, "Login page"], "isController": false}, {"data": [1.0, 500, 1500, "Add Blue Top"], "isController": false}, {"data": [0.5, 500, 1500, "Create Account"], "isController": false}, {"data": [0.5, 500, 1500, "Create user for login test"], "isController": false}, {"data": [0.5, 500, 1500, "Signup - account details"], "isController": false}, {"data": [1.0, 500, 1500, "Add to cart"], "isController": false}, {"data": [1.0, 500, 1500, "Verify Login - invalid"], "isController": false}, {"data": [1.0, 500, 1500, "View Cart"], "isController": false}, {"data": [0.0, 500, 1500, "Add two products to cart"], "isController": true}, {"data": [0.5, 500, 1500, "Place order-0"], "isController": false}, {"data": [1.0, 500, 1500, "Place order-1"], "isController": false}, {"data": [1.0, 500, 1500, "Add Men Tshirt"], "isController": false}, {"data": [1.0, 500, 1500, "Checkout page"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 34, 0, 0.0, 784.6176470588236, 365, 2796, 403.0, 1506.5, 2038.5, 2796.0, 4.901254144442843, 39.762578609269134, 1.8648585033155543], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Signup - name and email", 1, 0, 0.0, 394.0, 394, 394, 394.0, 394.0, 394.0, 394.0, 2.5380710659898473, 50.02776015228426, 1.3285215736040608], "isController": false}, {"data": ["Place order", 1, 0, 0.0, 1786.0, 1786, 1786, 1786.0, 1786.0, 1786.0, 1786.0, 0.5599104143337066, 4.366645086786114, 0.5227288633818589], "isController": false}, {"data": ["Signup - account details-1", 1, 0, 0.0, 383.0, 383, 383, 383.0, 383.0, 383.0, 383.0, 2.6109660574412534, 17.771907637075717, 0.8924200391644909], "isController": false}, {"data": ["Verify Login - valid", 3, 0, 0.0, 383.6666666666667, 365, 395, 391.0, 395.0, 395.0, 395.0, 4.092769440654843, 3.678429826057299, 1.0311860504774897], "isController": false}, {"data": ["Signup - account details-0", 1, 0, 0.0, 550.0, 550, 550, 550.0, 550.0, 550.0, 550.0, 1.8181818181818181, 1.8022017045454544, 1.4044744318181817], "isController": false}, {"data": ["Home page", 3, 0, 0.0, 1912.0, 1330, 2796, 1610.0, 2796.0, 2796.0, 2796.0, 0.9674298613350532, 50.558602567720094, 0.11809446549500162], "isController": false}, {"data": ["Login page", 1, 0, 0.0, 1282.0, 1282, 1282, 1282.0, 1282.0, 1282.0, 1282.0, 0.7800312012480499, 5.988110618174727, 0.16149083463338534], "isController": false}, {"data": ["Add Blue Top", 3, 0, 0.0, 399.0, 390, 415, 392.0, 415.0, 415.0, 415.0, 3.5671819262782405, 3.4313224583828776, 0.8917954815695601], "isController": false}, {"data": ["Create Account", 3, 0, 0.0, 1099.0, 728, 1311, 1258.0, 1311.0, 1311.0, 1311.0, 2.1754894851341553, 1.7229706762146484, 1.1536042875271937], "isController": false}, {"data": ["Create user for login test", 3, 0, 0.0, 1290.6666666666667, 1266, 1324, 1282.0, 1324.0, 1324.0, 1324.0, 1.9933554817275745, 1.763652408637874, 1.0161441029900333], "isController": false}, {"data": ["Signup - account details", 1, 0, 0.0, 934.0, 934, 934, 934.0, 934.0, 934.0, 934.0, 1.0706638115631693, 8.348877475910063, 1.192995516595289], "isController": false}, {"data": ["Add to cart", 1, 0, 0.0, 382.0, 382, 382, 382.0, 382.0, 382.0, 382.0, 2.617801047120419, 2.139745582460733, 0.8896433246073299], "isController": false}, {"data": ["Verify Login - invalid", 3, 0, 0.0, 378.3333333333333, 370, 389, 376.0, 389.0, 389.0, 389.0, 3.5335689045936394, 3.1907943168433452, 0.9386042402826855], "isController": false}, {"data": ["View Cart", 3, 0, 0.0, 397.3333333333333, 388, 407, 397.0, 407.0, 407.0, 407.0, 3.3557046979865772, 37.16290023769575, 0.8585885067114094], "isController": false}, {"data": ["Add two products to cart", 3, 0, 0.0, 3095.3333333333335, 2509, 3996, 2781.0, 3996.0, 3996.0, 3996.0, 0.6615214994487321, 43.168584619625136, 0.6091941152149944], "isController": true}, {"data": ["Place order-0", 1, 0, 0.0, 1403.0, 1403, 1403, 1403.0, 1403.0, 1403.0, 1403.0, 0.7127583749109052, 0.6104385691375623, 0.42111212580185314], "isController": false}, {"data": ["Place order-1", 1, 0, 0.0, 382.0, 382, 382, 382.0, 382.0, 382.0, 382.0, 2.617801047120419, 18.173776996073297, 0.8973126636125655], "isController": false}, {"data": ["Add Men Tshirt", 3, 0, 0.0, 387.0, 378, 399, 384.0, 399.0, 399.0, 399.0, 3.293084522502744, 3.15908857025247, 0.9647708562019758], "isController": false}, {"data": ["Checkout page", 1, 0, 0.0, 440.0, 440, 440, 440.0, 440.0, 440.0, 440.0, 2.2727272727272725, 23.248845880681817, 0.7612748579545454], "isController": false}]}, function(index, item){
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

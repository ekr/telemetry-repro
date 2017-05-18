var Telemetry = require('telemetry-next-node');
var util = require("util");

var min_version = 44;
var max_version = 54;

var dates = Array.from(new Array(max_version - min_version + 1), (val, ui) => ({ "index": ui,
    "version": ui + min_version,
    "values": Array.from(new Array(31), (x,ii) => ({"date": (ii + 20170301).toString(), "measurement_sum": 0, "measurement_count": 0, "ping_count": 0}))
}))
var found = 0;

function collect() {
    for (i=min_version; i<=max_version; ++i) {
        Telemetry.getEvolution(
            "beta",
            i.toString(),
            "SSL_HANDSHAKE_VERSION",
            {}, 
            true,
            function(ii) { 
                return function(res) {
                    found += 1
                    let data = res[""]["data"];
                    data.forEach(function(x) {
                        index = dates[ii - min_version].values.map(o => o.date).indexOf(x.date)
                        if(index != -1) {
                            dates[ii - min_version].values[index].measurement_sum += x.sum
                            dates[ii - min_version].values[index].measurement_count += x.histogram.reduce((x, y) => x + y)
                            dates[ii - min_version].values[index].ping_count += x.count
                        }
                    });
                    if(found == (max_version - min_version + 1)){
                        console.log(util.inspect(dates.map(v => ({
                            "version": v.version,   
                            "values": v.values.map(x => ({
                                "date": x.date, 
                                "measurement_sum": x.measurement_sum.toLocaleString(), 
                                "measurement_count": x.measurement_count.toLocaleString(),
                                "avg_measurement_value": (x.measurement_sum / x.measurement_count).toFixed(3),
                                "ping_count": x.ping_count.toLocaleString()
                            }))
                        })), {showHidden: false, depth: null}))
                    }
                }
            }(i)
        );
    }
}

Telemetry.init(function() {
    collect();
});
               


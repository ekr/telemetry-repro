var Telemetry = require('telemetry-next-node');

var target_date = process.argv[2];
var min_version = 44;
var max_version = 53;
var total = 0;
var todo = 0;

function sum(x) {
    var ret = 0;

    x.forEach(function(y) {
        ret += y;
    });

    return ret;
}
    
function collect() {
    for (i=min_version; i<=max_version; ++i) {
        todo++;
        Telemetry.getEvolution("beta", i.toString(),
                               "SSL_HANDSHAKE_VERSION", {}, true, function(res) {
                                   let data = res[""]["data"];
                                   data.forEach(function(x) {
                                       if(x.date == target_date) {
                                           total += sum(x.histogram);
                                           todo--;
                                           if (!todo) {
                                               console.log("Sum was " + total);
                                           }
                                       }
                                   });
                               } );
    }
}

Telemetry.init(function() {
    collect();
});
               


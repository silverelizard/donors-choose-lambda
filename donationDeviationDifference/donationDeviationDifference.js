require('dotenv').load();
var pg = require('pg');
var conString = "postgres://" + process.env.DB_USER + ":" + process.env.DB_PASS +"@donors-choose.ct8ks5pp86im.us-west-2.redshift.amazonaws.com:5439/donorschoose";

exports.handler = function(event, context) {

    pg.connect(conString, function(err, client, done) {
        if(err) {
            context.fail(err);
            return console.error('error fetching client from pool', err);
        }
        var stateGroupQuery = "SELECT UPPER(school_state) AS state, SUM(total_donations) AS total FROM donorschoose_projects GROUP BY state";
        client.query(stateGroupQuery, function(err, groupResult) {


            if(err) {
                return console.error('error running query', err);
            }
            var devAvgQuery = "SELECT AVG(s.total) AS average, STDDEV(s.total) AS standard_deviation FROM(" + stateGroupQuery +") s"
            client.query(devAvgQuery, function(err, devAvgResult) {
                done();
                if(err) {
                    return console.error('error running query', err);
                }
                var average = devAvgResult.rows[0].average;
                var standardDeviation = devAvgResult.rows[0].standard_deviation;

                var results = groupResult.rows.reduce(function(total, row) {
                    var totalDonations = parseInt(row.total);
                    var devDiff = devDiffResult(totalDonations);
                    total[row.state] = {
                        "total" : totalDonations,
                        "devDiff" : devDiff
                    };
                    return total;
                }, {});
                function devDiffResult(totalDonations) {
                    return (totalDonations - average) / standardDeviation;
                }
                console.log(results);
                context.succeed(results);
            });

        });
    });
};
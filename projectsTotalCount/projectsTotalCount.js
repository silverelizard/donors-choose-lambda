require('dotenv').load();
var pg = require('pg');
var conString = "postgres://" + process.env.DB_USER + ":" + process.env.DB_PASS +"@donors-choose.ct8ks5pp86im.us-west-2.redshift.amazonaws.com:5439/donorschoose";

exports.handler = function(event, context) {

    pg.connect(conString, function(err, client, done) {
        if(err) {
            context.fail(err);
            return console.error('error fetching client from pool', err);
        }
        client.query("SELECT school_state, COUNT(school_state) AS total_projects FROM donorschoose_projects GROUP BY school_state", function(err, result) {
            done();

            if(err) {
                return console.error('error running query', err);
            }
            var results = result.rows.reduce(function(total, row) {
                var base = total[row.school_state.toString().toUpperCase()] || 0;
                total[row.school_state.toString().toUpperCase()] = parseInt(row.total_projects) + base;
                return total;
            }, {});
            console.log(results);
            context.succeed(results);

        });
    });

};
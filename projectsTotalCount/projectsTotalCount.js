require('dotenv').load();
var pg = require('pg');
var conString = "postgres://" + process.env.DB_USER + ":" + process.env.DB_PASS +"@donors-choose.ct8ks5pp86im.us-west-2.redshift.amazonaws.com:5439/donorschoose";

exports.handler = function(event, context) {

    pg.connect(conString, function(err, client, done) {
        if(err) {
            context.fail(err);
            return console.error('error fetching client from pool', err);
        }
        client.query("SELECT UPPER(school_state) AS state, COUNT(1) AS total_projects, COUNT(CASE WHEN funding_status = 'completed' THEN 1 END) AS completed_projects, COUNT(CASE WHEN funding_status = 'live' THEN 1 END) AS live_projects, SUM(num_donors) AS num_donors FROM donorschoose_projects GROUP BY state", function(err, result) {
            done();

            if(err) {
                return console.error('error running query', err);
            }
            var results = result.rows.reduce(function(total, row) {
                total[row.state] = {
                    total_projects: parseInt(row.total_projects),
                    completed_projects: parseInt(row.completed_projects),
                    live_projects: parseInt(row.live_projects),
                    num_donors: parseInt(row.num_donors)
                };

                return total;
            }, {});
            console.log(results);
            context.succeed(results);
        });
    });
};
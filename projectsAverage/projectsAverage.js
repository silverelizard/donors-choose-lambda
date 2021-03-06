require('dotenv').load();
var pg = require('pg');
var conString = "postgres://" + process.env.DB_USER + ":" + process.env.DB_PASS +"@donors-choose.ct8ks5pp86im.us-west-2.redshift.amazonaws.com:5439/donorschoose";

exports.handler = function(event, context) {

    pg.connect(conString, function(err, client, done) {
        if(err) {
            context.fail(err);
            return console.error('error fetching client from pool', err);
        }
        client.query("SELECT AVG(total_projects) FROM (SELECT UPPER(school_state) AS state, COUNT(1) AS total_projects FROM donorschoose_projects GROUP BY state)", function(err, result) {
            done();

            if(err) {
                return console.error('error running query', err);
            }

            console.log(result.rows[0]);
            context.succeed(result.rows[0]);
        });
    });
};
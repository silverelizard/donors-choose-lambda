require('dotenv').load();
var pg = require('pg');
var conString = "postgres://" + process.env.DB_USER + ":" + process.env.DB_PASS +"@donors-choose.ct8ks5pp86im.us-west-2.redshift.amazonaws.com:5439/donorschoose";

exports.handler = function(event, context) {
    var state = (event.state === undefined ? '' : event.state);
    if(state === '') {
        context.fail('State not provided');
    }
    else {
        pg.connect(conString, function(err, client, done) {
            if(err) {
                context.fail(err);
                return console.error('error fetching client from pool', err);
            }
            client.query("SELECT COUNT(*) AS total_projects FROM donorschoose_projects WHERE school_state = $1", [state], function(err, result) {
                done();

                if(err) {
                    return console.error('error running query', err);
                }
                client.end();
                console.log(result.rows[0]);
                context.succeed(result.rows[0]);

            });
        });
    }
};
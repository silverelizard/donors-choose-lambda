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
      client.query("select primary_focus_area, sum(total_price_including_optional_support) AS total " +
      "from donorschoose_projects WHERE school_state = $1 GROUP BY primary_focus_area ORDER BY primary_focus_area", [state], function(err, result) {
        done();

        if(err) {
          return console.error('error running query', err);
        }
        console.log(result.rows);
        context.succeed(result.rows);
      });
    });
  }
};
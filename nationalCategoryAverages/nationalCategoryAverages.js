require('dotenv').load();
var pg = require('pg');
var conString = "postgres://" + process.env.DB_USER + ":" + process.env.DB_PASS +"@donors-choose.ct8ks5pp86im.us-west-2.redshift.amazonaws.com:5439/donorschoose";

exports.handler = function(event, context) {
  pg.connect(conString, function(err, client, done) {
    if(err) {
      context.fail(err);
      return console.error('error fetching client from pool', err);
    }
    client.query("select t.primary_focus_area, avg(total) as national_average " +
    "from (select school_state, primary_focus_area, sum(total_price_including_optional_support) AS total " +
    "from donorschoose_projects GROUP BY school_state, primary_focus_area ORDER BY school_state) t " +
    "GROUP BY t.primary_focus_area ORDER BY primary_focus_area", function(err, result) {
      done();

      if(err) {
        return console.error('error running query', err);
      }
      client.end();
      console.log(result.rows);
      context.succeed(result.rows);
    });
  });
};
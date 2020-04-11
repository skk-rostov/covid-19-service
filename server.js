// Require the framework and instantiate it
const fastify = require('fastify')({ logger: true });
const fetch = require('node-fetch');
const fs = require('fs')

//=========================================
const data_url_confirmed =
  'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_confirmed_global.csv';
const data_url_deaths =
  'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_deaths_global.csv';
const data_url_recovered =
  'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_recovered_global.csv';

function get_url(id) {
  switch (id) {
    case 'confirmed':
      url = data_url_confirmed;
      break;
    case 'deaths':
      url = data_url_deaths;
      break;
    case 'recovered':
      url = data_url_recovered;
      break;
    default:
      url = data_url_confirmed;
  }
  return url;
}

function csvJSON(csv) {
  var lines = csv.split('\n');
  var result = [];
  var headers = lines[0].split(',');
  for (var i = 1; i < lines.length; i++) {
    var obj = {};
    var currentline = lines[i].split(',');

    for (var j = 0; j < headers.length; j++) {
      obj[headers[j]] = currentline[j];
    }
    result.push(obj);
  }
  return JSON.stringify(result); //JSON
}

//=========================================


// Declare a route
fastify.get('/', async (request, reply) => {
  reply.redirect('/api/');
});

fastify.get('/api', async (request, reply) => {
  reply.redirect('/api/');
});

fastify.get('/api/', async (request, reply) => {
const stream = fs.createReadStream('app.html');
reply.type('text/html').send(stream);
});

fastify.get('/api/:id/:country', async (request, reply) => {
  const url = get_url(request.params.id);
  const response = await fetch(url);
  const text = await response.text();
  const text_data = JSON.parse(csvJSON(text));
  for (i = 0; i < text_data.length; i++) {
    if (text_data[i]['Country/Region'] === request.params.country) {
      const query_data = Object.keys(text_data[i]).pop();

      return JSON.stringify(text_data[i][query_data]);
    }
  }
  return { data: 'no data' };
});

// Run the server!
const start = async () => {
  try {
    await fastify.listen(3000);
    fastify.log.info(`server listening on ${fastify.server.address().port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
start();

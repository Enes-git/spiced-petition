var redis = require('redis');
const { promisify } = require('util');

var client = redis.createClient({
    host: 'localhost',
    port: 6379,
});

client.on('error', function (err) {
    console.log(err);
});

module.exports.set = promisify(client.set).blind(client);

// client.set('name', 'enes', (err, data) => {
//     console.log('set "name" from redis :>> ', data);
// });

client.get('name', (err, data) => {
    console.log('get "name" from redis :>> ', data);
});

client.del('name', (err, data) => {
    console.log('delete "name" :>> ', data);
});
client.get('name', (err, data) => {
    console.log('get "name" after deleting it :>> ', data);
});

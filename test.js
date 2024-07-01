/* const config = require('./src/config.json');
const mongoose = require('mongoose');

mongoose.connection.on('connected', () => console.log('connected'));
mongoose.connection.on('open', () => console.log('open'));
mongoose.connection.on('disconnected', () => console.log('disconnected'));
mongoose.connection.on('reconnected', () => console.log('reconnected'));
mongoose.connection.on('disconnecting', () => console.log('disconnecting'));
mongoose.connection.on('close', () => console.log('close'));

mongoose.connect(`mongodb+srv://${config.mongodb.dev.username}:${config.mongodb.dev.password}@servicedata.mt5g7hs.mongodb.net/?retryWrites=true&w=majority&appName=ServiceData`);

 */

const fine = false;

module.exports = {
    fine
}
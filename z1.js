const moment = require('moment');

const currentDate = moment('08/10/2024', 'DD/MM/YYYY'); // Specify the input format
const daysToAdd = 1; // Number of days to add

const futureDate = currentDate.add(daysToAdd, 'days');

console.log(futureDate.format('DD/MM/YYYY')); // Outputs the new date in 'DD/MM/YYYY' format

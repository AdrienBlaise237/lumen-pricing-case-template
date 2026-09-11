'use strict';
const analysis = require('./analysis'); const data = require('./data');
module.exports = { ...data, ...analysis };

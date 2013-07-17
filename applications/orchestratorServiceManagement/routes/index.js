/*
 * GET home page.
 */
var runners = require('../runners');

exports.index = function(req, res) {
  res.render('index', {
    title: 'Orchestrator Server'
    ,description: 'This is the control panel for the orchestrator service'
    ,author: 'Notoja corp.'
    ,_layoutFile: true
    ,databaseServiceDet: runners.list()
    ,authenticationServiceDet: runners.list()
    ,runnerList: runners.list()
  });
};
module.exports = function(persistent, cache) {
  return {
    dbInformation: function(req, res) {
      var db_info = {};
      if(persistent) {
        db_info.persistent = {};
        db_info.persistent.name = servConf.get('selected_adaptors:persistent');
        // note require caches, so this will only need to load on first call
        db_info.persistent.class = require('../adaptors/' + servConf.get('selected_adaptors:persistent') + '/package.json').db_class;
      }

      if(cache) {
        db_info.cache = {};
        db_info.cache.name = servConf.get('selected_adaptors:cache');
        db_info.cache.class = require('../adaptors/' + servConf.get('selected_adaptors:cache') + '/package.json').db_class;
      }
      res.json(200, db_info);
      res.end();
    },
    applicationInformation: function(req, res) {
    }
  }
}

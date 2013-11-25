module.exports = function(persistent, cache) {
  return {
    dbInformation: function(req, res) {
      var db_info = {};
      if(persistent) {
        db_info.persistent = {};
        db_info.persistent.name = servConf.get('selected_adaptors:persistent');
        // note require caches, so this will only need to load on first call
        db_info.class = require('../adaptors/' + servConf.get('selected_adaptors:persistent') + '/package.json').db_class;
        // note possible sec issue if auth is stored in here
        //db_info.persistent.settings = servConf.get('adaptor_settings:'+ servConf.get('selected_adaptors:persistent'));
      }

      if(cache) {
        db_info.cache = {};
        db_info.cache.name = servConf.get('selected_adaptors:cache');
        db_info.class.class = require('../adaptors/' + servConf.get('selected_adaptors:cache') + '/package.json').db_class;
        //db_info.cache.settings = servConf.get('adaptor_settings:'+ servConf.get('selected_adaptors:cache'));
      }
    },
    applicationInformation: function(req, res) {
    }
  }
}

module.exports = function (persistent, cache) {
  return {
    findAll: function(req, res) {
      persistent.entity.findAll(req.params.application,
              req.params.collection,
              req.params.entity,
              req.query,
              sendJSONResponse(res, 200, 400));

    },
    

    //XXX should findAll hit the cache if so how can
    // we garruntee that we hit all the keys
    findById: function(req, res) {
      // try and hit the cache, if possible,
      // else do a lookup in the persistent store
      cache.entity.findById(req.params.application,
        req.params.collection,
        req.params.entity,
        req.params.id,
        function (obj, err) {
          if(err || !obj) {
            persistent.entity.findById(req.params.application,
                 req.params.collection,
                 req.params.entity,
                 req.params.id,
                 sendJSONResponse(res, 200, 400));
          } else {
            sendJSONResponse(res, 200, 400)(obj, err);
          }
        });
    },
    
    create: function(req, res) {
      var cTime = getChaceTime(req);
      if(cTime > 0) {
        cache.entity.create(req.params.application,
              req.params.collection,
              req.params.entity,
              req.body, 
              function (obj, err) {
                persistent.entity.create(req.params.application,
                  req.params.collection,
                  req.params.entity,
                  req.body,
                  sendJSONResponse(res, 201, 400));
              });
      } else {
        persistent.entity.create(req.params.application,
              req.params.collection,
              req.params.entity,
              req.body,
              sendJSONResponse(res, 201, 400));
      }
    },
    
    update: function(req, res) {
      var cTime = getChaceTime(req);
      this.entity.update(req.params.application,
              req.params.collection,
              req.params.entity,
              req.body,
              sendJSONResponse(res, 202, 400));
    };
    
    del: function(req, res) {
      cache.entity.del(req.params.application,
              req.params.collection,
              req.params.entity,
              req.params.id,
              sendJSONResponse(res, 200, 400));

      persistent.entity.del(req.params.application,
              req.params.collection,
              req.params.entity,
              req.params.id,
              sendJSONResponse(res, 200, 400));
    }
  };
}



// sends a JSON formatted response
function sendJSONResponse (res, successCode, errorCode) {
  return function(obj, err) {
    if(!err) {
      res.json(successCode, obj);
    } else {
      res.json(errorCode, obj);
    }
    res.end();
  };
}


// Returns cache time if cacheable
//         -1 if time not set but cachable
//         0 if not cacheable
function getCacheTime(req) {
  var cacheControl = req.header('Cache-Control'),
      cacheSettings = cacheControl.split(',');

  for(var i = 0, l = cacheSettings.length; i < l; i++) {
    cacheSettings[i] = cacheSettings[i].trim();
  }

  console.log(cacheSettings);
  if(!!cacheSettings[0] && (cacheSettings[0] === 'private' || cacheSettings[0] === 'Private')) {
    if(!!cacheSettings[1]) {
      return Number(cacheSettings[1].split('=')[1]);
    } else { // expire at max_cache_time
      return -1; 
    }
  } else {  // don't cache
    return 0;
  }
}

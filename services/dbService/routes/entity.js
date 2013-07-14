module.exports.adaptor = null;

module.exports.findAll = function(req, res) {
  adaptor.find(req.params.application,
            req.params.collection,
            req.params.entity,
            req.query,
            sendJSONResponse(res, 200, 400));
};

module.exports.findById = function(req, res) {
  adaptor.findById(req.params.application,
            req.params.collection,
            req.params.entity,
            req.params.id,
            sendJSONResponse(res, 200, 400));
};

module.exports.create = function(req, res) {
  adaptor.create(req.params.application,
            req.params.collection,
            req.params.entity,
            req.body,
            sendJSONResponse(res, 201, 400));
};

module.exports.update = function(req, res) {
  adaptor.update(req.params.application,
            req.params.collection,
            req.params.entity,
            req.body,
            sendJSONResponse(res, 202, 400));
};

module.exports.del = function(req, res) {
  adaptor.del(req.params.application,
            req.params.collection,
            req.params.entity,
            req.params.id,
            sendJSONResponse(res, 200, 400));
};



function sendJSONResponse (res, successCode, errorCode) {
  return function(object, err) {
    if(!err) {
      res.json(successCode, object);
    } else {
      res.json(errorCode, err);
    }
    res.end();
  };
}
module.exports = function(persistent, cache) {
    return {
        findAll: function(req, res) {
            persistent.entity.findAll(req.params.application,
                req.params.collection,
                req.params.entity,
                req.query,
                sendJSONResponse(res, 200, 400));
        },


        findById: function(req, res) {
            if (cache !== undefined) {
                // try and hit the cache, if possible,
                // else do a lookup in the persistent store
                cache.entity.findById(req.params.application,
                    req.params.collection,
                    req.params.entity,
                    req.params.id,
                    function(err, obj) {
                        if (err || !obj) {
                            persistent.entity.findById(req.params.application,
                                req.params.collection,
                                req.params.entity,
                                req.params.id,
                                sendJSONResponse(res, 200, 400));
                        } else {
                            sendJSONResponse(res, 200, 400)(err, obj);
                        }
                    });
                return;
            } else {
                persistent.entity.findById(req.params.application,
                    req.params.collection,
                    req.params.entity,
                    req.params.id,
                    sendJSONResponse(res, 200, 400));
            }
        },

        create: function(req, res) {
            if (cache !== undefined) {
                var cTime = getcacheTime(req);
                if (cTime !== 0) {
                    cache.entity.create(req.params.application,
                        req.params.collection,
                        req.params.entity,
                        req.body,
                        function(obj, err) {
                            persistent.entity.create(req.params.application,
                                req.params.collection,
                                req.params.entity,
                                req.body,
                                sendJSONResponse(res, 201, 400));
                        });
                    return;
                } else {
                    persistent.entity.create(req.params.application,
                        req.params.collection,
                        req.params.entity,
                        req.body,
                        sendJSONResponse(res, 201, 400));
                    return;
                }
            } else {
                persistent.entity.create(req.params.application,
                    req.params.collection,
                    req.params.entity,
                    req.body,
                    sendJSONResponse(res, 201, 400));
            }
        },

        findAttachment: function(req, res) {
            if (cache !== undefined) {
                var cTime = getcacheTime(req);
                if (cTime !== 0) {
                    cache.entity.findAttachment(req.params.application,
                        req.params.collection,
                        req.params.entity,
                        req.params.id,
                        req.params.name,
                        function(err, fileStream) {
                            persistent.entity.findAttachment(req.params.application,
                                req.params.collection,
                                req.params.entity,
                                req.params.id,
                                req.params.name,
                                function(err, fileStream) {
                                    fileStream.pipe(res);
                                });
                            return;
                        });
                } else {
                    persistent.entity.findAttachment(req.params.application,
                        req.params.collection,
                        req.params.entity,
                        req.params.id,
                        req.params.name,
                        function(err, fileStream) {
                            fileStream.pipe(res);
                        });
                    return;
                }
            } else {
                persistent.entity.findAttachment(req.params.application,
                    req.params.collection,
                    req.params.entity,
                    req.params.id,
                    req.params.name,
                    function(err, fileStream) {
                        fileStream.pipe(res);
                    });
            }
        },

        removeAttachment: function(req, res) {
            if (cache !== undefined) {
                var cTime = getcacheTime(req);
                if (cTime !== 0) {
                    cache.entity.removeAttachment(req.params.application,
                        req.params.collection,
                        req.params.entity,
                        req.params.id,
                        req.params.name,
                        function(err, resp) {
                            persistent.entity.removeAttachment(req.params.application,
                                req.params.collection,
                                req.params.entity,
                                req.params.id,
                                req.params.name,
                                sendJSONResponse(res, 201, 400));
                            return;
                        });
                } else {
                    persistent.entity.removeAttachment(req.params.application,
                        req.params.collection,
                        req.params.entity,
                        req.params.id,
                        req.params.name,
                        sendJSONResponse(res, 201, 400));
                    return;
                }
            } else {
                persistent.entity.removeAttachment(req.params.application,
                    req.params.collection,
                    req.params.entity,
                    req.params.id,
                    req.params.name,
                    sendJSONResponse(res, 201, 400));
            }
        },

        attachFile: function(req, res) {
            if (cache !== undefined) {
                var cTime = getcacheTime(req);
                if (cTime !== 0) {
                    cache.entity.attachFile(req.params.application,
                        req.params.collection,
                        req.params.entity,
                        req.params.id,
                        req.params.name,
                        req.files,
                        function(obj, err) {
                            persistent.entity.attachFile(req.params.application,
                                req.params.collection,
                                req.params.entity,
                                req.params.id,
                                req.params.name,
                                req.files,
                                sendJSONResponse(res, 201, 400));
                        });
                    return;
                } else {
                    persistent.entity.attachFile(req.params.application,
                        req.params.collection,
                        req.params.entity,
                        req.params.id,
                        req.params.name,
                        req.files,
                        sendJSONResponse(res, 201, 400));
                    return;
                }
            } else {
                persistent.entity.attachFile(req.params.application,
                    req.params.collection,
                    req.params.entity,
                    req.params.id,
                    req.params.name,
                    req.files,
                    sendJSONResponse(res, 201, 400));
            }
        },

        //TODO FINISH cached version  
        update: function(req, res) {
            if (cache !== undefined) {
                var cTime = getcacheTime(req);
                cache.entity.update(req.params.application,
                    req.params.collection,
                    req.params.entity,
                    req.body,
                    function(err, obj) {
                        if (err || !obj) {
                            this.entity.update(req.params.application,
                                req.params.collection,
                                req.params.entity,
                                req.params.id,
                                req.body,
                                sendJSONResponse(res, 202, 400));
                        }
                    });
                return;
            } else {
                persistent.entity.update(req.params.application,
                    req.params.collection,
                    req.params.entity,
                    req.body,
                    sendJSONResponse(res, 202, 400));
            }
        },


        del: function(req, res) {
            if (cache !== undefined) {
                cache.entity.del(req.params.application,
                    req.params.collection,
                    req.params.entity,
                    req.params.id,
                    sendJSONResponse(res, 202, 400));
            }

            persistent.entity.del(req.params.application,
                req.params.collection,
                req.params.entity,
                req.params.id,
                sendJSONResponse(res, 200, 400));
        }
    };
}

function sendJSONResponse(res, successCode, errorCode) {
    return function(err, obj) {
        if (!err) {
            res.json(successCode, obj);
        } else {
            res.json(errorCode, err);
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

    for (var i = 0, l = cacheSettings.length; i < l; i++) {
        cacheSettings[i] = cacheSettings[i].trim();
    }

    console.log(cacheSettings);
    if ( !! cacheSettings[0] && (cacheSettings[0] === 'private' || cacheSettings[0] === 'Private')) {
        if ( !! cacheSettings[1]) {
            return Number(cacheSettings[1].split('=')[1]);
        } else { // expire at max_cache_time
            return -1;
        }
    } else { // don't cache
        return 0;
    }
}
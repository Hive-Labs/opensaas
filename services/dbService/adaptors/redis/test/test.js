var assert = require('assert'),
    should = require('should');

var entity = require('..')().entity;

describe('Entity Basic CURD action', function () {
  var testEntity = {
    username: 'bill',
    pass: '1234',
    isIntelligent: true,
    age: 42
  };

  describe('create', function () {
    it('should create entity', function (done) {
      entity.create('test_app', 'test_col', 'test_ent', testEntity,  function (savedObj) {
        testEntity = savedObj;
        testEntity.should.have.property('_id');
        done();
      });
    });
  });

  //TODO figure out auto recasting of types, currently finding with string properties
  describe('findById',  function () {
    it('should find by _id should return test object', function (done) {
      entity.findById('test_app', 'test_col', 'test_ent', testEntity._id, function (obj) {
        for (key in testEntity) {
          if (testEntity.hasOwnProperty(key)) {
            obj.should.have.property(key);
            debugger;
            if(key === '_id') {
              (obj._id === 'test_app' + ':' + 'test_col' + ':' + 'test_ent' + ':' + testEntity._id).should.be.ok;
            } else {
              (obj[key] === testEntity[key] || obj[key] === '' + testEntity[key]).should.be.ok;
            }
          }
        }
        done();
      });
    });
  });

  // describe('update', function () {
  //   it('should update test entity field to new value', function (done) {
  //     testEntity.age = 31;
  //     entity.update('test_app', 'test_col', 'test_ent', testEntity, function (obj) {
  //       
  //     });
  //   });
  // });
});

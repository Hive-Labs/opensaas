var assert = require('assert'),
    should = require('should');

var entity = require('..')().entity;


var enforce_datatype = false;
var testNamespace = 'test_app:test_col:test_ent:';
var testEntity = {
  username: 'bill',
  pass: '1234',
  isIntelligent: true,
  age: 42
};


describe('Entity Basic CURD action', function () {
  describe('create', function () {
    it('should create entity', function (done) {
      entity.create('test_app', 'test_col', 'test_ent', testEntity,  function (err, obj) {
        should.not.exist(err);
        testEntity = obj;
        testEntity.should.have.property('_id');
        done();
      });
    });
  });

  describe('findById',  function () {
    it('should find by _id and return test object', function (done) {
      testEntity.should.have.property('_id');
      debugger;
      entity.findById('test_app', 'test_col', 'test_ent', testEntity._id, function (err, obj) {
        should.not.exist(err);
        deepCompareEntities(testEntity, obj, testNamespace);
        done();
      });
    });
  });

  describe('update', function () {
    it('should update test entity field to new value', function (done) {
      testEntity.should.have.property('_id');
      testEntity.age = 31;
      entity.update('test_app', 'test_col', 'test_ent', testEntity, function (err, obj) {
        should.not.exist(err);
        deepCompareEntities(testEntity, obj, testNamespace);
        done();
      });
    });
  });

  describe('delete', function () {
    it('should delete the test entity', function (done) {
      testEntity.should.have.property('_id');
      entity.del('test_app', 'test_col', 'test_ent', testEntity._id, function (err, obj) {
        should.not.exist(err);
        done();
      });
    });
  });
});


// make sure the objects contain the same keys and values
function deepCompareEntities(original, modified, idPrefix) {
  for (key in original) {
    if (original.hasOwnProperty(key)) {
      modified.should.have.property(key);
      // if(key === '_id') {
      //   (modified._id === idPrefix + original._id).should.be.ok;
      // } else {
        if(!enforce_datatype) {
          (modified[key] === original[key] || modified[key] === '' + original[key]).should.be.ok;
        } else {
          (modified[key] === original[key] || modified[key] === original[key]).should.be.ok;
        }
      //}
    }
  } 
}

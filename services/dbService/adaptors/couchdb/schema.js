/*
 * Migration are modifications of an entity's schema.
 * To perform a migration on an entity a migration object
 * is passed to the migrate function of the schema module in
 * the following form:
 *
 * {
 *   _meta: {
 *     name: 'entity_name',
 *     collection: 'col_name',
 *     appName: 'app_name',
 *     versionCode: 1
 *   },
 *   field1: {        // expanded form for extra options
 *     type: string,
 *     default: 'blah',
 *     renamedFrom: 'foo'
 *   },
 *   field2: integer,  
 *   field3: float,
 *   field4: boolean
 * }
 *
 * To later retrieve this schema the get function is called
 * with the name of the entity to retrieve.
 */
var exceptions = require('../../exceptions');
var app = 'db',
    col = 'migrations';
var namespace = app + ':' + col + ':'; 

// note entity here refers to the db entity object
// not an entity itself
module.exports = function (entity, settings) {
  return {
    migrate: function (oldSchema, newSchema, next) {
      if(!newSchema) { // remove entity
        removeEntity(oldSchema, entity);
        next(null, oldSchema);
        return;
      }

      if(!newSchema._meta) {
        next(exceptions.schema.metaParemeterEception('The meta parameter of the new schema was undefined'), newSchema);
        return;
      }

      if(!oldSchema) { // completely new entity
        createEntity(newSchema, entity);
        return;
      } else {         // update existing entity
        for (var key in newSchema) {
          if(newSchema.hasOwnProperty(key)) {
            if(key === '_meta') {
            } else if(!oldSchema[key]) {                   // completely new field
              addField(oldSchema._meta, key, oldSchema[key], entity);
            } else if(oldSchema[key] !== newSchema[key]) { // field changed
              removeField(oldSchema._meta, key, oldSchema[key], newShema[key], entity);
            }
          }
        }

        // remove deleted keys
        for(var key in oldSchema) {
          if(oldSchema.hasOwnProperty(key) && !newSchema[key]) {
            if(key === '_meta') { // throw exception, meta removed
              next(exceptions.schema.metaParemeterEception('The meta parameter can not be removed from a schema'), oldSchema);
              return;
            } else {
              changeField(oldSchema._meta, key, oldSchema[key], newShema[key], entity);
            }
          }
        }
      }
    },

    get: function (entityName, version, next) {
      entity.findById(namespace + entityName + ':' (version || 1), next);
    }
  }
};




function createEntity(schema, entity, next) {
  if(!schema._meta.name) {
    next(exceptions.schema.metaParemeterEception(
        'Could not save schema as schema name was not specified.  ' +
        'Metaparamenter _meta.name not specified.'
      ),
      schema);
    return;
  }

  entity.create(app, col, schema._meta.name, schema, next);
}

function removeEntity(oldSchema, entity, next) {
  if(!schema._meta.name) {
    next(exceptions.schema.metaParemeterEception(
        'Could not remove schema as schema name was not specified.  ' +
        'Metaparamenter _meta.name not specified.'
      ),
      schema);
    return; 
  } else {
  }
}

function addField(meta, key, oldType, newType, entity, next) {
}

function removeField(meta, key, oldType, newType, entity, next) {
}

function changeField(meta, key, oldType, newType, entity, next) {
}

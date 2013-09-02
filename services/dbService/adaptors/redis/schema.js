/*
 * Migration are modifications of an entity's schema.
 * To perform a migration on an entity a migration object
 * is passed to the migrate function of the schema module in
 * the following form:
 *
 * {
 *   _name: "entityName",
 *   _versionCode: 1, // can optionally be omitted to autoincrement
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
module.exports = function(client) {
  return {
    migrate: function(migrationObject, next) {
    },

    get: function(entityName, next) {

    }
  }
};

function createEntity() {
}

function removeEntity() {
}

function addField() {
}

function renameField() {
}

function removeField() {
}


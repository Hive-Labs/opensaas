# DB Service
The DB (Database) service provides a central database for all applications.  Database functions are abstracted from the underlying database so that application need not be concerned with the underlying database technology.  In doing so connectors can be made for any underlying database that the systems administrator has confidence in scaling.  It also simplifies the job of scaling as only a single database must be scaled to meet the demand 
of a companies users.  All interaction with the DB service is done though a REST layer built upon authenticated (per application) requests.

---

## Database Layers
### Entity
An entity is an object that is stored in a datastore.  Entities are made up of what are called fields.  They
are represented by routes starting in `/enity/:applcation/:collection/:entity` where `:application` maps to the
name (in slug form) of the application making the request.  The `:collection` maps to the name of the collection
that the object belongs to collections are orginizational units used to group similar entites.  The `:entity` 
maps to the name of the entity type itself.

####Entity Routes:
* GET    `/entity/:application/:collection/:entity` - Get all entities of the type entity using query parameters
  to limit the results
* GET    `/entity/:application/:collection/:entity/:id` - Get the entity of id `:id`
* POST   `/entity/:application/:collection/:entity` - Create a new entity using the provided JSON object as it's body
* POST   `/entity/:application/:collection/:entity/:id` - Update/ Replace object with id `:id` with the newly given object
* DELETE `/entity/:application/:collection/:entity/:id` - Delete object with id `:id`



### Schema
A schema is the underlying definition of an entity.  Schemas are important for use in database life cycle
management.  A schema is built from the underlying migrations that define it how it is built.  In doing this
schemas can be managed or "migrated" from one version to another.

All migrations are performed through the route POST `/schema/migrate/:application`.  This route takes an object
in the following format
> `{
>   "version_code": 0,
>   "migrations": [
>     "action": "action_name",
>     "data": {}
>   ]
> }`
####Legal Actions
| Action                    | JSON Object Representing   | Example Object                                                                         |
|:-------------------------:|:--------------------------:|---------------------------------------------------------------------------------------:|
| entity_create             | property name to type      | `{"entiy_name": "<name>", <property_name>": "<type>", ...}`                            |
| entity_remove             | entity to remove           | `{"entity_name": "<name>"}`                                                            |
| entity_rename             | previous and new name      | `{"entity_old_name": "<old_name>", "entity_new_name": "<new_name>"}`                   |
| entity_add_field          | new field name and type    | `{"entity_name": "<name>", "name": "<name>", "field_type": "<type>"}`                  |
| entity_remove_field       | old field name             | `{"entity_name": "<name>", "name": "<field_name>"}`                                    |
| entity_rename_field       | old and new field name     | `{"entity_name": "<name>", "old_field_name": "<ame>",  "new_field_name": "<name>"}`    |
| collection_create         | collection name            | `{"collection_name": "<collection_name>", <property_name>": "<type>", ...}`            |
| collection_remove         | collection to remove       | `{"collection_name": "<name>"}`                                                        |
| collection_rename         | previous and new name      | `{"collection_old_name": "<old_name>", "collection_new_name": "<new_name>"}`           |
| collection_add_entity     | collection and entity name | `{"collection_name": "name", "entity_name": "name"}`                                   |
| collection_remove_entity  | collection and entity name | `{"collection_name": "name", "entity_name": "name"}`                                   | 


---

## Adaptor
An adaptor is a module used to interface the db server with the underlying database of choice.  Included by default are MongoDB and an in-memory 
interface for development purposes.  For a database adaptor to be valid it must implement the following interface.
```javascript
> module.exports.entity.create = function(application, collection, entity, object, next)
> module.exports.entity.find = function(application, collection, entity, query, next)
> module.exports.entity.findById = function(application, collection, entity, id, next)
> module.exports.entity.update = function(application, collection, entity, object, next)
> module.exports.entity.del = function(application, collection, entity, id, next)
> module.exports.schema.migrate = function(migration, next)
> module.exports.schema.get = function(next)
> module.exports.dbConnect = function(url, username, password)
```
An adaptor resides in it's own folder in the adaptors folder and the above interface functions must be visible from an index.js file in the folder
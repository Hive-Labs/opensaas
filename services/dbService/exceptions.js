module.exports = {
    entity: {
        createException: function(description) {
            return {
                exception: 'EntityCreateException',
                description: description
            };
        },
        notFoundException: function(description) {
            return {
                exception: 'EntityNotFoundExist',
                description: description
            };
        },
        updateException: function(description) {
            return {
                exception: 'EntityUpdateException',
                description: description
            };
        },
        deleteException: function(description) {
            return {
                exception: 'EntityDeletionException',
                description: description
            };
        }
    },

    schema: {
        metaParameterException: function(description) {
            return {
                exception: 'SchemaMetaParameterException',
                description: description
            };
        }
    },

    db: {}
}
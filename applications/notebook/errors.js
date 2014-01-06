AuthError = function(message) { //a Foo constructor
    this.name = 'Authentication Error';
    this.message = message;
    this.stack = (new Error()).stack;
};

DBError = function(message) { //a Foo constructor
    this.name = 'Database Error';
    this.message = message;
    this.stack = (new Error()).stack;
};

DBError.prototype = new Error;

AuthError.prototype = new Error;
AuthError = function(message) { //a Foo constructor
    this.name = 'Authentication error';
    this.message = message;
    this.stack = (new Error()).stack;
};

DBError = function(message) { //a Foo constructor
    this.name = 'Database error';
    this.message = message;
    this.stack = (new Error()).stack;
};

ParameterError = function(message) { //a Foo constructor
    this.name = 'Invalid input parameters';
    this.message = message;
    this.stack = (new Error()).stack;
};


DBError.prototype = new Error;

AuthError.prototype = new Error;

ParameterError.prototype = new Error;
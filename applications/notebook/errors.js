AuthError = function(message){ //a Foo constructor
    this.name = 'Authentication Error';
    this.message = message;
    this.stack = (new Error()).stack;
}
AuthError.prototype = new Error;
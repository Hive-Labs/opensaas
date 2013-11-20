var users = [
    { id: '1', email: 'bob', password: 'secret', displayName: 'Bob Smith' },
    { id: '2', email: 'joe', password: 'password', displayName: 'Joe Davis' },
    { id: '3', email: 'rohitkrishnan101@gmail.com', password: 'google1', displayName: 'Rohit Krishnan'},
    { id: '4', email: 'sparedes@notoja.com', password: 'google1', displayName: 'Santiago Paredes'},
    { id: '5', email: 'btran@notoja.com', password: 'google1', displayName: 'Brian Tran'},
    { id: '6', email: 'tmustafa@notoja.com', password: 'google1', displayName: 'Tanzil Mustafa (Nafiballs)'}
];


exports.find = function(id, done) {
  for (var i = 0, len = users.length; i < len; i++) {
    var user = users[i];
    if (user.id === id) {
      return done(null, user);
    }
  }
  return done(null, null);
};

exports.findByEmail = function(email, done) {
  for (var i = 0, len = users.length; i < len; i++) {
    var user = users[i];
    if (user.email === email) {
      return done(null, user);
    }
  }
  return done(null, null);
};

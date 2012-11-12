connect = require('connect');

var app = connect()
      .use(connect.static( __dirname + '\\WebContent'))
      .listen(1234);

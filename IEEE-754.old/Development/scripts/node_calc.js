/*  node_calc.js
 *
 *    Receives calculation requests on port 1337; echoes results.
 */

  var net = require('net');
  var server = net.createServer(
  function (socket)
  {
    socket.on('data', function(arg)
    {
      console.log('got ' + arg);
    });
  }
  );

  server.listen(1337, "127.0.0.1");
  console.log('1337 here');

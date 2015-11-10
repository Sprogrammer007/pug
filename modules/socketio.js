var socket = require('socket.io')
  , io
  , userSockets = {};


function Socket() { 

}


Socket.listen = function(app){
  io = socket.listen(app)

  io.on('connection', function(socket){
    console.warn("new user connected")    
    socket.on('login', function(user){
      userSockets[user.id] = socket.id;
    })    
    socket.on('logout', function(socket){
      delete userSockets[user.id]
    })
  })  



  return io
}


module.exports = Socket;
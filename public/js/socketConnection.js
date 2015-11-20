$(document).ready(function(){
      
      var $username = $('#username');
      var $onlineUser = $('#onlineUser');
      var $msgForm = $('#msgForm');
      var $userId = $('#userId');
      var $message = $('#message');
      var $messages = $('#messages');
      socket = io.connect();
      // new user join
      socket.emit('user join',{userId:$userId.val(),username:$username.val()});
      
      // broadcast online user list

      socket.on('online user',function(users){
            var html = '';
            for(var key in users){
                  html += '<li class="list-group-item">' +users[key]+ '</li>';
            }
            $onlineUser.html(html);
      });

      $msgForm.submit(function(e){
            e.preventDefault();
            socket.emit('message',{msg:$message.val()});
      });

      socket.on('new message',function(data){
            $messages.append('<li>'+data.msg+'</li>')
      });
      //When send button is clicked on, send the message to server
      /*$("#send").click(function () {
      //send to the server with person name and message
      socket.emit("clientMsg", {
      "name": name,
      "msg": $("#msg").val()
      });
      $("#msg").val('');
      });
      //After sending message to the server, we'll have to wire up the event for it.
      //We can do the following. Upon recievin the message print it to the message box
      //that we've created in our html
      socket.on("serverMsg", function (data) {
      //Append the message from the server to the message box
      $("#msgBox").append("<strong>" + data.name + "</strong>: " + data.msg + "<br/>");
      });
      $("#msg").on("keyup", function (event) {
      socket.emit("sender", {
      name: name
      });
      });
      socket.on("sender", function (data) {
      $("#status").html(data.name + " is typing");
      setTimeout(function () {
      $("#status").html('');
      }, 3000);
      });
      });*/
      
});
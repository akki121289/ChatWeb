$(document).ready(function(){
      
      // setContainerHeight();      
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
                  html += '<li class="list-group-item" onclick=CreateTab("'+users[key]+'") >' +users[key]+ '</li>';
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


function CreateTab(name)
{    
      $('#chat_tabs').append('<div class=col-sm-3 style="border:1px solid black;background:white;"><div>     <div class=col-sm-12 style="background:green;">  <span class="glyphicon glyphicon-minus" style="float: right;" aria-hidden="true"></span>  <span class="glyphicon glyphicon-unchecked" style="float: right;" aria-hidden="true"></span>  <span class="glyphicon glyphicon-remove" style="float: right;" aria-hidden="true"></span> </div>    <div>'+ name +'</div><div style="width:80%;float:left;"> <ul id="messages" style="padding-bottom:40px"></ul></div><div style="width:20%; margin-left:auto;"><div style="width:100%; margin-left: auto;"><ol id="users"></ol></div></div></div><div><form action="" id="msgForm"><input id="message" autocomplete="off" placeholder="Type message" class="form-control"><button>Send</button></form></div> </div>')
}

function setContainerHeight()
{     var height = $( window ).height();
      $('.container').height(height);
}
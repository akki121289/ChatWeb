$(document).ready(function(){
      
      // setContainerHeight();      
      var $username = $('#username');
      var $onlineUser = $('#onlineUser');
      var $msgForm = $('#msgForm');
      var $userId = $('#userId');
      var $message = $('#message');
      var $messages = $('#messages');
      var $totalonline = $('#totalonline');
      var $personalMsgForm = $('.personalMsgForm');
      socket = io.connect();
      // new user join

      socket.on('on join',function(users){
            var html = '';
            for(var key in users){
                  var userId = key.substr(0,key.indexOf('@'));
                  html += '<li id="'+userId+'"class="list-group-item" onclick=CreateTab("'+users[key]+'","'+key+'") >' +users[key]+ '</li>';
            }
            $onlineUser.html(html);
      });

      socket.on('online user numbers',function(numbers){
            $totalonline.html(' '+numbers+' ');
      });

      socket.emit('user join',{userId:$userId.val(),username:$username.val()});
      
      socket.on('online user',function(user){
            var userId = (user.userId).substr(0,(user.userId).indexOf('@'));
            $onlineUser.append('<li id="'+userId+'" class="list-group-item" onclick=CreateTab("'+user.username+'","'+user.userId+'") >' +user.username+ '</li>')
      });

      socket.on('remove user',function(user){
            var userId = user.substr(0,user.indexOf('@'));
            $('#'+userId).remove();
      });

      $msgForm.submit(function(e){
            e.preventDefault();
            if($message.val().trim() !== ''){
                  socket.emit('message',{msg:$message.val()});
                  $message.val('');
            }
      });

      socket.on('new message',function(data){
            $messages.append('<li><b>'+data.username+':</b>  '+data.msg+'</li>');
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


function CreateTab(name,key)
{    
      $('#chat_tabs').append('<div class=col-sm-3 style="border:1px solid black;background:white;"><div>     <div class=col-sm-12 style="background:green;">  <span class="glyphicon glyphicon-minus" style="float: right;" aria-hidden="true"></span>  <span class="glyphicon glyphicon-unchecked" style="float: right;" aria-hidden="true"></span>  <span class="glyphicon glyphicon-remove" style="float: right;" aria-hidden="true"></span> </div>    <div>'+ name +'</div><div style="width:80%;float:left;"> <ul id="messages" style="padding-bottom:40px"></ul></div><div style="width:20%; margin-left:auto;"><div style="width:100%; margin-left: auto;"><ol id="users"></ol></div></div></div><div><form action="" id="msgForm"><input id="message" autocomplete="off" placeholder="Type message" class="form-control"><button>Send</button></form></div> </div>')
}

function setContainerHeight()
{     var height = $( window ).height();
      $('.container').height(height);
}

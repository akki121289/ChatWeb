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
                  html += '<li id="'+userId+'"class="list-group-item" onclick=CreateTab("'+users[key]+'") >' +users[key]+ '</li>';
            }
            $onlineUser.html(html);
      });

      socket.on('online user numbers',function(numbers){
            $totalonline.html(' '+numbers+' ');
      });

      socket.emit('user join',{userId:$userId.val(),username:$username.val()});
      
      socket.on('online user',function(user){
            var userId = (user.userId).substr(0,(user.userId).indexOf('@'));
            var aa = user.username.toString();
            // $onlineUser.append('<li id="'+userId+'" class="list-group-item" onclick=\'CreateTab("'+aa+'","'+user.userId+'")\' >' +user.username+ '</li>')
             $onlineUser.append("<li id='"+userId+ "' class=list-group-item onclick=\"CreateTab('"+aa+"' ,'"+user.userId+"')\" > "+user.username+ "</li>");
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

      socket.on('load messages',function(msgs){
            for(var i = msgs.length-1; i>=0; i--){
                  $messages.append('<li><b>'+(msgs[i].username).toUpperCase()+':</b> '+msgs[i].msg+'</li>');
            }
      });

      socket.on('new message',function(data){
            $messages.append('<li><b>'+(data.username).toUpperCase()+':</b>  '+data.msg+'</li>');
      });
      
      // $('#chat_tabs.chat_tab').submit(function(e){
      //       e.preventDefault();
      //       if($message.val().trim() !== ''){
      //             socket.emit('message',{msg:$message.val()});
      //             $message.val('');
      //       } 
      // })


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
      // $('#chat_tabs').append('<div class=col-sm-3 style="border:1px solid black;background:white;"><div> <div class=col-sm-12 style="background:green;">  <span class="glyphicon glyphicon-minus" style="float: right;" aria-hidden="true"></span>  <span class="glyphicon glyphicon-unchecked" style="float: right;" aria-hidden="true"></span>  <span class="glyphicon glyphicon-remove" style="float: right;" aria-hidden="true"></span> </div>    <div>'+ name +'</div><div style="width:80%;float:left;"> <ul id="messages" style="padding-bottom:40px"></ul></div><div style="width:20%; margin-left:auto;"><div style="width:100%; margin-left: auto;"><ol id="users"></ol></div></div></div><div><form onclick="return false" action="" class="chat_tab"><input id="messageTab" autocomplete="off" placeholder="Type message" class="form-control"><button onclick = "tabMessageSender()" >Send</button></form></div> </div>')
      $('#chat_tabs').append('<div class=col-sm-3 style="border:1px solid black;background:white;"><div> <div class=col-sm-12 style="background:green;">  <span class="glyphicon glyphicon-minus" style="float: right;" aria-hidden="true"></span>  <span class="glyphicon glyphicon-unchecked" style="float: right;" aria-hidden="true"></span>  <span class="glyphicon glyphicon-remove" style="float: right;" aria-hidden="true"></span> </div>    <div>'+ name +'</div><div style="width:80%;float:left;"> <ul id="messages" style="padding-bottom:40px"></ul></div><div style="width:20%; margin-left:auto;"><div style="width:100%; margin-left: auto;"><ol id="users"></ol></div></div></div><div><form action="" class="chat_tab"><input id="messageTab" autocomplete="off" placeholder="Type message" class="form-control"><button>Send</button></form></div> </div>')
      $('#chat_tabs .chat_tab').submit(function(e){
            e.preventDefault();
            console.log("etertrereter");
            console.log(this.)
            // if($message.val().trim() !== ''){
            //       socket.emit('message',{msg:$message.val()});
            //       $message.val('');
            // } 
      })
}

function setContainerHeight()
{     var height = $( window ).height();
      $('.container').height(height);
}

function tabMessageSender()
{
            var message = $('#messageTab').val()
            if(message !== ''){
                  socket.emit('message',{msg:message});
                  $('#messageTab').val('');
            } 
}



// $('#chat_tabs .chat_tab').submit(function(e){
//             e.preventDefault();
//             console.log("etertrereter");
//             // if($message.val().trim() !== ''){
//             //       socket.emit('message',{msg:$message.val()});
//             //       $message.val('');
//             // } 
//       })
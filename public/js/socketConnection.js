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
      var $personalMessage = $('.personalMessage');
      var $personalMessages = $('.personalMessages');
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
            var aa = user.username.toString();
            $onlineUser.append("<li id='"+userId+ "' class=list-group-item onclick=\"CreateTab('"+aa+"' ,'"+user.userId+"')\" > "+user.username+ "</li>");
      });

      socket.on('remove user',function(user){
            var userId = user.substr(0,user.indexOf('@'));
            $('#'+userId).remove();
      });
      // group chatting
      $msgForm.submit(function(e){
            e.preventDefault();
            if($message.val().trim() !== ''){
                  socket.emit('message',{msg:$message.val()});
            }
            $message.val('');
      });

      socket.on('load messages',function(msgs){
            for(var i = msgs.length-1; i>=0; i--){
                  $messages.append('<li><b>'+(msgs[i].username).toUpperCase()+':</b> '+msgs[i].msg+'</li>');
            }
      });

      socket.on('new message',function(data){
            $messages.append('<li><b>'+(data.username).toUpperCase()+':</b>  '+data.msg+'</li>');
      });
      // one to one chatting
      /*$personalMsgForm.submit(function(e){

            e.preventDefault();
            var msg = $(this).find('.personalMessage').val().trim();
            if(msg !== ''){
                  $(this).find('.personalMessages').append('<li><b>'+$username.val().toUpperCase()+':</b>  '+msg+'</li>');
                  socket('personal message',{msg:msg,friendId:$(this).attr('data-attribute')});
            }
            $(this).find('.personalMessages').val('');

      });
      socket.on('message from friend',function(data){
            
      });*/

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


function CreateTab(name,userId)
{    
      var Id = userId.substr(0,userId.indexOf('@'));
      $('#chat_tabs').append('<form data-attribute="'+Id+'" id="'+Id+'" class="personalMsgForm"><div class=col-sm-3 style="border:1px solid black;background:white;"><div> <div class=col-sm-12 style="background:green;">  <span class="glyphicon glyphicon-minus" onclick="hideTab(this)" style="float: right;" aria-hidden="true"></span>  <span class="glyphicon glyphicon-unchecked" style="float: right;" aria-hidden="true"></span>  <span class="glyphicon glyphicon-remove" style="float: right;" aria-hidden="true"></span> </div>    <div>'+ name +'</div><div class="hideable" style="width:80%;float:left;"> <ul class="personalMessages" style="padding-bottom:40px"></ul></div></div><div class="hideable" ><input class="personalMessage" autocomplete="off" placeholder="Type message" class="form-control"><button>Send</button></div> </div></form>')
      $('.personalMsgForm').submit(function(e){
            e.preventDefault();
            alert("okkkkkk");
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

function hideTab(parr)
{
      // console.log("hellllllllllllllllllllooooooooooooooo");
      // console.log($(this).children());
      var elements = $(parr).parent().parent().children();
      elements.each(function(index){
            console.log($(this));
            if( $(this).hasClass( "hideable" ))
            $(this).hide();
      })
      
      // elements('.hideable').hide();
      // console.log($(parr).parent().parent().children().('.hideable').hide());
}
$(document).ready(function(){
            
      var $username = $('#username');
      var $_id = $('#_id');
      var $onlineUser = $('#onlineUser');
      var $msgForm = $('#msgForm');
      var $userId = $('#userId');
      var $message = $('#message');
      var $messages = $('#messages');
      var $totalonline = $('#totalonline');
      var $personalMsgForm = $('.personalMsgForm');
      var $personalMessage = $('.personalMessage');
      var $personalMessages = $('.personalMessages');
      var divmsgs=document.getElementById('msgs');
      // connection with socket
      socket = io.connect();
      //on when any user become online new user join
      socket.on('on join',function(users){
            var html = '';
            for(var key in users){
                  if (key !== $_id.val())
                        html += '<li id="'+key+'userList" class="list-group-item" onclick=CreateTab("'+users[key]+'","'+key+'") >' +users[key]+ '</li>';
            }
            $onlineUser.html(html);
      });
      // for updating the number of online users in real time 
      socket.on('online user numbers',function(numbers){
            numbers = numbers ? (numbers - 1) : numbers;
            $totalonline.html(' '+numbers+' ');
      });
      // emit this event because notification other user that i ma became online :)
      socket.emit('user join',{ _id:$_id.val(), userId:$userId.val(), username:$username.val() });
      // updating the list of online user when any user became online
      socket.on('online user',function(user){
            user.username = user.username.toString();
            if (user._id !== $_id.val())
                  $onlineUser.append("<li id='"+user._id+"userList' class=list-group-item onclick=\"CreateTab('"+user.username+"' ,'"+user._id+"')\" > "+user.username+ "</li>");
      });
      // updating the list of online user when any user goes offline
      socket.on('remove user',function(_id){
            $('#'+_id+'userList').remove();
      });
      // message broadcasting  
      // when any online user wants to broadcast any message to all the user those are online
      $msgForm.submit(function(e){
            e.preventDefault();
            if($message.val().trim() !== ''){
                  socket.emit('message',{msg:$message.val()});
            }
            $message.val('');
      });
      // load all messages to the user when he or she became online ( the broadcasted messages )
      socket.on('load messages',function(msgs){
            for(var i = msgs.length-1; i>=0; i--){
                  $messages.append('<li><b>'+(msgs[i].username).toUpperCase()+':</b><span> '+msgs[i].msg+'</span></li>');
            }
      });
      // when any user broadcast message to all users
      socket.on('new message',function(data){
            $messages.append('<li><b>'+(data.username).toUpperCase()+':</b><span>  '+data.msg+'<span></li>');
            var down=divmsgs.scrollHeight-divmsgs.clientHeight;
            if(down>=0){
                  $("#msgs").scrollTop(down);
            }
      });
      // one to one chatting 
      // when any friend send the personal message
      socket.on('message from friend', function(data, callback){
            if ($('#'+data._id).length){
                  $('#'+data._id).find('.personalMessages').append('<li style="margin: 10px 0;"><b>'+(data.username).toUpperCase()+':</b><div style="border-radius: 0px 15px 15px 15px;background: #22C7C4;width:70%;height:110%" > '+data.msg+'</div></li>');
                  scrollChat($('#'+data._id).find('.showMsgs')[0]);
            }else{
                  CreateTab(data.username,data._id);
            }
            callback();
      });
      // load old messsage of the friend 
      socket.on('seen all messages',function(data){
            if($('#'+data.friendId).length) {
                  $('#'+data.friendId).find('.personalMessages').find('.deliver').removeClass( ".deliver" ).addClass( "seen" );
                  $('#'+data.friendId).find('.personalMessages').find('.deliver').removeClass( ".send" ).addClass( "seen" );
            }
      });
});


function CreateTab(name, uniqueId)
{          
      
     var aa = [];
      $('#chat_tabs').children().each(function(index){
            aa.push($(this).attr('id'));
      });      


      if(jQuery.inArray(uniqueId, aa) == -1){
            $('#chat_tabs').append('<div class="col-sm-3 closeChatBox" style="border:2px solid black;background:white;"><div class="row chatBoxTitleBar"><div class="panel panel-primary" style="margin-bottom:auto"><div class="panel-heading">'+name+'<ul class="list-inline" align="right" style="margin-top: -20px;"><li><span class="closeBox glyphicon glyphicon-remove" aria-hidden="true"></span></li><li><span class="glyphicon glyphicon-unchecked maximize" aria-hidden="true"></span></li><li><span class="glyphicon glyphicon-minus minimize" aria-hidden="true"></span></li></ul></div></div></div><div class="row minimizeChatBox"><form class="form-inline personalMsgForm" role="form" data-attribute="'+uniqueId+'" id="'+uniqueId+'"><div class="showMsgs" style="width:100%;float:left;height:110px;overflow: scroll;"> <ul class="personalMessages" style="padding-bottom:40px"></ul></div><div class="form-group"><input class="form-control personalMessage" autocomplete="off" placeholder="Type message"></div><button class="btn btn-default">Send</button></form></div></div>');
            socket.emit('tab open',{friendId:uniqueId});
      }
      socket.on('old message',function(data){
            var html = '';
            for(var i =data.length -1 ; i>= 0; i--){
                  if(data[i].from === uniqueId) {
                        html += '<li><span class=""> '+data[i].message+'</span></li>'
                  } else {
                        html += '<li><span class="'+data[i].status+'"> '+data[i].message+'</span></li>'
                  }
            }
            if ($('#'+uniqueId).length){
                  $('#'+uniqueId).find('.personalMessages').append(html);
            }
            scrollChat($('#'+uniqueId).find('.showMsgs')[0]);
      });

      $('.personalMsgForm').submit(function(e){
            e.preventDefault();

            var msg = $(this).find('.personalMessage').val().trim();
            if(msg !== ''){
                  
                  scrollChat($(this).find('.showMsgs')[0]);
                  var currentForm = $(this);
                  socket.emit('personal message',{msg:msg,friendId:$(this).attr('data-attribute')},function(err, status){
                        if(err) {
            
                              currentForm.find('.personalMessages').append('<li style="margin: 10px 0;" ><b>'+$('#username').val().toUpperCase()+':</b><div style="border-radius: 15px 0px 15px 15px;background: #DFC3C3;width:70%;height:110%";float: right;text-align: right;>  '+msg+'</div></li>');
                        
                        }
                        else if(status == 'deliver') {
                              
                              currentForm.find('.personalMessages').append('<li style="margin: 10px 0;"><b>'+$('#username').val().toUpperCase()+':</b><div style="border-radius: 15px 0px 15px 15px;background: #DFC3C3;width:70%;height:110%;float: right;text-align: right;" class="deliver"> '+msg+'</span></li>');
                        
                        }
                        else {
                              
                              currentForm.find('.personalMessages').append('<li style="margin: 10px 0;"><b>'+$('#username').val().toUpperCase()+':</b><div style="border-radius: 15px 0px 15px 15px;background: #DFC3C3;width:70%;height:110%;float: right;text-align: right;" class="send">  '+msg+'</span></li>');
                        
                        }
                  });
            }
            $(this).find('.personalMessage').val('');
      });
      setInterval(function(){

            if($('#'+uniqueId).find('.personalMessage').is(":focus")){
                  socket.emit('read message', {friendId:uniqueId});
            }
            
      },100);

      $('.minimize').click(function(){
            $(this).closest('.closeChatBox').find('.minimizeChatBox').hide();
      });
      $('.maximize').click(function(){
            $(this).closest('.closeChatBox').find('.minimizeChatBox').show();
      });
      $('.closeBox').click(function(){
            $(this).closest('.closeChatBox').remove();
      });
}

function scrollChat(chatWindow){

      var down = chatWindow.scrollHeight - chatWindow.clientHeight;
      if(down>=0){                       
            $(chatWindow).scrollTop(down); 
      }

}






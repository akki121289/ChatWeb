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

      //added by brijesh
      var divmsgs=document.getElementById('msgs');
      // connection with socket
      socket = io.connect();
      // new user join
      socket.on('on join',function(users){
            var html = '';
            for(var key in users){
                  html += '<li id="'+key+'userList" class="list-group-item" onclick=CreateTab("'+users[key]+'","'+key+'") >' +users[key]+ '</li>';
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
            $onlineUser.append("<li class=list-group-item onclick=\"CreateTab('"+aa+"' ,'"+user.userId+"')\" > "+user.username+ "</li>");
      });

      socket.on('remove user',function(user){
            $('#'+user+'userList').remove();
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
                  $messages.append('<li><b>'+(msgs[i].username).toUpperCase()+':</b><span> '+msgs[i].msg+'</span></li>');
            }
      });

      socket.on('new message',function(data){
            $messages.append('<li><b>'+(data.username).toUpperCase()+':</b><span>  '+data.msg+'<span></li>');
            var down=divmsgs.scrollHeight-divmsgs.clientHeight;
            if(down>=0){
                  $("#msgs").scrollTop(down);
            }
      });

      // one to one chatting
      socket.on('message from friend', function(data, callback){

            if ($('#'+data.userId).length){
                  $('#'+data.userId).find('.personalMessages').append('<li><b>'+(data.username).toUpperCase()+':</b><span> '+data.msg+'</span></li>');
                  scrollChat($('#'+data.userId).find('.showMsgs')[0]);
            }else{
                  CreateTab(data.username,data.userId);
            }
            callback();
      });

      socket.on('seen all messages',function(data){
            if($('#'+data.friendId).length) {
                  $('#'+data.friendId).find('.personalMessages').find('.deliver').removeClass( ".deliver" ).addClass( "seen" );
                  $('#'+data.friendId).find('.personalMessages').find('.deliver').removeClass( ".send" ).addClass( "seen" );
            }
      });
});


function CreateTab(name, userId)
{          
      var Id;
      if(userId.indexOf('@') !== -1) {
            Id = userId.substr(0,userId.indexOf('@'));
      } else{
            Id = userId;
      }
     var aa = [];
      $('#chat_tabs').children().each(function(index){
            aa.push($(this).attr('id'));
      });      

      if(jQuery.inArray(Id, aa) == -1){
            $('#chat_tabs').append('<div class="col-sm-3 closeChatBox" style="border:2px solid black;background:white;"><div class="row chatBoxTitleBar"><div class="panel panel-primary" style="margin-bottom:auto"><div class="panel-heading">'+name+'<ul class="list-inline" align="right" style="margin-top: -20px;"><li><span class="closeBox glyphicon glyphicon-remove" aria-hidden="true"></span></li><li><span class="glyphicon glyphicon-unchecked maximize" aria-hidden="true"></span></li><li><span class="glyphicon glyphicon-minus minimize" aria-hidden="true"></span></li></ul></div></div></div><div class="row minimizeChatBox"><form class="form-inline personalMsgForm" role="form" align="center" data-attribute="'+Id+'" id="'+Id+'"><div class="showMsgs" style="width:100%;float:left;height:110px;overflow: scroll;"> <ul class="personalMessages" style="padding-bottom:40px"></ul></div><div class="form-group"><input class="form-control personalMessage" autocomplete="off" placeholder="Type message"></div><button class="btn btn-default">Send</button></form></div></div>');
            socket.emit('tab open',{friendId:Id});
      }
      socket.on('old message',function(data){
            var html = '';
            for(var i =data.length -1 ; i>= 0; i--){
                  if(data[i].from === Id) {
                        html += '<li><b>'+(data[i].name).toUpperCase()+':</b> <span class=""> '+data[i].message+'</span></li>'
                  } else {
                        html += '<li><b>'+(data[i].name).toUpperCase()+':</b> <span class="'+data[i].status+'"> '+data[i].message+'</span></li>'
                  }
            }
            $('#'+Id).find('.personalMessages').append(html);
            scrollChat($('#'+Id).find('.showMsgs')[0]);
      });

      $('.personalMsgForm').submit(function(e){
            e.preventDefault();

            var msg = $(this).find('.personalMessage').val().trim();
            if(msg !== ''){
                  $(this).find('.personalMessages').append('<li><b>'+$('#username').val().toUpperCase()+':</b>  '+msg+'</li>');
                  scrollChat($(this).find('.showMsgs')[0]);
                  socket.emit('personal message',{msg:msg,friendId:$(this).attr('data-attribute')},function(err, status){
                        if(err) {
            
                              $('#'+Id).find('.personalMessages').append('<li><b>'+$('#username').val().toUpperCase()+':</b><span>  '+msg+'</span></li>');
                        
                        }
                        else if(status == 'deliver') {
                              
                              $('#'+Id).find('.personalMessages').append('<li><b>'+$('#username').val().toUpperCase()+':</b><span class="deliver"> '+msg+'</span></li>');
                        
                        }
                        else {
                              
                              $('#'+Id).find('.personalMessages').append('<li><b>'+$('#username').val().toUpperCase()+':</b><span class="send">  '+msg+'</span></li>');
                        
                        }
                  });
            }
            $(this).find('.personalMessage').val('');
      });
      setInterval(function(){

            if($('#'+Id).find('.personalMessage').is(":focus")){
                  socket.emit('read message', {friendId:Id});
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
      var elementsInternal = $(parr).parent().parent().children();
      var elementsExternal = $(parr).parent().parent().parent().children();
      
      elementsInternal.each(function(index){
            console.log($(this));
            if( $(this).hasClass( "hideable" ))
            $(this).hide();
      });

      elementsExternal.each(function(index){
            console.log($(this));
            if( $(this).hasClass( "hideable" ))
            $(this).hide();
      })


}

function showTab(parr)
{
      var elementsInternal = $(parr).parent().parent().children();
      var elementsExternal = $(parr).parent().parent().parent().children();
      
      elementsInternal.each(function(index){
            console.log($(this));
            if( $(this).hasClass( "hideable" ))
            $(this).show();
      });

      elementsExternal.each(function(index){
            console.log($(this));
            if( $(this).hasClass( "hideable" ))
            $(this).show();
      })

}


function removeTab(parr)
{
      var elementsExternal = $(parr).parent().parent().parent().remove();
}

function scrollChat(personalMsgs){
      var down=personalMsgs.scrollHeight-personalMsgs.clientHeight;
      if(down>=0){                       
      $(personalMsgs).scrollTop(down); 
      }
}






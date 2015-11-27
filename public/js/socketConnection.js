$(document).ready(function(){
      
      // setContainerHeight();      
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

      socket.emit('user join',{ _id:$_id.val(), userId:$userId.val(), username:$username.val() });
      
      socket.on('online user',function(user){
            var userId = (user.userId).substr(0,(user.userId).indexOf('@'));
            var aa = user.username.toString();
            $onlineUser.append('<li id="'+user._id+'" class=list-group-item onclick=\"CreateTab('"+aa+"' ,'"+user.userId+"')\" > "+user.username+ "</li>');
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
            $('#chat_tabs').append('<form data-attribute="'+Id+'" id="'+Id+'" class="personalMsgForm"><div class=col-sm-3 style="border:1px solid black;background:white;"><div> <div class=col-sm-12 style="background:green;">  <span class="glyphicon glyphicon-minus" onclick="hideTab(this)" style="float: right;" aria-hidden="true"></span>  <span class="glyphicon glyphicon-unchecked" style="float: right;" aria-hidden="true" onclick="showTab(this)" ></span>  <span class="glyphicon glyphicon-remove" style="float: right;" aria-hidden="true" onclick="removeTab(this)"></span> </div>    <div>'+ name +'</div><div class="showMsgs hideable" style="width:100%;float:left;height:110px;overflow: scroll;"> <ul class="personalMessages" style="padding-bottom:40px"></ul></div></div><div class="hideable" ><input class="personalMessage" autocomplete="off" placeholder="Type message" class="form-control"><button>Send</button></div> </div></form>')
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
      });

      $('.personalMsgForm').submit(function(e){
            e.preventDefault();

            var msg = $(this).find('.personalMessage').val().trim();
            if(msg !== ''){

                  var personalMsgs= $(this).find('.showMsgs')[0];
                  var down= personalMsgs.scrollHeight-personalMsgs.clientHeight;
                  if(down>=0){

                        $(".showMsgs").scrollTop(down); 
                  }
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
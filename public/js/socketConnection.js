$(document).ready(function(){
            
      var $username = $('#username');
      var $_id = $('#_id');
      var $onlineUser = $('#onlineUser');
      var $groupIds = $('#groupIds');
      var $chatRooms = $('#chatRooms')
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
      socket.emit('user join',{ _id:$_id.val(), userId:$userId.val(), username:$username.val(), groupIds:$groupIds.val() });
      // emit this event to know the groups available for the online user
      socket.on('groups available',function(data,callback){
            var groupIdsArray = [];
            var html = '';
            for(var i=0;i<data[0].groups.length;i++){
                  html += '<li id="'+data[0].groups[i].groupId+'" class="list-group-item" onclick=createGroupTab("'+data[0].groups[i].groupName+'","'+data[0].groups[i].groupId+'") >' +data[0].groups[i].groupName+ '</li>';
                  groupIdsArray.push(data[0].groups[i].groupId)
            }
            $chatRooms.html(html);
            callback(groupIdsArray);
      });
      // updating the list of online user when any user became online
      socket.on('online user',function(user){
            user.username = user.username.toString();
            if (user._id !== $_id.val())
                  $onlineUser.append("<li id='"+user._id+"userList' class=list-group-item onclick=\"CreateTab('"+user.username+"' ,'"+user._id+"')\" > "+user.username+ "</li>");
      });

      socket.on('image from friend',function(data,callback){
            if ($('#'+data._id).length){
                  $('#'+data._id).find('.personalMessages').append('<li><div class="col-sm-12"><div class="pChatFrom"><img class="showImageModal" data-toggle="modal" data-target="#openModal" src="'+data.img+'" width="150" height="80"></div></div></li>');
                  scrollChat($('#'+data._id).find('.showMsgs')[0]);
            }else{
                  CreateTab(data.username,data._id);
            }
            
            callback();
      });

      socket.on('video from friend',function(data,callback){
            if ($('#'+data._id).length){
                  $('#'+data._id).find('.personalMessages').append('<li><div class="col-sm-12"><div class="pChatFrom" > <video controls style="width:100%;" class="showVideoModal" data-toggle="modal" data-target="#openModal"><source src="'+ data.img +'"></video></div></div></li>');
                  scrollChat($('#'+data._id).find('.showMsgs')[0]);
            }else{
                  CreateTab(data.username,data._id);
            }
            
            callback();
      });

      socket.on('audio from friend',function(data,callback){
            if ($('#'+data._id).length){
                  $('#'+data._id).find('.personalMessages').append('<li><div class="col-sm-12"><div class="pChatFrom" > <audio controls style="width:100%;"><source src="'+ data.img +'"></audio></div></div></li>');
                  scrollChat($('#'+data._id).find('.showMsgs')[0]);
            }else{
                  CreateTab(data.username,data._id);
            }
            
            callback();
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
                  // $('#'+data._id).find('.personalMessages').append('<li><div class="col-sm-12"><div style="margin: 2px 0;border-radius: 0px 15px 15px 15px;background: #22C7C4;width:70%;height:110%" > '+data.msg+'</div></div></li>');
                  $('#'+data._id).find('.personalMessages').append('<li><div class="col-sm-12"><div class="pChatFrom"> '+data.msg+'</div></div></li>');
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

       socket.on('old message',function(messageData){
            var data =  messageData.messages;
            var uniqueId = messageData.uniqueId;
            var html = '';
            for(var i =data.length -1 ; i>= 0; i--){
                  if(data[i].from === uniqueId) 
                        html += '<li><div class="col-sm-12"><div class="pChatFrom" >';
                   else 
                        html += '<li><div class="col-sm-12"><div class=" pChatTo" >';

                   if(data[i].type == 'message'){
                        html += data[i][data[i].type];  
                  }
                  else if(data[i].type == 'image'){
                        html += '<img class="showImageModal" data-toggle="modal" data-target="#openModal" src="'+ data[i][data[i].type] +'" width="150" height="80"></div>'; 
                  }
                  else{
                        if(data[i].type=="video"){
                              html += '<'+ data[i].type +' controls style="width:100%;" class="showVideoModal" data-toggle="modal" data-target="#openModal"><source src="'+ data[i][data[i].type] +'"></'+data[i].type+'></div>'
                        }
                        else{
                              html += '<'+ data[i].type +' controls style="width:100%;"><source src="'+ data[i][data[i].type] +'"></'+data[i].type+'>'      
                        }
                  }
                 html += '</div></div></li>';
            }
            if ($('#'+uniqueId).length){
                  $('#'+uniqueId).find('.personalMessages').append(html);
            }
            scrollChat($('#'+uniqueId).find('.showMsgs')[0]);
      });

      socket.on('updateGroupChat',function(data){
            console.log(data.name);
            console.log(data.groupId);
            console.log(data.groupName);
            console.log(data.msg);
            if($('#'+data.groupId+'GroupTab').length){
                  msg = "<b>" + data.name + "</b>" + ": " + data.msg;
                  $('#'+data.groupId+'GroupTab').find('.groupMessages').append('<li><div class="col-sm-12"><div class="pChatFrom"> '+msg+'</div></div></li>');
                  
                  
            }else{
                  createGroupTab(data.groupName,data.groupId);
            }
            scrollChat($('#'+data.groupId+'GroupTab').find('.showMsgs')[0]);
            //$("#connected").append(data.name+" "+data.msg+"<br/>");
      });

});

function createGroupTab(groupName,groupId){
      if(! $('#'+groupId+'GroupTab').length){
            var username = $('#username').val();
            $('#chat_tabs').append("<div class='col-sm-3 closeChatBox' id='"+groupId+"GroupTab'><div class='row chatBoxTitleBar'><div class='panel panel-primary' style='margin-bottom:auto'><div class='panel-heading'>"+groupName+"<ul class='list-inline' style='float:right;'><li><span class='closeBox glyphicon glyphicon-remove' aria-hidden='true'></span></li><li><span class='glyphicon glyphicon-unchecked maximize' aria-hidden='true'></span></li><li><span class='glyphicon glyphicon-minus minimize' aria-hidden='true'></span></li></ul></div></div></div><div class='row minimizeChatBox'><form class='form-inline groupMsgForm' role='form' data-attribute='"+groupName+"' id='"+groupId+"'><div class='showMsgs'> <ul class='groupMessages' style='padding-bottom:40px;'></ul></div><div class='form-group'><input class='form-control groupMessage' autocomplete='off' placeholder='Type message'></div><button class='btn btn-default'>Send</button></form><input class='uploadData' type='file' name='pic' accept='image/* , video/* , audio/*' ></div></div>");      
            socket.emit('groupTab Open',{groupId:groupId},function(messages){
                  console.log("old Group messages cccc",messages);
                  for(var i =messages.length -1 ; i>= 0; i--){
                        msg = "<b>" + messages[i].from + "</b>" + ": " + messages[i].msg;
                        if(messages[i].from === username){
                              $('#'+messages[i].groupId+'GroupTab').find('.groupMessages').append('<li><div class="col-sm-12"><div class="pChatTo"> '+msg+'</div></div></li>');      
                        }
                        else{
                              $('#'+messages[i].groupId+'GroupTab').find('.groupMessages').append('<li><div class="col-sm-12"><div class="pChatFrom"> '+msg+'</div></div></li>');      
                        }
                  }
                  scrollChat($('#'+groupId+'GroupTab').find('.showMsgs')[0]);
            });
      }  

      $('.groupMsgForm').submit(function(e){
            e.preventDefault();
            var username = $('#username').val();
            var groupName = $(this).attr('data-attribute');
            var groupId = $(this).attr('id');
            var msg = $(this).find('.groupMessage').val().trim();
            if(msg !== ''){
                  var currentForm = $(this);
                  socket.emit('send Group Messages',{ name:username, groupId:groupId, groupName:groupName, msg:msg },function(err){
                        if(err){
                              throw err;
                        }
                        else{
                              msg = "<b>" + username + "</b>" + ": " + msg;
                              console.log(currentForm.find('.groupMessages'));
                              currentForm.find('.groupMessages').append('<li ><div class="col-sm-12"><div class="pChatTo" > '+msg+'</div></div></li>');
                        }
                        scrollChat(currentForm.find('.showMsgs')[0]);
                  }); 
            }
            $(this).find('.groupMessage').val('');
      }); 

      $('.minimize').click(function(){
            var minBoxHeight = $('.minimizeChatBox').height();
            $(this).closest('.closeChatBox').find('.minimizeChatBox').hide();
            $(this).closest('.closeChatBox').css("padding-top",minBoxHeight);

      });
      $('.maximize').click(function(){
            $(this).closest('.closeChatBox').css("padding-top","0px");
            $(this).closest('.closeChatBox').find('.minimizeChatBox').show();
      });
      $('.closeBox').click(function(){
            $(this).closest('.closeChatBox').remove();
      });   
}


function CreateTab(name, uniqueId)
{          
      if(! $('#'+uniqueId+'userTab').length){
            // $('#chat_tabs').append("<div class='col-sm-3 closeChatBox' style='margin-right:5px;background:white;' id='"+uniqueId+"userTab'><div class='row chatBoxTitleBar'><div class='panel panel-primary' style='margin-bottom:auto'><div class='panel-heading'>"+name+"<ul class='list-inline' style='list-style-type:none;float:right'><li><span class='closeBox glyphicon glyphicon-remove' aria-hidden='true'></span></li><li><span class='glyphicon glyphicon-unchecked maximize' aria-hidden='true'></span></li><li><span class='glyphicon glyphicon-minus minimize' aria-hidden='true'></span></li></ul></div></div></div><div class='row minimizeChatBox'><form class='form-inline personalMsgForm' role='form' data-attribute='"+uniqueId+"' id='"+uniqueId+"'><div class='showMsgs' style='width:100%;float:left;height:110px;overflow: scroll;'> <ul class='personalMessages' style='padding-bottom:40px; list-style-type:none;'></ul></div><div class='form-group'><input class='form-control personalMessage' autocomplete='off' placeholder='Type message'></div><button class='btn btn-default'>Send</button></form></div></div>");
            $('#chat_tabs').append("<div class='col-sm-3 closeChatBox' id='"+uniqueId+"userTab'><div class='row chatBoxTitleBar'><div class='panel panel-primary' style='margin-bottom:auto'><div class='panel-heading'>"+name+"<ul class='list-inline' style='float:right;'><li><span class='closeBox glyphicon glyphicon-remove' aria-hidden='true'></span></li><li><span class='glyphicon glyphicon-unchecked maximize' aria-hidden='true'></span></li><li><span class='glyphicon glyphicon-minus minimize' aria-hidden='true'></span></li></ul></div></div></div><div class='row minimizeChatBox'><form class='form-inline personalMsgForm' role='form' data-attribute='"+uniqueId+"' id='"+uniqueId+"'><div class='showMsgs'> <ul class='personalMessages' style='padding-bottom:40px;'></ul></div><div class='form-group'><input class='form-control personalMessage' autocomplete='off' placeholder='Type message'></div><button class='btn btn-default'>Send</button></form><input class='uploadData' type='file' name='pic' accept='image/* , video/* , audio/*' ></div></div>");
            console.log(uniqueId);
            socket.emit('tab open',{friendId:uniqueId});
      }

      $('.uploadData').unbind( "change");

      $('.uploadData').on('change', function(e){
            upload(e,this);
      });

      // $('.uploadAudio').unbind( "change");
      // $('.uploadAudio').on('change', function(e){
      //       upload(e,this,'audio');
      // });

      $('.personalMsgForm').submit(function(e){
           
            console.log(e);
            e.preventDefault();
            // var files = e.target[1].files;

            var jsonObject = {};
            var reader = new FileReader();
                  reader.onload = function(evt){
                  jsonObject = {
                  'imageData': evt.target.result,
                  }
              console.log("jsonObject",jsonObject);    
            }
              // send a custom socket message to server
              
            var msg = $(this).find('.personalMessage').val().trim();
            if(msg !== ''){
                  var currentForm = $(this);
                  console.log(currentForm);
                  socket.emit('personal message',{msg:msg,friendId:$(this).attr('data-attribute')},function(err, status){
                        if(err) {
                              currentForm.find('.personalMessages').append('<li ><div class="col-sm-12"><div class="pChatTo" > '+msg+'</div></div></li>');
                        }
                        else if(status == 'deliver') {
                              
                              currentForm.find('.personalMessages').append('<li><div class="col-sm-12"><div class="deliver pChatTo"> '+msg+'</div></div></li>');
                        }
                        else {
                              
                              currentForm.find('.personalMessages').append('<li><div class="col-sm-12"><div class="send pChatTo">  '+msg+'</div></div></li>');
                        }
                        scrollChat(currentForm.find('.showMsgs')[0]);
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
            var minBoxHeight = $('.minimizeChatBox').height();
            $(this).closest('.closeChatBox').find('.minimizeChatBox').hide();
            $(this).closest('.closeChatBox').css("padding-top",minBoxHeight);

      });
      $('.maximize').click(function(){
            $(this).closest('.closeChatBox').css("padding-top","0px");
            $(this).closest('.closeChatBox').find('.minimizeChatBox').show();
      });
      $('.closeBox').click(function(){
            $(this).closest('.closeChatBox').remove();
      });

      $('body').on('click','.showImageModal', function() {
            var imageSource = $(this).attr('src');
            $('#openModal .modal-body').append('<img id="modalContent" src="'+imageSource+'" class="img-responsive">');
      });

      $('body').on('click','.showVideoModal', function() {
            var videoSource = $(this).find('source').attr('src');       
            $('#openModal .modal-body').append('<div id="modalContent" class="embed-responsive embed-responsive-16by9"><iframe src="'+videoSource+'" class="embed-responsive-item"></iframe></div>');
      });

      $('#openModal').on('hide.bs.modal', function (e) {
            $('#modalContent').remove();
      });
}

function scrollChat(chatWindow){
      var down = chatWindow.scrollHeight - chatWindow.clientHeight;
      if(down>=0){                       
            $(chatWindow).scrollTop(down); 
      }
}

function upload(e,thisObj)
{     
      // console.log(t);
      var file = e.originalEvent.target.files[0],
      reader = new FileReader();
      console.log(file);
      var elementType = file.type.split('/');
      console.log("elementType",elementType[0]);
      var friendId = $(thisObj).closest('.minimizeChatBox').find('.personalMsgForm').attr('data-attribute');
      var currentForm = $(thisObj);
      reader.onload = function(evt){
            var jsonObject = {
                  'friendId' : friendId,
                  'fileName' : file.name,
                  'fileType' : file.type
            }

            jsonObject[elementType[0]+'Data'] = evt.target.result;
            // send a custom socket message to server
            console.log("jsonObject",jsonObject);
            // socket.emit('user '+ elementType[0], jsonObject,function(err, data){
            socket.emit('user upload', jsonObject,function(err, data){
            
                  // console.log("code===",'<li ><div class="col-sm-12"><div class="pChatTo" > <' +elementType=='image'?elementType:' controls style="width:100%;" ><source ' +' src="'+ data.img +elementType=='image'?'" width="150" height="80">':'> </audio>' +' </div></div></li>');

                  if(elementType[0] == 'image')
                  {
                        if(err) {
                              currentForm.closest('.minimizeChatBox').find('.personalMessages').append('<li><div class="col-sm-12"><div class="deliver pChatTo"> <'+elementType[0]+' src="'+ data.img +'" width="150" height="80"> </div></div></li>');
                        }
                        else if(data.status == 'deliver') {
                              currentForm.closest('.minimizeChatBox').find('.personalMessages').append('<li><div class="col-sm-12"><div class="deliver pChatTo"> <'+elementType[0]+' src="'+ data.img +'" width="150" height="80"> </div></div></li>');
                        }
                        else {
                              currentForm.closest('.minimizeChatBox').find('.personalMessages').append('<li><div class="col-sm-12"><div class="send pChatTo">  <'+elementType[0]+' src="'+ dat.img +'" width="150" height="80"> </div></div></li>');
                        }      
                  }
                  else if(elementType[0] == 'video'){
                        if(err) {
                              currentForm.closest('.minimizeChatBox').find('.personalMessages').append('<li ><div class="col-sm-12"><div class="pChatTo" > <'+elementType[0]+' controls style="width:100%;" class="showVideoModal" data-toggle="modal" data-target="#openModal"><source src="'+ data.img +'"></'+elementType[0]+'></div></div></li>');
                        }
                        else if(data.status == 'deliver') {
                              currentForm.closest('.minimizeChatBox').find('.personalMessages').append('<li><div class="col-sm-12"><div class="deliver pChatTo"><'+elementType[0]+' controls style="width:100%;" class="showVideoModal" data-toggle="modal" data-target="#openModal"><source src="'+ data.img +'"></'+elementType[0]+'></div></div></li>');
                        }
                        else {
                               currentForm.closest('.minimizeChatBox').find('.personalMessages').append('<li><div class="col-sm-12"><div class="send pChatTo"> <'+elementType[0]+' controls style="width:100%;" class="showVideoModal" data-toggle="modal" data-target="#openModal"><source src="'+ data.img +'"></'+elementType[0]+'></div></div></li>');
                        }
                  }
                  else
                  {
                        if(err) {
                              currentForm.closest('.minimizeChatBox').find('.personalMessages').append('<li ><div class="col-sm-12"><div class="pChatTo" > <'+elementType[0]+' controls style="width:100%;"><source src="'+ data.img +'"></'+elementType[0]+'></div></div></li>');
                        }
                        else if(data.status == 'deliver') {
                              currentForm.closest('.minimizeChatBox').find('.personalMessages').append('<li><div class="col-sm-12"><div class="deliver pChatTo"><'+elementType[0]+' controls style="width:100%;"><source src="'+ data.img +'"></'+elementType[0]+'></div></div></li>');
                        }
                        else {
                               currentForm.closest('.minimizeChatBox').find('.personalMessages').append('<li><div class="col-sm-12"><div class="send pChatTo"> <'+elementType[0]+' controls style="width:100%;"><source src="'+ data.img +'"></'+elementType[0]+'></div></div></li>');
                        }
                  }
                  
                  scrollChat(currentForm.closest('.minimizeChatBox').find('.showMsgs')[0]);
            });
      };
      reader.readAsDataURL(file);
}




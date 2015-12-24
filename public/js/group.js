

$(document).ready(function(){

// ajax for creating list of user in database (i.e. create typeahead)
$('#createGroupText1').keyup(function(){
	var createGroupText = $('#createGroupText1').val(); 
	$.ajax({
	url: "group/create",
	data: 
		{
			method 	 : "createGroup",
			createGroupText	 : createGroupText
		},
	}).done(function(data) {
		var usernameArray = [];
        var liString = '';
        $('#createGroupul1').empty();
		data.forEach(function(ele,index,err){
             liString =  liString + '<li data-value="'+ele._id+'" class=""><a href="#">'+ele.username+'</a></li>';
			usernameArray.push(ele.username);
		});

        $('#createGroupul1').append(liString);
	});
});

});

// dynamically binding of onclick event on create group li 
$(document).on( 'click', '#createGroupul1 li', function(){
    // $('#createGroupToken').append('<div class="token invalid" style="display: inline-block;border-radius:3px 3px 3px 3px;background:#dfdfe6;width:fit-content;margin-left:5px;"><span id="'+$(this).attr('data-value')+'" class="token-span" style="padding-left:3px;padding-right:15px">'+$(this).text()+'</span><a href="#" class="close" data-dismiss="token">×</a></div>');
    $('#createGroupToken').append('<div class="token" style="display: inline-block;border-radius:3px 3px 3px 3px;background:#dfdfe6;width:fit-content;margin-left:5px;"><span id="'+$(this).attr('data-value')+'" class="token-span" style="padding-left:3px;padding-right:15px">'+$(this).text()+'</span><a href="#" class="close" data-dismiss="token">×</a></div>');

    if($('#createHiddenInput').val() == '')
        $('#createHiddenInput').val($(this).attr('data-value'));
        // $('#createHiddenInput').val($(this).text());
    else
    {
        // var hiddenInputValue = $('#createHiddenInput').val() + ','+$(this).text();
        var hiddenInputValue = $('#createHiddenInput').val() + ','+$(this).attr('data-value');
        $('#createHiddenInput').val(hiddenInputValue);
    }
        
});

// dynamically binding of close token
$(document).on( 'click', '.close', function(){
    var valueRemoved = $(this).closest('.token').find('.token-span').attr('id');
    if($('#createHiddenInput').val().search(valueRemoved))
    {
        var valueRemoved = "," + $(this).closest('.token').find('.token-span').attr('id');
        $('#createHiddenInput').val($('#createHiddenInput').val().replace(valueRemoved,"") );
    }
    else if($('#createHiddenInput').val().search(',') == -1)
    {
        var valueRemoved =  $(this).closest('.token').find('.token-span').attr('id') ;
        $('#createHiddenInput').val($('#createHiddenInput').val().replace(valueRemoved,"") );
    }
    else
    {
        var valueRemoved =  $(this).closest('.token').find('.token-span').attr('id') + ",";
        $('#createHiddenInput').val($('#createHiddenInput').val().replace(valueRemoved,"") );   
    }

    $(this).closest('.token').remove();

});

// $(document).on( 'click', '#createGroupSave', function(){
    
// });
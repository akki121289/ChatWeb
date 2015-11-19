var name,
    socket = io.connect("http://localhost:1234");

$(function () {

    //as the user to enter their nick name or name.
    name = window.prompt("enter your name");

    //If the name is not given, ask the user to enter once again
    if (name == null) {
        $("body").html(" please refresh the page and try again ");
    }

    //When send button is clicked on, send the message to server
    $("#send").click(function () {

        //send to the server with person name and message
        socket.emit("clientMsg", {
            "name": name,
            "msg": $("#msg").val()
        });
    });
});
var connected = false
var socket
var messages = {} // Store messages per recipient
var currentRecipient = null

$(document).ready(function() {
    $("#connect").click(connect)
    $("#send").click(sendMessage)

    $("#name").keypress(function(event) {
        if (event.keyCode == 13 || event.which == 13) {
            connect()
        }
    })

    $("#msg").keypress(function(event) {
        if (event.keyCode == 13 || event.which == 13) {
            sendMessage()
        }
    })

    $("#chat").change(function() {
        scrollToBottom()
    })

    $("#name").focus()
})

var connect = function() {
    if (!connected) {
        var name = $("#name").val()
        console.log("Val: " + name)
        socket = new WebSocket("ws://" + location.host + "/chat/" + name)
        socket.onopen = function() {
            connected = true
            console.log("Connected to the web socket")
            $("#send").attr("disabled", false)
            $("#connect").attr("disabled", true)
            $("#name").attr("disabled", true)
            $("#msg").focus()
        }
        socket.onmessage = function(m) {
            console.log("Got message: " + m.data)
            handleIncomingMessage(m.data)
        }
    }
}

var handleIncomingMessage = function(message) {
    // Assuming message format is: sender:message_content
    var tmp = message.split(":")
    var sender = tmp[0]

    if (message.startsWith("User ") && message.endsWith(" joined")) {
        sender = tmp[0].substring(5, tmp[0].length - 7)
        // addRecipientToList(sender)
        messages[sender] = []
        return
    }

    if (!messages[sender]) {
        messages[sender] = [message]
        addRecipientToList(sender)
        console.log("Added " + sender + " to the recipient list")
        updateChatWindow()
        return
    }

    var content = tmp[1]
    messages[sender].push(sender + ": " + content)

    if (currentRecipient === sender) {
        updateChatWindow()
    }
}

var addRecipientToList = function(recipient) {
    var recipientItem = $("<a>").addClass("list-group-item recipient-item").text(recipient)
    recipientItem.click(function() {
        currentRecipient = recipient
        updateChatWindow()
    })
    $("#recipient-list").append(recipientItem)
}

var updateChatWindow = function() {
    console.log("Updating chat window for " + currentRecipient)
    if (currentRecipient == null) {
        return
    }
    var msgs = []
    if (messages[currentRecipient]) {
        msgs = messages[currentRecipient]
    }
    $("#chat").val(msgs.join("\n"))
    scrollToBottom()
}

var sendMessage = function() {
    if (connected) {
        var value = $("#msg").val()
        if (!currentRecipient) {
            // alert("Select a recipient first!")
            // return
        }

        var message = null
        if (!currentRecipient) {
            message = value
        } else {
            var message = currentRecipient + ":" + value
        }

        socket.send(message)

        if (!messages[currentRecipient]) {
            // messages[currentRecipient] = []
            // addRecipientToList(currentRecipient)
        } else {
            messages[currentRecipient].push("Me: " + value)
        }

        console.log("Sent message: '" + message + "' to " + currentRecipient)
        $("#msg").val("")
        updateChatWindow()
    }
}

var scrollToBottom = function() {
    $("#chat").scrollTop($("#chat")[0].scrollHeight)
}
addRecipientToList("General")
addRecipientToList("Jo")
addRecipientToList("john")
addRecipientToList("arthur")

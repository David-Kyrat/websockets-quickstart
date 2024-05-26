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

    var modal = document.getElementById("addRecipientModal")
    var btn = document.getElementById("add-recipient")
    var span = document.getElementsByClassName("close")[0]

    btn.onclick = function() {
        modal.style.display = "block"
    }

    span.onclick = function() {
        modal.style.display = "none"
    }

    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none"
        }
    }

    $("#save-recipient").click(function() {
        var newRecipient = $("#new-recipient-name").val()
        if (newRecipient) {
            addRecipientToList(newRecipient)
            $("#new-recipient-name").val("")
            modal.style.display = "none"
        }
    })
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
    var content = tmp.slice(1).join(":")

    if (!messages[sender]) {
        messages[sender] = []
        // addRecipientToList(sender)
    }

    messages[sender].push({ sender: sender, content: content })

    if (currentRecipient === sender) {
        updateChatWindow()
    }
}

var addRecipientToList = function(recipient) {
    var recipientItem = $("<div>").addClass("recipient-item").text(recipient)
    recipientItem.click(function() {
        currentRecipient = recipient
        $("#chat-header").text(currentRecipient)
        updateChatWindow()
    })
    $("#recipient-list").append(recipientItem)
}

var updateChatWindow = function() {
    var chatBox = $("#chat")
    chatBox.empty()
    if (messages[currentRecipient]) {
        messages[currentRecipient].forEach(function(message) {
            var messageElement = $("<div>").addClass("message")
            var contentElement = $("<div>").addClass("content").text(message.content)
            messageElement.addClass(message.sender === "Me" ? "sent" : "received")

            messageElement.append(contentElement)
            chatBox.append(messageElement)
        })
    }
    scrollToBottom()
}

var sendMessage = function() {
    if (connected) {
        var value = $("#msg").val()
        if (!currentRecipient) {
            alert("Select a recipient first!")
            return
        }

        var message = currentRecipient + ":" + value
        socket.send(message)

        if (!messages[currentRecipient]) {
            messages[currentRecipient] = []
            // addRecipientToList(currentRecipient)
        }

        console.log("Sent message: '" + message + "' to " + currentRecipient)
        messages[currentRecipient].push({ sender: "Me", content: value })
        $("#msg").val("")
        updateChatWindow()
    }
}

var scrollToBottom = function() {
    $("#chat").scrollTop($("#chat")[0].scrollHeight)
}

addRecipientToList("General")
addRecipientToList("jo")
addRecipientToList("ji")
addRecipientToList("jp")

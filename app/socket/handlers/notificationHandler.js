const registerNotificationHandlers = async (io, socket) => {
    socket.join('admins')
}

module.exports = {
    registerNotificationHandlers
}
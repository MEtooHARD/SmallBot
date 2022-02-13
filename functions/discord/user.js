



// return @user string for discord message
const atUser = id => '<@!' + String(id) + '>'

// get userID from a @ component in a message
const getUserIdFromAt = str => str.replace("<@!", "").replace("<@", "").replace(">", "")

module.exports = {
    atUser: atUser,
    getUserIdFromAt: getUserIdFromAt,
}

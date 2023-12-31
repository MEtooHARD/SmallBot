import { Snowflake, SnowflakeUtil, User } from "discord.js";

const atUser = (UID: Snowflake | User) => {
    if (UID instanceof User)
        return `<@${UID.id}>`
    return `<@${UID}>`
}

export {
    atUser
}
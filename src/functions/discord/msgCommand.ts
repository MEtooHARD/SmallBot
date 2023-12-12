import { prefix } from "../../app"


const getCmdInfo = (content: string) => {
    return content.substring(prefix.length).split(' ');
}

export {
    getCmdInfo
}
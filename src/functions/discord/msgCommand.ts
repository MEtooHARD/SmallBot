import { divider, prefix } from "../../app"


const getCmdInfo = (content: string) => {
    return content.substring(prefix.length + divider.length).split(' ');
}

export {
    getCmdInfo
}
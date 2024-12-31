import { dividor, prefix } from "../../app"


const getCmdInfo = (content: string) => {
    return content.substring(prefix.length + dividor.length).split(' ');
}

export {
    getCmdInfo
}
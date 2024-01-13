import { CommandStatus, status } from "../../app"

const shouldDeployCommand = () => {
    return status === CommandStatus.dev;
}

const deploy = async () => {
    await require('../../deploy-commands')();
}

export {
    shouldDeployCommand,
    deploy
}
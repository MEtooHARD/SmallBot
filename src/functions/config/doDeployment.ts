import { CommandStatus } from "../../app"

const shouldDeployCommand = (status: CommandStatus) => {
    return status === CommandStatus.dev;
}

const deploy = async () => {
    await require('../../deploy-commands')();
}

export {
    shouldDeployCommand,
    deploy
}
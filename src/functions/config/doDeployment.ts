import { CommandDeployStatus } from "../../config/status";

const shouldDeployCommand = (status: CommandDeployStatus) => {
    return status === CommandDeployStatus.dev;
}

const deploy = async () => {
    await require('../../deploy-commands')();
}

export {
    shouldDeployCommand,
    deploy
}
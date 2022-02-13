
/*
* no functions should be imported in this file
*/

const envDelimiter = 'ENVVARIABLEDELIMITER'
const parseEnv = varName => process.env[varName].split(envDelimiter)
const isDebug = () => process.env.mode === 'dev'
const isReady = () => process.env.ready
const setReady = () => process.env.ready = true
const shouldReload = () => process.env.shouldReload

module.exports = {
    envDelimiter: envDelimiter,
    parseEnv: parseEnv,
    isDebug: isDebug,
    isReady: isReady,
    setReady: setReady,
    shouldReload: shouldReload,
}

export const logger = (module: string) => {
    const log = (msg: string) => console.log(`[${module}] ${msg}`);
    log.success = (msg: string) => console.log(`[${module}] ✅ ${msg}`);
    log.info = (msg: string) => console.info(`[${module}] 💠 ${msg}`);
    log.error = (msg: string) => console.error(`[${module}] ❌ ${msg}`);
    log.warn = (msg: string) => console.warn(`[${module}] ⚠️  ${msg}`);
    return log;
};

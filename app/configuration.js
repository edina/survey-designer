import cfg from '../config/env.json!';
import myEnv from '../config/.env!text';

/**
 * get config object
 * @returns {object} configuration object of the application
 */
function getConfig(){
    let env = myEnv || 'development';
    return cfg[env];
}

export {getConfig};

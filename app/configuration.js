import cfg from '../config/env.json!json';
import myEnv from '../config/.env!text';

/**
 * get config object
 * @returns {object} configuration object of the application
 */
function getConfig(){
    let environment = myEnv.trim() || 'development';
    return cfg[environment];
}

export {getConfig};

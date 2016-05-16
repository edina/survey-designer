import cfg from '../config/env.json!';
import process from 'process';

/**
 * get config object
 * @returns {object} configuration object of the application
 */
function getConfig(){
    let env = process.env.NODE_ENV || 'development';
    return cfg[env];
}

export {getConfig};

const baseConfig = require('electron-webpack/webpack.renderer.config.js');

module.exports = env => {
  const config = baseConfig(env);
  
  // Fix for webpack 5: replace namedModules with moduleIds
  if (config.optimization && config.optimization.namedModules) {
    delete config.optimization.namedModules;
    config.optimization.moduleIds = 'named';
  }
  
  return config;
} 
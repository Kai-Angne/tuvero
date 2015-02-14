/**
 * config.js: sets up the shared configuration of the projects
 * 
 * @author Erik E. Lorenz <erik.e.lorenz@gmail.com>
 * @license MIT License
 * @see LICENSE
 */

require.config({
  shim: {
    'lib/modernizr': {
      deps: ['lib/Blob'],
      exports: 'Modernizr'
    },
    'lib/Blob': {
      exports: 'Blob'
    }
  },
  paths: {
    // All paths are relative to the baseUrl, not this config file, hence the
    // '../../'
    'lib': '../../lib',
    'ui': '../../legacy/scripts/ui',
    'backend': '../../legacy/scripts/backend',
    'jquery': '../../lib/jquery',
    'filesaver': '../../lib/FileSaver',
  }
});

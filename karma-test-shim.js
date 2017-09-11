// /*global jasmine, __karma__, window*/
Error.stackTraceLimit = 0;
jasmine.DEFAULT_TIMEOUT_INTERVAL = 1000;

var builtPaths = (__karma__.config.builtPaths || ['dist/'])
  .map(function(p) { return '/base/'+p;});

__karma__.loaded = function () { };

function isJsFile(path) {
  return path.slice(-3) == '.js';
}

function isSpecFile(path) {
  return /\.spec\.(.*\.)?js$/.test(path);
}

// Is a "built" file if is JavaScript file in one of the "built" folders
function isBuiltFile(path) {
  return isJsFile(path) &&
    builtPaths.reduce(function(keep, bp) {
      return keep || (path.substr(0, bp.length) === bp);
    }, false);
}

var allSpecFiles = Object.keys(window.__karma__.files)
  .filter(isSpecFile)
  .filter(isBuiltFile);

System.config({
  baseURL: 'base/',
  packages: { 'testing': { main: 'index.js', defaultExtension: 'js' } },
  map: {
    '@angular/core/testing': 'npm:@angular/core/bundles/core-testing.umd.js',
    '@angular/common/testing': 'npm:@angular/common/bundles/common-testing.umd.js',
    '@angular/compiler/testing': 'npm:@angular/compiler/bundles/compiler-testing.umd.js',
    '@angular/platform-browser/testing': 'npm:@angular/platform-browser/bundles/platform-browser-testing.umd.js',
    '@angular/platform-browser-dynamic/testing': 'npm:@angular/platform-browser-dynamic/bundles/platform-browser-dynamic-testing.umd.js'
  },
});

System.import('systemjs.config.js')
  .then(initTestBed)
  .then(initTesting);

function initTestBed(){
  return Promise.all([
    System.import('@angular/core/testing'),
    System.import('@angular/platform-browser-dynamic/testing')
  ])

    .then(function (providers) {
      var coreTesting    = providers[0];
      var browserTesting = providers[1];

      coreTesting.TestBed.initTestEnvironment(
        browserTesting.BrowserDynamicTestingModule,
        browserTesting.platformBrowserDynamicTesting());
    })
}

// Import all spec files and start karma
function initTesting () {
  return Promise.all(
    allSpecFiles.map(function (moduleName) {
      return System.import(moduleName);
    })
  )
    .then(__karma__.start, __karma__.error);
}
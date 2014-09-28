#!/bin/bash
#
# creates the common.js and test.js files

createTestJS(){
    files=`echo ./*/test/*.js`
    files=${files//.js/}
    files=${files// /\', \'}

    cat << EOF
/**
* run all tests
* 
* this file is automatically created by updatetests.sh, located in the same folder. Do not attempt manual changes
*/

require([ './common', 'lib/qunit', '$files'], function(Common, QUnit){
  QUnit.load();
  QUnit.start();
});
EOF
}


getallfiles(){
    find */* -name '*.js' -not -path 'lib/require.js' -not -path '*/test/*.js' | grep -v 'jquery'
}

getrequirefiles(){
	  grep -Pl 'define\((?!\))' `getallfiles`
}

getrequirepaths(){
    getrequirefiles | sed 's/\.js$//'
}

formatpatharray(){
    echo "["
    getrequirepaths | sed -e 's/^\|$/"/g' -e 's/^/  /' -e '$q;s/$/,/'
    echo "]"
}

createCommonJS(){
    cat <<EOF
/**
* common.js: loads EVERY require-js compatible file from this folder
* and configures requirejs to load the libraries as shims
* 
* This file is automatically generated by createcommon.sh
*/

require.config({
  shim : {
    'lib/modernizr' : {
      deps: ['lib/Blob'],
      exports: 'Modernizr'
    },
      'lib/Blob' : {
      exports : 'Blob'
    },
      'lib/typeahead' : {
      deps: [ 'lib/jquery' ]
    },
    'lib/jsPlumb' : {
      deps: ['lib/jquery'],
      exports: 'jsPlumb'
    },
    'lib/qunit' : {
      exports: 'QUnit',
      init: function() {
        QUnit.config.autoload = false;
        QUnit.config.autostart = false;
      }
    }
  },
});

define(`formatpatharray`);

EOF
}

getShim(){
    sed -n '/^\s*shim\s*:/,/})/p' common.js
}

updateBuildJS(){
    newbuild=`sed -e '/^\s*shim\s*:/,$ d' build.js`
    cat <<EOF > build.js
$newbuild
`getShim`
EOF
}

createCommonJS > common.js
echo "common.js written"
createTestJS > test.js
echo "test.js written"
updateBuildJS
echo "build.js updated"

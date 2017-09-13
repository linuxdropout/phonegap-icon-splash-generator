const gm          = require("gm").subClass({ imageMagick: true })
const fs          = require("fs")
const path        = process.argv[1].replace(/\\/,'/').replace("/phonegap-icon-splash-generator.js","")

var files = fs.readdirSync(path)
var xml = ""
var processing = 0

if ( !files.includes("sizes.json") ) {
  console.log("No sizes.json file found")
  return;
} else {
  var info = JSON.parse(fs.readFileSync( path+"/sizes.json" ))
}

if ( files.includes("icon.png") ) {
  checkpath(info.icon.ios.path)
  checkpath(info.icon.android.path)
  checkpath(info.icon.windows.path)
  checkpath(info.store.ios.path)
  checkpath(info.store.android.path)
  checkpath(info.store.windows.path)
  createDefaultIcon()
  for (let i = 0; i < info.icon.ios.sizes.length;      i++) { createIcon(info.icon.ios.path,      info.icon.ios.sizes[i],      'ios')      }
  for (let i = 0; i < info.icon.android.sizes.length;  i++) { createIcon(info.icon.android.path,  info.icon.android.sizes[i],  'android')  }
  for (let i = 0; i < info.icon.windows.sizes.length;  i++) { createIcon(info.icon.windows.path,  info.icon.windows.sizes[i],  'winphone') }
  for (let i = 0; i < info.store.ios.sizes.length;     i++) { createIcon(info.store.ios.path,     info.store.ios.sizes[i],     'ios')      }
  for (let i = 0; i < info.store.android.sizes.length; i++) { createIcon(info.store.android.path, info.store.android.sizes[i], 'android')  }
  for (let i = 0; i < info.store.windows.sizes.length; i++) { createIcon(info.store.windows.path, info.store.windows.sizes[i], 'winphone') }
}

if ( !files.includes("splash.png") ) {
  checkpath(info.splash.ios.path)
  checkpath(info.splash.android.path)
  checkpath(info.splash.windows.path)
  createDefaultSplash()
  for (let i = 0; i < info.splash.ios.sizes.length; i++)     { createSplash(info.splash.ios.path,     info.splash.ios.sizes[i],     'ios')      }
  for (let i = 0; i < info.splash.android.sizes.length; i++) { createSplash(info.splash.android.path, info.splash.android.sizes[i], 'android')  }
  for (let i = 0; i < info.splash.windows.sizes.length; i++) { createSplash(info.splash.windows.path, info.splash.windows.sizes[i], 'winphone') }
}

function checkpath(dirpath) {
  let path_parts = dirpath.split('/')
  let current_path = path
  for ( var i = 0; i < path_parts.length; i++ ) {
    current_path += "/"+path_parts[i]
    if ( !fs.existsSync( current_path ) ) {
      fs.mkdirSync(current_path, 0744);
    }
  }
}

function createDefaultIcon() {
  let from = path+"/icon.png"
  let dest = "www/icon.png"
  processing++
  xml += '<icon src="'+dest.replace('www/','')+'">\n'
  gm( from )
  .resize( 512, 512, "!" )
  .write( dest, function(err,data2,data2,command) {
    console.log(command)
    if ( --processing == 0 ) { fs.writeFileSync( path+"/iconsplash.xml", xml, "UTF-8" ) }
  })
}

function createDefaultSplash() {
  let from = path+"/icon.png"
  let dest = "www/splash.png"
  processing++
  xml += '<splash src="'+dest.replace('www/','')+'">\n'
  let size = Math.floor(Math.min(512,1024) * 0.8)
  gm( from )
  .resize( size, size, "!" )
  .gravity('Center')
  .background('#ffffff')
  .extent( 512, 1024 )
  .write( dest, function(err,data2,data2,command) {
    console.log(command)
    if ( --processing == 0 ) { fs.writeFileSync( path+"/iconsplash.xml", xml, "UTF-8" ) }
  })
}

function createIcon( destination, size_data, platform ) {
  let from = path+"/icon.png"
  let dest = destination+"/"+size_data.name+".png"
  processing++
  switch ( platform ) {
    case 'android':
      if ( size_data.qualifier != undefined ) {
        xml += '<icon platform="android" qualifier="'+size_data.qualifier+'" src="'+dest.replace('www/','')+'">\n';
        break;
      }
    default: xml += '<icon platform="'+platform+'" width="'+size_data.width+'" height="'+size_data.height+'" src="'+dest.replace('www/','')+'">\n'; break;
  }
  if ( size_data.width != size_data.height ) {
    let size = Math.floor(Math.min(size_data.width,size_data.height) * 0.8)
    gm( from )
    .resize( size, size, "!" )
    .gravity('Center')
    .background('#ffffff')
    .extent( size_data.width, size_data.height )
    .write( dest, function(err,data2,data2,command) {
      console.log(command)
      if ( --processing == 0 ) { fs.writeFileSync( path+"/iconsplash.xml", xml, "UTF-8" ) }
    })
  } else {
    gm( from )
    .resize( size_data.width, size_data.height, "!" )
    .write( dest, function(err,data2,data2,command) {
      console.log(command)
      if ( --processing == 0 ) { fs.writeFileSync( path+"/iconsplash.xml", xml, "UTF-8" ) }
    })
  }
}

function createSplash( destination, size_data, platform ) {
  let from = path+"/icon.png"
  let dest = destination+"/"+size_data.name+".png"
  processing++
  switch ( platform ) {
    case 'android' : xml += '<splash platform="'+platform+'" qualifier="'+size_data.qualifier+'" src="'+dest.replace('www/','')+'">\n'; break;
    default        : xml += '<splash platform="'+platform+'" width="'+size_data.width+'" height="'+size_data.height+'" src="'+dest.replace('www/','')+'">\n';
  }
  let size = Math.floor(Math.min(size_data.width,size_data.height) * 0.8)
  gm( from )
  .resize( size, size, "!" )
  .gravity('Center')
  .background('#ffffff')
  .extent( size_data.width, size_data.height )
  .write( dest, function(err,data2,data2,command) {
    console.log(command)
    if ( --processing == 0 ) { fs.writeFileSync( path+"/iconsplash.xml", xml, "UTF-8" ) }
  })
}

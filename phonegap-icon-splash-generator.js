const gm          = require("gm").subClass({ imageMagick: true })
const fs          = require("fs")
const path        = process.argv[1].replace(/\\/,'/').replace("/phonegap-icon-splash-generator.js","").replace("\\phonegap-icon-splash-generator.js","")

var xml = ""
var log = ""
var images = {}
var sorting = 0
var processing = 0
var sizes = JSON.parse(fs.readFileSync(path+"/sizes.json", "UTF-8"))

function ImageProcessor( path, type, source ) {
  const self = this

  this.path     = path+"/resources/source/"+type+"/"+source
  this.gm       = gm(this.path)
  this.events   = {}
  this.type     = type
  this.source   = source
  
  this.gm.identify(function(nan, props) {
    self.background = props['Background color']
    self.format     = props.format
    self.width      = props.size.width
    self.height     = props.size.height
    self.ratio      = self.width / self.height
    self.gcd = gcd( self.width, self.height )
    self.aspect_ratio = getAspectRatio( self.width, self.height )
    self.resolution   = Number(props["Number pixels"].replace("K","000").replace("M","000000"))
    self.trigger('init')
  })

  this.gm.quality(100)
}
ImageProcessor.prototype.trigger = function(type, params) {
  if ( typeof this.events[type] == 'undefined' ) { return; }
  for (var i = this.events[type].length - 1; i >= 0; i--) {
    var event = this.events[type][i]
    if ( event.callback.call(this, params) || event.temp ) { this.events[type].splice(i,1) }
  }
}
ImageProcessor.prototype.on = function(type, callback, id) {
  if ( typeof this.events[type] == 'undefined' ) { this.events[type] = [] }
  this.events[type].push({ callback: callback, id: id })
}
ImageProcessor.prototype.once = function(type, callback, id) {
  if ( typeof this.events[type] == 'undefined' ) { this.events[type] = [] }
  this.events[type].push({ callback: callback, id: id, temp: true })
}

function gcd(a,b) {
  if ( b == 0 ) { return a }
  return gcd( b, a % b )
}
function getAspectRatio(width, height) {
  var r = gcd(width, height)
  return (width/r).toString() + ":" + (height/r).toString()
}

var types = fs.readdirSync(path+"/resources/source")
for ( var type of types ) {
  var sources = fs.readdirSync(path+"/resources/source/"+type)
  for ( var source of sources ) {
    sorting++
    console.log("Found source", type, source)
    var ip = new ImageProcessor( path, type, source )
    ip.once('init', function(_type){
      return function() {
        sortImages(this, _type)
        if ( --sorting == 0 ) {  processImages(images) }
      }
    }(type))
  }
}

function sortImages( image_processor, type ) {
  if ( typeof images[type] == "undefined" ) { images[type] = [] }
  for (var i = images[type].length - 1; i >= 0; i--) {
    if (images[type][i].aspect_ratio === image_processor.aspect_ratio) {
      if ( image_processor.resolution > images[type][i].resolution ) {
        console.log("Discarding",images[type][i].type,images[type][i].width+"x"+images[type][i].height,"for higher res image")
        images[type].splice(i, 1)
        break;
      } else {
        return;
      }
    }
  }
  console.log("Using",image_processor.type,image_processor.width+"x"+image_processor.height)
  images[type].push(image_processor)
}

function processImages(images) {
  for ( var type in sizes ) {
    for ( var platform in sizes[type] ) {
      for ( var size of sizes[type][platform].sizes ) {
        if ( typeof images[type] != "undefined" ) {
          var ar = getAspectRatio( size.width, size.height )
          var found = false
          for ( var image of images[type] ) {
            if ( image.aspect_ratio == ar ) {
              found = true
              processImage( size, sizes[type][platform].path, image, type, platform )
              break;
            }
          }
          if ( !found ) {
            console.log("WARN: Missing "+type+" "+size.width+"x"+size.height+" ("+ar+") for "+platform+" "+size.name)
            if ( true ) {
              var image = getBestFitProcessor( images[type], size.width, size.height, type )
              if ( !image ) {
                console.log("ERR: No appropriate images found")
              } else {
                console.log("Using best fit", image.width+"x"+image.height, "for", size.width, size.height)
                switch ( type ) {
                  case "icon" :
                  case "store": extendImage( size, sizes[type][platform].path, image, type, platform ); break;
                  default     : cutImage( size, sizes[type][platform].path, image, type, platform );    break;
                }
              }
            }
          }
        }
      }
    }
  }
}

function processImage( size, path, image, type, platform ) {
  checkPath(path)
  var dest = path+"/"+size.name+".png"
  processing++
  switch ( type ) {
    case 'icon':
    case 'splash':
      switch ( platform ) {
        case "windows": xml += '<'+type+' platform="winphone" width="'+size.width+'" height="'+size.height+'" src="'+dest.replace("www/","")+'"></'+type+'>\n'; break;
        case "android": xml += '<'+type+' platform="android" qualifier="'+size.qualifier+'" width="'+size.width+'" height="'+size.height+'" src="'+dest.replace("www/","")+'"></'+type+'>\n'; break;
        default       : xml += '<'+type+' platform="'+platform+'" width="'+size.width+'" height="'+size.height+'" src="'+dest.replace("www/","")+'"></'+type+'>\n';
      }
    break;
  }
  gm(image.path)
    .quality(100)
    .gravity('Center')
    .scale(size.width, size.height)
    .write( dest, function(err,data2,data2,command) {
      console.log("Image created", dest, "("+size.width+"x"+size.height+")")
      log+=command+"\n"
      if ( err ) { log+=err+"\n" }
      if ( --processing == 0 ) {
        fs.writeFileSync("iconsplash.xml",xml)
        fs.writeFileSync("iconsplash.log",log)
      }
    })
}
function extendImage( size, path, image, type, platform ) {
  checkPath(path)
  var dest = path+"/"+size.name+".png"
  var icon = {
    width : image.width,
    height: image.height
  }
  if ( icon.width > size.width ) {
    var r = size.width/icon.width
    icon.width = Math.floor(icon.width*r)
    icon.height = Math.floor(icon.height*r)
  }
  if ( icon.height > size.height ) {
    var r = size.height/icon.height
    icon.width = Math.floor(icon.width*r)
    icon.height = Math.floor(icon.height*r)
  }
  processing++
  switch ( type ) {
    case 'icon':
    case 'splash':
      switch ( platform ) {
        case "windows": xml += '<'+type+' platform="winphone" width="'+size.width+'" height="'+size.height+'" src="'+dest.replace("www/","")+'"></'+type+'>\n'; break;
        case "android": xml += '<'+type+' platform="android" qualifier="'+size.qualifier+'" width="'+size.width+'" height="'+size.height+'" src="'+dest.replace("www/","")+'"></'+type+'>\n'; break;
        default       : xml += '<'+type+' platform="'+platform+'" width="'+size.width+'" height="'+size.height+'" src="'+dest.replace("www/","")+'"></'+type+'>\n';
      }
    break;
  }
  gm(image.path)
    .resize( icon.width, icon.height )
    .gravity("Center")
    .alpha('remove')
    .background(image.background)
    .extent( size.width, size.height )
    .write( dest, function(err,data2,data2,command) {
      console.log("Image created", dest, "("+size.width+"x"+size.height+")")
      log+=command+"\n"
      if ( err ) { log+=err+"\n" }
      if ( --processing == 0 ) {
        fs.writeFileSync("iconsplash.xml",xml)
        fs.writeFileSync("iconsplash.log",log)
      }
    })
}

function cutImage( size, path, image, type, platform ) {
  checkPath(path)
  var dest = path+"/"+size.name+".png"
  processing++
  switch ( type ) {
    case 'icon':
    case 'splash':
      switch ( platform ) {
        case "windows": xml += '<'+type+' platform="winphone" width="'+size.width+'" height="'+size.height+'" src="'+dest.replace("www/","")+'"></'+type+'>\n'; break;
        case "android": xml += '<'+type+' platform="android" qualifier="'+size.qualifier+'" width="'+size.width+'" height="'+size.height+'" src="'+dest.replace("www/","")+'"></'+type+'>\n'; break;
        default       : xml += '<'+type+' platform="'+platform+'" width="'+size.width+'" height="'+size.height+'" src="'+dest.replace("www/","")+'"></'+type+'>\n';
      }
    break;
  }
  gm(image.path)
    .crop( size.width, size.height, (image.width-size.width)/2, (image.height-size.height)/2 )
    .gravity("Center")
    .alpha('remove')
    .write( dest, function(err,data2,data2,command) {
      console.log("Image created", dest, "("+size.width+"x"+size.height+")")
      log+=command+"\n"
      if ( err ) { log+=err+"\n" }
      if ( --processing == 0 ) {
        fs.writeFileSync("iconsplash.xml",xml)
        fs.writeFileSync("iconsplash.log",log)
      }
    })
}

function checkPath(dirpath) {
  var path_parts = dirpath.split('/')
  var current_path = path
  for ( var i = 0; i < path_parts.length; i++ ) {
    current_path += "/"+path_parts[i]
    if ( !fs.existsSync( current_path ) ) {
      fs.mkdirSync(current_path, 0744);
    }
  }
}

function getBestFitProcessor(images, width, height) {
  if ( images == undefined ) { return }
  var ratio_diff = 1000
  var index = -1
  var scl = width/height
  for (var i = 0; i < images.length; i++) {
    var img = images[i]
    if ( img.type == "icon" || img.type == "store" || (img.width > width && img.height > height) ) {
      var diff = Math.abs(scl-img.ratio)
      if ( diff < ratio_diff ) {
        ratio_diff = diff
        index = i
      }
    }
  }
  if ( index != -1 ) { return images[index] }
}
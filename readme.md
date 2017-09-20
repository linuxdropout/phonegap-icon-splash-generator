npm https://www.npmjs.com/package/phonegap-icon-splash-generator

git https://github.com/dylan0150/phonegap-icon-splash-generator

Auto generate splash screens and icons for a phongap ionic cordova 1.0 project from an icon.png. Including a splash.png will also generate splash screens from that image.

## Installation

```sh
npm install phonegap-icon-splash-generator
cp node_modules/phonegap-icon-splash-generator/phonegap-icon-splash-generator.js .
cp node_modules/phonegap-icon-splash-generator/sizes.json .
```

## Usage:

1. Put 'icon.png' in the root of the folder. This should be 1024x1024.
2. Put 'splash.png' in the root of the folder. This should be 640x1136
3. Run this command:

```sh
node phonegap-icon-splash-generator.js
```

*Author - Dylan Hanner*

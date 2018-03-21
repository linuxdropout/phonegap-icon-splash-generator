npm https://www.npmjs.com/package/phonegap-icon-splash-generator

git https://github.com/dylan0150/phonegap-icon-splash-generator

Auto generate splash screens and icons for a phongap ionic cordova 1.0 project from an icon.png. Including a splash.png will also generate splash screens from that image.

## Installation

```sh
npm install phonegap-icon-splash-generator
cp node_modules/phonegap-icon-splash-generator/phonegap-icon-splash-generator.js .
cp node_modules/phonegap-icon-splash-generator/sizes.json .
```


## Usage (v2.0.0+):

1. Create a resources/sources folder in the root of your project.
2. Create store, icon, and splash folders inside sources.
3. Place any splash/icon/store images in the relevant folders.
4. The more aspect ratios you have the better, ideally 2:3, 3:4, 3:5, 4:5, 5:8, 1:2 in as high res as possible. (landscape also supported) file names do not matter.
5. Run below command.
6. Copy and paste the contents of iconsplash.xml into your config.xml file. You'll also want to add a default icon.png and splash.png

```sh
node phonegap-icon-splash-generator.js
```


## Planned Features

1. ~~Support for landscape splash screens other than just creating one from the given icon.~~ v2 (as many as you want can be given)
2. ~~Option to provide background colour other than just white.~~ v2 (now uses image background if present)

*Author - Dylan Hanner*


## Old Versions (< v2.0.0):

1. Put 'icon.png' in the root of the folder. This should be 1024x1024.
2. Put 'splash.png' in the root of the folder. This should be 640x1136
3. Run below command.
4. Copy and paste the contents of iconsplash.xml into your config.xml file.

```sh
node phonegap-icon-splash-generator.js
```
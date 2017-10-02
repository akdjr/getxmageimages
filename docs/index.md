# getxmageimages
This is a command line tool to grab images from scryfall.com for use with Xmage.  I wrote this to quickly gather images as the built in image funcationality and many of the suggestions on the Xmage reddit sidebar were too annoying for me to use :p

NOTE: if you're using this tool, make sure that the check for new images at startup and store images in zip files options are DISABLED under preferences -> images.

# How to use

## Windows

In a terminal of your choice, simply type the following:

````
./getimages-win.exe <3/4 letter set code>
````

For example, to grab all images for Ixalan, type the following:

````
./getimages-win.exe XLN
````

This will download all images to a folder named XLN in the same folder that the tool is located in.  From there, all you need to do is copy the appropriate set folders to your XMage images folder (usually xmage\mage-client\plugins\images)

You can also type the following to see usage:

````
./getimages-win.exe help
````

## MacOS

In a terminal of your choice, simply type the following:

````
./getimages-macos <3/4 letter set code>
````

For example, to grab all images for Ixalan, type the following:

````
./getimages-macos XLN
````

This will download all images to a folder named XLN in the same folder that the tool is located in.  From there, all you need to do is copy the appropriate set folders to your XMage images folder (usually xmage\mage-client\plugins\images)

You can also type the following to see usage:

````
./getimages-macos help
````

## Liunx

In a terminal of your choice, simply type the following:

````
./getimages-linux <3/4 letter set code>
````

For example, to grab all images for Ixalan, type the following:

````
./getimages-linux XLN
````

This will download all images to a folder named XLN in the same folder that the tool is located in.  From there, all you need to do is copy the appropriate set folders to your XMage images folder (usually xmage\mage-client\plugins\images)

You can also type the following to see usage:

````
./getimages-linux help
````

# How to build

This tool uses the pkg plugin to package the tool as a binary.  To set up your environment and build the package, use the following commands:

````
npm install -g pkg
npm install
pkg getimages.js --out-path bin
````

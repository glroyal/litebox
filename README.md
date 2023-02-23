# LiteBox

> An Adaptive Density Graphical Photo Browser powered by Computed HTML


![litebox.jpg](/usr/local/var/www/litebox/litebox.jpg)

## Overview

**LiteBox** is a Graphical Photo Browser that renders photos with the finest practical image detail.

**Computed HTML** is a programming model in which the tags describing a complex layout are compiled in RAM, then passed to the browser's HTML interpreter to render in a single paint.

**Adaptive Density** is a strategy for optimizing image quality by adjusting the download resolution for each image to match the pixel density of the screen it's being displayed on. 

## You're Soaking In It

[**View the live demo**](http://self) on your dektop, notebook, tablet and phone. The Q (quality) score for almost all photos on almost all devices will be 100%.

Lower figures indicate there weren't enough pixels in the image to fill all the hardware pixels, and the browser upsampled the image to cover the gap. The visual quality will be no worse than standard, and possibly a bit better.

## Make It Yours

* Clone or download the repo

* Drag the file index.html into an open browser window

* Absorb what is useful, discard what is useless, and add what is specifically your own 

## Computed HTML

There is an HTML element property called [**innerHTML**]([Element.innerHTML - Web APIs | MDN](https://developer.mozilla.org/en-US/docs/Web/API/Element/innerHTML)), which allows you to read or write tranches of the DOM as a string of HTML tags.

You might have used it to do a live update of a widget or a time and date display, but it's possible to generate the entire front end by assembling tags in RAM and pushing them through innerHTML to render inside an empty DIV. 

InnerHTML is orders of magnitude faster than JavaScript DOM because the browser's HTML interpreter is optimized for rendering layouts from streams of HTML tags.

## Adaptive Density

High-definition mobile video displays range from 1x (HD or below), 2x (Retina), 3x (Super Retina), 4x (xxxhdpi), and many intermediate sizes between.

The HTML `srcset` attribute is based on the assumption that you will prerender all assets at different resolutions to accomodate devices with different pixel densities, but this is impractical for large and/or dynamic collections of media.

Adaptive Density is a strategy for finding the greatest image pixel density below the device pixel density that matches both the picture and the screen at the requested presentation size.

Photos can then be downloaded from a scaling image server at the best resolution for the display it will be viewed on.

```javascript
function compute_adr(id, aspect, length) {

    // compute adaptive density ratio

    // id = photo id from catalog
    // aspect = 0=landscape, 1=portrait
    // length = rendition size

    var adr = devicePixelRatio; 

    while(Math.floor(adr) > 1 && length * adr > catalog[id][aspect]) {
        adr -= 1;
    }

    return adr;
}
```

Adaptive density is not computed for any image the same size or smaller than the presentation size. The picture is downloaded at its natural resolution and the browser upsamples the image to match the display density. 

Otherwise, if the Device Pixel Ratio is 4*x* (16:1) but there aren't enough pixels in the image for a 4*x* rendition at the requested size, ADR will consider 3*x* (9:1), and 2*x* (4:1) before defaulting to 1*x* (1:1).

For each image, a *Q* (quality) score is computed to represent the fraction of hardware pixels versus image pixels in the rendition.

> *Q = (aspect * adr / aspect * dpr) * 100, where **aspect** is the greater of the width or height of the rendition, **adr** is the computed Adaptive Density Ratio, and **dpr** is the hardware Device Pixel Ratio.*

100 means that there is an image pixel for every display pixel. Lower scores indicate some amount of upscaling was required to fill the rendition. In some cases the ADR may be greater than 1 but less than the DPR, yielding better-than-standard definition.

Bandwidth consumption is conservative but never stingy. High-definition displays show high-definition photos, but standard-definition displays don't waste bandwidth on picture detail they can't resolve. 

### Lorem Picsum

**[Lorem Picsum](https://picsum.photos/)** is an image placeholder service that allows you to download arbitrary photos at arbitrary sizes to demonstrate the placement of images in a layout.

Information about Picsum placeholders is stored in an array called the *catalog*:

```javascript
const catalog = [
    // [width, height, picsum ID, author ID, unsplash ID, row]
    [5000,3333,396,482,"ko-wCySsj-I",0],
    [4240,2832,667,283,"XMcoTHgNcQA",1],
    ...
    [3872,2592,348,40,"mVhd5QVlDWw",892]
];
```

*Width, Height, Picsum ID* = data to access the photo

*Author ID* = Index of the author's name in the author table for photo credit

*Unsplash ID* = URL path to the photo on [**Unsplash**](https://unsplash.com/about), an archive of free-to-use high-resolution photos

*Row* = the ordinal number of the item in the catalog array

## 



## Wisdom

*"Anyone can build a fast processor. The trick is to build a fast system."*
-- Seymour Cray

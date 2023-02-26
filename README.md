# LiteBox

> An Adaptive Density Graphical Photo Browser powered by Computed HTML

![litebox.jpg](litebox.jpg)

## Overview

**LiteBox** is a Graphical Photo Browser that renders photos with the finest practical image detail on all devices. 

It's written in **Computed HTML**, a programming model where the tags describing a layout are compiled in RAM, then passed to the browser's HTML interpreter to render.

It introduces **Adaptive Density**, a strategy for optimizing image quality by adjusting the download resolution for each image to match the pixel density of the screen it's being displayed on. 

## You're Soaking In It

[**View the Live Demo**](https://glroyal.github.io/litebox/) on your dektop, notebook, tablet and phone. The Q (quality) score for almost all photos on almost all devices will be 100%.

Lower figures indicate there weren't enough pixels in the image to fill all the hardware pixels, and the browser upsampled the image to cover the gap. The visual quality will be no worse than standard, and possibly a bit better.

## Make It Yours

* Clone or download the repo

* Drag the file index.html into an open browser window

* *"Absorb what is useful, discard what is useless, and add what is specifically your own"* 
  -- Bruce Lee

## Computed HTML

There is an element property called [**innerHTML**]([Element.innerHTML - Web APIs | MDN](https://developer.mozilla.org/en-US/docs/Web/API/Element/innerHTML)), which reads or writes tranches of the DOM as a string of HTML tags.

InnerHTML is orders of magnitude faster than JavaScript DOM because the browser's HTML interpreter is optimized for generating layouts from streams of markup tags.

LiteBox weighs just 67K, but can render its catalog of 893 photos as thumbnails in 7  ms.

## Adaptive Density

Adaptive Density is a common sense approach to image optimization.

The objective is to fill all of the screen pixels in a rendition with image pixels, either by downsampling an oversized image or upsampling an undersized image to match the device pixel ratio (DPR) of the display it's being viewed on, for each rendition of that image (thumbnail or fullscreen).

**Table 1: geometries of a small sample of video displays**

| device                    | resolution | dpr  | ppi | viewport  |
| ------------------------- | ---------- | ---- | --- | --------- |
| 27" PC monitor            | 1920x1080  | 1.00 | 82  | 1920x1080 |
| 9.7" iPad                 | 768x1024   | 1.00 | 132 | 768x1024  |
| 27" iMac 2020             | 2560x1440  | 2.00 | 109 | 1280x720  |
| 12.9" iPad Pro            | 2048x2732  | 2.00 | 264 | 1024x1366 |
| 3.5" iPhone 4             | 640x960    | 2.00 | 326 | 320x480   |
| 5.8" Pixel 4a             | 1080x2340  | 2.75 | 443 | 393x851   |
| 6.1" iPhone 13            | 1170x2532  | 3.00 | 460 | 390x844   |
| 6.8" Galaxy S23 Ultra     | 1440x3088  | 4.00 | 501 | 360x772   |
| 14.6" Galaxy Tab S8 Ultra | 1848x2960  | 4.00 | 240 | 462x740   |

**Listing 1: adaptive density ratio**

```javascript
function compute_adr(id, p) {

    // compute adaptive density ratio

    // id = photo id from catalog
    // p = presentation size of image 

    var 
        axis = Math.max(catalog[id][WIDTH],catalog[id][HEIGHT]),
        adr = Math.ceil(devicePixelRatio); // ignore fractional pixels
    
    // If the presentation size * adr is larger than the image,
    // subtract 1 from the adr and try again 

    while(adr > 1 && p * adr > catalog[id][axis]) {
        adr -= 1;
    }

    return adr;
}
```

Adaptive density is not computed for any image the same size or smaller than the presentation size. The picture is downloaded at its natural resolution and the browser upsamples the image to match the display density. 

If the Device Pixel Ratio is 4, but there aren't enough pixels in the image for a 4x rendition at the requested size, ADR will consider 3x and 2x  before defaulting to 1x.

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

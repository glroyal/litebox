/***************************************************************************
 *
 *   LiteBox
 *   An Adaptive Density Graphical Photo Browser written in Computed HTML
 *   © Copyright Gary Royal 2022, 2023
 *
 *   This program is free software; you can redistribute it and/or modify
 *   it under the terms of the GNU General Public License as published by
 *   the Free Software Foundation; either version 2 of the License, or
 *   (at your option) any later version.
 *
 *   This program is distributed in the hope that it will be useful,
 *   but WITHOUT ANY WARRANTY; without even the implied warranty of
 *   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 *   GNU General Public License for more details.
 *
 ***************************************************************************/

const start = Date.now();

// globals

var
    last_width, columns_per_row, total_gutter_width, max_img_width, render_width, gallery_width, left_offset,page_length, total_pages, page_number, column_height, last_n;

var
    window_width, window_height, scrollbar_width, viewport_width;

const
    responsive_columns = [0,0,2,2,2,2,3,3,4,4,5,5,5,5,6,6,7,7,8,8,9],
    gutter_size = 8,
    alt_max_width = 192,
    dpr = devicePixelRatio,
    WIDTH=0, HEIGHT=1, ID=2, AUTH=3, UNSPL=4, ROW=5, // pointers into the catalog
    no=0, yes=1;

// preferences

const
    PAGINATE = no,
    DOWNLOAD_LIMIT = 0;
   // PAGE_LENGTH = catalog.length;

if(DOWNLOAD_LIMIT) {
    catalog = catalog.slice(0,DOWNLOAD_LIMIT-1);
}



observer = lozad();


function get_window_geometry() {

    window_width = function() {
        var x = 0;
        if (self.innerHeight) {
            x = self.innerWidth;
        } else if (document.documentElement && document.documentElement.clientHeight) {
            x = document.documentElement.clientWidth;
        } else if (document.body) {
            x = document.body.clientWidth;
        }
        return x;
    }(),

    window_height = function() {
        var y = 0;
        if (self.innerHeight) {
            y = self.innerHeight;
        } else if (document.documentElement && document.documentElement.clientHeight) {
            y = document.documentElement.clientHeight;
        } else if (document.body) {
            y = document.body.clientHeight;
        }
        return y;
    }(),

    scrollbar_width = function() {
        // Creating invisible container
        const outer = document.createElement('div');
        outer.style.visibility = 'hidden';
        outer.style.overflow = 'scroll'; // forcing scrollbar to appear
        outer.style.msOverflowStyle = 'scrollbar'; // needed for WinJS apps
        document.body.appendChild(outer);

        // Creating inner element and placing it in the container
        const inner = document.createElement('div');
        outer.appendChild(inner);

        // Calculating difference between container's full width and the child width
        const scrollbar_width = (outer.offsetWidth - inner.offsetWidth);

        // Removing temporary elements from the DOM
        outer.parentNode.removeChild(outer);

        return scrollbar_width;
    }();

    viewport_width = window_width - scrollbar_width;
}


function init() {

    last_width = viewport_width,

    columns_per_row = (viewport_width < 300) ? 1 : ((viewport_width > 2100) ? 12 : responsive_columns[Math.floor(viewport_width / 100)]);

    total_gutter_width = (columns_per_row + 1) * gutter_size,

    max_img_width = (Math.floor((viewport_width - total_gutter_width) / columns_per_row) * 4) / 4,

    render_width = (max_img_width >= alt_max_width) ? alt_max_width : max_img_width,

    gallery_width = (render_width * columns_per_row) + total_gutter_width,

    left_offset = Math.floor((viewport_width - gallery_width) / 2);

    //

//    page_length = Math.ceil(window_height / render_width) * columns_per_row * 2,

    page_length = (PAGINATE) ? 56 : catalog.length,

    total_pages = Math.ceil(catalog.length / page_length),

    page_number = 0,

    column_height = new Array(columns_per_row);

    column_height.fill(gutter_size);
}


function debounce(func) {

    // pause execution while window is being dragged

    var timer;

    return function(event) {
        if(timer) clearTimeout(timer);
        timer = setTimeout(func,100,event);
    };
}


window.addEventListener("resize",debounce(function(e){

    // re-render gallery after resize or orientation change

    get_window_geometry();

    if (viewport_width != last_width) {

         $('gallery').innerHTML='';
         init();

        if($('lightbox').style.display == 'block') {
            lightbox_open(last_n);
        }

        auto_paginate();
    }
}));


function compute_adr(id, aspect, length) {

    // compute adaptive density ratio

    var adr = dpr;

    while(Math.floor(adr) > 1 && length * adr > catalog[id][aspect]) {
        adr -= 1;
    }

    return adr;
}


function display_adr(width, height, adr) {

    // percentage of screen pixels filled by image pixels
    // under 100 = image upsampled by browser

    return Math.max(width*adr,height*adr) / Math.max(width*dpr,height*dpr) * 100;
}


function $(el) {

    // that handy $('foo') shortcut thing

    try {
        return (typeof el == 'string') ? document.getElementById(el) : el;
    } catch (e) {
        if (debug) {
            alert(el);
        }
    }
}


function fetch_page() {

    // fetch the next page from the catalog

    var ll, rr;

    if(page_number < total_pages) {

        ll = (page_number * page_length), rr = ll + page_length - 1;

        return catalog.slice(ll, rr).map(function(value,index) {
            return value[ROW];
        });

    } else {
        return [];
    }
}


function auto_paginate() {

    const start = Date.now();

    // stream a page of thumbnail cards to the browser

    if(total_pages > 0) {

        var list = fetch_page();
        //console.log(`list len=${list.length}`);

        if(list.length > 0) {

            var adr,
                render_height,
                image,
                i, // current image
                j, // current column
                chtml = [],
                el;

            // For each photo in the list,

            for(i = 0; i < list.length; i++) {

                // find the column with the shortest height,

                j = column_height.indexOf(Math.min(...column_height)),

                // compute the adaptive density ratio,

                adr = (catalog[list[i]][WIDTH] <= render_width) ? 1 : compute_adr(list[i],WIDTH,render_width);

                // and compile a thumbnail card.

                render_height = Math.round((catalog[list[i]][HEIGHT] / catalog[list[i]][WIDTH]) * render_width, 0);

                chtml[i] = `<div class="lozad brick" style="top:${
                    column_height[j]
                }px;left:${
                    left_offset + gutter_size + (j * (render_width + gutter_size))
                }px;width:${
                    render_width
                }px;height:${
                    render_height
                }px;background-image:url('https://picsum.photos/id/${
                    catalog[list[i]][ID]
                }/${
                    Math.floor(render_width * adr)
                }/${
                    Math.floor(render_height * adr)
                }');" onclick="lightbox_open(${
                    list[i]
                });"><div class="brick-id">${
                    display_adr(render_width,render_height,adr)
                }</div></div>`;

                // adjust the column height and continue with the next picture

                column_height[j] += render_height + gutter_size;
            }

            // submit the page of thumbnails to the HTML interpreter

            el = document.createElement('div');
            el.innerHTML = chtml.join('');
            $('gallery').appendChild(el);

            //const end = Date.now();
            //console.log(`Execution time: ${end - start} ms`);

            // and lazy-load the photos

            observer.observe();
        }
    }
}


function nfobox_close() {

    if($('nfobox').style.visibility == 'visible') {
        $('nfobox').style.visibility = 'hidden';
    }
}


function nfobox_toggle() {

    if($('nfobox').style.visibility == 'hidden') {
        $('nfobox').style.visibility = 'visible';
    } else {
        $('nfobox').style.visibility = 'hidden';
    }
}


function lightbox_close() {

    nfobox_close();
    $('img01').src = "1x1.gif";
    $('menu').style.visibility = 'hidden';
    $('lightbox').style.display = 'none';
}


function lightbox_open(n) { // n = ROW

    // Show the selected photo in an overlay window

    var
        img_width,
        img_height,
        img_src,
        aspect = catalog[n][WIDTH] / catalog[n][HEIGHT],
        adr;

        console.log('render');

    if(aspect < 1) {

        // portrait

        adr = (catalog[n][HEIGHT] <= window_height) ? 1 : compute_adr(n,HEIGHT,window_height);
        img_height = Math.floor(window_height * adr);
        img_width = Math.ceil(aspect * img_height);

    } else {

        // landscape

        adr = (catalog[n][WIDTH] <= window_width) ? 1 : compute_adr(n,WIDTH,window_width);
        img_width = Math.floor(window_width * adr);
        img_height = Math.ceil(img_width / aspect, 0);
    }

    $('nfobox').style.top = (window_height-260)/2 + 'px';
    $('nfobox').style.left = (window_width-260)/2 + 'px';

    $('nfobox').innerHTML = `
        <table>
            <tr><td class="stub">Picsum ID:</td><td class="col">#&thinsp;${catalog[n][ID]}</td></tr>
            <tr><td class="stub">Author:</td><td class="col"><a href="https://unsplash.com/photos/${catalog[n][UNSPL]}" target="_blank">${authors[catalog[n][AUTH]]}</a></td></tr>
            <tr><td class="stub">Image:</td><td class="col">${catalog[n][WIDTH]+'&thinsp;x&thinsp;'+catalog[n][HEIGHT]}</td></tr>
            <tr><td class="stub">Render:</td><td class="col">${Math.floor(img_width/adr) + '&thinsp;x&thinsp;' + Math.floor(img_height/adr)}</td></tr>
            <tr><td class="stub">Quality:</td><td class="col">${
                display_adr(img_width, img_height, adr)
            } %</td></tr>
        </table>`;

    $('img01').src = `https://picsum.photos/id/${catalog[n][ID]}/${img_width}/${img_height}`;

    $('lightbox').style.display = 'block';
    $('menu').style.visibility = 'visible';
    $('nfobox').style.visibility = 'hidden';

    last_n = n;
}



function crlf() {

    var
        top = column_height[column_height.indexOf(Math.max(...column_height))] + gutter_size,
        k;

    console.log(top);

    for(k=0; k<columns_per_row-1; k++) {
        column_height[k]  = top;
    }

    return top;
}

function echo(msg) {

    var top = crlf();
    var el = document.createElement('div');
    el.innerHTML = [`<p style="position:absolute;top:${top}px;left:${left_offset}px;">${msg}<br><br></p>`].join('');
    $('gallery').appendChild(el);
    crlf();
}


// And Here We Go

get_window_geometry();
init();

document.addEventListener("DOMContentLoaded", function(){

    // render the user interface

    $('form1').innerHTML = `
    <div id="browser">
        <header>
            <nav class="left">
                <span class="material-icons md-24 md-light md-inactive">menu</span>
                <span class="logo">LiteBox</span>
            </nav>
            <nav></nav>
            <nav></nav>
        </header>
        <div id="pga">
            <div id="gallery"></div>
        </div>
    </div>

    <div id="lightbox">
        <div id="imgdiv" class="cover" onclick="nfobox_toggle();">
            <img class="slide" id="img01" src="1x1.gif" onclick="">
        </div>
    </div>

    <div id="nfobox" style="top:${(window_height-260)/2}px;left:${(window_width-260)/2}px;" onclick="nfobox_toggle();"></div>

    <nav id="menu" class="menu" style="visibility:hidden;">
        <span class="material-icons md-24 md-light" onclick="nfobox_toggle();">info_outline</span>
        <span class="material-icons md-24 md-light" onclick="lightbox_close();">close</span>
    </nav>`;

    // fetch and render the next page on scroll

/*
    $('pga').addEventListener("scroll", function () {

        if(page_number >= 0) {

            if ($('pga').scrollHeight - $('pga').scrollTop === $('pga').clientHeight) {

                page_number++;
                // page_number = (page_number>(total_pages-1)) ? total_pages-1 : page_number;
                page_number = (page_number>(total_pages-1)) ? -1 : page_number;
                auto_paginate();
            }

        } else {

//           const end = Date.now();
//            echo(`${} thumbnails rendered in ${} ms`);
//             const end = Date.now();
//           console.log(`Execution time: ${end - start} ms`);

        }


    }, false);
*/

    auto_paginate(); // fetch and render the first page
    const end = Date.now();
    const t = end - start;
    const num = (Math.ceil(1000/t) * catalog.length).toLocaleString();
    const perflog = `Execution time = ${t} ms,<br> render speed ~= ${num} thumbs/sec`;
    console.log(perflog);
    echo(perflog);

});

(function(){
  const OVERLAY = 'ncc-image-checker-overlay';
  const URL = 'ncc-image-checker-url';
  const COMPACT ='ncc-image-checker-compact';

  function buildImagesOverlay(images) {
    let body = document.getElementsByTagName('body')[0];
    findImages(images).map(image => {
      let div = document.createElement('div');
      div.classList.add(OVERLAY);
      div.style.width = image.width + 'px';
      div.style.height = image.height + 'px';
      div.style.top = image.position.top;
      div.style.left = image.position.left;

      //if element small or medium
      div.setAttribute('title', image.url);

      if (image.width > 150 && image.height > 50) {
        if (image.height > 120) {
          let url = document.createElement('a');
          url.innerHTML = processUrl(image);
          url.setAttribute('href', image.url);
          url.setAttribute('target', '_blank');
          url.classList.add(URL);
          div.appendChild(url);
        }

        let renderedP = document.createElement('p');
        renderedP.innerHTML = `Display: ${ image.width } x ${ image.height }`;
        div.appendChild(renderedP);


        let naturalP = document.createElement('p');
        naturalP.innerHTML = `Natural: ${ image.naturalSize.width } x ${ image.naturalSize.height }`;
        div.appendChild(naturalP);

        let optimalP = document.createElement('p');
        let naturalArea = image.naturalSize.width * image.naturalSize.height;
        let renderArea = image.width * image.height * window.devicePixelRatio;
        optimalP.innerHTML = `Image coverage: ${ (naturalArea / renderArea * 100).toFixed(2) }%`;
        div.appendChild(optimalP);

        let sizeP = document.createElement('p');
        sizeP.innerHTML = `File Size: ${ image.size } KB`;
        div.appendChild(sizeP);
      } else {
        // some files listed here must be excluded
        div.classList.add(COMPACT);
      }

      //the end
      body.appendChild(div);
    });
  }

  function processUrl (image) {
    let safeSize = (image.width - 10) / 8;
    return image.url.length < safeSize * 2 ? image.url : image.url.substring(0, safeSize - 3) + '....' + image.url.substring(image.url.length - safeSize + 4, image.url.length);
  }

  // this is the last point element is a DOM element
  function findImages(domNodes) {
    let images = haveImages(domNodes);
    return images.map(element => {
      return {
        url: getUrl(element),
        size: (getSize(element) / 1024).toFixed(3),
        position: getElementTopLeft(element),
        height: element.offsetHeight,
        width: element.offsetWidth,
        naturalSize: getNaturalSize(element)
      };
    }).filter(image => !(!image.height || !image.width || (!image.position.top && !image.position.left)));
  }

  function haveImages(elementsArray) {
    return elementsArray.filter(elem => {
      let style = window.getComputedStyle(elem);

      if (style.visibility === "hidden") {
        return false;
      }

      if (elem.tagName === 'IMG') {
        return true;
      }

      if (style.backgroundImage) {
        let urlMatcher = /url\(("?http.*"?)\)/ig.exec(style.backgroundImage);

        if (urlMatcher && urlMatcher.length > 1) {
          return true;
        }
      }

      return false;
    }).filter(element => getUrl(element));
  }

  function getElementTopLeft(elem) {
    let location = {
      top: 0,
      left: 0
    };
    if ( elem.x && elem.y) {
      location.top = elem.y + 'px';
      location.left = elem.x + 'px';
    } else if (elem.offsetParent) {
      do {
        location.top += elem.offsetTop;
        location.left += elem.offsetLeft;
        elem = elem.offsetParent;
      } while (elem);
    }
    return location;
  }

  function getNaturalSize(element) {
    if (element.naturalWidth) {
      return {
        width: element.naturalWidth,
        height: element.naturalHeight
      };
    } else {
      let image = new Image();
      image.src = getUrl(element);

      return {
        width: image.naturalWidth,
        height: image.naturalHeight
      };
    }
  }

  function getSize(element) {
    let performanceEntry = performance.getEntriesByName(getUrl(element))[0];
    if (performanceEntry) {
      return performanceEntry.encodedBodySize;
    }
  }

  function getUrl(element) {
    if (element.src) {
      return element.src;
    }
    else {
      let bkg = window.getComputedStyle(element).backgroundImage;
      let URL_REGEX = /url\((.*)\)/;
      let url = URL_REGEX.exec(bkg);
      if (url) {
        return url[1].replace(/["]/g, '');
      }
    }
  }

  function collectionToArray(domCollection) {
    let array = [];

    for (let i = domCollection.length - 1; i >= 0; i--) {
      array[i] = domCollection[i];
    }

    return array;
  }

  window.NCC = window.NCC || {};

  window.NCC.imageChecker = {
      showImagesInfo: buildImagesOverlay,
      getImages: findImages,
      _collectionToArray: collectionToArray,
      _getUrl: getUrl,
      _getSize: getSize,
      _getNaturalSize: getNaturalSize,
      _getElementTopLeft: getElementTopLeft,
      _haveImages: haveImages,
      _processUrl: processUrl
  };
}());

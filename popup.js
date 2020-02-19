//TODO Image download or link

const options = {
  output: ['png', 'jpg', 'pdf'],
  cs: ['srgb'],
  c: ['pad'],
};

const base = {
  w: 1500,
  h: 1500,
  c: options.c[0],
  dn: 300,
  cs: options.cs[0],
  // pg: 1,
  output: options.output[0]
};

const handle = {
  w: document.querySelector('#width'),
  h: document.querySelector('#height'),
  dn: document.querySelector('#dpi'),
  c: document.querySelector('#crop-select'),
  cs: document.querySelector('#cs-select'),
  image: document.querySelector('#imageButt'),
  link: document.querySelector('#linkButt'),
  reset: document.querySelector('#reset'),
  out: document.querySelector('#output-select'),
  message: document.querySelector('#message')
  // pg: document.querySelector('#pages-select'),
  // secondary: document.querySelector('#secondary')
};


/**
 * Set initial values and popululate select options in DOM
 */
const initialize = () => {
  handle.w.value = base.w;
  handle.h.value = base.h;
  handle.dn.value = base.dn;
  handle.out.innerHTML = options.output.map(option => {
    return `<option ${option === base.output ? 'selected' : ''} value="${option}">${option}</option>`;
  });
  handle.cs.innerHTML = options.cs.map(option => {
    return `<option ${option === base.cs ? 'selected' : ''} value="${option}">${option}</option>`;
  });
  handle.c.innerHTML = options.c.map(option => {
    return `<option ${option === base.c ? 'selected' : ''} value="${option}">${option}</option>`;
  });
};


/**
 * Slices up the Salsify tab's url
 * @param {string} url 
 * @returns {{first:string, last:string}}
 */
const breakUrl = url => {
  const split = url.split('/');
  const first = split.slice(0, split.length - 1).join('/');
  const last = split[split.length - 1].split('.')[0];

  return { first, last };
};


/**
 * Transform broken url into the nice, clean url
 * @param {{first:string, last:string}} obj 
 * @returns {string} url
 */
const rebuildUrl = obj => {
  return `${obj.first}/c_${handle.c.value},w_${handle.w.value},h_${handle.h.value},dn_${handle.dn.value},cs_${handle.cs.value}/${obj.last}.${handle.out.value}`;
};


/**
 * Wrtite Text to Clipboard
 * @param {string} newClip 
 */
const addTextClipboard = newClip => {
  // console.log('newclip -- ', newClip);
  navigator.clipboard.writeText(newClip).then(() => {
    /* clipboard successfully set */
    /** Change name of button for user feedback  */
    handle.link.textContent = 'COPIED!';
    handle.link.classList = 'copied';

    /** Close popup to help Users get on with their lives */
    setTimeout(() => {
      window.close();
    }, 2000);


  }, () => {
    /* clipboard write failed */
    alert('Text could not be copied! See Perry');

  });
};


/**
 * Wrtite Image to Clipboard
 * https://web.dev/image-support-for-async-clipboard/
 * @param {string} newClip 
 */
const addImageClipboard = newClip => {
  try {
    // const imgURL = newClip;
    fetch(newClip).then(response => {

      return response.blob();
    }).then(blob => {

      navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob
        })
      ]).then(() => {
        /* clipboard successfully set */
        /** Change name of button for user feedback  */
        handle.image.textContent = 'COPIED!';
        handle.image.classList = 'copied';

        /** Close popup to help Users get on with their lives */
        setTimeout(() => {
          window.close();
        }, 2000);
      }, () => {
        /* clipboard write failed */
        alert('Image could not be copied! See Perry');

      });
    });

  } catch (e) {
    /* clipboard write failed */
    alert('Image could not be fetched! See Perry');
  }
};


/** 
 * Sets the event listener for primary button
*/
handle.image.onclick = function () {

  chrome.tabs.query({ 'active': true }, (tabs) => {
    //http://images.salsify.com/image/upload/s--qT0Rpe-g--/hc4jqgdybrvlb5hfmo5a
    const url = tabs[0].url;
    const brokenUrl = breakUrl(url);
    const goodUrl = rebuildUrl(brokenUrl);


    /** 
     * Get permission...
     * https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Interact_with_the_clipboard
    */
    navigator.permissions.query({ name: 'clipboard-write' }).then(result => {
      if (result.state == 'granted' ||
        result.state == 'prompt') {

        /* write to the clipboard now */
        addImageClipboard(goodUrl);
      } else {
        alert('Permissions issue. See Perry');
      }
    });

    /** Save for later */
    // chrome.windows.create({
    //   // url: chrome.extension.getURL('index.html')
    //   url: goodUrl,
    //   width: 1000,
    //   height: 1000,
    // });
  });
};


/** 
 * Sets the event listener for primary button
*/
handle.link.onclick = function () {

  chrome.tabs.query({ 'active': true }, (tabs) => {
    //http://images.salsify.com/image/upload/s--qT0Rpe-g--/hc4jqgdybrvlb5hfmo5a
    const url = tabs[0].url;
    const brokenUrl = breakUrl(url);
    const goodUrl = rebuildUrl(brokenUrl);


    /** 
     * Get permission...
     * https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Interact_with_the_clipboard
    */
    navigator.permissions.query({ name: 'clipboard-write' }).then(result => {
      if (result.state == 'granted' ||
        result.state == 'prompt') {

        /* write to the clipboard now */
        addTextClipboard(goodUrl);

      } else {
        alert('Permissions issue. See Perry');
      }
    });
  });
};

/** 
 * Sets event listener for reset button
*/
// handle.reset.onclick = () => {
//   console.log('reset');
//   initialize();
// };


/** Run on popup opening */
initialize();

handle.out.addEventListener('change', (e) => {
  console.log(e.target.value);
  const i = handle.image;
  console.dir(i);
  if (e.target.value === 'png') {

    handle.image.disabled = false;
    console.log('set disable to false');
  }
  else {
    console.log('set disable to true');
    handle.image.disabled = true;
  }
})

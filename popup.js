
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
  message: document.querySelector('#message'),
  debug: document.querySelector('#debug'),
  // pg: document.querySelector('#pages-select'),
};


/**
 * Set initial values and popululate select options in DOM
 */
const initialize = () => {

  window.removeEventListener('click', this);

  window.addEventListener('click', e => {
    let targetId = e.target.id;

    if (targetId === handle.link.id) {
      transformify(handle.link.id);
    } else if (targetId === handle.image.id) {
      transformify(handle.image.id);
    }
  });


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
 * Do the work here
 * @param {*} tagetId 
 */
const transformify = targetId => {

  chrome.tabs.query({ 'active': true }, tabs => {
    const brokenUrl = breakApartUrl(tabs[0].url);
    const rebuiltUrl = rebuildUrl(brokenUrl);

    /** Debuggin */
    console.log(tabs[0]);

    chrome.windows.getCurrent({ populate: true }, window => {
      console.log(window);
    });

    chrome.windows.getLastFocused({ populate: true }, window => {
      console.log(window);
    });

    /** end  */

    getPermission().then(() => {

      if (targetId === handle.link.id) {
        addTextClipboard(rebuiltUrl);
      }
      else if (targetId === handle.image.id) {
        addImageClipboard(rebuiltUrl);
      }

    });

  });
};


/**
 * Slices up the Salsify tab's url
 * sample url:  http://images.salsify.com/image/upload/s--qT0Rpe-g--/hc4jqgdybrvlb5hfmo5a
 * @param {string} url 
 * @returns {{first:string, last:string}}
 */
const breakApartUrl = url => {
  const split = url.split('/');
  let [protocol] = [...split].slice(0, 1); //copy and strip array
  const rest = [...split].slice(1, split.length - 1).join('/');
  const last = [...split][split.length - 1].split('.')[0];

  if (protocol === 'http:') {
    protocol = 'https:';
  }

  const first = [protocol, rest].join('/');

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
function addTextClipboard(newClip) {
  console.log('newclip -- ', newClip);

  navigator.clipboard.writeText(newClip)
    .then(() => {
      /* clipboard successfully set */

      /** Change name of button for user feedback  */
      handle.link.textContent = 'COPIED!';
      handle.link.classList = 'copied';

      /** Close popup to help Users get on with their lives; window is popup */
      // setTimeout(() => {
      //   window.close();
      // }, 2000);

    })
    .catch(err => {
      // This can happen if the user denies clipboard permissions:
      handle.link.textContent = 'ERROR';
      handle.link.classList = 'error';
      console.error('Could not copy text: ', err);
    });

}


/**
 * Wrtite Image to Clipboard
 * https://web.dev/image-support-for-async-clipboard/
 * @param {string} newClip 
 */
const addImageClipboard = newClip => {
  // try {
  // const imgURL = newClip;
  fetch(newClip).then(response => {

    return response.blob();
  })
    .then(blob => {

      navigator.clipboard.write([
        // eslint-disable-next-line no-undef
        new ClipboardItem({
          [blob.type]: blob
        })
      ])
        .then(() => {
          /* clipboard successfully set */
          /** Change name of button for user feedback  */
          handle.image.textContent = 'COPIED!';
          handle.image.classList = 'copied';

          /** Close popup to help Users get on with their lives */
          // setTimeout(() => {
          //   window.close();
          // }, 2000);

        })
        .catch(err => {
          /* clipboard write failed */
          handle.image.textContent = 'ERROR';
          handle.image.classList = 'error';
          alert('Image could not be copied!');
          console.error('Could not copy blob: ', err);
        });
    })
    .catch(err => {

      alert('Could not fetch');
      console.error('Image could not be fetched! ', err);
    });

  // } catch (e) {
  //   /* clipboard write failed */
  //   console.error(e);
  //   alert('Image could not be fetched! See Perry');
  // }
};


/** 
   * Get permission...
   * https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Interact_with_the_clipboard
  */
function getPermission() {

  return new Promise((resolve, reject) => {
    navigator.permissions.query({ name: 'clipboard-write' })
      .then(result => {
        console.log('Requesting WRITE permission from Clipboard API: ', result.state);

        if (result.state == 'granted' ||
          result.state == 'prompt') {

          return result.state;

        } else {

          alert('Permissions issue - rejected WRITE. See Perry');
          return reject(null);
        }
      })
      .then(resolvedWrite => {

        navigator.permissions.query({ name: 'clipboard-read' })
          .then(result => {
            console.log('Requesting READ permission from Clipboard API: ', result.state);

            if (result.state == 'granted' ||
              result.state == 'prompt') {

              return resolve({ write: resolvedWrite, read: result.state });

            } else {

              alert('Permissions issue - rejected READ. See Perry');
              return reject(null);
            }
          });
      });
  });

}



/** Run on popup opening */
initialize();


/** 
 * Handles the disable on COPY button 
 */
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
});

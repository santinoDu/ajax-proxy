let currentPanelWindow = null;

const debugActiveName = 'proxy-debug-status'

chrome.devtools.panels.create("Proxy",
  "../images/icon.png",
  "../index.html",
  (panel) => {
    panel.onShown.addListener(setupActions);
  }
);

chrome.devtools.network.onRequestFinished.addListener(request => {
  request.getContent((body) => {
    if (request.request && request.request.url && request._resourceType === 'xhr') {
      currentPanelWindow && currentPanelWindow.postMessage({
        action: {content: body, url: request.request.url},
        source: 'fetch-xhr',
      }, '*');
    }
  });
});

function getHeaderString(headers) {
  let responseHeader = '';
  headers.forEach((header, key) => {
    let value = header;
    if (key === 'content-type') {
      value = (header || '').split(';')[0] + '; charset=UTF-8';
    }
    return responseHeader += key + ':' + value + '\n';
  });
  return responseHeader;
}

async function ajaxMe(url, headers, method, postData, success, error) {
  let finalResponse = {};
  let response = await fetch(url, {
    method,
    mode: 'cors',
    headers,
    redirect: 'follow',
    body: postData
  });
  finalResponse.response = await response.text();
  finalResponse.headers = getHeaderString(response.headers);
  // finalResponse.headers['content-type'] = finalResponse.headers['content-type'].split(';')[0] + '; charset=UTF-8';
  // if (response.ok) {
    success(finalResponse);
  // } else {
    // error(finalResponse);
  // }
}
function replaceResponse(response, filteredData, callback) {
  filteredData.forEach(item => {
    response = item.formatContent;
  })
  callback(response)
}
function checkURLTagged(request, replaceList) {
  return replaceList.filter(item =>  {
    return (request.url.includes(item.url) || (request.postData || '').includes(item.url)) && item.active;
  });
}

let debugee = null;
let targett = null;

const handleEvent = (source, method, params) => {
  var request = params.request;
  var continueParams = {
    requestId: params.requestId,
  };
  if (source.tabId === targett.id) {
    if (method === "Fetch.requestPaused") {
      chrome.storage.local.get("proxyTable", (data) => {
        const storageData = data.proxyTable;
        const filteredData = checkURLTagged(params.request, storageData);
        console.log('filteredData', filteredData)
        if (filteredData.length > 1) {
          console.log('multiple')
          currentPanelWindow && currentPanelWindow.postMessage({
            action: {filteredData, request: params.request},
            source: 'proxy-match-multiple',
          }, '*');
        } else if (filteredData.length === 1) {
          ajaxMe(request.url, request.headers, request.method, request.postData, (data) => {
            replaceResponse(data.response, filteredData, (replacedData) => {
              console.log('replacedData', replacedData)
              continueParams.responseCode = 200;
              continueParams.binaryResponseHeaders = btoa(unescape(encodeURIComponent(data.headers.replace(/(?:\r\n|\r|\n)/g, '\0'))));
              continueParams.body = btoa(unescape(encodeURIComponent(replacedData)));
              chrome.debugger.sendCommand(debugee, 'Fetch.fulfillRequest', continueParams);
            });
          }, () => {
            chrome.debugger.sendCommand(debugee, 'Fetch.continueRequest', continueParams);
          });
        } else {
          chrome.debugger.sendCommand(debugee, 'Fetch.continueRequest', continueParams);
        }
      });
    }
  }
}

const handleClose = () => {
  currentPanelWindow && currentPanelWindow.postMessage({
    action: false,
    source: debugActiveName,
  }, '*');
  destroyDebugger();
}

function setupDebugger(targets) {
  targett = targets[0];
  debugee = { tabId: targett.id };

  chrome.debugger.attach(debugee, "1.0", () => {
    chrome.debugger.sendCommand(debugee, "Fetch.enable");
    chrome.debugger.sendCommand(debugee, "Network.enable");
  });

  chrome.debugger.onDetach.addListener(handleClose);

  chrome.debugger.onEvent.addListener(handleEvent);
}

function setupActions(panelWindow) {
  currentPanelWindow = panelWindow;
  panelWindow && panelWindow.addEventListener('message', (event) => {
    if (event.source !== panelWindow) {
      return;
    }
    let message = event.data;
    if (message && message.source !== debugActiveName) {
      return;
    }
    if (message.action) {
      startOverride();
    } else {
      destroyDebugger();
    }
  })
}

function startOverride() {
  chrome.tabs.query({active: true}, setupDebugger)
}

function destroyDebugger() {
  chrome.debugger.onDetach.removeListener(handleClose);
  chrome.debugger.onEvent.removeListener(handleEvent);
  chrome.debugger.detach(debugee, () => {
    debugee = null;
  });
}

(async function () {
  const OrchaSupport = (window as any).OrchaSupport || [];
  (window as any).OrchaSupport = OrchaSupport;

  let isIframeReady = false;
  const iframeId = "orcha-support-iframe";
  const buttonId = "orcha-support-button";

  const style = document.createElement("style");
  style.innerHTML = `
button.orcha-support-button { 
  position: fixed;
  display: flex;
  justify-content: center;
  align-items: center;
  bottom: 300px;
  right: -44px;
  height: 36px;
  width: 120px;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
  background-color: #334155;
  z-index :100;
  border: 0;
  box-shadow: 0 10px 15px -4px rgb(0 0 0 / 0.3), 0 4px 5px -3px rgb(0 0 0 / 0);
  transform:rotate(270deg);
}

button.orcha-support-button span { 
  color: white;
  margin-left: 8px;
  font-weight: 700;
  font-size: 14px;
}

button.orcha-support-button .inline-close-button svg {
  margin-left: 5px;
  padding: 1px;
  color: white;
}

button.orcha-support-button button.close-button {
  border-radius: 12px;
  background-color: #1e293b;
  color: white;
  position: absolute;
  top: 12px;
  opacity: 0;
  right: 12px;
  width: 20px;
  height: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: right 0.5s ease-in 1.5s, top 0.5s ease-in 1.5s, opacity 0.5s ease-in 1.5s, background-color 0.3s;
  z-index: -1;
}

button.orcha-support-button button.close-button svg {
  height: 12px;
  width: 12px;
  color: b91c1c;
}

button.orcha-support-button button.close-button:hover svg {
  color: white;
}

button.orcha-support-button button.close-button:hover {
  background-color: #b91c1c;
}

button.orcha-support-button:hover button.close-button {
  transition: right 0.5s ease-in 0.3s, top 0.5s ease-in 0.3s, opacity 0.5s ease-in 0.3s, background-color 0.3s;
  opacity: 100;
  top: -16px;
  right: -16px;
}

button.orcha-support-button.bsb-start { 
  transition: right 1s ease-in 2s;
  right: -44px;
}

button.orcha-support-button.bsb-start.bsb-enter { 
  right: -44px;
}

button.orcha-support-button:hover {
  right: -44px;
}

@media (min-width: 640px) {
  button.orcha-support-button { 
    right: -68px;
  }

  button.orcha-support-button.bsb-start.bsb-enter { 
    right: -68px;
  }

  button.orcha-support-button .inline-close-button {
    display: none;
  }
}

button.orcha-support-button img { 
  color: white;
  width: 22px;
  height: 22px;
}

button.orcha-support-button { 
  transition: background-color 0.4s, right 0.5s ease-in 2s;
}

button.orcha-support-button:hover { 
  transition: background-color 0.4s, right 0.3s ease-out;
  background-color: #1e293b;
}

@media (max-width: 639px) {
  iframe.orcha-support-iframe { 
    display: none;
    position: fixed;
    bottom: 0;
    right: 0;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 100;
  }
}
@media (min-width: 640px) {
  iframe.orcha-support-iframe { 
    display: none;
    position: fixed;
    bottom: 24px;
    right: 24px;
    width: 400px;
    height: 482px;
    max-width: calc(100% - 48px);
    border-radius: 12px;
    border-bottom-right-radius: 8px;
    border: 1px solid rgba(100,100,100,0.3);
    z-index: 100;
    box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
  }
}
`;
  document.getElementsByTagName("head")[0].appendChild(style);

  const OrchaSupportOrigin = process.env.VITE_SUPPORT_URI;
  const OrchaSupportLocation =
    OrchaSupportOrigin +
    "/index.html#" +
    encodeURIComponent(window.location.origin);
  // generate the iframe where the support will take place

  let button: HTMLButtonElement | null = null;

  // the queue for the iframe when it is loaded
  let iframeMessageQueue: Array<string[]> = [];

  // this method creates a new queue without duplicates
  //  based on the action being performed
  function enQueueMessage(message: string[]): Array<string[]> {
    const newQueue: Array<string[]> = [];
    for (const queuedMessage of iframeMessageQueue) {
      // do not add message with the same action to the new queue
      // queuedMessage[0] and message[0] store the action name
      if (queuedMessage[0] !== message[0]) {
        newQueue.push(queuedMessage);
      }
    }
    // add the new message to the queue
    newQueue.push(message);
    return newQueue;
  }

  // Handle messages from the iframe, only closing action
  window.addEventListener(
    "message",
    async function (event) {
      if (event.origin !== OrchaSupportOrigin) {
        return;
      }

      switch (event.data) {
        case "orcha-support:close":
          hideIframe();
          break;
        case "orcha-support:hide":
          hideIframe(false);
          break;
        case "orcha-support:screenshot":
          screenshot();
          break;
        case "orcha-support:ready":
          isIframeReady = true;

          // send all the queued message to the iframe
          for (const message of iframeMessageQueue) {
            await iframeMessage(message[0], message[1]);
          }
          // clear the queue once done
          iframeMessageQueue = [];
          break;
        default:
          console.warn("Orcha Support: unknown command", event.data);
      }
    },
    false
  );

  // standardize iframe messaging
  async function iframeMessage(action: string, value: string = "") {
    if (isIframeReady) {
      const iframe = await getIframe();
      iframe.contentWindow!.postMessage(
        encodeURIComponent(action) + " " + encodeURIComponent(value),
        OrchaSupportLocation
      );
    } else {
      iframeMessageQueue = enQueueMessage([action, value]);
    }
  }

  async function hideIframe(showButtonAfter: boolean = true) {
    const iframe = await getIframe();
    iframe.style.display = "none";

    if (showButtonAfter) {
      showButton();
    }
  }

  async function showIframe() {
    const iframe = await getIframe();
    iframe.style.display = "block";
    iframeMessage("show");
    hideButton();
  }

  function animateButtonEnter() {
    if (button) {
      button.classList.add("bsb-start");
      setTimeout(() => button!.classList.add("bsb-enter"));
      setTimeout(() => {
        if (button) {
          button.classList.remove("bsb-enter");
          button.classList.remove("bsb-start");
        }
      }, 3000);
    }
  }

  function showButton() {
    if (button) {
      button.style.display = "flex";
      animateButtonEnter();
    }
  }

  function hideButton() {
    if (button) {
      button.style.display = "none";
    }
  }

  async function uploadImage(image: string) {
    await iframeMessage("uploadImage", image);
  }

  async function setEmail(email: string) {
    await iframeMessage("setEmail", email);
  }

  async function setName(name: string) {
    await iframeMessage("setName", name);
  }

  async function setUrl(url: string) {
    await iframeMessage("setUrl", url);
  }

  async function setMetaData(url: string) {
    await iframeMessage("setMetaData", url);
  }

  async function setProductId(productId: string) {
    await iframeMessage("setProductId", productId);
  }

  async function setDocumentationId(documentationId: string) {
    await iframeMessage("setDocumentationId", documentationId);
  }

  async function showDocumentationPageId(pageId: string) {
    await iframeMessage("showDocumentationPageId", pageId);
  }

  /**
   * Create the iframe and resolves only once it has fully loaded
   */
  async function getIframe(): Promise<HTMLIFrameElement> {
    return new Promise((resolve) => {
      var iframe = document.getElementById(iframeId);
      if (!iframe) {
        iframe = document.createElement("iframe");
        iframe.setAttribute("src", OrchaSupportLocation);
        iframe.setAttribute("id", iframeId);
        iframe.className = "orcha-support-iframe";

        document.body.appendChild(iframe);
      }

      if (isIframeReady) {
        resolve(iframe as HTMLIFrameElement);
      }

      // send to the iframe all the commands only once it is loaded
      // retry to communicated every 500ms
      const interval = setInterval(function () {
        if (isIframeReady) {
          clearInterval(interval);
          resolve(iframe as HTMLIFrameElement);
        }
      }, 500);
    });
  }

  function getOrCreateButton() {
    var button = document.getElementById(buttonId);
    if (!button) {
      button = document.createElement("button");
      button.setAttribute("id", buttonId);
      button.addEventListener("click", showIframe);
      button.setAttribute("sr-only", "Contact support");

      const img = document.createElement("img");
      img.setAttribute("src", OrchaSupportOrigin + "/supportIcon.svg");
      img.setAttribute("alt", "Chat bubble icon");
      button.appendChild(img);

      const span = document.createElement("span");
      span.innerHTML = "Support";
      button.appendChild(span);

      const inlineCloseButton = document.createElement("button");
      inlineCloseButton.addEventListener("click", (event) => {
        event.stopPropagation();
        hideButton();
      });
      inlineCloseButton.setAttribute("title", "Hide support button");
      inlineCloseButton.className = "inline-close-button";
      inlineCloseButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="3" stroke="currentColor" class="w-4 h-4">
      <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 19.5l15-15m-15 0l15 15" />
    </svg>`;
      button.appendChild(inlineCloseButton);

      const closeButton = document.createElement("button");
      closeButton.addEventListener("click", (event) => {
        event.stopPropagation();
        hideButton();
      });
      closeButton.setAttribute("title", "Hide support button");
      closeButton.className = "close-button";
      closeButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="3" stroke="currentColor" class="w-6 h-6">
      <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 19.5l15-15m-15 0l15 15" />
    </svg>`;
      button.appendChild(closeButton);

      document.body.appendChild(button);
    }

    return button as HTMLButtonElement;
  }

  const ImageCapture = (window as any).ImageCapture;

  async function screenshot() {
    if (!ImageCapture) {
      console.error("Web browser does not permit screen catpures");
      return;
    }

    hideIframe();
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        SurfaceSwitchingPreferenceEnum: ["Browser"],
        audio: false,
        preferCurrentTab: true,
        surfaceSwitching: "exclude",
      } as any);

      const videoTrack = stream.getVideoTracks()[0];
      // init Image Capture and not Video stream
      const imageCapture = new ImageCapture(videoTrack);
      // take first frame only
      const bitmap = await imageCapture.grabFrame();

      // destroy video track to prevent more recording / mem leak
      videoTrack.stop();

      showIframe();

      // const canvas = document.getElementById("fake");
      const canvas = document.createElement("canvas");
      // this could be a document.createElement('canvas') if you want
      // draw weird image type to canvas so we can get a useful image
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;

      const context = canvas.getContext("2d");

      if (context) {
        context.drawImage(bitmap, 0, 0, bitmap.width, bitmap.height);
        uploadImage(canvas.toDataURL());
      }
    } catch (error) {
      showIframe();
    }
  }

  // for async loading, we are using an array to capture
  // commands requested before the app was loaded
  async function processCommand(command: [string, string]) {
    const action = command[0];
    const value = command[1];

    switch (action) {
      case "show":
        return showIframe();

      case "hide":
        return hideIframe();

      case "showButton":
        return showButton();

      case "hideButton":
        return hideButton();

      case "setEmail":
        return setEmail(value);

      case "setName":
        return setName(value);

      case "setUrl":
        return setUrl(value);

      case "setProductId":
        return setProductId(value);

      case "setDocumentationId":
        return setDocumentationId(value);

      case "showDocumentationPageId":
        showIframe();
        return showDocumentationPageId(value);

      case "setMetaData":
        return setMetaData(value);

      default:
        console.warn("Orcha Support: unknow command", action);
    }
  }

  async function init() {
    // as we initialize, we'll retrieve the product ID
    const scripts = document.querySelectorAll("script");
    scripts.forEach(function (scriptTag) {
      if (scriptTag.src.endsWith("/orcha-support.js")) {
        button = getOrCreateButton();

        // custom class if provided otherwise ".orcha-support-button"
        const button_class = scriptTag.getAttribute("data-button-class");
        button.className = button_class || "orcha-support-button";

        const show_button = scriptTag.getAttribute("data-show-button");
        if (show_button && show_button.toLowerCase() === "false") {
          hideButton();
        } else {
          // apply animation classes
          animateButtonEnter();
        }

        const product_id = scriptTag.getAttribute("data-product-id");
        if (!product_id) {
          throw new Error(
            "Error: Orcha support tag is missing the data-product-id."
          );
        }
        OrchaSupport.unshift(["setProductId", product_id]);

        const documentation_id = scriptTag.getAttribute(
          "data-documentation-id"
        );
        if (documentation_id) {
          OrchaSupport.unshift(["setDocumentationId", documentation_id]);
        }
      }
    });

    for (const command of OrchaSupport) {
      await processCommand(command);
    }
    OrchaSupport.push = processCommand;
  }

  init();
})();

chrome.runtime.onMessage.addListener(({ type, payload }, { tab }, sendResponse) => {
  if (type === "SET_RECIPIENT") {
    chrome.tabs.query({ currentWindow: true }, (tabs) => {
      const manosiuntosTab = tabs.find(({ url }) => url.includes("https://manosiuntos.post.lt"));

      if (manosiuntosTab) chrome.tabs.remove(manosiuntosTab.id);

      chrome.tabs.create({
        active: true,
        url: "https://manosiuntos.post.lt/send/prepare?addNew=true",
      });

      chrome.runtime.sendMessage({ type: "CREATE_MANOSIUNTOS" });
    });
  }
});

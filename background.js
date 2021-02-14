console.log("background worker ir running");

chrome.runtime.onMessage.addListener(({ type, payload }, { tab }, sendResponse) => {
  chrome.storage.sync.get("color", ({ color }) => {
    document.body.style.backgroundColor = "red";
  });

  if (type === "SET_RECIPIENT") {
    chrome.tabs.query({ currentWindow: true }, (tabs) => {
      const manosiuntosTab = tabs.find(({ url }) => url.includes("https://manosiuntos.post.lt"));
      if (manosiuntosTab) {
        chrome.tabs.update(manosiuntosTab.id, { active: true, highlighted: true });
        chrome.runtime.sendMessage({ type: "OPEN_MANOSIUNTOS" });
      } else {
        chrome.tabs.create({
          active: true,
          url: "https://manosiuntos.post.lt/send/prepare?addNew=true",
        });
        chrome.runtime.sendMessage({ type: "CREATE_MANOSIUNTOS" });
      }
    });
  }
});

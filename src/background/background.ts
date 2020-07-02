import ChromeMessage from "../types/chrome-message";
import ChromeMessageType from "../types/chrome-message-type";
import * as localStorage from "../local-storage";
import LocalStorageKeys from "../types/local-storage-keys";
import * as parasiteFunctionsClient from "./http-clients.ts/parasite-functions-client";

chrome.runtime.onInstalled.addListener(() => {
  const code = "window.location.reload();";
  chrome.tabs.query({url: "https://www.youtube.com/*"}, tabs => {
    tabs.forEach(tab => chrome.tabs.executeScript(tab.id, {code}))
  });
});

chrome.runtime.onMessage.addListener((message: ChromeMessage, sender, sendResponse) => {
  handleMessage(message, sender, sendResponse);
  return true;
});

async function handleMessage(message: ChromeMessage, sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) {
  switch(message.type) {
    case(ChromeMessageType.ToggleLike): {
      const previousHasLiked = await localStorage.get(LocalStorageKeys.HasLiked);
      if(previousHasLiked)
        await parasiteFunctionsClient.unlike();
      else
        await parasiteFunctionsClient.like();
      
      const hasLiked = !previousHasLiked;
      await localStorage.set(LocalStorageKeys.HasLiked, hasLiked);
      
      chrome.tabs.query({url: "https://www.youtube.com/*"}, tabs => {
        tabs.forEach(tab => {
          chrome.tabs.sendMessage(tab.id, {type: ChromeMessageType.LikeToggled, payload: hasLiked});
        });
        sendResponse();
      });

      break;
    };
  }
}

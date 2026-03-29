// Browser compatibility shim — normalizes Firefox (browser.*) and Chrome/Edge (chrome.*)
if (typeof browser === 'undefined') var browser = chrome;

document.addEventListener("click", (e) => {

    // function getCurrentWindow() {
    //   return browser.windows.getCurrent();
    // }
  
    // if (e.target.id === "window-update-size_768") {
    //   getCurrentWindow().then((currentWindow) => {
    //     var updateInfo = {
    //       width: 768,
    //       height: 1024
    //     };
  
    //     browser.windows.update(currentWindow.id, updateInfo);
    //   });
    // }
  
    // if (e.target.id === "window-update-minimize") {
    //   getCurrentWindow().then((currentWindow) => {
    //     var updateInfo = {
    //       state: "minimized"
    //     };
  
    //     browser.windows.update(currentWindow.id, updateInfo);
    //   });
    // }
  
    // else if (e.target.id === "window-create-normal") {
    //   let createData = {};
    //   let creating = browser.windows.create(createData);
    //   creating.then(() => {
    //     console.log("The normal window has been created");
    //   });
    // }
  
    // else if (e.target.id === "window-create-incognito") {
    //   let createData = {
    //     incognito: true,
    //   };
    //   let creating = browser.windows.create(createData);
    //   creating.then(() => {
    //     console.log("The incognito window has been created");
    //   });
    // }
  
    // else if (e.target.id === "window-create-panel") {
    //   let createData = {
    //     type: "panel",
    //   };
    //   let creating = browser.windows.create(createData);
    //   creating.then(() => {
    //     console.log("The panel has been created");
    //   });
    // }
  
    // else if (e.target.id === "window-create-detached-panel") {
    //   let createData = {
    //     type: "detached_panel",
    //   };
    //   let creating = browser.windows.create(createData);
    //   creating.then(() => {
    //     console.log("The detached panel has been created");
    //   });
    // }
  
    // else if (e.target.id === "window-create-popup") {
    //   let createData = {
    //     type: "popup",
    //   };
    //   let creating = browser.windows.create(createData);
    //   creating.then(() => {
    //     console.log("The popup has been created");
    //   });
    // }
  
    // else if (e.target.id === "window-remove") {
    //   getCurrentWindow().then((currentWindow) => {
    //     browser.windows.remove(currentWindow.id);
    //   });
    // }
  
    // else if (e.target.id === "window-resize-all") {
    //   var gettingAll = browser.windows.getAll();
    //   gettingAll.then((windows) => {
    //     var updateInfo = {
    //       width: 1024,
    //       height: 768
    //     };
    //     for (var item of windows) {
    //       browser.windows.update(item.id, updateInfo);
    //     }
    //   });
    // }
  
    // else if (e.target.id === "window-preface-title") {
    //   getCurrentWindow().then((currentWindow) => {
    //     let updateInfo = {
    //       titlePreface: "Preface | "
    //     }
    //     browser.windows.update(currentWindow.id, updateInfo);
    //   });
    // }
  
    // e.preventDefault();
  });
  
  function saveOptions(e) {
    browser.storage.sync.set({
      configuration: {
        countries: {
          blocked: {
            list: document.querySelector("#blocked_countries").value.split(","),
            color: document.querySelector("#blocked_countries_color").value
          },
          highlighted: {
            list: document.querySelector("#highlight_countries").value.split(","),
            color: document.querySelector("#highlight_countries_color").value
          },
        },
        proposal: {
          color: {
            lt5: document.querySelector("#lt5").value,
            f5to10: document.querySelector("#f5to10").value,
            f10to15: document.querySelector("#f10to15").value,
            f15to20: document.querySelector("#f15to20").value,
            f20to50: document.querySelector("#f20to50").value,
            proother: document.querySelector("#proother").value,
          }
        }
      }
    });
    e.preventDefault();
    console.log("saved");
    var savedData = browser.storage.sync.get('configuration');
    savedData.then((res) => {
      console.log(res.configuration.countries);
    });
  }
  
  function restoreOptions() {
    var savedData = browser.storage.sync.get('configuration');
    savedData.then((res) => {
      document.querySelector("#blocked_countries").value = res.configuration.countries.blocked.list.join(",") || "India";
      document.querySelector("#blocked_countries_color").value = res.configuration.countries.blocked.color || "silver";
      document.querySelector("#highlight_countries").value = res.configuration.countries.highlighted.list.join(",") || "United States";
      document.querySelector("#highlight_countries_color").value = res.configuration.countries.highlighted.color || "#8ab7ff";
      document.querySelector("#lt5").value = res.configuration.proposal.color.lt5 || "green";
      document.querySelector("#f5to10").value = res.configuration.proposal.color.f5to10 || "silver";
      document.querySelector("#f10to15").value = res.configuration.proposal.color.f10to15 || "silver";
      document.querySelector("#f15to20").value = res.configuration.proposal.color.f15to20 || "silver";
      document.querySelector("#f20to50").value = res.configuration.proposal.color.f20to50 || "silver";
      document.querySelector("#proother").value = res.configuration.proposal.color.proother || "silver";
    });

    console.log("Restored");
  }
  
  document.addEventListener('DOMContentLoaded', restoreOptions);
  document.querySelector("#form").addEventListener("submit", saveOptions);
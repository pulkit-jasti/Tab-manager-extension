function createTabItem(tab, onTabSelect, onGoToTab, onTabClose) {
  let tabItem = document.createElement("li");
  tabItem.setAttribute("class", "listItem");

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.onclick = onTabSelect;
  tabItem.appendChild(checkbox);

  const tabContent = document.createElement("div");
  tabContent.setAttribute("class", "tabContent");
  tabItem.appendChild(tabContent);

  const topWrapper = document.createElement("div");
  topWrapper.setAttribute("class", "topWrapper");
  tabContent.appendChild(topWrapper);

  const favicon = document.createElement("img");
  favicon.setAttribute("class", "favicon");
  if (tab.favIconUrl) {
    favicon.src = tab.favIconUrl;
    topWrapper.appendChild(favicon);
  }

  const tabTitle = document.createElement("p");
  tabTitle.setAttribute("class", "tabTitle");
  tabTitle.textContent = tab.title;
  topWrapper.appendChild(tabTitle);

  const goToTabImage = document.createElement("img");
  goToTabImage.src = "icons/open.png";

  const goToTabButton = document.createElement("button");
  goToTabButton.setAttribute("class", "tabButton");
  goToTabButton.appendChild(goToTabImage);
  goToTabButton.onclick = onGoToTab;
  topWrapper.appendChild(goToTabButton);

  const closeTabImage = document.createElement("img");
  closeTabImage.src = "icons/close.png";

  const closeTabButton = document.createElement("button");
  closeTabButton.setAttribute("class", "tabButton");
  closeTabButton.appendChild(closeTabImage);
  closeTabButton.onclick = onTabClose;
  topWrapper.appendChild(closeTabButton);

  const tabLink = document.createElement("a");
  tabLink.setAttribute("class", "tabLink");
  tabLink.href = tab.url;
  tabLink.textContent = tab.url;
  tabContent.appendChild(tabLink);

  return tabItem;
}

// const testTab = {
//   id: 1,
//   favIconUrl: "https://www.google.com/favicon.ico",
//   title: "Google",
//   url: "https://www.google.com",
// };

document.addEventListener("DOMContentLoaded", function () {
  const tabsList = document.getElementById("tabsList");
  const searchInput = document.getElementById("search");
  const countDisplay = document.getElementById("count");
  const multiSelectActions = document.getElementById("multiSelectActions");
  const copySelectedBtn = document.getElementById("copySelected");
  const closeSelectedBtn = document.getElementById("closeSelected");

  let multiSelectMode = true;
  // const selectedTabs = new Set();
  let selectedTabs = [];

  function updateMultiSelectActions() {
    if (selectedTabs.size > 0) {
      multiSelectActions.style.display = "block";
    } else {
      multiSelectActions.style.display = "none";
    }
  }

  const closeTab = (tabId) => {
    browser.tabs.remove(tabId).then(() => {
      // Refresh the tabs list
      filterTabs();
    });
  };

  function listTabs(tabs) {
    tabsList.innerHTML = "";
    countDisplay.textContent = `${tabs.length} tabs`;

    for (let tab of tabs) {
      const handleTabClose = () => {
        closeTab(tab.id);
      };

      const handleGoToTab = () => {
        console.log("go to this tab");
        browser.tabs.update(tab.id, { active: true });
        // Close the popup after activating the tab
        window.close();
      };

      const tabItem = createTabItem(
        tab,
        () => {},
        handleGoToTab,
        handleTabClose
      );

      tabsList.appendChild(tabItem);

      // let checkbox = document.createElement("input");
      // checkbox.type = "checkbox";
      // checkbox.dataset.tabId = tab.id; // Store the tab ID on the checkbox
      // checkbox.onchange = (e) => {
      //   if (e.target.checked) {
      //     selectedTabs.add(parseInt(e.target.dataset.tabId)); // Ensure the tab ID is stored as an integer
      //   } else {
      //     selectedTabs.delete(parseInt(e.target.dataset.tabId));
      //   }
      //   updateMultiSelectActions();
      // };

      // listItem.appendChild(checkbox);
      // listItem.innerHTML += `<strong>${tab.title}</strong> - <a href="${tab.url}" target="_blank">${tab.url}</a> `;
      // listItem.appendChild(closeButton);

      // tabsList.appendChild(listItem);
    }
  }

  function filterTabs() {
    const query = searchInput.value.toLowerCase();

    browser.tabs.query({}).then((tabs) => {
      const filteredTabs = tabs.filter(
        (tab) =>
          tab.title.toLowerCase().includes(query) ||
          tab.url.toLowerCase().includes(query)
      );
      listTabs(filteredTabs);
    });
  }

  copySelectedBtn.addEventListener("click", () => {
    browser.tabs.query({}).then((tabs) => {
      let selectedUrls = tabs
        .filter((tab) => selectedTabs.has(tab.id))
        .map((tab) => tab.url)
        .join("\n");
      navigator.clipboard.writeText(selectedUrls).then(() => {
        alert("Selected URLs copied to clipboard!");
      });
    });
  });

  closeSelectedBtn.addEventListener("click", () => {
    browser.tabs.remove([...selectedTabs]).then(() => {
      // Clear the set and hide actions
      selectedTabs.clear();
      updateMultiSelectActions();

      // Refresh the tabs list
      filterTabs();
    });
  });

  // Initially list all tabs
  browser.tabs.query({}).then(listTabs);

  // Attach event listener to the search input
  searchInput.addEventListener("keyup", filterTabs);
});

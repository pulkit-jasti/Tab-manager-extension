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
  closeTabButton.setAttribute("id", "closeButton");
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

document.addEventListener("DOMContentLoaded", function () {
  const tabsList = document.getElementById("tabsList");
  const searchInput = document.getElementById("search");
  const countDisplay = document.getElementById("count");
  const multiSelectActions = document.getElementById("multiSelectActions");
  const copySelectedBtn = document.getElementById("copySelected");
  const closeSelectedBtn = document.getElementById("closeSelected");
  const selectedCount = document.getElementById("selectedCount");

  let multiSelectMode = true;
  let selectedTabs = [];

  function updateMultiSelectActions() {
    if (selectedTabs.length > 0) {
      multiSelectActions.style.display = "flex";
      tabsList.style.paddingTop = "148px";
    } else {
      multiSelectActions.style.display = "none";
      tabsList.style.paddingTop = "102px";
    }
    selectedCount.textContent = `${selectedTabs.length} selected`;
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

      const handleTabSelect = (e) => {
        if (e.target.checked) {
          selectedTabs.push(tab.id);
        } else {
          selectedTabs = selectedTabs.filter((id) => id !== tab.id);
        }
        updateMultiSelectActions();
      };

      const tabItem = createTabItem(
        tab,
        handleTabSelect,
        handleGoToTab,
        handleTabClose
      );

      tabsList.appendChild(tabItem);
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
        .filter((tab) => selectedTabs.includes(tab.id))
        .map((tab) => tab.url)
        .join(", ");
      navigator.clipboard.writeText(selectedUrls).then(() => {
        copySelectedBtn.textContent = "Copied!";
        setTimeout(() => {
          copySelectedBtn.textContent = "Copy tabs";
        }, 3000);
      });
    });
  });

  closeSelectedBtn.addEventListener("click", () => {
    browser.tabs.remove([...selectedTabs]).then(() => {
      // Clear the set and hide actions
      selectedTabs = [];
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

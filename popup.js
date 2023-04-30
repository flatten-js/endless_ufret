const list = document.getElementById('list')

function to(id) {
  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    chrome.tabs.sendMessage(tabs[0].id, { active: id })
  })
}

function onChangeHandler(changes) {
  if (!changes.tabs) return

  const tabs = JSON.parse(changes.tabs.newValue || '[]')
  list.innerHTML = tabs.map(tab => `
    <li id="${tab}">${tab}</li>
  `)

  list.childNodes.forEach(li => {
    li.onclick = () => to(li.id)
  })
}

chrome.storage.local.onChanged.addListener(onChangeHandler)
chrome.storage.local.get('tabs', result => {
  onChangeHandler({ tabs: { oldValue: null, newValue: result.tabs } })
})


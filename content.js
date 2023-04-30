const pause = document.getElementById('pause')

let timeid = null
function to_active(id) {
  clearTimeout(timeid)
  pause.click()

  const target = document.getElementById(id)
  target.scrollIntoView({ block: 'nearest', inline: 'start' })
  
  timeid = setTimeout(target.click, 3000)
}

chrome.runtime.onMessage.addListener(request => {
  if (request.active) to_active(request.active)
})

function compare(a, b) {
  const regex = /(\d+)$/
  return a.match(regex)[1] - b.match(regex)[1]
}

document.body.addEventListener('contextmenu', e => {
  const tab = e.target.id
  chrome.storage.local.get('tabs', ({ tabs }) => {
    const item_tabs = [...new Set([...JSON.parse(tabs || '[]'), tab])].sort(compare)
    chrome.storage.local.set({ 'tabs': JSON.stringify(item_tabs) })
  })
})

document.body.addEventListener('keydown', e => {
  switch (e.keyCode) {
    case 8:
      const active = document.querySelector('.active')
      chrome.storage.local.get('tabs', ({ tabs }) => {
        tabs = JSON.parse(tabs || '[]')

        const target = tabs.reverse().find(tab => {
          const regex = /(\d+)$/
          return parseInt(tab.match(regex)[1]) <= parseInt(active.id.match(regex)[1])
        })

        if (target) to_active(target)
      })
      break
    
    case 49:
    case 50:
    case 51:
    case 52:
    case 53:
    case 54:
    case 55:
    case 56:
    case 57:
    case 58:
      chrome.storage.local.get('tabs', ({ tabs }) => {
        tabs = JSON.parse(tabs || '[]')
        target = tabs[e.keyCode - 49]
        if (target) to_active(target)
      })
      break
  }
})
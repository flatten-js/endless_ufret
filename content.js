const song_id = new URLSearchParams(location.search).get('data')

if (song_id) {
  const pause = document.getElementById('pause')

  let timer
  function change_active_tab(id) {
    clearTimeout(timer)
    pause.click()
  
    const target_tab = document.getElementById(id)
    target_tab.scrollIntoView({ block: 'nearest', inline: 'start' })
  
    timer = setTimeout(() => target_tab.click(), 3000)
  }

  chrome.runtime.onMessage.addListener(req => {
    if (req.tab_id) change_active_tab(req.tab_id) 
  })

  async function get_tabs() {
    return new Promise(resolve => {
      chrome.storage.local.get(song_id, data => {
        const tabs = JSON.parse(data[song_id] || '[]')
        return resolve(tabs)
      })
    })
  }

  document.body.addEventListener('contextmenu', async e => {
    const tab = { name: e.target.id, id: e.target.id, index: e.target.dataset.value }
    
    let tabs = await get_tabs()
    tabs = [...new Map([tab, ...tabs].map(t => [t.index, t])).values()].sort((a,b) => a.index - b.index)
    chrome.storage.local.set({ [song_id]: JSON.stringify(tabs) })
  })

  const KEY_CODE_1 = 49
  document.body.addEventListener('keydown', async e => {
    switch (e.keyCode) {
      case 8: {
        const active_tab = document.querySelector('.active')
        const tabs = await get_tabs()

        const target_tab = tabs.reverse().find(tab => {
          return parseInt(tab.index) - parseInt(active_tab.dataset.value)
        })

        if (target_tab) change_active_tab(target_tab.id)
        break 
      }
      
      case KEY_CODE_1:
      case 50:
      case 51:
      case 52:
      case 53:
      case 54:
      case 55:
      case 56:
      case 57: {
        const tabs = await get_tabs()
        const target_tab = tabs[e.keyCode - KEY_CODE_1]
        if (target_tab) change_active_tab(target_tab.id)
      }
    }
  })
}
(async () => {
  async function get_content_tab() {
    return new Promise(resolve => {
      chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        return resolve(tabs[0])
      })
    })
  }

  const url = new URL((await get_content_tab()).url)
  const song_id = url.searchParams.get('data')

  if (song_id) {
    const points = document.getElementById('points')
  
    async function next_active_tab(id) {
      const tab = await get_content_tab() 
      chrome.tabs.sendMessage(tab.id, { tab_id: id })
    }

    async function get_tabs() {
      return new Promise(resolve => {
        chrome.storage.local.get(song_id, data => {
          const tabs = JSON.parse(data[song_id] || '[]')
          return resolve(tabs)
        })
      })
    }

    async function update_name_tab(id, name) {
      let tabs = await get_tabs()
      tabs = tabs.map(tab => tab.id == id ? { ...tab, name } : tab)
      chrome.storage.local.set({ [song_id]: JSON.stringify(tabs) })
    }

    async function delete_tab(id) {
      let tabs = await get_tabs()
      tabs = tabs.filter(tab => tab.id != id)
      chrome.storage.local.set({ [song_id]: JSON.stringify(tabs) })
    }
  
    function on_change_handler(changes) {
      if (changes[song_id]) {
        const tabs = JSON.parse(changes[song_id].newValue || '[]')
  
        points.innerHTML = tabs.map((tab, i) => `<li id="${tab.id}"><span>${i+1}.</span><input value="${tab.name}" /><i class="las la-step-backward"></i><i class="las la-times"></i></li>`).join('')
        points.querySelectorAll('li').forEach(li => {
          const input = li.querySelector('input')
          input.onblur = e => update_name_tab(li.id, e.target.value)

          const back = li.querySelector('.la-step-backward')
          back.onclick = () => next_active_tab(li.id)

          const times = li.querySelector('.la-times')
          times.ondblclick = () => delete_tab(li.id)
        })
      }
    }
  
    chrome.storage.local.onChanged.addListener(on_change_handler)
    chrome.storage.local.get(song_id, data => {
      on_change_handler({ [song_id]: { oldValue: null, newValue: data[song_id] } })
    })
  }
})()


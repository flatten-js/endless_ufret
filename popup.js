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

    async function update_name_tab(id, name) {
      chrome.storage.local.get(song_id, data => {
        const tabs = JSON.parse(data[song_id] || '[]').map(tab => tab.id == id ? { ...tab, name } : tab)
        chrome.storage.local.set({ [song_id]: JSON.stringify(tabs) })
      })
    }
  
    function on_change_handler(changes) {
      if (changes[song_id]) {
        const tabs = JSON.parse(changes[song_id].newValue || '[]')
  
        points.innerHTML = tabs.map((tab, i) => `<li id="${tab.id}"><span>${i+1}.</span><input value="${tab.name}" /><i class="las la-step-backward"></i></li>`).join('')
        points.querySelectorAll('li').forEach(li => {
          const input = li.querySelector('input')
          
          let timer
          input.oninput = e => {
            clearTimeout(timer)
            timer = setTimeout(() => {
              update_name_tab(li.id, e.target.value)
            }, 1000)
          }

          const i = li.querySelector('i')
          i.onclick = () => next_active_tab(li.id)
        })
      }
    }
  
    chrome.storage.local.onChanged.addListener(on_change_handler)
    chrome.storage.local.get(song_id, data => {
      on_change_handler({ [song_id]: { oldValue: null, newValue: data[song_id] } })
    })
  }
})()


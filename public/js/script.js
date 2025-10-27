function copyToClipboardFromButton(button){
  const text = button.dataset.command;
  navigator.clipboard.writeText(text).then(()=>{
    button.textContent = "Copied ✔";
    setTimeout(()=> button.textContent = "Copy", 1200);
  }).catch(()=> alert("Could not copy."));
}

async function filterCards(){
  const query = (document.getElementById('search')?.value || '').toLowerCase();
  const resultsContainer = document.getElementById('cards-search-results');
  const categoriesCard = document.getElementById('categories-card');
  if(categoriesCard) categoriesCard.style.display = query ? 'none' : '';
  if(!resultsContainer) return;
  if(!query){ resultsContainer.innerHTML = ''; return; }
  try {
    const response = await fetch('/data/cards.json');
    const data = await response.json();
    let matches = [];
    Object.values(data).forEach(cards => {
      cards.forEach(card => {
        const key = (card.title + ' ' + card.desc + ' ' + card.command + ' ' + (card.args||[]).join(' ')).toLowerCase();
        if(key.includes(query)) matches.push(card);
      });
    });
    resultsContainer.innerHTML = '';
    if(matches.length === 0){
      resultsContainer.innerHTML = '<div class="card">No se encontraron resultados.</div>';
      return;
    }
    matches.forEach(card => {
      const cardElement = document.createElement('div');
      cardElement.className = 'card';
      cardElement.innerHTML = `
        <h2>${card.title}</h2>
        <p class="desc">${card.desc}</p>
        <pre class="code">${card.command}</pre>
        ${card.args && card.args.length ? `<ul>${card.args.map(arg => `<li><kbd>${arg}</kbd></li>`).join('')}</ul>` : ''}
        <button class="btn" data-command="${card.command.replace(/"/g, '&quot;')}">Copy</button>
      `;
      cardElement.querySelector('.btn').onclick = function(){ copyToClipboardFromButton(this); };
      resultsContainer.appendChild(cardElement);
    });
  } catch(e){
    resultsContainer.innerHTML = '<div class="card">No se pudieron cargar los comandos.</div>';
  }
}


async function loadCards(category) {
  const container = document.getElementById('cards-container');
  if (!container) return;
  try {
    const response = await fetch('/data/cards.json');
    const data = await response.json();
    const cards = data[category] || [];
    container.innerHTML = '';
    cards.forEach(card => {
      const cardElement = document.createElement('div');
      cardElement.className = 'card';
      cardElement.setAttribute('data-key', card.title + ' ' + card.command);
      cardElement.innerHTML = `
        <h2>${card.title}</h2>
        <p class="desc">${card.desc}</p>
        <pre class="code">${card.command}</pre>
        ${card.args && card.args.length ? `<ul>${card.args.map(arg => `<li><kbd>${arg}</kbd></li>`).join('')}</ul>` : ''}
        <button class="btn" data-command="${card.command.replace(/"/g, '&quot;')}">Copy</button>
      `;
      cardElement.querySelector('.btn').onclick = function(){ copyToClipboardFromButton(this); };
      container.appendChild(cardElement);
    });
  } catch (e) {
    container.innerHTML = '<div class="card">No se pudieron cargar los comandos.</div>';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('search');
  const file = location.pathname.split('/').pop();
  if(file === 'index.html' && searchInput){
    searchInput.addEventListener('input', filterCards);
  } else {
    const pageMap = {
      'system.html': 'system',
      'security.html': 'security',
      'network.html': 'network',
      'gpo.html': 'gpo',
      'firewall.html': 'firewall',
      'ad.html': 'ad'
    };
    if(pageMap[file]){
      loadCards(pageMap[file]);
    }
  }
});

function build(){
  const name = (document.getElementById('name').value || 'Custom_Rule').trim();
  const direction = document.getElementById('dir').value;
  const action = document.getElementById('action').value;
  const protocol = document.getElementById('proto').value;
  const localPort = document.getElementById('lport').value.trim();
  const remotePort = document.getElementById('rport').value.trim();
  const remoteIp = document.getElementById('rip').value.trim();
  const program = document.getElementById('program').value.trim();
  const profileSelected = Array.from(document.getElementById('profile').selectedOptions).map(o => o.value);
  const enabled = document.getElementById('enabled').value;
  const edge = document.getElementById('edge').value;

  let cmd = 'netsh advfirewall firewall add rule name="' + name + '" dir=' + direction + ' action=' + action;
  if(program) cmd += ' program="' + program + '"';
  if(protocol !== 'ANY') cmd += ' protocol=' + protocol;
  if(localPort) cmd += ' localport=' + localPort;
  if(remotePort) cmd += ' remoteport=' + remotePort;
  if(remoteIp) cmd += ' remoteip=' + remoteIp;
  if(profileSelected.length) cmd += ' profile=' + profileSelected.join(',');
  if(enabled) cmd += ' enable=' + enabled;
  if(edge==='yes' && direction==='in') cmd += ' edge=yes';

  document.getElementById('out').textContent = cmd;
}

function copyOut(){
  const text = document.getElementById('out').textContent;
  if(!text){ alert('Generate the command first.'); return; }
  navigator.clipboard.writeText(text).then(function(){alert('Command copied.');}).catch(function(){alert('Could not copy.');});
}

function resetForm(){
  Array.prototype.forEach.call(document.querySelectorAll('input'), function(input){ input.value=''; });
  document.getElementById('dir').value='in';
  document.getElementById('action').value='allow';
  document.getElementById('proto').value='TCP';
  document.getElementById('enabled').value='yes';
  document.getElementById('edge').value='no';
  document.getElementById('profile').selectedIndex = -1;
  document.getElementById('out').textContent='';
}

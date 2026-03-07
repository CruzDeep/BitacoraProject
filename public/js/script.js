// ============================================
// FUNCIÓN: Copiar comando al portapapeles
// ============================================
function copyToClipboardFromButton(button){
  const text = button.dataset.command; // Obtener el comando del atributo data-command
  navigator.clipboard.writeText(text).then(() => {
    // Feedback visual: cambiar texto del botón temporalmente
    button.textContent = "Copied ✔";
    setTimeout(() => button.textContent = "Copy", 1200);
  }).catch(() => alert("Could not copy."));
}

// ============================================
// FUNCIÓN: Filtrar cards por búsqueda (página de inicio)
// ============================================
async function filterCards(){
  // Obtener el texto de búsqueda (en minúsculas para comparar)
  const query = (document.getElementById('search')?.value || '').toLowerCase();
  const resultsContainer = document.getElementById('cards-search-results');
  const categoriesCard = document.getElementById('categories-card');
  
  // Ocultar/mostrar la sección de categorías según haya búsqueda o no
  if(categoriesCard) categoriesCard.style.display = query ? 'none' : '';
  
  if(!resultsContainer) return;
  if(!query){ 
    resultsContainer.innerHTML = ''; // Limpiar resultados si no hay búsqueda
    return; 
  }
  
  try {
    // Obtener todas las cards de la API
    const response = await fetch('/api/cards');
    const data = await response.json(); // Viene agrupado por categoría
    
    let matches = [];
    
    // Recorrer todas las categorías y buscar coincidencias
    Object.values(data).forEach(cards => {
      cards.forEach(card => {
        // Crear un string con todos los campos de la card para buscar
        const key = (card.title + ' ' + card.desc + ' ' + card.command + ' ' + (card.args||[]).join(' ')).toLowerCase();
        if(key.includes(query)) matches.push(card);
      });
    });
    
    // Limpiar y mostrar resultados
    resultsContainer.innerHTML = '';
    
    if(matches.length === 0){
      resultsContainer.innerHTML = '<div class="card">No se encontraron resultados.</div>';
      return;
    }
    
    // Renderizar cada card encontrada
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
      // Asignar evento de copiado al botón
      cardElement.querySelector('.btn').onclick = function(){ copyToClipboardFromButton(this); };
      resultsContainer.appendChild(cardElement);
    });
  } catch(e){
    console.error('Error en búsqueda:', e);
    resultsContainer.innerHTML = '<div class="card">No se pudieron cargar los comandos.</div>';
  }
}

// ============================================
// FUNCIÓN: Cargar cards de una categoría específica
// (Usada en system.html, network.html, logs.html, etc.)
// ============================================
async function loadCards(category) {
  const container = document.getElementById('cards-container');
  if (!container) return;
  
  try {
    // Obtener cards de la categoría específica
    const response = await fetch(`/api/cards/category/${category}`);
    const cards = await response.json();
    
    container.innerHTML = '';
    
    // Renderizar cada card de la categoría
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
      // Asignar evento de copiado al botón
      cardElement.querySelector('.btn').onclick = function(){ copyToClipboardFromButton(this); };
      container.appendChild(cardElement);
    });
  } catch (e) {
    console.error(`Error cargando categoría ${category}:`, e);
    container.innerHTML = '<div class="card">No se pudieron cargar los comandos.</div>';
  }
}

// ============================================
// INICIALIZACIÓN: Detectar qué página estamos y actuar en consecuencia
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('search');
  const file = location.pathname.split('/').pop(); // Obtener el nombre del archivo actual
  
  // CASO 1: Estamos en la página de inicio (index.html o ruta raíz)
  if(file === 'index.html' || file === '') {
    if(searchInput){
      // Configurar el evento de búsqueda en tiempo real
      searchInput.addEventListener('input', filterCards);
      
      // Si ya hay texto en el buscador (ej: después de recargar), ejecutar búsqueda
      if(searchInput.value) {
        filterCards();
      }
    }
  } 
  // CASO 2: Estamos en una página de categoría
  else {
    // Mapa que relaciona archivos HTML con nombres de categorías en la BD
    const pageMap = {
      'system.html': 'system',
      'security.html': 'security',
      'network.html': 'network',
      'gpo.html': 'gpo',
      'firewall.html': 'firewall',
      'ad.html': 'ad',
      'logs.html': 'logs'  // ← NUEVA CATEGORÍA
    };
    
    // Si la página actual está en el mapa, cargar sus cards
    if(pageMap[file]){
      loadCards(pageMap[file]);
    }
  }
});

// ============================================
// FUNCIONES PARA EL CONSTRUCTOR DE REGLAS DE FIREWALL
// (Usadas en firewall-builder.html)
// ============================================

/**
 * Construye un comando de netsh para reglas de firewall
 * a partir de los valores del formulario
 */
function build(){
  // Obtener valores del formulario
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

  // Construir comando base
  let cmd = 'netsh advfirewall firewall add rule name="' + name + '" dir=' + direction + ' action=' + action;
  
  // Agregar parámetros opcionales según estén presentes
  if(program) cmd += ' program="' + program + '"';
  if(protocol !== 'ANY') cmd += ' protocol=' + protocol;
  if(localPort) cmd += ' localport=' + localPort;
  if(remotePort) cmd += ' remoteport=' + remotePort;
  if(remoteIp) cmd += ' remoteip=' + remoteIp;
  if(profileSelected.length) cmd += ' profile=' + profileSelected.join(',');
  if(enabled) cmd += ' enable=' + enabled;
  if(edge === 'yes' && direction === 'in') cmd += ' edge=yes';

  // Mostrar el comando generado
  document.getElementById('out').textContent = cmd;
}

/**
 * Copia el comando generado al portapapeles
 */
function copyOut(){
  const text = document.getElementById('out').textContent;
  if(!text){ 
    alert('Generate the command first.'); 
    return; 
  }
  navigator.clipboard.writeText(text)
    .then(() => alert('Command copied.'))
    .catch(() => alert('Could not copy.'));
}

/**
 * Reinicia el formulario del constructor
 */
function resetForm(){
  // Limpiar todos los inputs
  Array.prototype.forEach.call(document.querySelectorAll('input'), function(input){ 
    input.value = ''; 
  });
  
  // Restablecer selects a valores por defecto
  document.getElementById('dir').value = 'in';
  document.getElementById('action').value = 'allow';
  document.getElementById('proto').value = 'TCP';
  document.getElementById('enabled').value = 'yes';
  document.getElementById('edge').value = 'no';
  document.getElementById('profile').selectedIndex = -1;
  
  // Limpiar el comando generado
  document.getElementById('out').textContent = '';
}
// Функция для отображения обратной связи при добавлении карточки
function showFeedback(message) {
  // Создаем элемент для отображения сообщения
  const feedback = document.createElement('div');
  feedback.className = 'card-added-feedback';
  feedback.textContent = message;
  
  // Добавляем на страницу
  document.body.appendChild(feedback);
  
  // Удаляем через некоторое время
  setTimeout(() => {
    feedback.remove();
  }, 3000); // 3 секунды показа
}

// Функции переключения между разделами
function showHome() {
    hideAllSections();
    document.getElementById('homeContent').style.display = 'block';
    setActiveButton('showHome');
  }
  
  function showGachaSystem() {
    hideAllSections();
    document.getElementById('gachaSystem').style.display = 'block';
    setActiveButton('showGachaSystem');
  }
  
  function showCollection() {
    hideAllSections();
    document.getElementById('cardCollection').style.display = 'block';
    updateCollection();
  }
  
  function showTycoon() {
    hideAllSections();
    document.getElementById('tycoonMode').style.display = 'block';
    setActiveButton('showTycoon');
    
    // Инициализируем тайкун-систему, если это первый показ
    initTycoonSystem();
  }
  
  function showNews() {
    hideAllSections();
    document.getElementById('newsSection').style.display = 'block';
  }
  
  function showShop() {
    hideAllSections();
    document.getElementById('shopSection').style.display = 'block';
  }
  
  function showEvents() {
    hideAllSections();
    document.getElementById('eventsSection').style.display = 'block';
  }
  
  function showProfile() {
    hideAllSections();
    document.getElementById('profileSection').style.display = 'block';
  }
  
  function hideAllSections() {
    const sections = [
      'homeContent', 'gachaSystem', 'cardCollection', 'tycoonMode', 
      'newsSection', 'shopSection', 'eventsSection', 'profileSection'
    ];
    sections.forEach(section => {
      document.getElementById(section).style.display = 'none';
    });
  }
  
  // Функция для переключения бокового меню
  function toggleMenu() {
    const menu = document.getElementById('sideMenu');
    menu.classList.toggle('active');
  }
  
  // Функция для выделения активного раздела
  function setActiveButton(buttonId) {
    const buttons = document.querySelectorAll('#sideMenu .nav-link');
    buttons.forEach(button => button.classList.remove('active')); // Убираем активный класс у всех кнопок
    const activeButton = document.querySelector(`#sideMenu .nav-link[onclick*="${buttonId}"]`);
    if (activeButton) {
      activeButton.classList.add('active'); // Добавляем активный класс к текущей кнопке
    }
  }
  
  // =======================================
  // Обновленная тайкун-система
  // =======================================

  // Переменные для управления тайкун-системой
  let studioLevel = 1;
  let studioIncome = 100;
  let totalFans = 0;
  let totalGems = 1000;
  let totalConcerts = 0;
  let studioRank = 'D';
  let studioExp = 0;
  let studioMaxExp = 1000;
  let currentTeam = [];
  let maxTeamSize = 3;
  let songs = [];
  let dailyTasks = {
    completeConcert: false,
    composeSong: false,
    gainFans: false
  };

  // Бонусы команды
  let teamBonuses = {
    fanGain: 0,
    songQuality: 0,
    performance: 0
  };

  // Глобальная переменная для хранения модального окна команды
  let teamModalInstance = null;

  // Глобальная переменная для хранения модального окна результатов концерта
  let concertResultModalInstance = null;

  // Глобальные переменные для отслеживания выбранных элементов
  let selectedCardIndex = -1;
  let selectedSlotIndex = -1;

  // Инициализация тайкун-системы
  function initTycoonSystem() {
    updateStudioExp();
    updateTycoonStats();
    updateTeamDisplay();
    updateActivityLog('Welcome to your new Studio!', 'Start by adding team members and creating songs');
  }

  // Обновление статистики студии
  function updateTycoonStats() {
    document.getElementById('studioLevel').textContent = studioLevel;
    document.getElementById('studioIncome').textContent = studioIncome;
    document.getElementById('totalFans').textContent = totalFans;
    document.getElementById('totalGems').textContent = totalGems;
    document.getElementById('totalConcerts').textContent = totalConcerts;
    document.getElementById('studioRank').textContent = studioRank;
    document.getElementById('currentStaff').textContent = currentTeam.length;
    document.getElementById('maxStaff').textContent = maxTeamSize;
    document.getElementById('songCount').textContent = songs.length;
    
    // Обновляем бонусы команды
    document.getElementById('fanBonus').textContent = `+${teamBonuses.fanGain}%`;
    document.getElementById('songBonus').textContent = `+${teamBonuses.songQuality}%`;
    document.getElementById('perfBonus').textContent = `+${teamBonuses.performance}%`;
    
    // Обновляем также информацию в профиле
    document.getElementById('profileRank').textContent = studioRank;
    document.getElementById('profileTotalCards').textContent = collection.length;
    document.getElementById('profileGems').textContent = totalGems;
    document.getElementById('profileConcerts').textContent = totalConcerts;
    document.getElementById('profileFans').textContent = totalFans;
    document.getElementById('profileStudioLevel').textContent = studioLevel;
    
    // Находим высшую редкость в коллекции
    let highestRarity = 0;
    collection.forEach(char => {
      if (char.rarity > highestRarity) {
        highestRarity = char.rarity;
      }
    });
    document.getElementById('profileHighestRarity').textContent = highestRarity + '★';
  }

  // Обновление опыта студии
  function updateStudioExp() {
    const expBar = document.getElementById('studioExpBar');
    const expText = document.getElementById('studioExpText');
    
    const expPercentage = (studioExp / studioMaxExp) * 100;
    expBar.style.width = `${expPercentage}%`;
    expText.textContent = `Exp: ${studioExp}/${studioMaxExp}`;
  }

  // Функция для добавления опыта студии
  function addStudioExp(amount) {
    studioExp += amount;
    
    // Проверяем, достигнут ли следующий уровень
    if (studioExp >= studioMaxExp) {
      studioLevel += 1;
      const remainingExp = studioExp - studioMaxExp;
      studioExp = remainingExp;
      studioMaxExp = Math.floor(studioMaxExp * 1.5); // Увеличиваем требуемый опыт
      
      // Увеличиваем доход
      studioIncome = studioLevel * 100;
      
      // Обновляем возможный размер команды
      if (studioLevel % 3 === 0) {
        maxTeamSize += 1;
      }
      
      // Показываем сообщение о повышении уровня
      alert(`Studio Level Up! You are now level ${studioLevel}!`);
      
      // Добавляем запись в лог
      updateActivityLog(`Studio Level Up!`, `Your studio is now level ${studioLevel}`);
    }
    
    updateStudioExp();
    updateTycoonStats();
  }

  // Функция обновления ранга студии
  function updateStudioRank() {
    if (totalFans >= 20000) {
      studioRank = 'S';
    } else if (totalFans >= 10000) {
      studioRank = 'A';
    } else if (totalFans >= 5000) {
      studioRank = 'B';
    } else if (totalFans >= 2000) {
      studioRank = 'C';
    } else {
      studioRank = 'D';
    }
    
    updateTycoonStats();
  }

  // Функция для апгрейда студии
  function upgradeStudio() {
    const upgradeCost = 500 * studioLevel;
    
    if (totalGems >= upgradeCost) {
      totalGems -= upgradeCost;
      
      // Добавляем опыт студии напрямую
      addStudioExp(studioMaxExp); // Это автоматически повысит уровень
      
      // Добавляем запись в лог
      updateActivityLog(`Studio Upgraded`, `Your studio is now level ${studioLevel}`);
    } else {
      alert(`Not enough gems! You need ${upgradeCost}💎, but you have ${totalGems}💎`);
    }
  }

  // Функция для обновления списка команды
  function updateTeamDisplay() {
    const teamMembers = document.getElementById('teamMembers');
    teamMembers.innerHTML = '';
    
    // Отображаем текущих членов команды
    for (let i = 0; i < maxTeamSize; i++) {
      const teamSlot = document.createElement('div');
      teamSlot.className = 'card-thumbnail position-relative';
      
      if (i < currentTeam.length) {
        // Слот занят
        const member = currentTeam[i];
        teamSlot.innerHTML = `
          <img src="${member.imgUrl || member.img}" alt="${member.name}" class="img-fluid">
          <div class="position-absolute bottom-0 start-0 end-0 p-1 bg-dark bg-opacity-75 text-center">
            <small>${member.rarity}★</small>
          </div>
        `;
        teamSlot.setAttribute('data-index', i);
        teamSlot.onclick = () => removeTeamMember(i);
      } else {
        // Пустой слот
        teamSlot.classList.add('empty-slot');
        teamSlot.innerHTML = `
          <div class="position-absolute top-50 start-50 translate-middle text-center">
            <i class="fas fa-plus" style="font-size: 24px; color: rgba(255, 255, 255, 0.5);"></i>
          </div>
        `;
        teamSlot.onclick = showTeamManagement;
      }
      
      teamMembers.appendChild(teamSlot);
    }
  }

  // Функция для показа модального окна управления командой
  function showTeamManagement() {
    // Сбрасываем выбранные элементы
    selectedCardIndex = -1;
    selectedSlotIndex = -1;
    
    // Обновляем содержимое модального окна
    updateTeamModalContent();
    
    // Очищаем лишние backdrop элементы
    clearBackdrops();
    
    // Показываем модальное окно
    const teamModalElement = document.getElementById('teamModal');
    teamModalInstance = new bootstrap.Modal(teamModalElement);
    
    // Добавляем обработчик события закрытия модального окна
    teamModalElement.addEventListener('hidden.bs.modal', function () {
      clearBackdrops();
      calculateTeamBonuses();
      updateTeamDisplay();
    }, { once: true });
    
    teamModalInstance.show();
  }

  // Функция для обновления списка карточек
  function updateCardSelectionList() {
    const cardSelection = document.getElementById('cardSelection');
    cardSelection.innerHTML = '';
    
    // Получаем список карточек из коллекции
    let availableCards = [...collection];
    
    // Сортировка карточек - безопасное получение значения
    const cardFilterElement = document.getElementById('cardFilter');
    const sortType = cardFilterElement ? cardFilterElement.value : 'all';
    
    if (sortType !== 'all') {
      availableCards.sort((a, b) => {
        if (sortType === 'rarity') {
          return b.rarity - a.rarity;
        } else if (sortType === 'power') {
          return b.power - a.power;
        } else if (sortType === 'beauty') {
          return b.beauty - a.beauty;
        } else if (sortType === 'charisma') {
          return b.charisma - a.charisma;
        } else if (sortType === 'vocal') {
          return b.vocal - a.vocal;
        }
        return 0;
      });
    }
    
    // Если коллекция пустая, показываем placeholder
    if (availableCards.length === 0) {
      const placeholder = document.createElement('div');
      placeholder.className = 'card-placeholder';
      placeholder.textContent = 'No cards yet';
      cardSelection.appendChild(placeholder);
    } else {
      // Добавляем все доступные карточки
      availableCards.forEach((card, index) => {
        // Проверяем, не находится ли карточка уже в команде
        const isInTeam = currentTeam.some(member => 
          (member.id && member.id === card.id) || 
          (member.img && member.img === card.img) || 
          (member.imgUrl && member.imgUrl === (card.imgUrl || card.img))
        );
        
        if (!isInTeam) {
          const cardContainer = document.createElement('div');
          cardContainer.className = 'position-relative';
          
          const cardElement = document.createElement('img');
          cardElement.className = 'card-option img-fluid';
          cardElement.src = card.imgUrl || card.img;
          cardElement.alt = card.name;
          cardElement.setAttribute('data-index', index);
          
          // Если эта карточка выбрана, добавляем класс selected
          if (index === selectedCardIndex) {
            cardElement.classList.add('selected');
          }
          
          // Добавляем всплывающую подсказку
          const tooltip = document.createElement('div');
          tooltip.className = 'tooltip-card';
          tooltip.innerHTML = `
            ${card.name} (${card.rarity}★)<br>
            Power: ${card.power}<br>
            Beauty: ${card.beauty}<br>
            Charisma: ${card.charisma}<br>
            Vocal: ${card.vocal}
          `;
          
          // Добавляем бейдж с редкостью
          const badge = document.createElement('div');
          badge.className = 'card-badge';
          badge.textContent = card.rarity;
          
          cardContainer.appendChild(cardElement);
          cardContainer.appendChild(tooltip);
          cardContainer.appendChild(badge);
          
          // Обработчик клика по карточке
          cardElement.addEventListener('click', function() {
            // Снимаем выделение со всех карточек
            document.querySelectorAll('.card-option').forEach(card => {
              card.classList.remove('selected');
            });
            
            // Выделяем текущую карточку
            this.classList.add('selected');
            selectedCardIndex = index;
            
            // Если слот уже выбран, сразу добавляем карточку
            if (selectedSlotIndex !== -1) {
              addCardToTeam(availableCards[index], selectedSlotIndex);
            } else {
              // Показываем подсказку о необходимости выбрать слот
              showFeedback('Выберите слот для этой карточки');
              
              // Подсвечиваем пустые слоты
              highlightEmptySlots();
            }
          });
          
          cardSelection.appendChild(cardContainer);
        }
      });
    }
  }

  // Функция для подсветки пустых слотов
  function highlightEmptySlots() {
    const emptySlots = document.querySelectorAll('.team-slot');
    for (let j = currentTeam.length; j < maxTeamSize; j++) {
      emptySlots[j].classList.add('highlight');
      setTimeout(() => {
        if (!emptySlots[j].classList.contains('selected-slot')) {
          emptySlots[j].classList.remove('highlight');
        }
      }, 2000);
    }
  }

  // Функция для обновления слотов команды в модальном окне
  function updateTeamModalContent() {
    const modalTeamSlots = document.getElementById('teamSlots');
    modalTeamSlots.innerHTML = '';
    
    // Заполняем слоты команды
    for (let i = 0; i < maxTeamSize; i++) {
      const teamSlot = document.createElement('div');
      teamSlot.className = 'team-slot mb-3 p-2 bg-dark rounded';
      teamSlot.setAttribute('data-slot', i);
      
      // Добавляем класс selected-slot, если этот слот выбран
      if (i === selectedSlotIndex) {
        teamSlot.classList.add('selected-slot', 'highlight');
      }
      
      if (i < currentTeam.length) {
        // Слот занят
        const member = currentTeam[i];
        teamSlot.innerHTML = `
          <div class="d-flex">
            <div class="card-thumbnail me-3 position-relative">
              <img src="${member.imgUrl || member.img}" alt="${member.name}" class="img-fluid">
              <div class="tooltip-card">
                ${member.name} (${member.rarity}★)<br>
                P: ${member.power} | B: ${member.beauty}<br>
                C: ${member.charisma} | V: ${member.vocal}
              </div>
            </div>
            <div>
              <p class="mb-0">${member.name}</p>
              <small class="text-muted">Rarity: ${member.rarity}★</small>
              <div class="mt-1">
                <button class="btn btn-sm btn-danger remove-member" data-index="${i}">Remove</button>
              </div>
            </div>
          </div>
        `;

        teamSlot.querySelector('.remove-member').addEventListener('click', (event) => {
          event.stopPropagation();
          if (confirm(`Remove ${member.name} from your team?`)) {
            currentTeam.splice(i, 1);
            selectedSlotIndex = -1; // Сбрасываем выбранный слот
            updateTeamModalContent();
          }
        });
        
        // Добавляем возможность выбрать занятый слот для замены
        teamSlot.addEventListener('click', function() {
          selectTeamSlot(i);
        });
        
      } else {
        // Пустой слот
        teamSlot.innerHTML = `
          <div class="d-flex">
            <div class="card-thumbnail position-relative empty-slot me-3">
              <div class="position-absolute top-50 start-50 translate-middle text-center">
                <i class="fas fa-plus" style="font-size: 24px; color: rgba(255, 255, 255, 0.5);"></i>
              </div>
            </div>
            <div>
              <p class="mb-0">Slot #${i+1}</p>
              <small class="text-muted">Click to select this slot for a new card</small>
            </div>
          </div>
        `;
        
        // Обработчик клика по пустому слоту
        teamSlot.addEventListener('click', function() {
          selectTeamSlot(i);
        });
      }
      
      modalTeamSlots.appendChild(teamSlot);
    }
    
    // Обновляем список карточек
    updateCardSelectionList();
    
    // Обновляем бонусы
    document.getElementById('modalFanBonus').textContent = `+${teamBonuses.fanGain}%`;
    document.getElementById('modalSongBonus').textContent = `+${teamBonuses.songQuality}%`;
    document.getElementById('modalPerfBonus').textContent = `+${teamBonuses.performance}%`;
  }

  // Функция для выбора слота команды
  function selectTeamSlot(slotIndex) {
    // Снимаем выделение со всех слотов
    document.querySelectorAll('.team-slot').forEach(slot => {
      slot.classList.remove('highlight', 'selected-slot');
    });
    
    // Выделяем выбранный слот
    const slot = document.querySelector(`.team-slot[data-slot="${slotIndex}"]`);
    slot.classList.add('highlight', 'selected-slot');
    selectedSlotIndex = slotIndex;
    
    // Если карточка уже выбрана, сразу добавляем ее в команду
    if (selectedCardIndex !== -1) {
      const availableCards = [...collection].filter(card => 
        !currentTeam.some(member => 
          (member.id && member.id === card.id) || 
          (member.img && member.img === card.img) || 
          (member.imgUrl && member.imgUrl === (card.imgUrl || card.img))
        )
      );
      
      // Сортировка карточек
      const sortType = document.getElementById('cardFilter').value;
      if (sortType !== 'all') {
        availableCards.sort((a, b) => {
          if (sortType === 'rarity') {
            return b.rarity - a.rarity;
          } else if (sortType === 'power') {
            return b.power - a.power;
          } else if (sortType === 'beauty') {
            return b.beauty - a.beauty;
          } else if (sortType === 'charisma') {
            return b.charisma - a.charisma;
          } else if (sortType === 'vocal') {
            return b.vocal - a.vocal;
          }
          return 0;
        });
      }
      
      addCardToTeam(availableCards[selectedCardIndex], slotIndex);
    } else {
      // Показываем подсказку о необходимости выбрать карточку
      showFeedback('Теперь выберите карточку для этого слота');
    }
  }

  // Функция для добавления карточки в команду
  function addCardToTeam(card, slotIndex) {
    if (!card) {
      showFeedback('Ошибка: карточка не найдена');
      return;
    }
    
    const teamMember = {
      id: card.id || Date.now(),
      name: card.name,
      img: card.img,
      imgUrl: card.imgUrl || card.img,
      rarity: card.rarity,
      power: card.power,
      beauty: card.beauty,
      charisma: card.charisma,
      vocal: card.vocal,
      type: card.type
    };
    
    // Добавляем карточку в команду на указанный слот
    if (slotIndex < currentTeam.length) {
      // Заменяем существующую карточку
      currentTeam[slotIndex] = teamMember;
    } else {
      // Добавляем новую карточку
      currentTeam.push(teamMember);
    }
    
    // Показываем обратную связь
    showFeedback(`${card.name} добавлен в команду!`);
    
    // Сбрасываем выбранные элементы
    selectedCardIndex = -1;
    selectedSlotIndex = -1;
    
    // Обновляем содержимое модального окна
    updateTeamModalContent();
  }

  // Функция для удаления члена команды
  function removeTeamMember(index) {
    if (confirm(`Remove ${currentTeam[index].name} from your team?`)) {
      // Удаляем члена команды
      currentTeam.splice(index, 1);
      
      // Пересчитываем бонусы команды
      calculateTeamBonuses();
      
      // Обновляем отображение команды
      updateTeamDisplay();
      
      // Добавляем запись в лог
      updateActivityLog('Team Member Removed', 'A member has been removed from your team');
    }
  }

  // Функция для расчета бонусов команды
  function calculateTeamBonuses() {
    // Сбрасываем бонусы
    teamBonuses.fanGain = 0;
    teamBonuses.songQuality = 0;
    teamBonuses.performance = 0;
    
    // Считаем бонусы от каждого члена команды
    currentTeam.forEach(member => {
      // Бонус фанатов зависит от харизмы
      teamBonuses.fanGain += Math.floor(member.charisma / 10) + member.rarity * 2;
      
      // Бонус качества песни зависит от вокала
      teamBonuses.songQuality += Math.floor(member.vocal / 10) + member.rarity * 2;
      
      // Бонус выступления зависит от силы и красоты
      teamBonuses.performance += Math.floor((member.power + member.beauty) / 20) + member.rarity * 2;
    });
    
    // Обновляем отображение бонусов
    updateTycoonStats();
  }

  // Функция для создания песни
  function produceSong() {
    // Получаем выбранный тип песни и его стоимость
    const songTypeSelect = document.getElementById('songType');
    const songType = songTypeSelect.value;
    let cost = 0;
    let baseQuality = 0;
    
    switch (songType) {
      case 'pop':
        cost = 100;
        baseQuality = 1;
        break;
      case 'rock':
        cost = 200;
        baseQuality = 2;
        break;
      case 'ballad':
        cost = 300;
        baseQuality = 3;
        break;
      case 'dance':
        cost = 400;
        baseQuality = 4;
        break;
    }
    
    // Проверяем, хватает ли гемов
    if (totalGems < cost) {
      alert(`Not enough gems! You need ${cost}💎, but you have ${totalGems}💎`);
      return;
    }
    
    // Снимаем стоимость
    totalGems -= cost;
    
    // Рассчитываем качество песни с учетом бонуса
    let songQuality = baseQuality;
    if (teamBonuses.songQuality > 0) {
      // Улучшаем качество песни на основе бонуса
      songQuality += Math.floor(teamBonuses.songQuality / 20);
    }
    
    // Ограничиваем качество песни до 5
    songQuality = Math.min(songQuality, 5);
    
    // Создаем название песни
    const songNames = [
      'Melody of Dreams', 'Digital Heart', 'Electro Harmony', 
      'Future Vision', 'Cyber Angel', 'Crystal Voice', 
      'Neon Destiny', 'Virtual Love', 'Digital Heartbeat', 'Pixel Tears'
    ];
    
    const songTypeNames = {
      'pop': 'Pop',
      'rock': 'Rock',
      'ballad': 'Ballad',
      'dance': 'Dance'
    };
    
    const randomName = songNames[Math.floor(Math.random() * songNames.length)];
    const songName = `${randomName} (${songTypeNames[songType]})`;
    
    // Создаем объект песни
    const song = {
      id: Date.now(),
      name: songName,
      type: songType,
      quality: songQuality,
      performCount: 0
    };
    
    // Добавляем песню в список
    songs.push(song);
    
    // Обновляем отображение песен
    updateSongList();
    
    // Добавляем опыт студии
    addStudioExp(50 * songQuality);
    
    // Обновляем статистику
    updateTycoonStats();
    
    // Отмечаем ежедневную задачу, если она не выполнена
    if (!dailyTasks.composeSong) {
      dailyTasks.composeSong = true;
      document.getElementById('task2').checked = true;
    }
    
    // Добавляем запись в лог
    updateActivityLog(`New Song Created`, `Created "${songName}" (${songQuality}★)`);
  }

  // Функция для обновления списка песен
  function updateSongList() {
    const songList = document.getElementById('songList');
    songList.innerHTML = '';
    
    // Добавляем песни в список
    songs.forEach(song => {
      const songItem = document.createElement('div');
      songItem.className = 'song-item d-flex align-items-center justify-content-between mb-2 p-2 bg-dark rounded';
      
      let stars = '';
      for (let i = 0; i < song.quality; i++) {
        stars += '★';
      }
      
      songItem.innerHTML = `
        <span>${song.name} <span class="song-quality-${song.quality}">${stars}</span></span>
        <span class="badge bg-secondary">${song.type}</span>
      `;
      
      songList.appendChild(songItem);
    });
    
    // Обновляем список песен в выпадающем меню для концерта
    const concertSongSelect = document.getElementById('concertSong');
    if (concertSongSelect) {
      concertSongSelect.innerHTML = '';
      
      // Добавляем песни в выпадающее меню
      songs.forEach(song => {
        const option = document.createElement('option');
        option.value = song.id;
        
        let stars = '';
        for (let i = 0; i < song.quality; i++) {
          stars += '★';
        }
        
        option.textContent = `${song.name} (${stars})`;
        concertSongSelect.appendChild(option);
      });
    }
  }

  // Функция для обновления лога активности
  function updateActivityLog(title, description) {
    const activityLog = document.getElementById('activityLog');
    
    const activityItem = document.createElement('div');
    activityItem.className = 'activity-item d-flex align-items-center mb-2';
    
    activityItem.innerHTML = `
      <div class="activity-icon me-3">
        <i class="fas fa-music"></i>
      </div>
      <div class="activity-content">
        <p class="mb-0">${title}</p>
        <small class="text-muted">${description}</small>
      </div>
    `;
    
    // Добавляем новую запись в начало лога
    activityLog.insertBefore(activityItem, activityLog.firstChild);
    
    // Ограничиваем количество записей в логе
    if (activityLog.children.length > 10) {
      activityLog.removeChild(activityLog.lastChild);
    }
  }

  const characters = [
    
  ];

  let collection = [];

  // Массив с именами для карточек
  const mikuNames = [
    "Hatsune Miku", "Snow Miku", "Future Miku", "Miku Classic", "Miku Angel", 
    "Miku Star", "Miku Dream", "Miku Crystal", "Miku Aurora", "Miku Galaxy"
  ];

  async function getRandomDanbooruImage() {
    const tags = "hatsune_miku";
    const url = `https://danbooru.donmai.us/posts.json?tags=${encodeURIComponent(tags)}&limit=100`;
    const response = await fetch(url);
    const data = await response.json();
    if (data.length > 0) {
      // Перемешиваем массив данных, чтобы случайно выбирать изображения
      const shuffledData = data.sort(() => Math.random() - 0.5);
      for (const post of shuffledData) {
        if (post.file_url) {
          // Проверяем, доступно ли изображение
          try {
            const imgResponse = await fetch(post.file_url);
            if (imgResponse.ok) {
              return post.file_url;
            }
          } catch (error) {
            console.error("Ошибка загрузки изображения:", error);
          }
        }
      }
    }
    // Если ни одно изображение не загрузилось, возвращаем запасное изображение
    return "https://danbooru.donmai.us/data/sample/__hatsune_miku_vocaloid_drawn_by_tns_k__sample-c0df9bb90e9b91a9621175d188019021.jpg";
  }

  // Функция для генерации уникального имени на основе URL изображения
  function generateUniqueName(imgUrl) {
    // Используем хэш URL для генерации уникального имени
    const hash = imgUrl.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const names = [
      "Hatsune Miku", "Snow Miku", "Future Miku", "Miku Classic", "Miku Angel", 
      "Miku Star", "Miku Dream", "Miku Crystal", "Miku Aurora", "Miku Galaxy"
    ];
    return names[hash % names.length] + ` #${hash}`; // Добавляем уникальный идентификатор
  }

  // Добавим переменные для отслеживания коллекции
  const TOTAL_UNIQUE_CARDS = 200; // Общее количество уникальных карт
  let uniqueCardsCollected = 0; // Количество собранных уникальных карт

  // Массив для хранения информации о собранных уникальных картах
  let uniqueCards = {};

  // Функция для обновления счетчика коллекции
  function updateCollectionCounter() {
    // Подсчитываем количество уникальных карт в коллекции
    uniqueCardsCollected = Object.keys(uniqueCards).length;
    
    // Обновляем отображение счетчика на главной странице
    const cardCountElement = document.querySelector('.card-count');
    if (cardCountElement) {
      cardCountElement.textContent = `${uniqueCardsCollected}/${TOTAL_UNIQUE_CARDS}`;
    }
    
    // Обновляем счетчик в других местах, если необходимо
    // Например, в профиле
    const profileTotalCardsElement = document.getElementById('profileTotalCards');
    if (profileTotalCardsElement) {
      profileTotalCardsElement.textContent = uniqueCardsCollected;
    }
    
    // Вычисляем процент собранной коллекции
    const collectionPercentage = Math.floor((uniqueCardsCollected / TOTAL_UNIQUE_CARDS) * 100);
    console.log(`Collection progress: ${collectionPercentage}%`);
  }

  // Обновляем функцию pullGacha, чтобы она отслеживала уникальные карты
  async function pullGacha(times) {
    // Проверяем, достаточно ли у игрока гемов
    const cost = times * 10;
    if (totalGems < cost) {
      alert(`Not enough gems! You need ${cost}💎, but you have ${totalGems}💎`);
      return;
    }
    
    // Списываем гемы
    totalGems -= cost;
    updateTycoonStats();
    
    const resultContainer = document.getElementById("gachaResults");
    resultContainer.innerHTML = "";

    for (let i = 0; i < times; i++) {
      const imgUrl = await getRandomDanbooruImage();
      if (!imgUrl) continue;

      // Генерируем уникальное имя на основе URL изображения
      const uniqueName = generateUniqueName(imgUrl);

      // Генерируем редкость от 1 до 6
      const rarity = Math.floor(Math.random() * 6) + 1;

      // Ограничиваем характеристики в зависимости от редкости
      const maxStat = rarity * 20; // Максимальное значение характеристики = редкость * 20
      const power = Math.floor(Math.random() * maxStat) + 1;
      const beauty = Math.floor(Math.random() * maxStat) + 1;
      const charisma = Math.floor(Math.random() * maxStat) + 1;
      const vocal = Math.floor(Math.random() * maxStat) + 1;

      const char = {
        name: uniqueName, // Используем уникальное имя
        rarity: rarity,
        img: imgUrl,
        type: "miku",
        power: power,
        beauty: beauty,
        charisma: charisma,
        vocal: vocal,
        description: "A unique Miku character with random stats."
      };
      collection.push(char);
      
      // Обновляем список уникальных карт
      // Используем URL изображения как уникальный идентификатор карты
      if (!uniqueCards[imgUrl]) {
        uniqueCards[imgUrl] = char;
        // Обновляем счетчик коллекции при получении новой уникальной карты
        updateCollectionCounter();
      }

      const card = document.createElement("div");
      card.className = `col-md-3 gacha-animation`;
      card.innerHTML = `
        <div class="gacha-card p-2 rarity-${char.rarity}">
          <img src="${char.img}" class="img-fluid rounded" alt="${char.name}"/>
          <div class="text-center mt-2">
            <h5>${char.name}</h5>
            <span>${"★".repeat(char.rarity)}</span>
          </div>
        </div>
      `;

      // Добавляем анимацию "выпадения" карточки
      card.style.animation = "drop-in 0.5s ease-out";

      // Добавляем обработчик клика на карточку
      card.addEventListener("click", () => {
        document.getElementById("modalImage").src = char.img;
        document.getElementById("modalName").textContent = char.name;
        document.getElementById("modalRarity").textContent = "★".repeat(char.rarity);
        document.getElementById("modalPower").textContent = char.power;
        document.getElementById("modalBeauty").textContent = char.beauty;
        document.getElementById("modalCharisma").textContent = char.charisma;
        document.getElementById("modalVocal").textContent = char.vocal;
        document.getElementById("modalDescription").textContent = char.description;

        // Обновляем прогресс-бары
        document.getElementById("modalPowerBar").style.width = `${char.power}%`;
        document.getElementById("modalBeautyBar").style.width = `${char.beauty}%`;
        document.getElementById("modalCharismaBar").style.width = `${char.charisma}%`;
        document.getElementById("modalVocalBar").style.width = `${char.vocal}%`;

        const modal = new bootstrap.Modal(document.getElementById("characterModal"));
        modal.show();
      });

      // Добавляем задержку перед показом карточки
      setTimeout(() => {
        resultContainer.appendChild(card);
      }, i * 300); // Задержка в 300 мс между карточками

      // Добавляем звуковой эффект
      try {
      const audio = new Audio("https://www.soundjay.com/button/beep-07.mp3");
      audio.play();
      } catch (e) {
        console.log("Аудио не удалось воспроизвести:", e);
    }
    }
    
    // Обновляем статистику в профиле
    updateTycoonStats();
    updateCollection();
    updateCollectionCounter();
  }

  function updateCollection() {
    const allTab = document.getElementById("all");
    const mikuTab = document.getElementById("miku");
    const eventTab = document.getElementById("event");

    allTab.innerHTML = "";
    mikuTab.innerHTML = "";
    eventTab.innerHTML = "";

    // Группируем карточки по имени
    const groupedCollection = collection.reduce((acc, char) => {
      if (!acc[char.name]) {
        acc[char.name] = { ...char, count: 1 };
      } else {
        acc[char.name].count += 1;
      }
      return acc;
    }, {});

    // Получаем выбранный тип сортировки
    const sortType = document.getElementById("sortType").value;

    // Сортируем карточки в зависимости от выбранного типа
    const sortedCollection = Object.values(groupedCollection).sort((a, b) => {
      if (sortType === "rarity") {
        return b.rarity - a.rarity; // Сортировка по редкости (от большего к меньшему)
      } else if (sortType === "power") {
        return b.power - a.power; // Сортировка по силе
      } else if (sortType === "beauty") {
        return b.beauty - a.beauty; // Сортировка по красоте
      } else if (sortType === "charisma") {
        return b.charisma - a.charisma; // Сортировка по харизме
      } else if (sortType === "vocal") {
        return b.vocal - a.vocal; // Сортировка по вокалу
      } else {
        return 0; // Без сортировки
      }
    });

    // Группируем карточки по редкости (если выбрана сортировка по редкости)
    if (sortType === "rarity") {
      const groupedByRarity = sortedCollection.reduce((acc, char) => {
        if (!acc[char.rarity]) {
          acc[char.rarity] = [];
        }
        acc[char.rarity].push(char);
        return acc;
      }, {});

      // Отображаем карточки сгруппированными по редкости
      Object.keys(groupedByRarity).sort((a, b) => b - a).forEach(rarity => {
        const groupHeader = document.createElement("div");
        groupHeader.className = "rarity-header";
        groupHeader.innerHTML = `<span>${"★".repeat(rarity)}</span> Редкость: ${rarity}★`;
        allTab.appendChild(groupHeader);

        groupedByRarity[rarity].forEach(char => {
          const el = document.createElement("div");
          el.className = "d-inline-block text-center m-2";
          el.innerHTML = `
            <img src="${char.img}" class="img-thumbnail" alt="${char.name}" style="width: 100px;"/>
            <div class="mt-1">${char.name} <span class="badge bg-secondary">x${char.count}</span></div>
          `;

          // Добавляем обработчик клика на изображение в коллекции
          el.addEventListener("click", () => {
            document.getElementById("modalImage").src = char.img;
            document.getElementById("modalName").textContent = char.name;
            document.getElementById("modalRarity").textContent = "★".repeat(char.rarity);
            document.getElementById("modalPower").textContent = char.power;
            document.getElementById("modalBeauty").textContent = char.beauty;
            document.getElementById("modalCharisma").textContent = char.charisma;
            document.getElementById("modalVocal").textContent = char.vocal;
            document.getElementById("modalDescription").textContent = char.description;

            // Обновляем прогресс-бары
            document.getElementById("modalPowerBar").style.width = `${char.power}%`;
            document.getElementById("modalBeautyBar").style.width = `${char.beauty}%`;
            document.getElementById("modalCharismaBar").style.width = `${char.charisma}%`;
            document.getElementById("modalVocalBar").style.width = `${char.vocal}%`;

            const modal = new bootstrap.Modal(document.getElementById("characterModal"));
            modal.show();
          });

          allTab.appendChild(el);
          if (char.type === "miku") mikuTab.appendChild(el.cloneNode(true));
          if (char.type === "event") eventTab.appendChild(el.cloneNode(true));
        });
      });
    } else {
      // Отображаем карточки без группировки
      sortedCollection.forEach(char => {
        const el = document.createElement("div");
        el.className = "d-inline-block text-center m-2";
        el.innerHTML = `
          <img src="${char.img}" class="img-thumbnail" alt="${char.name}" style="width: 100px;"/>
          <div class="mt-1">${char.name} <span class="badge bg-secondary">x${char.count}</span></div>
        `;

        // Добавляем обработчик клика на изображение в коллекции
        el.addEventListener("click", () => {
          document.getElementById("modalImage").src = char.img;
          document.getElementById("modalName").textContent = char.name;
          document.getElementById("modalRarity").textContent = "★".repeat(char.rarity);
          document.getElementById("modalPower").textContent = char.power;
          document.getElementById("modalBeauty").textContent = char.beauty;
          document.getElementById("modalCharisma").textContent = char.charisma;
          document.getElementById("modalVocal").textContent = char.vocal;
          document.getElementById("modalDescription").textContent = char.description;

          // Обновляем прогресс-бары
          document.getElementById("modalPowerBar").style.width = `${char.power}%`;
          document.getElementById("modalBeautyBar").style.width = `${char.beauty}%`;
          document.getElementById("modalCharismaBar").style.width = `${char.charisma}%`;
          document.getElementById("modalVocalBar").style.width = `${char.vocal}%`;

          const modal = new bootstrap.Modal(document.getElementById("characterModal"));
          modal.show();
        });

        allTab.appendChild(el);
        if (char.type === "miku") mikuTab.appendChild(el.cloneNode(true));
        if (char.type === "event") eventTab.appendChild(el.cloneNode(true));
      });
    }
  }
  
  // Добавляем обработчики событий для клонированных элементов коллекции
  document.addEventListener('DOMContentLoaded', function() {
    // Инициализируем некоторые карточки для демонстрации на главной странице
    if (collection.length === 0) {
      characters.forEach(char => {
        collection.push({...char, 
          power: Math.floor(Math.random() * 80) + 20,
          beauty: Math.floor(Math.random() * 80) + 20,
          charisma: Math.floor(Math.random() * 80) + 20,
          vocal: Math.floor(Math.random() * 80) + 20,
          description: "A starter Miku character."
        });
        
        // Добавляем в список уникальных карт
        if (!uniqueCards[char.img]) {
          uniqueCards[char.img] = char;
        }
      });
      
      // Обновляем счетчик коллекции
      updateCollectionCounter();
    }
    
    // Инициализируем статистику тайкун-режима
    updateTycoonStats();
  });

  // Функция для сбора наград за ежедневные задания
  function collectDailyTasks() {
    let totalReward = 0;
    let gachaTickets = 0;
    let message = 'Collected rewards: ';
    
    // Проверяем каждое задание
    if (dailyTasks.completeConcert) {
      totalReward += 50;
      message += '50💎 for concert, ';
    }
    
    if (dailyTasks.composeSong) {
      totalReward += 100;
      message += '100💎 for song, ';
    }
    
    if (dailyTasks.gainFans) {
      totalReward += 100;
      gachaTickets += 1;
      message += '100💎 + 1 ticket for fans, ';
    }
    
    // Если хотя бы одно задание выполнено
    if (totalReward > 0) {
      // Добавляем награды
      totalGems += totalReward;
      
      // Сбрасываем задания и чекбоксы
      dailyTasks.completeConcert = false;
      dailyTasks.composeSong = false;
      dailyTasks.gainFans = false;
      
      document.getElementById('task1').checked = false;
      document.getElementById('task2').checked = false;
      document.getElementById('task3').checked = false;
      
      // Обрезаем запятую и пробел в конце сообщения
      message = message.slice(0, -2);
      
      // Показываем сообщение и обновляем статистику
      alert(`${message}. Total: ${totalReward}💎${gachaTickets > 0 ? ' + ' + gachaTickets + ' gacha ticket(s)' : ''}`);
      updateTycoonStats();
      
      // Добавляем запись в лог
      updateActivityLog('Daily Tasks Completed', `Received ${totalReward}💎${gachaTickets > 0 ? ' + ' + gachaTickets + ' ticket(s)' : ''}`);
    } else {
      alert('No completed tasks to collect rewards from.');
    }
  }

  // Обработчик изменения цены билета
  document.addEventListener('DOMContentLoaded', function() {
    const ticketPriceSlider = document.getElementById('ticketPrice');
    const ticketPriceValue = document.getElementById('ticketPriceValue');
    
    if (ticketPriceSlider && ticketPriceValue) {
      ticketPriceSlider.addEventListener('input', function() {
        ticketPriceValue.textContent = this.value;
      });
    }
  });

  // Функция для проведения концерта
  function startConcert() {
    // Получаем выбранную площадку
    const venueSelect = document.getElementById('concertVenue');
    const venue = venueSelect.value;
    
    // Затраты и лимиты для разных площадок
    const venueCosts = {
      'small': 50,
      'medium': 200,
      'large': 500,
      'arena': 1000,
      'stadium': 2000
    };
    
    const venueMaxFans = {
      'small': 100,
      'medium': 500,
      'large': 2000,
      'arena': 5000,
      'stadium': 10000
    };
    
    const venueNames = {
      'small': 'Small Venue',
      'medium': 'Medium Venue',
      'large': 'Large Venue',
      'arena': 'Arena',
      'stadium': 'Stadium'
    };
    
    // Проверяем, достаточно ли гемов
    if (totalGems < venueCosts[venue]) {
      alert(`Not enough gems! You need ${venueCosts[venue]}💎, but you have ${totalGems}💎`);
      return;
    }
    
    // Получаем выбранную песню
    const songSelect = document.getElementById('concertSong');
    let selectedSong;
    
    if (songSelect && songSelect.value !== 'default') {
      const songId = parseInt(songSelect.value);
      selectedSong = songs.find(song => song.id === songId);
    } else {
      // Если нет выбранной песни, используем демо-песню
      selectedSong = {
        name: 'Example Song',
        quality: 3,
        type: 'pop'
      };
    }
    
    // Получаем цену билета
    const ticketPrice = parseInt(document.getElementById('ticketPrice').value);
    
    // Снимаем стоимость аренды площадки
    totalGems -= venueCosts[venue];
    
    // Рассчитываем базовое количество привлеченных фанатов
    let baseFans = Math.floor(Math.random() * (venueMaxFans[venue] / 2)) + Math.floor(venueMaxFans[venue] / 2);
    
    // Корректируем на основе цены билета
    // Чем выше цена, тем меньше фанатов, но больше доход
    const priceMultiplier = 1 - ((ticketPrice - 10) / 100);
    baseFans = Math.floor(baseFans * priceMultiplier);
    
    // Применяем бонус качества песни
    baseFans = Math.floor(baseFans * (1 + (selectedSong.quality * 0.1)));
    
    // Применяем бонус команды
    if (teamBonuses.fanGain > 0) {
      baseFans = Math.floor(baseFans * (1 + (teamBonuses.fanGain / 100)));
    }
    
    // Проверяем на максимум для площадки
    const actualFans = Math.min(baseFans, venueMaxFans[venue]);
    
    // Рассчитываем заработанные гемы
    let earnedGems = Math.floor(actualFans * (ticketPrice / 10));
    
    // Применяем бонус команды к выступлению
    if (teamBonuses.performance > 0) {
      earnedGems = Math.floor(earnedGems * (1 + (teamBonuses.performance / 100)));
    }
    
    // Добавляем фанатов и гемы
    totalFans += actualFans;
    totalGems += earnedGems;
    totalConcerts += 1;
    
    // Добавляем опыт студии
    addStudioExp(100 + (selectedSong.quality * 20));
    
    // Обновляем ранг студии
    updateStudioRank();
    
    // Отмечаем ежедневную задачу, если она не выполнена
    if (!dailyTasks.completeConcert) {
      dailyTasks.completeConcert = true;
      document.getElementById('task1').checked = true;
    }
    
    // Проверяем выполнение задания по привлечению фанатов
    if (!dailyTasks.gainFans && actualFans >= 100) {
      dailyTasks.gainFans = true;
      document.getElementById('task3').checked = true;
    }
    
    // Обновляем статистику
    updateTycoonStats();
    
    // Генерируем рейтинг выступления
    let performanceRating = '';
    let ratingStars = '';
    let performanceComment = '';
    
    // Качество выступления зависит от количества фанатов относительно максимума
    const performanceQuality = actualFans / venueMaxFans[venue];
    
    if (performanceQuality >= 0.9) {
      performanceRating = 'Outstanding!';
      ratingStars = '★★★★★';
      performanceComment = 'The performance was a huge success! The fans loved every moment!';
    } else if (performanceQuality >= 0.7) {
      performanceRating = 'Great!';
      ratingStars = '★★★★☆';
      performanceComment = 'The performance was very successful! Most fans really enjoyed it!';
    } else if (performanceQuality >= 0.5) {
      performanceRating = 'Good!';
      ratingStars = '★★★☆☆';
      performanceComment = 'The performance was good! The fans enjoyed the show.';
    } else if (performanceQuality >= 0.3) {
      performanceRating = 'Average';
      ratingStars = '★★☆☆☆';
      performanceComment = 'The performance was average. Some fans seemed to enjoy it.';
    } else {
      performanceRating = 'Poor';
      ratingStars = '★☆☆☆☆';
      performanceComment = 'The performance was not very good. Few fans enjoyed it.';
    }
    
    // Заполняем данные в модальном окне результатов
    document.getElementById('concertVenueName').textContent = venueNames[venue];
    document.getElementById('concertSongName').textContent = `Song: ${selectedSong.name}`;
    document.getElementById('concertFans').textContent = `+${actualFans}`;
    document.getElementById('concertGems').textContent = `+${earnedGems}`;
    document.getElementById('performanceRating').textContent = performanceRating;
    document.getElementById('ratingStars').textContent = ratingStars;
    document.getElementById('performanceComment').textContent = performanceComment;
    
    // Закрываем старое модальное окно, если оно открыто
    if (concertResultModalInstance) {
      concertResultModalInstance.hide();
      clearBackdrops();
      concertResultModalInstance = null;
    }
    
    // Очищаем любые существующие backdrop элементы
    clearBackdrops();
    
    // Показываем модальное окно с результатами
    const concertResultModalElement = document.getElementById('concertResultModal');
    concertResultModalInstance = new bootstrap.Modal(concertResultModalElement);
    
    // Добавляем обработчик на закрытие модального окна
    concertResultModalElement.addEventListener('hidden.bs.modal', function() {
      clearBackdrops();
    }, { once: true });
    
    concertResultModalInstance.show();
    
    // Добавляем запись в лог
    updateActivityLog('Concert Performed', `Gained ${actualFans} fans and ${earnedGems} gems`);
  }

  // Функция для "поделиться" результатами концерта
  function shareConcertResult() {
    alert('Concert results shared on social media!');
    
    // Бонус за шеринг
    totalFans += 10;
    updateTycoonStats();
    
    // Добавляем запись в лог
    updateActivityLog('Shared Results', 'Gained 10 extra fans from social media');
  }

  // Добавляем обработчик для кнопки сохранения команды
  document.addEventListener('DOMContentLoaded', function() {
    const saveTeamButton = document.getElementById('saveTeam');
    if (saveTeamButton) {
      saveTeamButton.addEventListener('click', function() {
        // Закрываем модальное окно
        if (teamModalInstance) {
          teamModalInstance.hide();
        }
        
        // Пересчитываем бонусы команды
        calculateTeamBonuses();
        
        // Обновляем отображение команды
        updateTeamDisplay();
        
        // Показываем сообщение об успешном сохранении
        showFeedback('Team composition saved!');
        
        // Добавляем запись в лог
        updateActivityLog('Team Updated', 'Your team composition has been updated');
      });
    }
  });

  // Функция для очистки backdrop элементов
  function clearBackdrops() {
    // Удаляем все modal-backdrop элементы
    document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
      backdrop.remove();
    });
    
    // Удаляем класс modal-open с body
    document.body.classList.remove('modal-open');
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
  }

  // Добавляем обработчик событий для всех модальных окон
  document.addEventListener('DOMContentLoaded', function() {
    // Очищаем все backdrop элементы при загрузке страницы
    clearBackdrops();
    
    // Добавляем обработчики для всех модальных окон, чтобы правильно удалять backdrop
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
      modal.addEventListener('hidden.bs.modal', function() {
        // Небольшая задержка перед очисткой, чтобы анимация успела завершиться
        setTimeout(clearBackdrops, 100);
      });
    });
  });

  

  // Функция для анимированного появления элементов при загрузке страницы
  function animateElementsOnLoad() {
    const elements = document.querySelectorAll('.feature-box, .site-header, .card-thumbnail, .feature-button, .play-button');
    
    elements.forEach((element, index) => {
      // Задаем начальные стили для анимации
      element.style.opacity = '0';
      element.style.transform = 'translateY(20px)';
      element.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
      
      // Задержка для последовательной анимации
      setTimeout(() => {
        element.style.opacity = '1';
        element.style.transform = 'translateY(0)';
      }, 100 * index);
    });
  }

  // Добавляем инициализацию эффектов при загрузке страницы
  document.addEventListener('DOMContentLoaded', function() {
    // Очищаем все backdrop элементы при загрузке страницы
    clearBackdrops();
    
    // Добавляем обработчики для всех модальных окон, чтобы правильно удалять backdrop
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
      modal.addEventListener('hidden.bs.modal', function() {
        // Небольшая задержка перед очисткой, чтобы анимация успела завершиться
        setTimeout(clearBackdrops, 100);
      });
    });
    

    
    // Анимируем элементы при загрузке
    animateElementsOnLoad();
    
    // Добавляем эффект параллакса для фона
    document.addEventListener('mousemove', function(e) {
      const moveX = (e.clientX - window.innerWidth / 2) / 50;
      const moveY = (e.clientY - window.innerHeight / 2) / 50;
      
      document.querySelectorAll('.musical-particle-1, .musical-particle-2, .musical-particle-3, .musical-particle-4, .musical-particle-5, .floating-note').forEach(particle => {
        particle.style.transform = `translate(${moveX}px, ${moveY}px)`;
      });
    });
  });
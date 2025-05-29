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
    renderNews(sampleNewsData, 'dynamicNewsContainer');
  }
  
  function showShop() {
    hideAllSections();
    document.getElementById('shopSection').style.display = 'block';
  }
  
  function showEvents() {
    hideAllSections();
    document.getElementById('eventsSection').style.display = 'block';
    renderEvents(sampleEventsData, 'dynamicEventsContainer');
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
    const isActive = menu.classList.contains('active');
    
    if (!isActive) { // Menu is about to open
      menu.classList.add('active');
      const navLinks = menu.querySelectorAll('.nav-link');
      navLinks.forEach((link, index) => {
        link.style.animationDelay = `${index * 0.07}s`; // Stagger delay
      });
    } else { // Menu is about to close
      menu.classList.remove('active');
      // Optional: Remove animation delays if they cause issues, though CSS animation should reset
      const navLinks = menu.querySelectorAll('.nav-link');
      navLinks.forEach(link => {
        link.style.animationDelay = ''; // Reset delay
      });
    }
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
  let selectedCardData = null; // Заменяем selectedCardIndex
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
    selectedCardData = null;
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
    let availableCards = [...collection].filter(card => 
        !currentTeam.some(member => 
            (member.id && member.id === card.id) || 
            (member.img && member.img === card.img) || 
            (member.imgUrl && member.imgUrl === (card.imgUrl || card.img))
        )
    );
    
    // Сортировка карточек
    const cardFilterElement = document.getElementById('cardFilter');
    const sortType = cardFilterElement ? cardFilterElement.value : 'all';
    
    if (sortType !== 'all') {
        availableCards.sort((a, b) => {
            if (sortType === 'rarity') { return b.rarity - a.rarity; }
            else if (sortType === 'power') { return b.power - a.power; }
            else if (sortType === 'beauty') { return b.beauty - a.beauty; }
            else if (sortType === 'charisma') { return b.charisma - a.charisma; }
            else if (sortType === 'vocal') { return b.vocal - a.vocal; }
            return 0;
        });
    }
    
    if (availableCards.length === 0) {
      const placeholder = document.createElement('div');
      placeholder.className = 'card-placeholder';
      placeholder.textContent = 'No available cards';
      cardSelection.appendChild(placeholder);
    } else {
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
          cardElement.className = 'card-option img-fluid team-manager-img'; // Добавляем класс team-manager-img
          cardElement.src = card.imgUrl || card.img;
          cardElement.alt = card.name;
          
          // Если эта карточка выбрана, добавляем класс selected
          if (selectedCardData && ((selectedCardData.id && selectedCardData.id === card.id) || selectedCardData.imgUrl === (card.imgUrl || card.img))) {
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
          
          // Добавляем обработчик клика на карточку
          cardElement.addEventListener('click', function() {
            // Снимаем выделение со всех карточек
            document.querySelectorAll('.card-option').forEach(el => {
              el.classList.remove('selected');
            });
            
            // Выделяем текущую карточку
            this.classList.add('selected');
            selectedCardData = card; // Сохраняем объект карты
            selectedSlotIndex = -1; 
            
            // Убираем подсветку со слотов
            document.querySelectorAll('.team-slot').forEach(slot => {
              slot.classList.remove('highlight', 'selected-slot');
            });

            // Показываем подсказку о необходимости выбрать слот
            showFeedback('Карта выбрана. Теперь кликните на слот в команде.');
              
            // Подсвечиваем доступные слоты
            highlightAvailableSlots();
          });
          
          cardSelection.appendChild(cardContainer);
        }
      });
    }
  }

  // Новая функция для подсветки ВСЕХ слотов команды
  function highlightAvailableSlots() {
    const teamSlots = document.querySelectorAll('.team-slot');
    teamSlots.forEach((slot, index) => {
      if (index < maxTeamSize) { // Подсвечиваем только существующие слоты
          slot.classList.add('highlight');
          // Можно добавить таймер для снятия подсветки, если нужно
          /*
          setTimeout(() => {
              if (selectedSlotIndex !== index) { // Не убирать подсветку, если слот выбран
                  slot.classList.remove('highlight');
              }
          }, 3000); 
          */
      }
    });
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
      
      // ----- ИЗМЕНЕНИЕ ЛОГИКИ КЛИКА ПО СЛОТУ ----- 
      const handleSlotClick = function(slotIndex) {
          if (!selectedCardData) { // Проверяем наличие объекта карты
              showFeedback('Сначала выберите карточку из вашей коллекции справа.');
              return; 
          }
          
          // Данные карты уже есть в selectedCardData
          // Убираем повторное получение availableCards и поиск по индексу
          /*
          let availableCards = [...];
          const sortType = ...;
          if (sortType !== 'all') { ... }
          const selected_card_data = availableCards[selectedCardIndex];
          if (!selected_card_data) { ... }
          */

          // Добавляем карту в команду
          addCardToTeam(selectedCardData, slotIndex); // Передаем объект карты
      };
      // ----- КОНЕЦ ИЗМЕНЕНИЯ ЛОГИКИ КЛИКА ПО СЛОТУ -----

      if (i < currentTeam.length) {
        // Слот занят
        const member = currentTeam[i];
        teamSlot.innerHTML = `
          <div class="d-flex">
            <div class="card-thumbnail me-3 position-relative">
              <img src="${member.imgUrl || member.img}" alt="${member.name}" class="img-fluid team-manager-img"> 
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
          event.stopPropagation(); // Предотвращаем всплытие на родительский div
          if (confirm(`Remove ${member.name} from your team?`)) {
            currentTeam.splice(i, 1);
            selectedCardData = null; // Сбрасываем выбор карты
            selectedSlotIndex = -1; 
            updateTeamModalContent();
          }
        });
        
        // Обработчик для занятого слота
        teamSlot.addEventListener('click', () => handleSlotClick(i));
        
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
              <small class="text-muted">Кликните, чтобы поместить сюда выбранную карту</small>
            </div>
          </div>
        `;
        
        // Обработчик для пустого слота
        teamSlot.addEventListener('click', () => handleSlotClick(i));
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
    if (selectedCardData !== null) {
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
      
      addCardToTeam(availableCards[selectedCardData.id], slotIndex);
    } else {
      // Показываем подсказку о необходимости выбрать карточку
      showFeedback('Теперь выберите карточку для этого слота');
    }
  }

  // Функция для добавления карточки в команду
  function addCardToTeam(card, slotIndex) {
    if (!card) { // Проверка на null/undefined
      showFeedback('Ошибка: не переданы данные карты для добавления.');
      return;
    }

    const teamMember = {
      id: card.id || Date.now() + Math.random(), // Улучшаем генерацию ID на всякий случай
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
    
    if (slotIndex < currentTeam.length) {
      currentTeam[slotIndex] = teamMember;
    } else {
      currentTeam.push(teamMember);
    }
    
    showFeedback(`${card.name} добавлен(а) в команду!`);
    
    selectedCardData = null; // Сбрасываем объект карты
    selectedSlotIndex = -1;
    
    updateTeamModalContent(); // Обновляем окно ПОСЛЕ сброса
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

  // Массив для отслеживания использованных локальных изображений (перемещаем в глобальную область)
  const localImages = [
    'img_card_game/miku (1).png',
    'img_card_game/miku (2).png',
    'img_card_game/miku (3).png',
    'img_card_game/miku (4).png',
    'img_card_game/miku (5).png',
    'img_card_game/miku (6).png',
    'img_card_game/miku (7).png',
    'img_card_game/miku (1).jpg',
    'img_card_game/miku (2).jpg',
    'img_card_game/miku (3).jpg',
    'img_card_game/miku (4).jpg',
    'img_card_game/miku (5).jpg',
    'img_card_game/miku (6).jpg',
    'img_card_game/miku (7).jpg',
    'img_card_game/miku (8).jpg',
    'img_card_game/miku (9).jpg',
    'img_card_game/miku (10).jpg',
    'img_card_game/miku (11).jpg',
    'img_card_game/miku (12).jpg',
    'img_card_game/miku (13).jpg',
    'img_card_game/miku (14).jpg',
    'img_card_game/miku (15).jpg',
    'img_card_game/miku (16).jpg',
    'img_card_game/miku (17).jpg',
    'img_card_game/miku (18).jpg',
    'img_card_game/miku (19).jpg',
    'img_card_game/miku (20).jpg',
    'img_card_game/miku (21).jpg',
    'img_card_game/miku (22).jpg',
    'img_card_game/miku (23).jpg',
    'img_card_game/miku (24).jpg',
    'img_card_game/miku (25).jpg',
    'img_card_game/miku (26).jpg',
    'img_card_game/miku (27).jpg',
    'img_card_game/miku (28).jpg',
    'img_card_game/miku (29).jpg',
    'img_card_game/miku (30).jpg',
    'img_card_game/miku (31).jpg',
    'img_card_game/miku (32).jpg',
    'img_card_game/miku (33).jpg',
    'img_card_game/miku (34).jpg',
    'img_card_game/miku (35).jpg',
    'img_card_game/miku (82).jpg',
    'img_card_game/miku (81).jpg',
    'img_card_game/miku (80).jpg',
    'img_card_game/miku (79).jpg',
    'img_card_game/miku (78).jpg',
    'img_card_game/miku (77).jpg',
    'img_card_game/miku (76).jpg',
    'img_card_game/miku (75).jpg',
    'img_card_game/miku (74).jpg',
    'img_card_game/miku (73).jpg',
    'img_card_game/miku (72).jpg',
    'img_card_game/miku (71).jpg',
    'img_card_game/miku (70).jpg',
    'img_card_game/miku (69).jpg',
    'img_card_game/miku (68).jpg',
    'img_card_game/miku (67).jpg',
    'img_card_game/miku (66).jpg',
    'img_card_game/miku (65).jpg',
    'img_card_game/miku (64).jpg',
    'img_card_game/miku (63).jpg',
    'img_card_game/miku (62).jpg',
    'img_card_game/miku (61).jpg',
    'img_card_game/miku (60).jpg',
    'img_card_game/miku (59).jpg',
    'img_card_game/miku (58).jpg',
    'img_card_game/miku (57).jpg',
    'img_card_game/miku (56).jpg',
    'img_card_game/miku (55).jpg',
    'img_card_game/miku (54).jpg',
    'img_card_game/miku (53).jpg',
    'img_card_game/miku (52).jpg',    
    'img_card_game/miku (51).jpg',
    'img_card_game/miku (50).jpg',
    'img_card_game/miku (49).jpg',
    'img_card_game/miku (48).jpg',
    'img_card_game/miku (47).jpg',
    'img_card_game/miku (46).jpg',
    'img_card_game/miku (45).jpg',
    'img_card_game/miku (44).jpg',
    'img_card_game/miku (43).jpg',
    'img_card_game/miku (42).jpg',
    'img_card_game/miku (41).jpg',
    'img_card_game/miku (40).jpg',
    'img_card_game/miku (39).jpg',
    'img_card_game/miku (38).jpg',
    'img_card_game/miku (37).jpg',
    'img_card_game/miku (36).jpg'
    
  ];

  let usedLocalImages = new Set();
  let unavailableImages = new Set();

  async function getRandomDanbooruImage() {
    // Используем только локальные изображения
    const availableImages = localImages.filter(image => 
      !usedLocalImages.has(image) && !unavailableImages.has(image)
    );

    if (availableImages.length > 0) {
      const randomIndex = Math.floor(Math.random() * availableImages.length);
      const selectedImage = availableImages[randomIndex];
      
      try {
        const img = new Image();
        img.src = selectedImage;
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = () => {
            console.error(`Ошибка загрузки локального изображения ${selectedImage}: изображение недоступно`);
            unavailableImages.add(selectedImage); // Помечаем как недоступное
            reject(new Error(`Failed to load local image: ${selectedImage}`)); // Добавляем reject с ошибкой
          };
        });
        usedLocalImages.add(selectedImage);
        return selectedImage;
      } catch (error) {
        // Если изображение недоступно, рекурсивно пробуем другое
        // Добавим проверку, чтобы избежать бесконечной рекурсии, если все недоступны
        if (unavailableImages.size < localImages.length) {
          return getRandomDanbooruImage(); 
        } else {
          console.error("Все локальные изображения недоступны или не удалось загрузить.");
          return null; // Возвращаем null, если все перепробованы и недоступны
        }
      }
    }

    // Если все доступные изображения уже использованы, сбрасываем список использованных и пробуем снова
    if (usedLocalImages.size === localImages.length - unavailableImages.size && availableImages.length === 0) {
      console.log("Все локальные изображения были использованы, начинаем заново...");
      usedLocalImages.clear();
      // Рекурсивно вызываем, чтобы выбрать из теперь полного списка
      return getRandomDanbooruImage();
    }

    // Если дошли сюда, значит что-то пошло не так (например, все изображения недоступны)
    console.error("Не удалось найти доступное локальное изображение.");
    return null; // Возвращаем null в качестве запасного варианта
  }

  let usedNames = new Set();

  function generateUniqueName(imgUrl, rarity = 1, power = 0, beauty = 0, charisma = 0, vocal = 0) {
    // Создаем хэш на основе всех параметров
    const hash = [imgUrl, rarity, power, beauty, charisma, vocal]
      .join('_')
      .split('')
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);

    // Тематические префиксы в зависимости от доминирующей характеристики
    const prefixes = {
      power: ["Energetic", "Powerful", "Dynamic", "Strong"],
      beauty: ["Elegant", "Graceful", "Beautiful", "Charming"],
      charisma: ["Charismatic", "Magnetic", "Radiant", "Stunning"],
      vocal: ["Melodic", "Harmonic", "Singing", "Musical"]
    };

    // Определяем доминирующую характеристику
    const stats = {
      power: power,
      beauty: beauty,
      charisma: charisma,
      vocal: vocal
    };
    
    const dominantStat = Object.entries(stats).reduce((a, b) => a[1] > b[1] ? a : b)[0];
    
    // Выбираем случайный префикс для доминирующей характеристики
    const prefix = prefixes[dominantStat][hash % prefixes[dominantStat].length];

    const names = [
      "Miku", "Snow Princess", "Future Diva", "Virtual Singer", "Cyber Angel", 
      "Star Vocalist", "Dream Idol", "Crystal Voice", "Digital Performer", "Galaxy Queen"
    ];
    
    const baseName = names[hash % names.length];
    
    // Создаем короткий ID (3 цифры)
    const shortId = (hash % 1000).toString().padStart(3, '0');
    
    // Возвращаем упрощенное имя
    return `${prefix} ${baseName} #${shortId}`;
  }

  // Функция для генерации описания характеристик
  function generateStatsDescription(power, beauty, charisma, vocal) {
    return `<div class="card-stats">
      <div><strong>P${power}</strong>: Power (Сила)</div>
      <div><strong>B${beauty}</strong>: Beauty (Красота)</div>
      <div><strong>C${charisma}</strong>: Charisma (Харизма)</div>
      <div><strong>V${vocal}</strong>: Vocal (Вокал)</div>
    </div>`;
  }

  // Добавим переменные для отслеживания коллекции
  const TOTAL_UNIQUE_CARDS = localImages.length; // <--- Обновляем, чтобы соответствовать кол-ву артов
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

  function generateCardKey(imgUrl, rarity, power, beauty, charisma, vocal) {
    return `${imgUrl}_${rarity}_${power}_${beauty}_${charisma}_${vocal}`;
  }

  // Глобальная переменная для хранения данных последнего пулла
  let lastPulledCardsData = [];
  let gachaPullModalInstance = null;

  // Модифицированная функция для отображения карточек
  function displayPulledCards(cardsData, containerId) {
    const resultContainer = document.getElementById(containerId);
    if (!resultContainer) {
        console.error(`Container with id ${containerId} not found!`);
        return;
    }
    resultContainer.innerHTML = ""; // Очищаем контейнер

    cardsData.forEach((char, index) => {
        const cardCol = document.createElement("div");
        cardCol.className = `col-lg-3 col-md-4 col-sm-6 gacha-animation`; 

        const cardElement = document.createElement("div");
        cardElement.className = `gacha-card p-2 rarity-${char.rarity}`;
        cardElement.innerHTML = `
            <img src="${char.img}" class="img-fluid rounded" alt="${char.name}"/>
            <div class="text-center mt-1">
              <h6 class="mb-0" style="font-size: 0.9rem;">${char.name}</h6> 
              <span style="font-size: 0.8rem;">${"★".repeat(char.rarity)}</span>
            </div>
        `;

        cardElement.style.animation = "drop-in 0.5s ease-out";
        cardElement.style.animationDelay = `${index * 0.1}s`;

        // --- УДАЛЯЕМ УСЛОВИЕ IF И ВСЕГДА ДОБАВЛЯЕМ КЛИК --- 
        // if (containerId === 'gachaResults') { ... } else { ... }
        cardElement.addEventListener("click", () => {
            // Убедимся, что элементы модального окна деталей существуют
            const modalImage = document.getElementById("modalImage");
            const modalName = document.getElementById("modalName");
            const modalRarity = document.getElementById("modalRarity");
            const modalPower = document.getElementById("modalPower");
            const modalBeauty = document.getElementById("modalBeauty");
            const modalCharisma = document.getElementById("modalCharisma");
            const modalVocal = document.getElementById("modalVocal");
            const modalDescription = document.getElementById("modalDescription");
            const modalStatsInfo = document.getElementById("modalStatsInfo");
            const modalPowerBar = document.getElementById("modalPowerBar");
            const modalBeautyBar = document.getElementById("modalBeautyBar");
            const modalCharismaBar = document.getElementById("modalCharismaBar");
            const modalVocalBar = document.getElementById("modalVocalBar");
            const characterModalElement = document.getElementById("characterModal");

            if (!characterModalElement || !modalImage || !modalName /* ... добавьте остальные проверки ... */) {
                console.error("Ошибка: Не найдены элементы модального окна деталей персонажа!");
                return;
            }
            
            // Заполняем данными и показываем модальное окно деталей
            modalImage.src = char.imgUrl || char.img; // Используем imgUrl или img
            modalName.textContent = char.name;
            modalRarity.textContent = "★".repeat(char.rarity);
            modalPower.textContent = char.power;
            modalBeauty.textContent = char.beauty;
            modalCharisma.textContent = char.charisma;
            modalVocal.textContent = char.vocal;
            modalDescription.textContent = char.description;
            if(modalStatsInfo) modalStatsInfo.innerHTML = generateStatsDescription(char.power, char.beauty, char.charisma, char.vocal);
            
            // Обновляем прогресс-бары
            if(modalPowerBar) modalPowerBar.style.width = `${char.power}%`;
            if(modalBeautyBar) modalBeautyBar.style.width = `${char.beauty}%`;
            if(modalCharismaBar) modalCharismaBar.style.width = `${char.charisma}%`;
            if(modalVocalBar) modalVocalBar.style.width = `${char.vocal}%`;

            // Создаем и показываем экземпляр модального окна Bootstrap
            // Важно: не создавайте новый экземпляр каждый раз, если он уже есть
            let characterModalInstance = bootstrap.Modal.getInstance(characterModalElement);
            if (!characterModalInstance) {
                characterModalInstance = new bootstrap.Modal(characterModalElement);
            }
            characterModalInstance.show();
        });
        // ---------------------------------------------------
        
        cardCol.appendChild(cardElement);
        resultContainer.appendChild(cardCol);

        // Звуковой эффект
        try {
            const audio = new Audio("https://www.soundjay.com/button/beep-07.mp3");
            setTimeout(() => audio.play(), index * 150);
        } catch (e) {
            console.log("Аудио не удалось воспроизвести:", e);
        }
    }); // Конец forEach
  } // Конец функции displayPulledCards

  // Функция для генерации редкости с учетом вероятности
  function getRandomRarity() {
    const random = Math.random() * 100; // Генерируем случайное число от 0 до 100

    if (random < 0.1) {
      return 6; // 6 звезд с вероятностью 0.1%
    } else if (random < 1) {
      return 5; // 5 звезд с вероятностью 0.9%
    } else if (random < 5) {
      return 4; // 4 звезды с вероятностью 4%
    } else if (random < 15) {
      return 3; // 3 звезды с вероятностью 10%
    } else if (random < 40) {
      return 2; // 2 звезды с вероятностью 25%
    } else {
      return 1; // 1 звезда с вероятностью 60%
    }
  }

  // Обновляем pullGacha
  async function pullGacha(times) {
    const cost = times * 10;
    if (totalGems < cost) {
      alert(`Not enough gems! You need ${cost}💎, but you have ${totalGems}💎`);
      return;
    }

    totalGems -= cost;
    updateTycoonStats();

    const modalElement = document.getElementById('gachaPullModal');
    const modalMessage = document.getElementById('gachaPullModalMessage');
    const collectButton = document.getElementById('collectGachaButton');
    const spinner = document.getElementById('gachaSpinner');
    const modalResultsContainer = document.getElementById('gachaPullModalResults');

    if (!modalElement || !modalMessage || !collectButton || !spinner || !modalResultsContainer) {
        console.error("Ошибка: Не найден один или несколько элементов модального окна гачи!");
        alert("Произошла ошибка интерфейса гачи. Пожалуйста, перезагрузите страницу.");
        return;
    }

    modalMessage.textContent = `Pulling ${times} card(s)...`;
    collectButton.disabled = true;
    spinner.style.display = 'block';
    modalResultsContainer.innerHTML = '';

    if (!gachaPullModalInstance) {
        if (modalElement) {
          gachaPullModalInstance = new bootstrap.Modal(modalElement);
        } else {
          console.error("Невозможно создать экземпляр модального окна: modalElement is null");
          return;
        }
    }
    gachaPullModalInstance.show();

    // --- Генерация данных карт (ПОСЛЕДОВАТЕЛЬНАЯ ОБРАБОТКА) ---
    lastPulledCardsData = [];
    
    // Состояние уникальных артов из ГЛОБАЛЬНОЙ коллекции ДО начала этого пулла
    const uniqueImageUrlsInGlobalCollection = new Set(
        Object.values(uniqueCards).map(card => card.imgUrl || card.img)
    );
    
    // Арты, которые были использованы для УНИКАЛЬНОЙ карты В ЭТОМ ПУЛЛЕ
    let imageUrlsUsedForUniqueCardInThisBatch = new Set();

    for (let i = 0; i < times; i++) {
        // 1. Получаем арт
        // getRandomDanbooruImage уже пытается дать уникальный арт для каждой карты в пакете через usedLocalImages
        const imgUrl = await getRandomDanbooruImage();

        if (!imgUrl) {
            console.warn(`Пропуск карты ${i + 1} из-за отсутствия imgUrl.`);
            // Можно добавить null в lastPulledCardsData или просто пропустить, 
            // чтобы в lastPulledCardsData были только успешно созданные карты
            continue; 
        }

        // 2. Генерируем характеристики, имя и т.д.
        const rarity = getRandomRarity();
        const maxStat = rarity * 20;
        const power = Math.floor(Math.random() * maxStat) + 1;
        const beauty = Math.floor(Math.random() * maxStat) + 1;
        const charisma = Math.floor(Math.random() * maxStat) + 1;
        const vocal = Math.floor(Math.random() * maxStat) + 1;
        
        const uniqueName = generateUniqueName(imgUrl, rarity, power, beauty, charisma, vocal);
        // cardKey все еще полезен, если мы хотим хранить карты с одинаковым imgUrl (не уникальные) 
        // в общем `collection` с разными статами, или для ID.
        const cardKey = generateCardKey(imgUrl, rarity, power, beauty, charisma, vocal);

        const char = {
            id: cardKey, 
            name: uniqueName,
            rarity: rarity,
            img: imgUrl,
            imgUrl: imgUrl,
            type: "miku",
            power: power,
            beauty: beauty,
            charisma: charisma,
            vocal: vocal,
            description: "A unique Miku character."
        };

        // 3. Всегда добавляем карту в общую коллекцию (collection)
        collection.push(char);

        // 4. Определяем, должна ли эта карта попасть в коллекцию УНИКАЛЬНЫХ АРТОВ (uniqueCards)
        // Условие: арт еще не встречался в глобальной коллекции уникальных артов
        // И арт еще не был использован для другой уникальной карты В ЭТОМ ПУЛЛЕ
        if (!uniqueImageUrlsInGlobalCollection.has(imgUrl) && 
            !imageUrlsUsedForUniqueCardInThisBatch.has(imgUrl)) {
            
            uniqueCards[imgUrl] = char; // Ключом в uniqueCards теперь будет сам imgUrl для строгой уникальности арта
            imageUrlsUsedForUniqueCardInThisBatch.add(imgUrl); // Отмечаем арт как использованный для уникальной карты в этом пакете
            
            console.log(`Добавлена УНИКАЛЬНАЯ карта (Арт: ${imgUrl}, Имя: ${uniqueName}) в uniqueCards.`);
        } else {
            console.log(`Арт ${imgUrl} уже использован для уникальной карты (глобально или в этом пакете). Карта '${uniqueName}' добавлена только в общую коллекцию.`);
        }
        
        lastPulledCardsData.push(char); // Добавляем в список карт этого пулла для отображения в модалке
    }
    // --- Конец генерации карт ---

    // --- Отображение в модальном окне ---
    if (spinner) spinner.style.display = 'none';
    if (modalMessage) modalMessage.textContent = `Pull complete! You got ${lastPulledCardsData.filter(c => c !== null).length} card(s).`;

    displayPulledCards(lastPulledCardsData.filter(c => c !== null), 'gachaPullModalResults');

    if (collectButton) collectButton.disabled = false;
}

  // Добавляем обработчик на кнопку "Забрать"
  document.addEventListener('DOMContentLoaded', function() {
    const collectButton = document.getElementById('collectGachaButton');
    if (collectButton) {
        collectButton.addEventListener('click', function() {
            if (lastPulledCardsData.length > 0) {
                // Отображаем карты в основном контейнере
                displayPulledCards(lastPulledCardsData, 'gachaResults'); // <-- Добавляем ID контейнера

                // Обновляем счетчики и коллекцию
                updateCollection();
                updateCollectionCounter();
                updateTycoonStats(); // Обновляем все статы, включая гемы
            }

            // Закрываем модальное окно
            if (gachaPullModalInstance) {
                gachaPullModalInstance.hide();
            }

            // Очищаем временные данные
            lastPulledCardsData = [];
        });
    }

    // ... остальной код DOMContentLoaded ...
    
    // Инициализация модального окна гачи (если нужно)
    const modalElement = document.getElementById('gachaPullModal');
    if (modalElement) {
        // Не создаем экземпляр здесь, создадим при первом показе
    }
    
    // ... остальной код инициализации ...
  });

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
            document.getElementById("modalStatsInfo").innerHTML = generateStatsDescription(char.power, char.beauty, char.charisma, char.vocal);

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
          document.getElementById("modalStatsInfo").innerHTML = generateStatsDescription(char.power, char.beauty, char.charisma, char.vocal);

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

    // Initialize Starry Parallax Background
    initStarryParallax();
  });

  // --- Starry Parallax Background ---
  function generateStars(numStars) {
    const parallaxBg = document.querySelector('.parallax-bg');
    if (!parallaxBg) return;

    for (let i = 0; i < numStars; i++) {
      const star = document.createElement('div');
      star.classList.add('star');

      const size = Math.random() * 3 + 1; // Star size between 1px and 4px
      star.style.width = `${size}px`;
      star.style.height = `${size}px`;

      star.style.top = `${Math.random() * 100}%`;
      star.style.left = `${Math.random() * 100}%`;

      // Random animation duration and delay
      star.style.animationDuration = `${Math.random() * 3 + 2}s`; // 2s to 5s
      star.style.animationDelay = `${Math.random() * 5}s`; // 0s to 5s

      // Assign to a random layer
      const layerType = Math.floor(Math.random() * 3) + 1;
      let layerClass = `star-layer${layerType}`;
      star.classList.add(layerClass);
      
      // Store the original Z transform for parallax calculation
      // This assumes the translateZ value is set by the class star-layerX in CSS
      let translateZValue = 0;
      if (layerType === 1) translateZValue = -300;
      else if (layerType === 2) translateZValue = -200;
      else if (layerType === 3) translateZValue = -100;
      star.dataset.translateZ = translateZValue;


      parallaxBg.appendChild(star);
    }
  }

  function initStarryParallax() {
    const numStars = 100; // Number of stars to generate
    generateStars(numStars);

    const parallaxBg = document.querySelector('.parallax-bg');
    if (!parallaxBg) return;

    window.addEventListener('mousemove', function(event) {
      const mouseX = (event.clientX - window.innerWidth / 2);
      const mouseY = (event.clientY - window.innerHeight / 2);

      const stars = document.querySelectorAll('.parallax-bg .star');
      stars.forEach(star => {
        const z = parseFloat(star.dataset.translateZ || 0);
        // Parallax factor: closer stars (smaller negative Z) move more
        // Adjust this factor to control the intensity of the parallax effect
        const parallaxFactor = (1000 + z) / 20000; // Example factor, can be tuned

        const offsetX = mouseX * parallaxFactor;
        const offsetY = mouseY * parallaxFactor;

        // Apply the parallax offset along with the original Z transform
        star.style.transform = `translate3d(${offsetX}px, ${offsetY}px, ${z}px)`;
      });
    });
  }
  // --- End Starry Parallax Background ---

  // Добавляем обработчик для кнопки объяснения характеристик
  const showStatsInfoBtn = document.getElementById('showStatsInfoBtn');
  if (showStatsInfoBtn) {
    showStatsInfoBtn.addEventListener('click', function() {
      // Создаем модальное окно с объяснением характеристик
      const statsInfoModal = document.createElement('div');
      // ... (rest of the modal creation code)
      statsInfoModal.className = 'modal fade';
      statsInfoModal.id = 'statsInfoModal';
      statsInfoModal.innerHTML = `
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Объяснение характеристик</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <p><strong>Характеристики персонажей:</strong></p>
              <ul class="stats-explanation">
                <li><strong>P (Power/Сила)</strong>: Определяет общую эффективность персонажа в команде и влияет на успех выступлений. Чем выше сила, тем больше влияние персонажа на команду.</li>
                <li><strong>B (Beauty/Красота)</strong>: Влияет на внешнюю привлекательность выступлений и способность привлекать определенную аудиторию. Персонажи с высокой красотой создают более зрелищные выступления.</li>
                <li><strong>C (Charisma/Харизма)</strong>: Напрямую влияет на привлечение фанатов и удержание аудитории. Персонажи с высокой харизмой привлекают больше фанатов после выступлений.</li>
                <li><strong>V (Vocal/Вокал)</strong>: Определяет качество создаваемых песен и их популярность. Хороший вокал позволяет создавать более успешные треки.</li>
              </ul>
              <div class="mt-3">
                <p><strong>Как использовать характеристики:</strong></p>
                <ul>
                  <li>Для создания хороших песен выбирайте персонажей с высоким значением Vocal</li>
                  <li>Для успешных концертов важна комбинация Beauty и Power</li>
                  <li>Для быстрого роста фан-базы ориентируйтесь на персонажей с высокой Charisma</li>
                  <li>Сбалансированная команда с разными сильными сторонами даст лучшие результаты</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      `;
      
      document.body.appendChild(statsInfoModal);
      const modal = new bootstrap.Modal(statsInfoModal);
      modal.show();
      statsInfoModal.addEventListener('hidden.bs.modal', function() {
        document.body.removeChild(statsInfoModal);
      });
    });
  }

// --- Sample Data for News and Events ---
const sampleNewsData = [
  {
    title: "New Album 'Cybernetic Symphony' Released!",
    date: "OCT 26, 2024",
    content: "Hatsune Miku's latest album, 'Cybernetic Symphony', is now available worldwide! Featuring 12 new tracks that blend futuristic sounds with her iconic vocal style. Don't miss out on the limited edition physical release with exclusive artwork.",
    imageUrl: "мику_картинки/08402f4a15ae284a450e5f5f263cd443.webp",
    buttonText: "Listen Now",
    buttonLink: "#"
  },
  {
    title: "Miku Expo 2025 World Tour Announced",
    date: "OCT 15, 2024",
    content: "Get ready! Miku Expo is hitting the road again in 2025 with a massive world tour. Dates and cities will be announced soon. Expect new songs, stunning visuals, and an unforgettable experience.",
    imageUrl: "мику_картинки/a0f5fa7c8929d2572041c1740f285ff7.webp"
  },
  {
    title: "Game Update v1.5: New Tycoon Features!",
    date: "OCT 10, 2024",
    content: "The Hatsune Miku Tycoon Gacha game has been updated to version 1.5! This update includes exciting new features for the Tycoon mode, balance adjustments, and a set of exclusive new cards. Log in now to check it out!",
    buttonText: "Read Patch Notes",
    buttonLink: "#"
  }
];

const sampleEventsData = [
  {
    title: "Magical Mirai 2024",
    dateRange: "SEP 01 - SEP 03, 2024",
    description: "Join us for Magical Mirai 2024! A special in-game event celebrating Miku's annual concert series. Participate in event stages to earn exclusive cards and items.",
    imageUrl: "мику_картинки/640b28cf1793694f9251afe6e1a43736.webp",
    progress: 75, // Optional: 0-100
    progressText: "7500/10000 EP",
    buttonText: "Go to Event"
  },
  {
    title: "Spring Melody Gacha Festival",
    dateRange: "NOW - OCT 30, 2024",
    description: "The Spring Melody Gacha is here! Increased chances to get rare Miku cards with floral themes. Special login bonuses available throughout the event.",
    imageUrl: "мику_картинки/0361f24ce641bd47ebe323b33d627725.webp",
    buttonText: "Pull Now!"
  },
  {
    title: "Snow Miku 2025 Design Contest",
    dateRange: "Submissions Open: NOV 01 - DEC 15, 2024",
    description: "The annual Snow Miku design contest is starting soon! Submit your creative designs for Snow Miku 2025 and her rabbit Yukine. The winning design will become an official Nendoroid!",
    imageUrl: "мику_картинки/2db039bbccdcfe5bcb98d22685295dff.webp",
    buttonText: "Learn More"
  }
];

// --- Rendering Functions for News and Events ---

function renderNews(newsArray, containerId) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Container with id ${containerId} not found for news.`);
    return;
  }
  // Render only if container is empty to avoid duplication on re-clicking the menu
  if (container.innerHTML.trim() !== "" && container.dataset.rendered === "true") return;

  container.innerHTML = ""; // Clear previous content

  newsArray.forEach(newsItem => {
    const itemBox = document.createElement('div');
    itemBox.className = 'feature-box mb-4';

    let imageHtml = '';
    if (newsItem.imageUrl) {
      imageHtml = `<img src="${newsItem.imageUrl}" alt="${newsItem.title}" class="img-fluid rounded mb-3" style="max-height: 250px; object-fit: cover; width: 100%;">`;
    }

    let buttonHtml = '';
    if (newsItem.buttonText && newsItem.buttonLink) {
      buttonHtml = `<button class="feature-button mt-3" onclick="window.open('${newsItem.buttonLink}', '_blank')">${newsItem.buttonText}</button>`;
    } else if (newsItem.buttonText) {
       buttonHtml = `<button class="feature-button mt-3">${newsItem.buttonText}</button>`;
    }


    itemBox.innerHTML = `
      <h3 class="feature-title">${newsItem.title}</h3>
      <p class="news-date">${newsItem.date}</p>
      ${imageHtml}
      <p>${newsItem.content}</p>
      ${buttonHtml}
    `;
    container.appendChild(itemBox);
  });
  container.dataset.rendered = "true";
}

function renderEvents(eventsArray, containerId) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Container with id ${containerId} not found for events.`);
    return;
  }
  if (container.innerHTML.trim() !== "" && container.dataset.rendered === "true") return;
  
  container.innerHTML = ""; // Clear previous content

  eventsArray.forEach(eventItem => {
    const itemBox = document.createElement('div');
    itemBox.className = 'feature-box mb-4';

    let imageCellHtml = ''; // Changed variable name for clarity
    if (eventItem.imageUrl) {
      // Add 'event-image-container' class to the div wrapping the image
      imageCellHtml = `<div class="col-md-4 event-image-container"><img src="${eventItem.imageUrl}" alt="${eventItem.title}" class="img-fluid rounded"></div>`;
    }

    let progressHtml = '';
    if (eventItem.progress !== undefined && eventItem.progressText) {
      progressHtml = `
        <div class="progress mb-2" style="height: 20px;">
          <div class="progress-bar bg-success" role="progressbar" style="width: ${eventItem.progress}%;" aria-valuenow="${eventItem.progress}" aria-valuemin="0" aria-valuemax="100">${eventItem.progress}%</div>
        </div>
        <p class="mb-2">Progress: ${eventItem.progressText}</p>
      `;
    }
    
    let buttonHtml = '';
    if (eventItem.buttonText && eventItem.buttonLink) {
        buttonHtml = `<button class="feature-button" onclick="window.open('${eventItem.buttonLink}', '_blank')">${eventItem.buttonText}</button>`;
    } else if (eventItem.buttonText) {
        buttonHtml = `<button class="feature-button">${eventItem.buttonText}</button>`;
    }


    itemBox.innerHTML = `
      <div class="row">
        ${imageCellHtml} 
        <div class="${eventItem.imageUrl ? 'col-md-8' : 'col-md-12'}">
          <h3 class="feature-title">${eventItem.title}</h3>
          <p class="news-date">${eventItem.dateRange}</p>
          <p>${eventItem.description}</p>
          ${progressHtml}
          ${buttonHtml}
        </div>
      </div>
    `;
    container.appendChild(itemBox);
  });
  container.dataset.rendered = "true";
}


// --- End Rendering Functions ---

// --- Basic Unit Tests ---
function assertEqual(actual, expected, message) {
  if (actual === expected) {
    console.log(`PASS: ${message}`);
    return true;
  } else {
    console.error(`FAIL: ${message}. Expected "${expected}", but got "${actual}".`);
    return false;
  }
}

function assertElementPresent(selector, message) {
  if (document.querySelector(selector)) {
    console.log(`PASS: ${message}`);
    return true;
  } else {
    console.error(`FAIL: ${message}. Element "${selector}" not found.`);
    return false;
  }
}

function assertElementTextContains(selector, text, message) {
  const element = document.querySelector(selector);
  if (element && element.textContent.includes(text)) {
    console.log(`PASS: ${message}`);
    return true;
  } else if (!element) {
    console.error(`FAIL: ${message}. Element "${selector}" not found.`);
    return false;
  } else {
    console.error(`FAIL: ${message}. Element "${selector}" does not contain text "${text}". Actual: "${element.textContent}".`);
    return false;
  }
}

function setupTestContainer(id) {
  let container = document.getElementById(id);
  if (container) {
    container.innerHTML = ''; // Clear if exists
  } else {
    container = document.createElement('div');
    container.id = id;
    document.body.appendChild(container); // Append to body for tests to run
  }
  container.dataset.rendered = "false"; // Reset rendered state
  return container;
}

function cleanupTestContainer(id) {
  const container = document.getElementById(id);
  if (container) {
    container.remove();
  }
}

function testRenderNews() {
  console.log("--- Testing renderNews ---");
  const containerId = 'testNewsContainer';
  let passCount = 0;
  let failCount = 0;

  // Test 1: Empty array
  setupTestContainer(containerId);
  renderNews([], containerId);
  const newsContainer = document.getElementById(containerId);
  if (assertEqual(newsContainer.children.length, 0, "Test 1: Renders no items for empty array")) {
    passCount++;
  } else {
    failCount++;
  }
  cleanupTestContainer(containerId);

  // Test 2: With sample data
  setupTestContainer(containerId);
  const sampleNews = [
    { title: "News 1", date: "Date 1", content: "Content 1", imageUrl: "img1.jpg", buttonText: "Read More" },
    { title: "News 2", date: "Date 2", content: "Content 2" }
  ];
  renderNews(sampleNews, containerId);
  if (assertEqual(newsContainer.children.length, 2, "Test 2.1: Renders correct number of news items")) {
    passCount++;
  } else {
    failCount++;
  }
  if (assertElementTextContains(`#${containerId} .feature-box:first-child .feature-title`, "News 1", "Test 2.2: Renders correct title for first item")) {
    passCount++;
  } else {
    failCount++;
  }
  if (assertElementTextContains(`#${containerId} .feature-box:first-child .news-date`, "Date 1", "Test 2.3: Renders correct date for first item")) {
    passCount++;
  } else {
    failCount++;
  }
  if (assertElementPresent(`#${containerId} .feature-box:first-child img[src="img1.jpg"]`, "Test 2.4: Renders image for first item")) {
    passCount++;
  } else {
    failCount++;
  }
  if (assertElementPresent(`#${containerId} .feature-box:first-child button`, "Test 2.5: Renders button for first item")) {
    passCount++;
  } else {
    failCount++;
  }
  if (assertElementPresent(`#${containerId} .feature-box:last-child .feature-title`, "Test 2.6: Renders title for second item")) {
     passCount++;
  } else {
    failCount++;
  }
  // Check that the second item does *not* have an image or button if not specified
  const secondItemImg = newsContainer.querySelector('.feature-box:last-child img');
  if (assertEqual(secondItemImg, null, "Test 2.7: Second item does not have an image")) {
    passCount++;
  } else {
    failCount++;
  }
  const secondItemButton = newsContainer.querySelector('.feature-box:last-child button');
  if (assertEqual(secondItemButton, null, "Test 2.8: Second item does not have a button")) {
    passCount++;
  } else {
    failCount++;
  }

  cleanupTestContainer(containerId);
  console.log(`renderNews Tests: ${passCount} passed, ${failCount} failed.`);
  return failCount === 0;
}

function testRenderEvents() {
  console.log("--- Testing renderEvents ---");
  const containerId = 'testEventsContainer';
  let passCount = 0;
  let failCount = 0;

  // Test 1: Empty array
  setupTestContainer(containerId);
  renderEvents([], containerId);
  const eventsContainer = document.getElementById(containerId);
  if (assertEqual(eventsContainer.children.length, 0, "Test 1: Renders no items for empty array")) {
    passCount++;
  } else {
    failCount++;
  }
  cleanupTestContainer(containerId);

  // Test 2: With sample data
  setupTestContainer(containerId);
  const sampleEvents = [
    { title: "Event 1", dateRange: "Dates 1", description: "Desc 1", imageUrl: "event1.jpg", progress: 50, progressText: "50/100", buttonText: "Join" },
    { title: "Event 2", dateRange: "Dates 2", description: "Desc 2" }
  ];
  renderEvents(sampleEvents, containerId);
  if (assertEqual(eventsContainer.children.length, 2, "Test 2.1: Renders correct number of event items")) {
    passCount++;
  } else {
    failCount++;
  }
  if (assertElementTextContains(`#${containerId} .feature-box:first-child .feature-title`, "Event 1", "Test 2.2: Renders correct title for first item")) {
    passCount++;
  } else {
    failCount++;
  }
  if (assertElementTextContains(`#${containerId} .feature-box:first-child .news-date`, "Dates 1", "Test 2.3: Renders correct date range for first item")) {
    passCount++;
  } else {
    failCount++;
  }
  if (assertElementPresent(`#${containerId} .feature-box:first-child .event-image-container img[src="event1.jpg"]`, "Test 2.4: Renders image for first item")) {
    passCount++;
  } else {
    failCount++;
  }
  if (assertElementPresent(`#${containerId} .feature-box:first-child .progress`, "Test 2.5: Renders progress bar for first item")) {
    passCount++;
  } else {
    failCount++;
  }
  if (assertElementPresent(`#${containerId} .feature-box:first-child button`, "Test 2.6: Renders button for first item")) {
    passCount++;
  } else {
    failCount++;
  }
  // Check that the second item does *not* have an image, progress or button if not specified
  const secondItemImgContainer = eventsContainer.querySelector('.feature-box:last-child .event-image-container');
  if (assertEqual(secondItemImgContainer, null, "Test 2.7: Second item does not have an image container")) {
      passCount++;
  } else {
      failCount++;
  }
  const secondItemProgress = eventsContainer.querySelector('.feature-box:last-child .progress');
  if (assertEqual(secondItemProgress, null, "Test 2.8: Second item does not have a progress bar")) {
      passCount++;
  } else {
      failCount++;
  }
  const secondItemButton = eventsContainer.querySelector('.feature-box:last-child button');
  if (assertEqual(secondItemButton, null, "Test 2.9: Second item does not have a button")) {
      passCount++;
  } else {
      failCount++;
  }


  cleanupTestContainer(containerId);
  console.log(`renderEvents Tests: ${passCount} passed, ${failCount} failed.`);
  return failCount === 0;
}

function runAllTests() {
  console.log("===== Running All Unit Tests =====");
  let overallSuccess = true;
  
  if (!testRenderNews()) {
    overallSuccess = false;
  }
  if (!testRenderEvents()) {
    overallSuccess = false;
  }

  if (overallSuccess) {
    console.log("===== All tests passed! =====");
  } else {
    console.error("===== Some tests failed. Please check logs. =====");
  }
}

// Automatically run tests when the script is loaded
// Ensure DOM is ready for container manipulation if tests run immediately
document.addEventListener('DOMContentLoaded', function() {
    runAllTests();
});
// --- End Basic Unit Tests ---

const statsInfoModal = document.createElement('div');
    statsInfoModal.className = 'modal fade';
    statsInfoModal.id = 'statsInfoModal';
    statsInfoModal.innerHTML = `
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Объяснение характеристик</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <p><strong>Характеристики персонажей:</strong></p>
            <ul class="stats-explanation">
              <li><strong>P (Power/Сила)</strong>: Определяет общую эффективность персонажа в команде и влияет на успех выступлений. Чем выше сила, тем больше влияние персонажа на команду.</li>
              <li><strong>B (Beauty/Красота)</strong>: Влияет на внешнюю привлекательность выступлений и способность привлекать определенную аудиторию. Персонажи с высокой красотой создают более зрелищные выступления.</li>
              <li><strong>C (Charisma/Харизма)</strong>: Напрямую влияет на привлечение фанатов и удержание аудитории. Персонажи с высокой харизмой привлекают больше фанатов после выступлений.</li>
              <li><strong>V (Vocal/Вокал)</strong>: Определяет качество создаваемых песен и их популярность. Хороший вокал позволяет создавать более успешные треки.</li>
            </ul>
            <div class="mt-3">
              <p><strong>Как использовать характеристики:</strong></p>
              <ul>
                <li>Для создания хороших песен выбирайте персонажей с высоким значением Vocal</li>
                <li>Для успешных концертов важна комбинация Beauty и Power</li>
                <li>Для быстрого роста фан-базы ориентируйтесь на персонажей с высокой Charisma</li>
                <li>Сбалансированная команда с разными сильными сторонами даст лучшие результаты</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    `;
    
    // Добавляем модальное окно в DOM
    document.body.appendChild(statsInfoModal);
    
    // Показываем модальное окно
    const modal = new bootstrap.Modal(statsInfoModal);
    modal.show();
    
    // Удаляем модальное окно после закрытия
    statsInfoModal.addEventListener('hidden.bs.modal', function() {
      document.body.removeChild(statsInfoModal);
    });
  });
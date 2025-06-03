// Функция для отображения тостов (всплывающих уведомлений)
function showToast(message, type = 'info', duration = 3000) {
  // Создаем уникальный ID для тоста
  const toastId = 'toast-' + Date.now();
  
  // Определяем класс для типа уведомления
  const typeClass = `toast-${type}`;
  
  // Создаем элемент тоста
  const toastElement = document.createElement('div');
  toastElement.className = `toast custom-toast ${typeClass} show`;
  toastElement.setAttribute('role', 'alert');
  toastElement.setAttribute('aria-live', 'assertive');
  toastElement.setAttribute('aria-atomic', 'true');
  toastElement.id = toastId;
  
  // Добавляем иконку в зависимости от типа
  let iconClass = 'info-circle';
  if (type === 'success') iconClass = 'check-circle';
  if (type === 'error') iconClass = 'exclamation-circle';
  if (type === 'warning') iconClass = 'exclamation-triangle';
  
  // Формируем содержимое тоста
  toastElement.innerHTML = `
    <div class="toast-header bg-transparent border-0 text-white">
      <i class="fas fa-${iconClass} me-2"></i>
      <strong class="me-auto">Уведомление</strong>
      <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast" aria-label="Close"></button>
    </div>
    <div class="toast-body">
      ${message}
    </div>
  `;
  
  // Добавляем тост в контейнер
  const container = document.getElementById('toastContainer');
  if (container) {
    container.appendChild(toastElement);
    
    // Создаем экземпляр Toast из Bootstrap
    const toast = new bootstrap.Toast(toastElement, {
      autohide: true,
      delay: duration
    });
    
    // Показываем тост
    toast.show();
    
    // Удаляем тост из DOM после скрытия
    toastElement.addEventListener('hidden.bs.toast', function() {
      toastElement.remove();
    });
  } else {
    console.error('Toast container not found!');
  }
}

// Обновленная функция для отображения обратной связи при добавлении карточки
function showFeedback(message) {
  // Создаем элемент для отображения сообщения
  const feedback = document.createElement('div');
  feedback.className = 'card-feedback';
  feedback.textContent = message;
  
  // Добавляем на страницу
  document.body.appendChild(feedback);
  
  // Удаляем через некоторое время
  setTimeout(() => {
    feedback.style.animation = 'fade-out 0.3s ease-out';
    feedback.addEventListener('animationend', () => {
      feedback.remove();
    });
  }, 2000); // 2 секунды показа
}

// Глобальные переменные для работы с коллекцией карточек
let collection = [];
let uniqueCards = {};
let lastPulledCardsData = [];
let gachaPullModalInstance = null;

// Функции переключения между разделами
function showHome() {
    console.log("Показываем главную страницу");
    hideAllSections();
    document.getElementById('homeContent').style.display = 'block';
    setActiveButton('navHome');
    
    // Отображаем последние новости на главной странице
    renderHomeNews();
    
    // Обновляем информацию для тайкун-режима на главной странице
    const homeTotalFans = document.getElementById('homeTotalFans');
    const homeSongCount = document.getElementById('homeSongCount');
    
    if (homeTotalFans) homeTotalFans.textContent = totalFans;
    if (homeSongCount) homeSongCount.textContent = songs.length;
  }
  
  function showGachaSystem() {
    console.log("Показываем гача-систему");
    hideAllSections();
    document.getElementById('gachaSystem').style.display = 'block';
    setActiveButton('navGacha');
  }
  
  function showCollection() {
    console.log("Показываем коллекцию");
    hideAllSections();
    document.getElementById('cardCollection').style.display = 'block';
    updateCollection();
    setActiveButton('navCollection');
  }
  
  function showTycoon() {
    console.log("Показываем тайкун-режим");
    hideAllSections();
    document.getElementById('tycoonMode').style.display = 'block';
    setActiveButton('navTycoon');
    
    // Инициализируем тайкун-систему, если это первый показ
    initTycoonSystem();
  }
  
  function showNews() {
    console.log("Показываем новости");
    hideAllSections();
    document.getElementById('newsSection').style.display = 'block';
    renderNews(sampleNewsData, 'dynamicNewsContainer');
    setActiveButton('navNews');
  }
  
  function showShop() {
    console.log("Показываем магазин");
    hideAllSections();
    document.getElementById('shopSection').style.display = 'block';
    setActiveButton('navShop');
  }
  
  function showEvents() {
    console.log("Показываем события");
    hideAllSections();
    document.getElementById('eventsSection').style.display = 'block';
    renderEvents(sampleEventsData, 'dynamicEventsContainer');
    setActiveButton('navEvents');
  }
  
  function showProfile() {
    console.log("Показываем профиль");
    hideAllSections();
    document.getElementById('profileSection').style.display = 'block';
    setActiveButton('navProfile');
  }
  
  function hideAllSections() {
    console.log("Скрываем все секции");
    const sections = [
      'homeContent', 'gachaSystem', 'cardCollection', 'tycoonMode', 
      'newsSection', 'shopSection', 'eventsSection', 'profileSection'
    ];
    sections.forEach(section => {
      const el = document.getElementById(section);
      if (el) {
        el.style.display = 'none';
      } else {
        console.warn(`Секция ${section} не найдена!`);
      }
    });
  }
  
  // Функция для переключения бокового меню
  function toggleMenu() {
    const menu = document.getElementById('sideMenu');
    menu.classList.toggle('active');
  }
  
  // Функция для выделения активного раздела
  function setActiveButton(buttonId) {
    console.log(`Устанавливаем активную кнопку: ${buttonId}`);
    const buttons = document.querySelectorAll('#sideMenu .nav-link');
    buttons.forEach(button => button.classList.remove('active')); // Убираем активный класс у всех кнопок
    
    // Теперь находим непосредственно по id кнопки
    const activeButton = document.getElementById(buttonId);
    if (activeButton) {
      activeButton.classList.add('active'); // Добавляем активный класс к текущей кнопке
    } else {
      console.warn(`Кнопка с id ${buttonId} не найдена!`);
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
      showToast(`Studio Level Up! You are now level ${studioLevel}!`, 'success');
      
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
      showToast(`Недостаточно гемов! Нужно ${upgradeCost}💎, у вас ${totalGems}💎`, 'error');
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
      
      if (i < currentTeam.length && currentTeam[i]) {
        // Слот занят
        const member = currentTeam[i];
        if (!member) {
          console.error(`Ошибка: объект члена команды ${i} не определен`);
          continue; // Пропускаем этот слот
        }
        
        const currentStamina = member.stamina !== undefined ? member.stamina : (member.maxStamina || 100);
        const currentMaxStamina = member.maxStamina || 100;
        teamSlot.innerHTML = `
          <img src="${member.imgUrl || member.img}" alt="${member.name || 'Персонаж'}" class="img-fluid">
          <div class="position-absolute bottom-0 start-0 end-0 p-1 bg-dark bg-opacity-75 text-center">
            <small>${member.rarity || '?'}★ <span class="text-warning">${currentStamina}/${currentMaxStamina} STM</span></small>
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
    if (!cardSelection) {
      console.error('Элемент cardSelection не найден!');
      return;
    }
    
    // Сохраняем позицию прокрутки перед обновлением
    const scrollPosition = cardSelection.scrollTop;
    
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
      placeholder.className = 'card-placeholder text-center p-3';
      placeholder.innerHTML = `
        <i class="fas fa-info-circle mb-2" style="font-size: 24px;"></i>
        <p>Нет доступных карточек</p>
        <small class="text-muted">Соберите больше карточек через гача!</small>
      `;
      cardSelection.appendChild(placeholder);
    } else {
      // Добавляем поиск, если карточек много
      if (availableCards.length > 10) {
        const searchContainer = document.createElement('div');
        searchContainer.className = 'search-container mb-3';
        searchContainer.innerHTML = `
          <div class="input-group input-group-sm">
            <span class="input-group-text bg-dark text-light border-secondary">
              <i class="fas fa-search"></i>
            </span>
            <input type="text" class="form-control form-control-sm bg-dark text-light border-secondary" 
                   placeholder="Поиск карточек..." id="cardSearchInput">
          </div>
        `;
        cardSelection.appendChild(searchContainer);
        
        // Добавляем обработчик поиска
        setTimeout(() => {
          const searchInput = document.getElementById('cardSearchInput');
          if (searchInput) {
            searchInput.addEventListener('input', function() {
              const searchValue = this.value.toLowerCase();
              document.querySelectorAll('.card-option-container').forEach(container => {
                const cardName = container.getAttribute('data-name').toLowerCase();
                const cardRarity = container.getAttribute('data-rarity');
                if (cardName.includes(searchValue) || cardRarity.includes(searchValue)) {
                  container.style.display = '';
                } else {
                  container.style.display = 'none';
                }
              });
            });
          }
        }, 100);
      }
      
      // Создаем контейнер для карточек
      const cardsGrid = document.createElement('div');
      cardsGrid.className = 'cards-grid';
      cardSelection.appendChild(cardsGrid);
      
      availableCards.forEach((card, index) => {
        // Проверяем, не находится ли карточка уже в команде
        const isInTeam = currentTeam.some(member => 
          (member.id && member.id === card.id) || 
          (member.img && member.img === card.img) || 
          (member.imgUrl && member.imgUrl === (card.imgUrl || card.img))
        );
        
        if (!isInTeam) {
          const cardContainer = document.createElement('div');
          cardContainer.className = 'position-relative card-option-container';
          cardContainer.setAttribute('data-name', card.name);
          cardContainer.setAttribute('data-rarity', card.rarity);
          
          const cardElement = document.createElement('img');
          cardElement.className = 'card-option img-fluid team-manager-img'; 
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
            Vocal: ${card.vocal}<br>
            Stamina: ${card.stamina !== undefined ? card.stamina : (card.maxStamina || 100)}/${card.maxStamina || 100} STM
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
          
          cardsGrid.appendChild(cardContainer);
        }
      });
    }
    
    // Восстанавливаем позицию прокрутки
    setTimeout(() => {
      cardSelection.scrollTop = scrollPosition;
    }, 10);
  }

  // Функция для подсветки доступных слотов команды
  function highlightAvailableSlots() {
    const teamSlots = document.querySelectorAll('.team-slot');
    teamSlots.forEach((slot, index) => {
      if (index < maxTeamSize) { // Подсвечиваем только существующие слоты
        slot.classList.add('highlight');
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
      
      const handleSlotClick = function(slotIndex) {
        if (!selectedCardData) { // Проверяем наличие объекта карты
          showFeedback('Сначала выберите карточку из вашей коллекции справа.');
          return; 
        }
        
        // Добавляем карту в команду
        addCardToTeam(selectedCardData, slotIndex); // Передаем объект карты
      };

      if (i < currentTeam.length && currentTeam[i]) {
        // Слот занят
        const member = currentTeam[i];
        if (!member) {
          console.error(`Ошибка: объект члена команды ${i} не определен`);
          continue; // Пропускаем этот слот
        }
        
        const memberName = member.name || 'Персонаж';
        const memberRarity = member.rarity || '?';
        const memberStamina = member.stamina !== undefined ? member.stamina : (member.maxStamina || 100);
        const memberMaxStamina = member.maxStamina || 100;
        
        teamSlot.innerHTML = `
          <div class="d-flex">
            <div class="card-thumbnail me-3 position-relative">
              <img src="${member.imgUrl || member.img}" alt="${memberName}" class="img-fluid team-manager-img"> 
              <div class="tooltip-card">
                ${memberName} (${memberRarity}★)<br>
                P: ${member.power} | B: ${member.beauty}<br>
                C: ${member.charisma} | V: ${member.vocal}<br>
                STM: ${memberStamina}/${memberMaxStamina}
              </div>
            </div>
            <div>
              <p class="mb-0">${memberName}</p>
              <small class="text-muted">Rarity: ${memberRarity}★ (${memberStamina}/${memberMaxStamina} STM)</small>
              <div class="mt-1">
                <button class="btn btn-sm btn-danger remove-member" data-index="${i}">Remove</button>
              </div>
            </div>
          </div>
        `;

        teamSlot.querySelector('.remove-member').addEventListener('click', (event) => {
          event.stopPropagation(); // Предотвращаем всплытие на родительский div
          removeTeamMember(i);
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

  // Функция для добавления карточки в команду
  function addCardToTeam(card, slotIndex) {
    if (!card) { // Проверка на null/undefined
      showToast('Ошибка: не переданы данные карты для добавления.', 'error');
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
      type: card.type,
      stamina: card.stamina !== undefined ? card.stamina : (card.maxStamina || 100),
      maxStamina: card.maxStamina || 100
    };
    
    if (slotIndex < currentTeam.length) {
      currentTeam[slotIndex] = teamMember;
    } else {
      currentTeam.push(teamMember);
    }
    
    showToast(`${card.name} добавлен(а) в команду!`, 'success');
    
    selectedCardData = null; // Сбрасываем объект карты
    selectedSlotIndex = -1;
    
    updateTeamModalContent(); // Обновляем окно ПОСЛЕ сброса
  }

  // Функция для удаления члена команды
  function removeTeamMember(index) {
    const removeMemberDialog = document.createElement('div');
    removeMemberDialog.className = 'card-feedback';
    removeMemberDialog.innerHTML = `
      <div class="d-flex align-items-center">
        <span>Удалить ${currentTeam[index].name} из команды?</span>
        <button class="btn btn-sm btn-danger ms-2 confirm-remove">Удалить</button>
        <button class="btn btn-sm btn-secondary ms-2 cancel-remove">Отмена</button>
      </div>
    `;
    
    document.body.appendChild(removeMemberDialog);
    
    // Добавляем обработчики событий
    removeMemberDialog.querySelector('.confirm-remove').addEventListener('click', () => {
      // Удаляем члена команды
      currentTeam.splice(index, 1);
      
      // Пересчитываем бонусы команды
      calculateTeamBonuses();
      
      // Обновляем отображение команды
      updateTeamDisplay();
      
      // Добавляем запись в лог и показываем уведомление
      updateActivityLog('Team Member Removed', 'A member has been removed from your team');
      showToast('Персонаж удален из команды', 'info');
      
      // Удаляем диалог
      removeMemberDialog.style.animation = 'fade-out 0.3s ease-out';
      removeMemberDialog.addEventListener('animationend', () => {
        removeMemberDialog.remove();
      });
    });
    
    removeMemberDialog.querySelector('.cancel-remove').addEventListener('click', () => {
      // Удаляем диалог
      removeMemberDialog.style.animation = 'fade-out 0.3s ease-out';
      removeMemberDialog.addEventListener('animationend', () => {
        removeMemberDialog.remove();
      });
    });
    
    // Автоматически удаляем через 5 секунд, если пользователь не отреагировал
    setTimeout(() => {
      if (document.body.contains(removeMemberDialog)) {
        removeMemberDialog.style.animation = 'fade-out 0.3s ease-out';
        removeMemberDialog.addEventListener('animationend', () => {
          removeMemberDialog.remove();
        });
      }
    }, 5000);
  }

  // Функция для расчета бонусов команды
  function calculateTeamBonuses() {
    // Сбрасываем бонусы
    teamBonuses.fanGain = 0;
    teamBonuses.songQuality = 0;
    teamBonuses.performance = 0;
    
    // Считаем бонусы от каждого члена команды
    currentTeam.forEach(member => {
      // Проверяем, что объект члена команды определен
      if (!member) {
        console.error('Ошибка: объект члена команды не определен');
        return; // Пропускаем этот элемент
      }
      
      // Убедимся, что у члена команды есть все необходимые свойства
      const charisma = member.charisma || 0;
      const vocal = member.vocal || 0;
      const power = member.power || 0;
      const beauty = member.beauty || 0;
      const rarity = member.rarity || 1;
      
      // Бонус фанатов зависит от харизмы
      teamBonuses.fanGain += Math.floor(charisma / 10) + rarity * 2;
      
      // Бонус качества песни зависит от вокала
      teamBonuses.songQuality += Math.floor(vocal / 10) + rarity * 2;
      
      // Бонус выступления зависит от силы и красоты
      teamBonuses.performance += Math.floor((power + beauty) / 20) + rarity * 2;
    });
    
    // Обновляем отображение бонусов
    updateTycoonStats();
  }

  // Функция для создания песни
  function produceSong() {
    const songType = document.getElementById('songType').value;
    let cost;
    // Получаем выбранный тип песни и его стоимость
    const staminaCostSong = 20; 
    if (currentTeam.length === 0 && staminaCostSong > 0) { 
      // showToast("Для создания песни нужна команда!", 'warning'); // Alert if team is strictly required for songs with cost
      // return; 
    }
    let canProduce = true;
    for (const member of currentTeam) {
      if (!member) {
        console.error('Ошибка: undefined член команды в currentTeam');
        canProduce = false; 
        break;
      }
      
      if (member.stamina === undefined) {
        console.error(`Ошибка: ${member.name || 'Персонаж'} имеет undefined stamina.`);
        canProduce = false; 
        break;
      }
      
      if (member.stamina < staminaCostSong) {
        showToast(`${member.name || 'Персонаж'} слишком устал(а) для создания песни. Нужно ${staminaCostSong} энергии, есть ${member.stamina}.`, 'warning');
        canProduce = false; 
        break;
      }
    }
    if (!canProduce && currentTeam.length > 0) return;

    const songTypeSelect = document.getElementById('songType');
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
      showToast(`Недостаточно гемов! Нужно ${cost}💎, у вас ${totalGems}💎`, 'error');
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

    // Deduct stamina from team members
    currentTeam.forEach(member => {
      member.stamina -= staminaCostSong;
    });
    
    // Обновляем отображение песен
    updateSongList();
    updateTeamDisplay(); 
    if (document.getElementById('teamModal') && document.getElementById('teamModal').classList.contains('show')) {
        updateTeamModalContent();
    }
    
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
    if (activityLog) {
      activityLog.insertBefore(activityItem, activityLog.firstChild);
      
      // Ограничиваем количество записей в логе
      if (activityLog.children.length > 10) {
        activityLog.removeChild(activityLog.lastChild);
      }
    }
  }

  const characters = [
    
  ];

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
  // Удаляем повторное объявление
  // let uniqueCards = {};

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
  // Удаляем повторное объявление
  // let lastPulledCardsData = [];
  // let gachaPullModalInstance = null;

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
      showToast(`Недостаточно гемов! Нужно ${cost}💎, у вас ${totalGems}💎`, 'error');
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
        showToast("Произошла ошибка интерфейса гачи. Пожалуйста, перезагрузите страницу.", "error");
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
            description: "A unique Miku character.",
            maxStamina: 100, // Added
            stamina: 100     // Added
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
      showToast(`${message}. Total: ${totalReward}💎${gachaTickets > 0 ? ' + ' + gachaTickets + ' gacha ticket(s)' : ''}`, 'success');
      updateTycoonStats();
      
      // Добавляем запись в лог
      updateActivityLog('Daily Tasks Completed', `Received ${totalReward}💎${gachaTickets > 0 ? ' + ' + gachaTickets + ' ticket(s)' : ''}`);
    } else {
      showToast('Нет выполненных заданий для получения наград.', 'info');
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
    const staminaCostConcert = 30;
    if (currentTeam.length === 0 && staminaCostConcert > 0) { 
      showToast("Для концерта рекомендуется иметь команду!", 'warning');
      // Не прерываем выполнение, даем возможность продолжить
    }
    
    let canPerform = true;
    for (const member of currentTeam) {
      if (!member || member.stamina === undefined) {
        console.error(`Ошибка: ${member ? member.name || 'Персонаж' : 'Член команды'} имеет undefined stamina.`);
        canPerform = false; 
        break;
      }
      
      if (member.stamina < staminaCostConcert) {
        showToast(`${member.name || 'Персонаж'} слишком устал(а) для концерта. Нужно ${staminaCostConcert} энергии, есть ${member.stamina}.`, 'warning');
        canPerform = false; 
        break;
      }
    }
    
    if (!canPerform && currentTeam.length > 0) return;

    const venueSelect = document.getElementById('concertVenue');
    if (!venueSelect) {
      showToast('Ошибка: не найден элемент выбора площадки', 'error');
      return;
    }
    
    const selectedVenue = venueSelect.value || 'small'; // Получаем значение выбранной площадки или используем 'small' по умолчанию
    
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
    if (totalGems < venueCosts[selectedVenue]) {
      showToast(`Недостаточно гемов! Нужно ${venueCosts[selectedVenue]}💎, у вас ${totalGems}💎`, 'error');
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
    totalGems -= venueCosts[selectedVenue];
    
    // Рассчитываем базовое количество привлеченных фанатов
    let baseFans = Math.floor(Math.random() * (venueMaxFans[selectedVenue] / 2)) + Math.floor(venueMaxFans[selectedVenue] / 2);
    
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
    const actualFans = Math.min(baseFans, venueMaxFans[selectedVenue]);
    
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
    const performanceQuality = actualFans / venueMaxFans[selectedVenue];
    
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
    document.getElementById('concertVenueName').textContent = venueNames[selectedVenue];
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
    
    // Деплитим выносливость у членов команды
    currentTeam.forEach(member => {
      if (member && member.stamina !== undefined) {
        member.stamina -= staminaCostConcert;
      }
    });

    // Обновляем отображение команды
    updateTeamDisplay();
    if (document.getElementById('teamModal') && document.getElementById('teamModal').classList.contains('show')) {
      updateTeamModalContent();
    }
    
    // Добавляем запись в лог
    updateActivityLog('Concert Performed', `Gained ${actualFans} fans and ${earnedGems} gems`);
    
    // Показываем модальное окно с результатами
  }

  // Функция для "поделиться" результатами концерта
  function shareConcertResult() {
    showToast('Результаты концерта опубликованы в социальных сетях!', 'success');
    
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

// --- Event Listener Setup ---
document.addEventListener('DOMContentLoaded', function() {
  // Запускаем тесты, вызывая функцию из render.js
  // runAllTests(); // Эта функция перенесена в render.js, закомментировано, чтобы избежать конфликтов
  
  // Очищаем все backdrop элементы при загрузке страницы
  clearBackdrops();
  
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
  
  // Отображаем новости на главной странице при загрузке
  renderHomeNews();
  
  // Header buttons
  const headerLogoLink = document.getElementById('headerLogoLink');
  if (headerLogoLink) {
    console.log('Найдена кнопка headerLogoLink');
    headerLogoLink.addEventListener('click', function(e) { 
      e.preventDefault(); 
      console.log('Нажата кнопка headerLogoLink');
      showHome(); 
    });
  } else {
    console.warn('Кнопка headerLogoLink не найдена!');
  }
  
  const headerMenuButton = document.getElementById('headerMenuButton');
  if (headerMenuButton) {
    console.log('Найдена кнопка headerMenuButton');
    headerMenuButton.addEventListener('click', function() {
      console.log('Нажата кнопка headerMenuButton');
      toggleMenu();
    });
  } else {
    console.warn('Кнопка headerMenuButton не найдена!');
  }

  // Home page buttons
  const homePlayNowButton = document.getElementById('homePlayNowButton');
  if (homePlayNowButton) {
    console.log('Найдена кнопка homePlayNowButton');
    homePlayNowButton.addEventListener('click', function() {
      console.log('Нажата кнопка homePlayNowButton');
      showGachaSystem();
    });
  } else {
    console.warn('Кнопка homePlayNowButton не найдена!');
  }
  
  const homeShowCollectionButton = document.getElementById('homeShowCollectionButton');
  if (homeShowCollectionButton) {
    console.log('Найдена кнопка homeShowCollectionButton');
    homeShowCollectionButton.addEventListener('click', function() {
      console.log('Нажата кнопка homeShowCollectionButton');
      showCollection();
    });
  } else {
    console.warn('Кнопка homeShowCollectionButton не найдена!');
  }
  
  const homeShowNewsButton = document.getElementById('homeShowNewsButton');
  if (homeShowNewsButton) {
    console.log('Найдена кнопка homeShowNewsButton');
    homeShowNewsButton.addEventListener('click', function() {
      console.log('Нажата кнопка homeShowNewsButton');
      showNews();
    });
  } else {
    console.warn('Кнопка homeShowNewsButton не найдена!');
  }
  
  const homeShowTycoonButton = document.getElementById('homeShowTycoonButton');
  if (homeShowTycoonButton) {
    console.log('Найдена кнопка homeShowTycoonButton');
    homeShowTycoonButton.addEventListener('click', function() {
      console.log('Нажата кнопка homeShowTycoonButton');
      showTycoon();
    });
  } else {
    console.warn('Кнопка homeShowTycoonButton не найдена!');
  }
  
  const homeShowGachaButton = document.getElementById('homeShowGachaButton');
  if (homeShowGachaButton) {
    console.log('Найдена кнопка homeShowGachaButton');
    homeShowGachaButton.addEventListener('click', function() {
      console.log('Нажата кнопка homeShowGachaButton');
      showGachaSystem();
    });
  } else {
    console.warn('Кнопка homeShowGachaButton не найдена!');
  }

  // Side Menu buttons
  const sideMenuCloseButton = document.getElementById('sideMenuCloseButton');
  if (sideMenuCloseButton) sideMenuCloseButton.addEventListener('click', toggleMenu);

  const navButtons = {
    'navHome': showHome,
    'navGacha': showGachaSystem,
    'navCollection': showCollection,
    'navTycoon': showTycoon,
    'navNews': showNews,
    'navShop': showShop,
    'navEvents': showEvents,
    'navProfile': showProfile
  };

  Object.entries(navButtons).forEach(([id, handler]) => {
    const button = document.getElementById(id);
    if (button) {
      button.addEventListener('click', () => {
        handler();
        toggleMenu(); // Close menu after navigation
      });
    }
  });
  
  // Добавляем обработчик на кнопку "Забрать"
  const collectButton = document.getElementById('collectGachaButton');
  if (collectButton) {
    collectButton.addEventListener('click', function() {
      if (lastPulledCardsData.length > 0) {
        // Отображаем карты в основном контейнере
        displayPulledCards(lastPulledCardsData, 'gachaResults'); 

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
  
  // Обработчик изменения цены билета
  const ticketPriceSlider = document.getElementById('ticketPrice');
  const ticketPriceValue = document.getElementById('ticketPriceValue');
  
  if (ticketPriceSlider && ticketPriceValue) {
    ticketPriceSlider.addEventListener('input', function() {
      ticketPriceValue.textContent = this.value;
    });
  }
  
  // Добавляем обработчик для кнопки сохранения команды
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
  
  // Show stats info button functionality
  const showStatsInfoBtn = document.getElementById('showStatsInfoBtn');
  if (showStatsInfoBtn) {
    showStatsInfoBtn.addEventListener('click', function() {
      let statsModal;
      const existingModal = document.getElementById('statsInfoModal');
      if (existingModal) {
        statsModal = bootstrap.Modal.getInstance(existingModal);
      } else {
        const statsInfoModalDiv = document.createElement('div');
        statsInfoModalDiv.className = 'modal fade';
        statsInfoModalDiv.id = 'statsInfoModal';
        statsInfoModalDiv.innerHTML = `
          <div class="modal-dialog">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title">Character Stats Explanation</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
              </div>
              <div class="modal-body">
                <h6>Power</h6>
                <p>Determines the character's overall strength and influence in performances.</p>
                
                <h6>Beauty</h6>
                <p>Affects visual appeal and stage presence during concerts.</p>
                
                <h6>Charisma</h6>
                <p>Influences fan engagement and crowd interaction.</p>
                
                <h6>Vocal</h6>
                <p>Represents singing ability and musical talent.</p>
                
                <div class="alert alert-info">
                  <i class="fas fa-info-circle me-2"></i>Higher stats will improve your concert performance and fan gains!
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
              </div>
            </div>
          </div>
        `;
        document.body.appendChild(statsInfoModalDiv);
        statsModal = new bootstrap.Modal(statsInfoModalDiv);
        statsInfoModalDiv.addEventListener('hidden.bs.modal', function() {
          document.body.removeChild(statsInfoModalDiv); // Clean up modal from DOM after it's hidden
        });
      }
      statsModal.show();
    });
  }
  
  // Вывод в консоль для отладки
  console.log("DOMContentLoaded: Инициализация завершена");
  
  // Добавляем обработчики для кнопок в гача-системе
  const pullGacha1Button = document.getElementById('pullGacha1Button');
  if (pullGacha1Button) {
    pullGacha1Button.addEventListener('click', function() {
      console.log('Нажата кнопка pullGacha1Button');
      pullGacha(1);
    });
  } else {
    console.warn('Кнопка pullGacha1Button не найдена!');
  }
  
  const pullGacha10Button = document.getElementById('pullGacha10Button');
  if (pullGacha10Button) {
    pullGacha10Button.addEventListener('click', function() {
      console.log('Нажата кнопка pullGacha10Button');
      pullGacha(10);
    });
  } else {
    console.warn('Кнопка pullGacha10Button не найдена!');
  }
  
  const gachaGoToCollectionButton = document.getElementById('gachaGoToCollectionButton');
  if (gachaGoToCollectionButton) {
    gachaGoToCollectionButton.addEventListener('click', function() {
      console.log('Нажата кнопка gachaGoToCollectionButton');
      showCollection();
    });
  } else {
    console.warn('Кнопка gachaGoToCollectionButton не найдена!');
  }
  
  const collectionGoToGachaButton = document.getElementById('collectionGoToGachaButton');
  if (collectionGoToGachaButton) {
    collectionGoToGachaButton.addEventListener('click', function() {
      console.log('Нажата кнопка collectionGoToGachaButton');
      showGachaSystem();
    });
  } else {
    console.warn('Кнопка collectionGoToGachaButton не найдена!');
  }
  
  // Добавляем обработчики для кнопок в тайкун-режиме
  const manageTeamButton = document.getElementById('manageTeamButton');
  if (manageTeamButton) {
    manageTeamButton.addEventListener('click', function() {
      console.log('Нажата кнопка manageTeamButton');
      showTeamManagement();
    });
  } else {
    console.warn('Кнопка manageTeamButton не найдена!');
  }
  
  const upgradeStudioButton = document.getElementById('upgradeStudioButton');
  if (upgradeStudioButton) {
    upgradeStudioButton.addEventListener('click', function() {
      console.log('Нажата кнопка upgradeStudioButton');
      upgradeStudio();
    });
  } else {
    console.warn('Кнопка upgradeStudioButton не найдена!');
  }
  
  const produceSongButton = document.getElementById('produceSongButton');
  if (produceSongButton) {
    produceSongButton.addEventListener('click', function() {
      console.log('Нажата кнопка produceSongButton');
      produceSong();
    });
  } else {
    console.warn('Кнопка produceSongButton не найдена!');
  }
  
  const startConcertButton = document.getElementById('startConcertButton');
  if (startConcertButton) {
    startConcertButton.addEventListener('click', function() {
      console.log('Нажата кнопка startConcertButton');
      startConcert();
    });
  } else {
    console.warn('Кнопка startConcertButton не найдена!');
  }
  
  const collectDailyTasksButton = document.getElementById('collectDailyTasksButton');
  if (collectDailyTasksButton) {
    collectDailyTasksButton.addEventListener('click', function() {
      console.log('Нажата кнопка collectDailyTasksButton');
      collectDailyTasks();
    });
  } else {
    console.warn('Кнопка collectDailyTasksButton не найдена!');
  }
  
  const shareConcertResultButton = document.getElementById('shareConcertResultButton');
  if (shareConcertResultButton) {
    shareConcertResultButton.addEventListener('click', function() {
      console.log('Нажата кнопка shareConcertResultButton');
      shareConcertResult();
    });
  } else {
    console.warn('Кнопка shareConcertResultButton не найдена!');
  }
  
  // Удаляем повторные объявления глобальных переменных
});
// --- End Event Listener Setup ---

// Функция для отображения новостей на главной странице
function renderHomeNews() {
  const newsContainer = document.getElementById('homeNewsBox');
  if (!newsContainer) {
    console.error('Контейнер новостей на главной странице не найден!');
    return;
  }

  // Сохраняем заголовок
  const title = newsContainer.querySelector('.feature-title');
  
  // Очищаем контейнер, сохраняя заголовок
  newsContainer.innerHTML = '';
  if (title) {
    newsContainer.appendChild(title);
  } else {
    const newTitle = document.createElement('h3');
    newTitle.className = 'feature-title';
    newTitle.textContent = 'NEWS';
    newsContainer.appendChild(newTitle);
  }

  // Отображаем только 2 последние новости для главной страницы
  const latestNews = sampleNewsData.slice(0, 2);
  
  latestNews.forEach(news => {
    const newsItem = document.createElement('div');
    newsItem.className = 'news-item';
    
    newsItem.innerHTML = `
      <p>${news.title}</p>
      <p class="news-date">${news.date}</p>
      <div class="dots-indicator">
        <span class="dot active"></span>
        <span class="dot"></span>
      </div>
    `;
    
    newsContainer.appendChild(newsItem);
  });
  
  // Добавляем кнопку для перехода в раздел новостей
  const button = document.createElement('button');
  button.className = 'feature-button mt-2';
  button.id = 'homeShowNewsButton';
  button.textContent = 'NEWS';
  button.addEventListener('click', showNews);
  
  newsContainer.appendChild(button);
}
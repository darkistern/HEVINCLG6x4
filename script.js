/* 
  HEV IN12 GL Clock v1.0
  Author: Erelin Darkis Sternelis (darkistern)
  GitHub: https://github.com/darkistern
  Copyright (c) 2026 Erelin Darkis Sternelis (darkistern). All rights reserved.
*/
document.addEventListener("DOMContentLoaded", () => {
	const in12Order = ['3', '8', '9', '4', '0', '7', '5', '2', '6', '1'];
	// Интервал антиотравления катодов в минутах
	const antiPoisonIntervalMinutes = 3.7; 
	// Динамическая генерация нитей-катодов внутри корпусов ламп
	function initLamps() {
		const lamps = document.querySelectorAll('.nixie-digit');
		lamps.forEach(lamp => {
			in12Order.forEach(num => {
				const span = document.createElement('span');
				span.textContent = num;
				span.setAttribute('data-num', num);
				lamp.appendChild(span);
			});
		});
	}
	// Обновление состояния конкретного цифрового индикатора
	function updateLamp(lampId, targetValue) {
		const lamp = document.getElementById(lampId);
		if (!lamp) return;
		const activeSpan = lamp.querySelector('.active');
		if (activeSpan && activeSpan.getAttribute('data-num') === targetValue) return;
		const allSpans = Array.from(lamp.querySelectorAll('span'));
		
		// Очистка предыдущих эффектов, теней катодов и инлайнового затухания
		allSpans.forEach(span => {
			span.classList.remove('shadow-overlay', 'reflected-glow-back');
			span.style.opacity = ''; 
		});
		// Запуск анимации гашения старого катода
		if (activeSpan) {
			activeSpan.classList.remove('active');
			activeSpan.classList.add('fading');
			setTimeout(() => activeSpan.classList.remove('fading'), 120);
		}
		// Включение новой активной цифры под искажающим стеклом
		const nextSpan = lamp.querySelector(`span[data-num="${targetValue}"]`);
		if (nextSpan) {
			nextSpan.classList.remove('fading');
			nextSpan.classList.add('active');
		}
		// Определение физического индекса горящей нити в лампе
		const targetIndex = allSpans.findIndex(s => s.getAttribute('data-num') === targetValue);
		// Послойное распределение теней вышестоящих и подсветки нижестоящих нитей
		allSpans.forEach((span, index) => {
			if (index === targetIndex) return;
			
			if (index < targetIndex) {
				// Тень Cathode Shadow для нитей, расположенных ПЕРЕД горящей
				span.classList.add('shadow-overlay');
			} else {
				// Мягкое отблесковое затухание для нитей, расположенных ПОЗАДИ горящей
				span.classList.add('reflected-glow-back');
				const distance = index - targetIndex; 
				const calculatedOpacity = 0.22 / Math.pow(2, distance - 1);
				span.style.setProperty('opacity', calculatedOpacity.toFixed(3), 'important');
			}
		});
	}
	// Точное посимвольное распределение времени по ID ламп
	function updateClock() {
		const now = new Date();
		const hours = String(now.getHours()).padStart(2, '0');
		const minutes = String(now.getMinutes()).padStart(2, '0');
		const seconds = String(now.getSeconds()).padStart(2, '0');
		
		// Каждая лампа получает ровно один свой символ из строки времени
		updateLamp('h1', hours[0]);
		updateLamp('h2', hours[1]);
		updateLamp('m1', minutes[0]);
		updateLamp('m2', minutes[1]);
		updateLamp('s1', seconds[0]);
		updateLamp('s2', seconds[1]);
	}
	// Цикл антиотравления катодов (Быстрый перебор цифр во всех 6 лампах)
	function triggerCathodeAntiPoisoning() {
		let step = 0;
		const clockContainer = document.querySelector('.transparent-clock');
		if (clockContainer) clockContainer.classList.add('shuffling');
		const shuffleInterval = setInterval(() => {
			if (step < in12Order.length) {
				const currentShuffleDigit = in12Order[step];
				document.querySelectorAll('.nixie-digit').forEach(lamp => {
					updateLamp(lamp.id, currentShuffleDigit);
				});
				step++;
			} else {
				clearInterval(shuffleInterval);
				if (clockContainer) clockContainer.classList.remove('shuffling');
				updateClock(); // Возвращаем текущее точное время после перебора
			}
		}, 40); 
	}
	// Стартовая инициализация и запуск таймеров приложения часов
	initLamps();
	updateClock(); // Мгновенный запуск времени при обновлении страницы
	setInterval(updateClock, 1000); 
	setInterval(triggerCathodeAntiPoisoning, antiPoisonIntervalMinutes * 60 * 1000);
});
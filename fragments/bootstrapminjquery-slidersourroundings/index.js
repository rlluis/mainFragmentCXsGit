/**
 * --------------------------------------------------------------------------
 * A vanilla JS implementation of the Bootstrap 4 carousel,
 * adapted from Liferay's own marketplace fragments to remove the jQuery dependency.
 * --------------------------------------------------------------------------
 */
class Carousel {
	constructor(element, config) {
		this.carousel = element;
		this.config = config;
		this.carouselInner = this.carousel.querySelector('.carousel-inner');
		this.carouselItems = this.carousel.querySelectorAll('.carousel-item');
		this.carouselIndicators = this.carousel.querySelectorAll('.carousel-indicators li');
		this.carouselNext = this.carousel.querySelector('.carousel-control-next');
		this.carouselPrev = this.carousel.querySelector('.carousel-control-prev');
		this.isSliding = false;
		this.interval = null;

		this.activeIndex = this._getItemIndex(
			this.carousel.querySelector('.carousel-item.active')
		);

		this._setEventListeners();

		if (this.config.ride === 'carousel' && this.config.interval) {
			this.cycle();
		}
	}

	_getItemIndex(element) {
		return Array.from(this.carouselItems).indexOf(element);
	}

	_setEventListeners() {
		if (this.carouselNext && this.carouselPrev) {
			this.carouselNext.addEventListener('click', () => this.next());
			this.carouselPrev.addEventListener('click', () => this.prev());
		}

		if (this.carouselIndicators) {
			this.carouselIndicators.forEach(indicator => {
				indicator.addEventListener('click', event => {
					this.goTo(parseInt(event.currentTarget.dataset.slideTo, 10));
				});
			});
		}
	}

	cycle() {
		this.pause();
		this.interval = setInterval(() => this.next(), this.config.interval);
	}

	pause() {
		clearInterval(this.interval);
	}

	next() {
		if (!this.isSliding) {
			this._slide('next');
		}
	}

	prev() {
		if (!this.isSliding) {
			this._slide('prev');
		}
	}

	goTo(index) {
		if (this.isSliding || index === this.activeIndex) return;

		const direction = index > this.activeIndex ? 'next' : 'prev';
		this._slide(direction, this.carouselItems[index]);
	}

	_slide(direction, nextElement = null) {
		const activeElement = this.carouselItems[this.activeIndex];
		const isNext = direction === 'next';

		if (!nextElement) {
			const nextIndex = (this.activeIndex + (isNext ? 1 : -1) + this.carouselItems.length) % this.carouselItems.length;
			nextElement = this.carouselItems[nextIndex];
		}

		const nextElementIndex = this._getItemIndex(nextElement);
		if (nextElementIndex === -1) return;

		this.isSliding = true;

		const directionClassName = isNext ? 'carousel-item-left' : 'carousel-item-right';
		const orderClassName = isNext ? 'carousel-item-next' : 'carousel-item-prev';

		nextElement.classList.add(orderClassName);
		// Force reflow
		void nextElement.offsetWidth;

		activeElement.classList.add(directionClassName);
		nextElement.classList.add(directionClassName);

		const onTransitionEnd = () => {
			nextElement.classList.remove(directionClassName, orderClassName);
			nextElement.classList.add('active');

			activeElement.classList.remove('active', directionClassName);

			this.isSliding = false;
			this.activeIndex = nextElementIndex;

			if (this.carouselIndicators.length) {
				this.carouselIndicators.forEach(el => el.classList.remove('active'));
				this.carouselIndicators[this.activeIndex].classList.add('active');
			}

			activeElement.removeEventListener('transitionend', onTransitionEnd);
		};

		activeElement.addEventListener('transitionend', onTransitionEnd);
	}
}

let sliderInitialized = false;

function initializeSlider() {
	const carouselElement = fragmentElement.querySelector('.carousel');
	if (!carouselElement) return;

	const carouselInner = carouselElement.querySelector('.carousel-inner');
	if (!carouselInner) return;

	let collectionItems = [];
	const rows = carouselInner.querySelectorAll('.row');

	if (rows.length === 1) {
		// If there's one row, check for columns inside to treat as slides.
		const singleRow = rows[0];
		const cols = singleRow.querySelectorAll('.col, [class*="col-"]');

		if (cols.length > 0) {
			// Treat columns as slides
			cols.forEach(col => {
				carouselInner.appendChild(col); // Move col to be a direct child of carousel-inner
				collectionItems.push(col);
			});
			singleRow.remove(); // Remove the now-empty row
		} else {
			// One row, no columns, so the row itself is the slide
			collectionItems = Array.from(rows);
		}
	} else if (rows.length > 0) {
		// Multiple rows, treat each row as a slide
		collectionItems = Array.from(rows);
	}

	let active = 'active';
	collectionItems.forEach((item) => {
		item.classList.add('carousel-item');
		if (active) {
			item.classList.add(active);
			active = '';
		}
	});

	// Dynamically generate indicators if there are slides
	const indicatorsList = carouselElement.querySelector('.carousel-indicators');
	if (indicatorsList && collectionItems.length > 0) {
		indicatorsList.innerHTML = ''; // Clear any existing indicators
		const carouselId = `#${carouselElement.id}`;

		collectionItems.forEach((_, index) => {
			const indicator = document.createElement('li');
			indicator.setAttribute('data-target', carouselId);
			indicator.setAttribute('data-slide-to', index);
			if (index === 0) {
				indicator.classList.add('active');
			}
			indicatorsList.appendChild(indicator);
		});
	}

	const interval = configuration.carouselAutoPlay ? parseInt(configuration.dataInterval, 10) : false;
	const ride = interval ? 'carousel' : false;

	new Carousel(carouselElement, { interval, ride });
}

function setupObserver() {
	const carouselElement = fragmentElement.querySelector('.carousel');
	if (!carouselElement) return;

	const observer = new MutationObserver(() => {
		const collectionItems = carouselElement.querySelectorAll('.carousel-inner .row');
		if (collectionItems.length > 0 && !sliderInitialized) {
			sliderInitialized = true;
			initializeSlider();
			observer.disconnect();
		}
	});
	observer.observe(carouselElement, { childList: true, subtree: true });
}

// Initial load
function init() {
	sliderInitialized = false;

	// Always run initializeSlider on view, and setup observer in edit mode
	// to handle drag-and-drop of collections.
	initializeSlider();
	if (typeof layoutMode !== 'undefined' && layoutMode === 'edit') {
		setupObserver();
	}
}

init();

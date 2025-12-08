let sliderInitialized = false;

function initializeSlider() {
	const carouselElement = fragmentElement.querySelector('.carousel');
	if (!carouselElement) return;

	const carouselInner = carouselElement.querySelector('.carousel-inner');
	if (!carouselInner) return;

	// Process slides from a collection display, which are wrapped in .row
	const collectionItems = carouselInner.querySelectorAll('.row');
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

	// Initialize the Bootstrap 4 carousel using jQuery, as required.
	// We now use the values from the fragment's configuration.
	const interval = configuration.carouselAutoPlay ? parseInt(configuration.dataInterval, 10) : false;

	$(carouselElement).carousel({
		interval: interval,
		// The 'ride' option tells the carousel to start cycling on load.
		// We only set it if an interval is active.
		ride: interval ? 'carousel' : false
	});
}

function setupObserver() {
	const carouselElement = fragmentElement.querySelector('.carousel');
	if (!carouselElement) return;

	const observer = new MutationObserver(() => {
		// Check if there are slides and the slider hasn't been initialized yet.
		const collectionItems = carouselElement.querySelectorAll('.carousel-inner .row');
		if (collectionItems.length > 0 && !sliderInitialized) {
			sliderInitialized = true;
			initializeSlider();
			// Once initialized, we don't need to observe anymore.
			observer.disconnect();
		}
	});

	// Observe the entire carousel for child and subtree changes.
	// This is more robust than targeting a specific Liferay class.
	observer.observe(carouselElement, {
		childList: true,
		subtree: true
	});
}

function init() {
	sliderInitialized = false;

	// Always run initializeSlider on view, and setup observer in edit mode
	// to handle drag-and-drop of collections.
	initializeSlider();
	if (typeof layoutMode !== 'undefined' && layoutMode === 'edit') {
		setupObserver();
	}
}

function safelyInitialize() {
	if (typeof $ !== 'undefined' && $.fn && $.fn.carousel) {
		// If jQuery and the carousel plugin are ready, initialize.
		init();
	} else {
		// If not, wait 100ms and try again.
		setTimeout(safelyInitialize, 100);
	}
}

// Start the safe initialization process.
safelyInitialize();
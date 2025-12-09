// Register the modules that will be used. This is the recommended practice.
Swiper.use([
	Swiper.Navigation,
	Swiper.Pagination,
	Swiper.Scrollbar,
	Swiper.EffectCube,
	Swiper.EffectFlip,
	Swiper.EffectFade,
	Swiper.EffectCoverflow,
	Swiper.EffectCards,
	Swiper.EffectCreative,
]);

function initSwiper(fragmentElement) {
	if (!fragmentElement) {
		return;
	}

	const swiperContainer = fragmentElement.querySelector('.mySwiper');

	if (swiperContainer.swiper) {
		swiperContainer.swiper.destroy(true, true);
	}

	if (configuration.isVertical) {
		swiperContainer.classList.add('swiper-vertical');
	}

	const swiperOptions = {
		slidesPerView: parseInt(configuration.numberOfSlides, 10),
		spaceBetween: parseInt(configuration.spaceBetween, 10),
		centeredSlides: configuration.centeredSlides,		
		observer: true,
		observeParents: true,
		direction: configuration.isVertical
			? 'vertical'
			: 'horizontal',
		loop: configuration.loop,
		effect: configuration.carouselEffect || 'slide',
	};

	if (configuration.showPagination) {
		swiperOptions.pagination = {
			el: '.swiper-pagination',
			clickable: true,
		};
	}

	if (configuration.showNavButtons) {
		swiperOptions.navigation = {
			nextEl: '.swiper-button-next',
			prevEl: '.swiper-button-prev',
		};
	}

	if (configuration.showScrollbar) {
		swiperOptions.scrollbar = {
			el: '.swiper-scrollbar',
			hide: true,
		};
	}

	// Add effect-specific options and modules
	if (swiperOptions.effect === 'cube') {
		swiperOptions.cubeEffect = {
			shadow: true,
			slideShadows: true,
			shadowOffset: 20,
			shadowScale: 0.94,
		};
	} else if (swiperOptions.effect === 'flip') {
		swiperOptions.flipEffect = {
			slideShadows: true,
		};
	} else if (swiperOptions.effect === 'fade') {
		swiperOptions.fadeEffect = {
			crossFade: true,
		};
	} else if (swiperOptions.effect === 'coverflow') {
		swiperOptions.coverflowEffect = {
			rotate: 50,
			stretch: 0,
			depth: 100,
			modifier: 1,
			slideShadows: true,
		};
	} else if (swiperOptions.effect === 'cards') {
		// The 'cards' effect works best with one slide per view.
		swiperOptions.slidesPerView = 1;
		swiperOptions.cardsEffect = {
			// ... additional card options can go here
		};
	} else if (swiperOptions.effect === 'creative') {
		swiperOptions.creativeEffect = {
			prev: {
				shadow: true,
				translate: [0, 0, -400],
			},
			next: {
				translate: ['100%', 0, 0],
			},
		};
	}
	
	new Swiper(swiperContainer, swiperOptions);
}

function processSlides(swiperWrapper) {
	// Find rows that are not yet processed.
	const rows = swiperWrapper.querySelectorAll('.row:not(.swiper-slide)');
	let processedCount = 0;

	if (rows.length === 1) {
		// If there's one row, check for columns inside to treat as slides.
		// This handles collections configured to display items as columns in a single row.
		const singleRow = rows[0];
		const cols = singleRow.querySelectorAll('.col, [class*="col-"]');

		if (cols.length > 0) {
			cols.forEach(colElement => {
				if (colElement.querySelector('lfr-drop-zone')) {
					return; // Ignore dropzones in the editor
				}
				colElement.classList.add('swiper-slide');
				swiperWrapper.appendChild(colElement); // Move col to be a direct child of the wrapper
				processedCount++;
			});

			// If the row is now empty, remove it.
			if (singleRow.children.length === 0) {
				singleRow.remove();
			}

			return processedCount > 0;
		}
	}

	// Default behavior: treat each row as a slide.
	// This works for collections where each item is a row, or for single-row cases without cols.
	rows.forEach(rowElement => {
		if (rowElement.querySelector('lfr-drop-zone')) {
			return; // Ignore dropzones in the editor
		}
		rowElement.classList.add('swiper-slide');
		swiperWrapper.appendChild(rowElement); // Ensure it's a direct child
		processedCount++;
	});

	return processedCount > 0;
}

function init() {
	let initialized = false;
	const swiperWrapper = fragmentElement.querySelector('.swiper-wrapper');
	
	// The observer will handle all dynamic content changes.
	const observer = new MutationObserver(() => {
		if (!initialized && processSlides(swiperWrapper)) {
			// Use setTimeout to ensure the DOM has updated before initializing.
			setTimeout(() => {
				initSwiper(fragmentElement);
				initialized = true;
				observer.disconnect();
			}, 0);
		}
	});

	// Start observing for content being added (e.g., from a collection).
	observer.observe(swiperWrapper, { childList: true, subtree: true });

	// Immediately attempt to initialize in case the content
	// is already present in the DOM on initial load.
	if (processSlides(swiperWrapper)) {
		initSwiper(fragmentElement);
		initialized = true;
		observer.disconnect();
	}
}

// Initial load
init();
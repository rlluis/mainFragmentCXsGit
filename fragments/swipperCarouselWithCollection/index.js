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

// Initial load
initSwiper(fragmentElement);
# Swiper Carousel Fragment

This fragment provides a highly configurable carousel based on the [Swiper.js](https://swiperjs.com/) library.

To use it you will need to first add the SwiperCarousel, then a Collection Display Fragment and finally anything you want to map your different slides to each Item from the Collection. Once the Collection is added, please remember to set it to No Pagination and to show all items (or the number of items you want). No additional configuration at this level is needed.

The Swiper Carousel needs a very specific HTML structure to work so we are manipulating the DOM in order to get wnat's needed. This means that small issues can happen when using it on edit mode. On the other hand, the advantage is that you get a nice Carousel that is fully configurable and WYSIWYG if used with care.

You will need to add the CSS and JS of Swiper Carousel. I am adding it into the Page or into the Master Page with 2 CXs from a CDN --> https://cdn.jsdelivr.net/npm/swiper@12/swiper-bundle.min.js and https://cdn.jsdelivr.net/npm/swiper@12/swiper-bundle.min.css

You will find multiple configurations for the Swiper itself including effects like Cube, Cards, Creative, Centered, etc.

You can also have different Carousels with different configurations in the same page as all should be scoped to the fragment's name.

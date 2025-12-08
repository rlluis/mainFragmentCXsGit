# Swiper Carousel with Collection Fragment

This fragment provides a carousel based on [Swiper.js](https://swiperjs.com/) that is dynamically populated from a Liferay Collection which is added through a Fragment Configuration. This means that in this exapmle we don't need to manipulate the DOM to have it working as the specific HTML structure that is needed for Swiper to work is fully controlled through Freemarker code: Liferay DXP provides a LOOP once you inject a Collection through Configuration.

You will find multiple configurations for the Swiper itself including effects like Cube, Cards, Creative, Centered, etc.

You can also have different Carousels with different configurations in the same page as all should be scoped to the fragment's name.

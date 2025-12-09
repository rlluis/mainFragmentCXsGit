# Swiper Carousel with Collection Fragment

This fragment provides a carousel based on [Swiper.js](https://swiperjs.com/) that is dynamically populated from a Liferay Collection which is added through a Fragment Configuration. This means that in this exapmle we don't need to manipulate the DOM to have it working as the specific HTML structure that is needed for Swiper to work is fully controlled through Freemarker code: Liferay DXP provides a LOOP once you inject a Collection through Configuration. Apart from the Collection itself, you also need to add a Widget Template ID: this is used to render each item of the collection and we use a headless call through JS to get it. You will need to create this Widget Template and provide there the CARD or similar you want to use to display your collection (unfortunately this is not fully WYSIWYG but you have full control)

You will need to add the CSS and JS of Swiper Carousel. I am adding it into the Page or into the Master Page with 2 CXs from a CDN --> https://cdn.jsdelivr.net/npm/swiper@12/swiper-bundle.min.js and https://cdn.jsdelivr.net/npm/swiper@12/swiper-bundle.min.css

You will find multiple configurations for the Swiper itself including effects like Cube, Cards, Creative, Centered, etc.

You can also have different Carousels with different configurations in the same page as all should be scoped to the fragment's name. Recommended configuration: add a container first. You can set the width of this container and also decide to have it in the middle by changing its flow to Flex Row and align center. The slides and the pagination and the buttons will fill the full space that the container is adding.

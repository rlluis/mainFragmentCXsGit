# Liferay Fragments and Client Extensions

This repository contains a collection of Fragments and Client Extensions for Liferay DXP.

## Fragments

Below is a list of the available Fragments. Each fragment directory contains a `README.md` with more detailed documentation.

- **Bootstrap-SliderItem**: A draggable card specifically prepared for the Bootstrap Slider fragments.
- **Bootstrap-slidersourroundings**: A flexible carousel based on Bootstrap Careousel, using JS to set each slide once all JS is ready. It depens on Jquery
- **Bootstrapminjquery-slidersourroundings**: Same than the above but without the JQuery dependency.
- **Chatbot**: a floating icon in the right bottom corner that will open a chatbot fragment that simulates a chat against a Liferay Object. Just for fun and also for quick AI predictable demos!
- **ChatbotAIBlueprint**: same than above but this fragment is connected to Neil's Chat Springboot Client Extension so you can use it as an alternative of the classic Fragment that Neil has.
- **Swiper Carousel**: A flexible carousel based on Swiper.js, where slides are added by dropping a Collection Display Fragment inside it. It manipulates the DOM so use with care.
- **Swiper Carousel with Collection**: Same than above but in this case the Collection is added through Configuration so there's no DOM manipulation as all is generated in a loop with freemarker, provided by the collection configuration.
- **Repeatable JSON Field**: A form field fragment that allows content creators to add multiple structured entries based on a specific child object. Each entry will be stored in a JSON field of the main Object and converted later on when calling the corresponding CX through an OBject Action.

Additionally note that on build.gradle there's a specific task to create a ZIP for each fragmnent that you can then import into Liferay DXP. It will create a ZIP under the dist/fragments folder.

## Client Extensions

Below is a list of the available Client Extensions. Each extension directory contains its own `README.md` with more detailed documentation.

- **From JSON to Object (Spring Boot)**: A Spring Boot backend service, to convert a JSON stored in an Object into its corresponding related object.

---
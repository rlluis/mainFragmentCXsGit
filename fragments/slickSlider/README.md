Slick Slider is a SLIDER, based on the awesome JQuery slider work by the author's of the Slick Slider (https://kenwheeler.github.io/slick/). You will be able to:

Create a nice Slider with a Collection Display Fragment in a very easy way. 
First step is to add the dependencies with Slick Slider. For that you need to create two Client Extensions, one for CSS and another one for JS and configure them in a Master Page or ni the page itself. To map the dependencies please use this URLs:
JS --> https://cdn.jsdelivr.net/gh/rlluis/liferayFragments@v1.1.4/remoteCSS%26JS/slick.min.js

CSS --> https://cdn.jsdelivr.net/gh/rlluis/liferayFragments@v1.1.4/remoteCSS%26JS/slick.css

In a Content Page you will then add Slick Slider Fragment and then drop a Collection Display Fragment on it. Then leave the collection configuration (Grid, etc.) as it is by default (configure it with No pagination and select all items or the number of items you want)
The Fragment lets you configure different settings for the Slider like its type (Full, Centered, Fade), Colors of the arrows, Dots, speed, etc.

NOTE: the first time you add it while editing the page it won't work. You may need to save and come back to edit mode to see it's there working and now you can configure better the different parameters. Same will happen if you change a parameter: it will work once you save it and Publish. Unfortunately the DOM manipulation that is done here, so the slick slider works, creates some problems when the DOM changes while editing, have that into account.

NOTE2: the fragment takes into account that you may want to add two or more instances in a page. It's possible, no problem.
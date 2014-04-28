What is mink
====

mink is an open-source first approach on a front-end framework. It strives to leverage the good ideas and latest trends born in the JS community to deliver a fresh, modular and portable UI framework, wrapped in a friendly API package.

This project is under high development and is not yet production ready. Check the [issue queue](https://github.com/mariomc/mink/issues) for the feature roadmap. Participation and collaboration will be much welcome!

The first stable release will feature a few ports of [Ink](https://github.com/sapo/Ink) modules, an integration of an Open Source project, the documentation of the API architecture and some build tools.

How does it work
====

__mink__ uses an helper API to work its magic: Zepto (with data plugin), Ender or jQuery. Just be sure to include it before mink's script and modules. 
If, for some reason, you have more than one helper and want to define which should be used, either set ````window.mink.helper=jQuery ```` or set the name of the helper as a data-attribute on the mink base script element like so ````<script src="mink/base/base.js" data-helper="jQuery" ></script>````

Where the goodness comes from:
*    [Ink](https://github.com/sapo/Ink)'s CSS and grid
*    [jQuery](https://github.com/jquery/jquery) and [Zepto](https://github.com/madrobby/zepto) compatible API
*    [Ender](https://github.com/ender-js/Ender) as a main helper API
*    Data-attributes autoloading.
*    [Semantic UI](https://github.com/Semantic-Org/Semantic-UI) inspired architecture
*    [UMD](https://github.com/umdjs/umd) wrapped modules
*    [NPM](https://www.npmjs.org) distribution of modules

Installation
====

````html
<link rel="stylesheet" href="http://cdn.ink.sapo.pt/3.0.0/css/ink-flex.css">
<!-- This CSS is only needed for this Proof of Concept -->
<link rel="stylesheet" href="http://rawgit.com/mariomc/mink/master/all/mink.css">
<!-- Helper API. Use Ender, jQuery or Zepto (with data plugin) -->
<script src="http://rawgit.com/mariomc/mink/master/ender.js"></script>
<!-- Mink base --> 
<script src="http://rawgit.com/mariomc/mink/base/base.js"></script>
<!-- Mink modal -->
<script src="http://rawgit.com/mariomc/mink/dist/modal/modal.js"></script>

<!-- Your HTML -->
<script>
(function($){
    $("#myModal").modal('open');
})(mink.$);
</script>
````

Demo
====

For a very rough demo, check [http://mariomc.github.io/mink/](http://mariomc.github.io/mink/).
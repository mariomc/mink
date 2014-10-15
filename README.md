#What is mink

**mink** is an open-source first approach on a front-end framework. It strives to leverage the good ideas and latest trends born in the JS community to deliver a fresh, modular and portable UI framework, wrapped in a friendly API package.

This project is under high development and not yet production ready. Check the [issue queue](https://github.com/mariomc/mink/issues) for the feature roadmap, the [samples folder](samples/) for a feel of what's to come. Participation and collaboration will be much welcome!

The first tagged release will feature a few ports of [Ink](https://github.com/sapo/Ink) modules, integrations of some Open Source projects, API architecture and some build tools.

#How does it work

**mink** needs an helper (**$**) library to work its magic. If you need one, we package an [Ender build](ender.js) in the project that gets the job done. If you're already using jQuery or Zepto in your project, go ahead and simply include **mink** base and the modules you'll use. No need for the overhead of another helper library.

Where the goodness comes from:
*    [Ink](https://github.com/sapo/Ink)'s CSS and grid
*    [jQuery](https://github.com/jquery/jquery) and [Zepto](https://github.com/madrobby/zepto) compatible API
*    [Ender](https://github.com/ender-js/Ender) as a main helper API
*    Data-attributes autoloading.
*    [Semantic UI](https://github.com/Semantic-Org/Semantic-UI) inspired architecture
*    [UMD](https://github.com/umdjs/umd) wrapped modules
*    [NPM](https://www.npmjs.org) distribution of modules

#How to use it

##The jQuery way
```html
<!-- Helper Library -->
<script src="jquery.js"></script>
<!-- Mink Core -->
<script src="mink.js"></script>
<!-- Mink Modules -->
<script src="dist/modal/modal.js"></script>
<script>
    $(document).ready(function(){
        $("#gallery").gallery();
    });
</script>
```

##The AMD way
```html
<!-- Helper Library -->
<script src="ender.js"></script>
<!-- Require.js -->
<script src="require.js"></script>
<script>
    require(['dist/gallery/gallery'],
        function(Gallery){
            new Gallery(document.getElementById('gallery'));
        }
    );
</script>
```

#Samples and Spec


You can find some samples in the [sample folder](samples/) and a [commented spec](http://rawgit.com/mariomc/mink/master/spec/docs/mink.html) in the repository
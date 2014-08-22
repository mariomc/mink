# $ - Helper library

mink needs an helper library to work its magic. If you need one, we package an Ender build in the project that gets the job done. If you're already using jQuery or Zepto in your project, go ahead and simply include mink base and the modules you'll use. No need for the overhead of another library.

# Global object

To aid in module creation and interactivity, a global object named ```mink``` is exposed.

This object contains a series of properties and methods used by mink modules

## mink.$

A reference to the helper (**$**) library being used by mink and its modules.

## mink.fn

An object containing a pointer to all mink module constructors.

## mink.$fn

An object containing a pointer to mink module methods in the helper library.

## mink.$.fn.mink

A reference to mink inside the helper (**$**) library.

## mink.defaults

The default settings used by all the modules

## mink._registry

An internal registry of all the module instances on the page.

## mink.factory(moduleDefaults) 

A method to create module constructors populated with mink properties and references

## mink.expose(name, Constructor)

Expose module in the window, inside the mink object and as a method of the helper library.

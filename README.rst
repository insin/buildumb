========
buildumb
========

Ultra-dumb build tool for exporting `Node.js`_ modules for use in browsers.

.. _`Node.js`: http://nodejs.org/

API
===

``formatTemplate(path[, arg1, ...])``
-------------------------------------

Reads a template from the given path and formats it with `util.format()`_,
using all additional arguments passed in.

.. _`util.format()`: http://nodejs.org/docs/latest/api/util.html#util.format

``build(config)``
-----------------

Bundles up specified modules and exports to the global namespace, as instructed.

Expected ``config`` properties are:

``root``
   The absolute path to the build root directory (usually a project directory).

   All other paths in the ``config`` object are relative to ``config.root``.
``modules``
   An object mapping source file paths to ``require()`` strings used to require
   them in your code. If the same file is required multiple ways, the right hand
   side should be an Array.

   Did I mention it was dumb?
``exports``
   An object mapping global variable names to the ``require()`` strings which
   should be used to export to them.
``output``
   Path to the build output file.
``header`` *(Optional)*
   A comment header for inclusion at the top of output files.
``compress`` *(Optional)*
   Path to a compressed output file, which will be created if given.
``exposeRequire`` *(Optional)*
   If ``true``, ``require()`` will be exported to the global scope.

   The `Closure Compiler Service API`_ is used to compress code - errors, warnings
   and statistics it returns will be displayed.

   A compressed version will not be written if there are errors present.

.. _`Closure Compiler Service API`: http://code.google.com/closure/compiler/docs/api-ref.html

# IEEE-754 Analyzers

This is the code for the “IEEE-754 Analyzers” web site hosted at <http://christophervickery.com/IEEE-754>.

Originally created as a student project to parse floating-point numbers, the code serves as a reference source for people who want to learn how the IEEE-754 standard works and/or to verify the correctness of code
written for applications that work directly with floating-point values.

See the web site’s [FAQ](https://christophervickery.com/IEEE-754/FAQ) for details.

If you want to clone the analyzers, or just study the code, these are the source code files used:

  btd.cpp           C++ binary to decimal converter
  dtb.cpp           C++ decimal to binary converter
  computeBin.php    AJAX server for dtb
  computeDec.php    AJAX server for btd
  analyzer.js       User Interactions
  numeric_value.js  Numeric calculations

  To host the analyzers, you will need a web server that supports PHP.

  You will need a copy of jQuery and jquery.hotkeys for user interactions. The versions used by the online analyzers are available in the _scripts_ directory.

  You will also need to install the [GNU Multiprecision Library](https://gmplib.org/) in order to build bdt and dtb.

_Christopher Vickery<br>Emeritus Professor of Computer Science<br>Queens College of CUNY_


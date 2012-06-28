<?php
  //  Generate the page
  //  --------------------------------------------------------------------------
  $mime_type = "text/html";
  $html_attributes="lang=\"en\"";
  if ( array_key_exists("HTTP_ACCEPT", $_SERVER) &&
        (stristr($_SERVER["HTTP_ACCEPT"], "application/xhtml") ||
         stristr($_SERVER["HTTP_ACCEPT"], "application/xml") )
       ||
       (array_key_exists("HTTP_USER_AGENT", $_SERVER) &&
        stristr($_SERVER["HTTP_USER_AGENT"], "W3C_Validator"))
     )
  {
    $mime_type = "application/xhtml+xml";
    $html_attributes = "xmlns=\"http://www.w3.org/1999/xhtml\" xml:lang=\"en\"";
    header("Content-type: $mime_type");
    echo "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n";
  }
  else
  {
    header("Content-type: $mime_type; charset=utf-8");
  }
?>
<!DOCTYPE html>
<html <?php echo $html_attributes;?>>
  <head>
    <title>IEEE-754 Analyzers Source Code</title>
    <link rel="icon" href="../../favicon.ico" />    
    <link rel="stylesheet" type="text/css" href="../css/faq.css" />
    <style type='text/css'>
      table { border-collapse:collapse; border:1px solid black;margin-left:1em;}
			th {text-align: left;padding: 0 0.5em;}
			td {padding: 0 1em;}
    </style>
  </head>
  <body>
    <h1>IEEE-754 Analyzers Source Code</h1>
    <p>
      The source code for this project is available under an <a href='License'>MIT
      license</a>, which allows you to use the code pretty much any way you want to provided you
      maintain the license document with the code.
    </p>
    <p>
      This code makes use of the GNU Multiprecision Arithmetic Library, which is licensed
      separately under the terms of the <a href="https://www.gnu.org/copyleft/lesser.html">GNU
      LGPL</a>
    </p>
    <p>
      The code also uses the jQuery JavaScript Library. See <a href='http://jquery.org/license/'>
      License - jQuery Project</a>. (They allow either an MIT or a GPL license.)
    </p>
    <h2>Download:</h2>
    <p style='margin-left:1em;'>
      <a href="754_analyzers.zip">754_analyzers.zip</a>
      ( <?php echo number_format(filesize('754_analyzers.zip')); ?> bytes).
    </p>
    <table>
      <tr><th>File</th><th>Notes</th><th>Location</th></tr>
      <tr><td>README</td><td></td><td>src</td></tr>
      <tr><td>Makefile</td><td>To compile the .cpp programs</td><td>src</td></tr>
      <tr><td>License</td><td></td><td>src</td></tr>
      <tr><td>btd.cpp</td><td>Binary to Decimal</td><td>src; btd goes in bin</td></tr>
      <tr><td>dtb.cpp</td><td>Decimal to Binary</td><td>src; dtb goes in bin</td></tr>
      <tr><td>computeDec.php</td><td>Ajax server for btd</td><td>root</td></tr>
      <tr><td>computeBin.php</td><td>Ajax server for dtb</td><td>root</td></tr>
      <tr><td>analyzer.js</td><td>User interactions. Uses jQuery.</td><td>scripts</td></tr>
      <tr><td>numeric_value.js</td><td>Calculation code</td><td>scripts</td></tr>
    </table>
  </body>
</html>

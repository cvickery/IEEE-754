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
  </head>
  <body>
    <h1>IEEE-754 Analyzers Source Code</h1>
    <p>
      The source code for this project is available under an <a href='../MIT.txt'>MIT license</a>,
      which allows you to use the code pretty much any way you want to provided you maintain
      the license document with the code.
    </p>
    <p>
      This code makes use of the GNU Multiprecision Arithmetic Library, which is licensed
      separately under the terms of the <a href="https://www.gnu.org/copyleft/lesser.html">GNU
      LGPL</a>
    </p>
    <h2>Download</h2>
    <p>
      Link not available yet.
    </p>
  </body>
</html>
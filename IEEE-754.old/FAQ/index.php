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
    <title>IEEE-754 Analyzers FAQ</title>
    <link rel="icon" href="../../favicon.ico" />    
    <link rel="stylesheet" type="text/css" href="../css/faq.css" />
  </head>
  <body>
    <h1>IEEE-754 Analyzers FAQ</h1>
    <dt>
      Who wrote the code?
    </dt>
    <dd>
      The code was written in 2011 by Michael Lubow, an undergraduate Computer Science major at Queens
      College, under the supervision of Dr. Christopher Vickery. The previous calculators were first
      written by another Queens College student, Quanfei Wen, also under Dr. Vickery’s supervision, in
      1997. The code for those calculators was considerably reworked by Kevin Brewer, an engineer working
      for Delco Electronics at the time. 
    </dd>
    <dl>
      <dt>What happened to the old IEEE-754 “calculators” and reference material?</dt>
      <dd>
        They are <a href="../../IEEE-754.old">still available.</a>
        <p>
          But please note: the reference material contains many broken links. I suggest that you
          use your favorite search engine to locate background information on the IEEE-754 floating 
          point standard now, instead of the reference material from the old calculators.
        </p>
        <p>
          “Kevin’s Chart” 
          <a href="http://babbage.cs.qc.cuny.edu/IEEE-754.old/References.xhtml#tables"> is still 
          there</a>, but has not been updated to handle the 2008 version of the IEEE-754 standard.
        </p>
      </dd>
      <dt>
        What’s changed?
      </dt>
      <dd>
        The new version is a total rewrite of the “calculators” page, so what’s changed under the hood 
        is: “Everything!”
        <p>
          The new calculators use the <a href='http://http://gmplib.org/'></a>GNU Multiprecision 
          Arithmetic library to do the more time-consuming underlying calculations. The old calculators
          used JavaScript
          for all its calculations, with several painstakingly-developed constants to handle edge cases.
        </p>
        <p>
          Although the old calculators were very accurate, we think the new analyzers will be even
          more so. Indeed, we recently received a report of an error in the old calculators that the
          new code handles correctly.
        </p>
        <p>
          The analyzers also handle rounding modes much more clearly, and include support for the
          Binary128 (quad precision) data type intoduced in the 2008 revision of the standard 
          (IEEE-754-2008).
        </p>
        <p>
          The new code also supports more flexibility in entering values for analysis. In particular,
          being able to enter rational numbers means you can now explore the representation of repeating
          fractions.
        </p>
      </dd>
      <dt>
        The old calculators were written in JavaScript, so it was easy to get a copy of the source
        code. Now there’s some sort of Ajax business going on that involves server-side code. Is that
        code available?
      </dt>
      <dd>
        <p>
          Sure, the C code for the binary to decimal (<em>btd</em>) and decimal to binary (<em>dtb</em>)
          programs, a Makefile for building them, and the JavaScript source code are all in the
          <a href='../src'>src directory</a>. Note that if you want to replicate the analyzers you will
          need both the C code and the JavaScript code given here, plus your own copy of the GNU 
          Multiprecision Arithmetic library for your platform.
        </p>
      </dd>
      <dt>Great! What are the licensing terms for the source code?</dt>
      <dd>
        <p>
          The source code for this project is available under an <a href='../MIT.txt'>MIT license</a>,
          which allows you to use the code pretty much any way you want, provided you maintain
          the license document with the code.
        </p>
        <p>
          This code makes use of the GNU Multiprecision Arithmetic Library, which is licensed
          separately under the terms of the <a href="https://www.gnu.org/copyleft/lesser.html">GNU
          LGPL</a>
        </p>
      </dd>
      <dt>
        I don’t understand what the analyzers are doing.
      </dt>
      <dd>
        <p>
          You need to have a basic understanding of floating-point numbers in general, and the IEEE-754
          floating-point standard specifically, to make sense of these analyzers. Any textbook on computer
          architecture can help you learn the basics.
        </p>
      </dd>
      <dt>
        I have a suggestion for a change in the design of the web page.
      </dt>
      <dt>
        I have a suggestion for making the instructions clearer.
      </dt>
      <dt>
        I found an error.
      </dt>
      <dd>
        <p>
          For all of these:
          <a href='mailto:Christopher.Vickery@qc.cuny.edu?Subject=IEEE-754%20Analyzers'>Let me know!</a>
        </p>
      </dd>
    </dl>
    <div><a href="../">Back to the Analyzers</a></div>
  </body>
</html>

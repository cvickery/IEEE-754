/*    This script implements the arithmetic and UI functions of the IEEE-754 analyzers.  For
 *    accuracy, arithmetic is done on strings rather than on JavaScript numbers.
 */
$().ready(function()
{
  // Initialization
  //  ---------------------------------------------------------------------------------------------
  $('#need-js').hide(0);

  //  keyboard_shortcuts()
  //  ---------------------------------------------------------------------------------------------
  /*  These shortcuts work only for analyzer #1
   *
   */
  function keyboard_shortcuts(event)
  {
    switch (event.data)
    {
      case 'ctrl+a':  $('#force-auto').focus();
      break;
      case 'ctrl+d':  $('#force-decimal').focus();
      break;
      case 'ctrl+b':  $('#force-binary').focus();
      break;
      case 'ctrl+h':  $('#force-hexadecimal').focus();
      break;
      case 'ctrl+l':  $('#force-little-endian').focus();
      break;
      case 'ctrl+v':  $('#value-entered').focus();
      break;
      case 'ctrl+up':   $('#force-round-pos-infinity').focus();
      break;
      case 'ctrl+down': $('#force-round-neg-infinity').focus();
      break;
      case 'ctrl+0':  $('#force-round-zero').focus();
      break;
      case 'ctrl+n':  $('#force-round-nearest-value').focus();
      break;
      default: alert('Unrecognized keyboard input: ' + event.data);
    }
    event.preventDefault();
  }
  $('input').bind('keyup', 'ctrl+a',    keyboard_shortcuts);
  $('input').bind('keyup', 'ctrl+d',    keyboard_shortcuts);
  $('input').bind('keyup', 'ctrl+b',    keyboard_shortcuts);
  $('input').bind('keyup', 'ctrl+h',    keyboard_shortcuts);
  $('input').bind('keyup', 'ctrl+l',    keyboard_shortcuts);
  $('input').bind('keyup', 'ctrl+v',    keyboard_shortcuts);
  $('input').bind('keyup', 'ctrl+up',   keyboard_shortcuts);
  $('input').bind('keyup', 'ctrl+down', keyboard_shortcuts);
  $('input').bind('keyup', 'ctrl+0',    keyboard_shortcuts);
  $('input').bind('keyup', 'ctrl+n',    keyboard_shortcuts);

  $('body, #instructions').bind('keyup', function(event)
    {
      //  Application-wide shortcuts
      var keyCode = event.keyCode;
      if (keyCode === 27 || keyCode === 81 || keyCode === 89)
      {
        switch (event.keyCode)
        {
          //  Esc: toggle instructions
          case 27:
            //console.log('call instructionsHandler');
            instructionsHandler();
            break;
          //  q:  faQ
          case 81:
            window.location = 'https://christophervickery.com/IEEE-754/faq.html';
            break;
          //  y:  Add an analYzer
          case 89:
            //console.log('call clickHandler');
            clickHandler();
            break;
        }
      }
      else
      {
        var nextUp = null;
        var analyzer_num = '';
        //  Determine which analyzer has focus in order to dispatch properly
        if (typeof document.activeElement !== 'undefined')
        {
          //console.log('activeElement: ' + document.activeElement +
          //  ' is ' + ($.isArray(document.activeElement) ? '' : 'not ') + 'an array'
          //);
          nextUp = document.activeElement;
        }

//      Tried to get this to work on Chrome: no luck
//      else if (typeof $('*:focus') !== 'undefined')
//      {
//        nextUp = $('*:focus');
//      }

        if (nextUp)
        {
          // search up to find a div of class analyzer
          var watchdog = 0;
          while (nextUp.tagName !== 'body')
          {
            //console.log(watchdog + ': ' + nextUp);
            var classes = nextUp.getAttribute('class');
            if (classes && -1 !== classes.indexOf('analyzer'))
            {
              var id = nextUp.getAttribute('id');
              var matches = /block(\d*)/.exec(id);
              analyzer_num = matches[1];
              break;
            }
            if (++watchdog > 10)
              break;
            nextUp = nextUp.parentNode;
          }
          //console.log('analyzer' + analyzer_num);
        }
      }
    });
  $('input').bind('keyup', 'ctrl+y', clickHandler);
  $('input').bind('keyup', 'ctrl+q',
      function(){window.location = $('#faq')[0].getAttribute('href');});

  // Array of the current set of analyzers.
  var analyzers           = [];
  var num                 = 1;
  var instructionsVisible = false;

  //  Behaviors
  $('#add-an-analyzer').bind('click', clickHandler);
  $('#kill-all').bind('click', killAllHandler);
  $('#show-instructions').bind('click', instructionsHandler);
  $('#analyzers-container').on('click', '.kill-this-analyzer', closeHandler);
  $('#analyzers-container').on('change', '.input_format input', handleHexRadio);

  //  Generate Analyzer object for Analyzer #1
  analyzers.push(new Analyzer(document.getElementById('value-entered'),
      document.getElementById('force-auto'),
      document.getElementById('force-decimal'),
      document.getElementById('force-binary'),
      document.getElementById('force-hexadecimal'),
      document.getElementById('syntax_msg').firstChild,
      document.getElementById('decimal_value').firstChild,
      document.getElementById('binary_value').firstChild,
      document.getElementById('hex32_value').firstChild,
      document.getElementById('hex64_value').firstChild,
      document.getElementById('hex128_value').firstChild,
      document.getElementById('hex32_sef').firstChild,
      document.getElementById('hex64_sef').firstChild,
      document.getElementById('hex128_sef').firstChild,
      document.getElementById('hex32_sign_value').firstChild,
      document.getElementById('hex32_exponent_value').firstChild,
      document.getElementById('hex32_decimal_exponent_value').firstChild,
      document.getElementById('hex32_fraction_value').firstChild,
      document.getElementById('hex32_decimal_fraction_value').firstChild,
      document.getElementById('hex64_sign_value').firstChild,
      document.getElementById('hex64_exponent_value').firstChild,
      document.getElementById('hex64_decimal_exponent_value').firstChild,
      document.getElementById('hex64_fraction_value').firstChild,
      document.getElementById('hex64_decimal_fraction_value').firstChild,
      document.getElementById('hex128_sign_value').firstChild,
      document.getElementById('hex128_exponent_value').firstChild,
      document.getElementById('hex128_decimal_exponent_value').firstChild,
      document.getElementById('hex128_fraction_value').firstChild,
      document.getElementById('hex128_decimal_fraction_value').firstChild,
      document.getElementById('hex32_sign_symbol').firstChild,
      document.getElementById('hex64_sign_symbol').firstChild,
      document.getElementById('hex128_sign_symbol').firstChild,
      document.getElementById('force-round-nearest-value'),
      document.getElementById('force-round-zero'),
      document.getElementById('force-round-pos-infinity'),
      document.getElementById('force-round-neg-infinity'),
      document.getElementById('hex32_status').firstChild,
      document.getElementById('hex64_status').firstChild,
      document.getElementById('hex128_status').firstChild,
      document.getElementById('force-little-endian')
      )
    );

  function getElementsByClass(theClass)
  {
    var elementArray = [];
    if (typeof document.all != "undefined")
    {
      elementArray = document.all;
    }
    else
    {
      elementArray = document.getElementsByTagName("*");
    }
    var matchedArray = [];
    var pattern = new RegExp("(^| )" + theClass + "( |$)");
    for ( var i = 0; i < elementArray.length; i++)
    {
      if (pattern.test(elementArray[i].className))
      {
        matchedArray[matchedArray.length] = elementArray[i];
      }
    }
    return matchedArray;
  }

  // Analyzer()
  // -------------------------------------------------------------------------
  /*
   */
  function Analyzer(valueEntered, forceAuto, forceDecimal, forceBinary,
      forceHexadecimal, syntaxMessage, decimalValue, binaryValue, hex32Value,
      hex64Value, hex128Value, hex32sef, hex64sef, hex128sef, hex32SignValue,
      hex32ExponentValue, hex32DecimalExponentValue, hex32FractionValue,
      hex32DecimalFractionValue, hex64SignValue, hex64ExponentValue,
      hex64DecimalExponentValue, hex64FractionValue, hex64DecimalFractionValue,
      hex128SignValue, hex128ExponentValue, hex128DecimalExponentValue,
      hex128FractionValue, hex128DecimalFractionValue, hex32SignSymbol,
      hex64SignSymbol, hex128SignSymbol, forceNearestValue, forceZero,
      forcePosInfinity, forceNegInfinity, hex32Status, hex64Status,
      hex128Status, forceLittleEndian)
  {
    this.value_entered = valueEntered;
    this.force_auto = forceAuto;
    this.force_decimal = forceDecimal;
    this.force_binary = forceBinary;
    this.force_hexadecimal = forceHexadecimal;
    this.syntax_message = syntaxMessage;
    this.decimal_value = decimalValue;
    this.binary_value = binaryValue;
    this.hex32_value = hex32Value;
    this.hex64_value = hex64Value;
    this.hex128_value = hex128Value;
    this.hex32_sef = hex32sef;
    this.hex64_sef = hex64sef;
    this.hex128_sef = hex128sef;
    this.hex32_sign_value = hex32SignValue;
    this.hex32_exponent_value = hex32ExponentValue;
    this.hex32_decimal_exponent_value = hex32DecimalExponentValue;
    this.hex32_fraction_value = hex32FractionValue;
    this.hex32_decimal_fraction_value = hex32DecimalFractionValue;
    this.hex64_sign_value = hex64SignValue;
    this.hex64_exponent_value = hex64ExponentValue;
    this.hex64_decimal_exponent_value = hex64DecimalExponentValue;
    this.hex64_fraction_value = hex64FractionValue;
    this.hex64_decimal_fraction_value = hex64DecimalFractionValue;
    this.hex128_sign_value = hex128SignValue;
    this.hex128_exponent_value = hex128ExponentValue;
    this.hex128_decimal_exponent_value = hex128DecimalExponentValue;
    this.hex128_fraction_value = hex128FractionValue;
    this.hex128_decimal_fraction_value = hex128DecimalFractionValue;
    this.hex32_sign_symbol = hex32SignSymbol;
    this.hex64_sign_symbol = hex64SignSymbol;
    this.hex128_sign_symbol = hex128SignSymbol;
    this.force_round_nearest_value = forceNearestValue;
    this.force_round_zero = forceZero;
    this.force_round_pos_infinity = forcePosInfinity;
    this.force_round_neg_infinity = forceNegInfinity;
    this.hex32_status = hex32Status;
    this.hex64_status = hex64Status;
    this.hex128_status = hex128Status;
    this.force_little_endian = forceLittleEndian;
    this.value_entered.onchange = valueChangeHandler;
    this.force_auto.onclick = valueChangeHandler;
    this.force_decimal.onclick = valueChangeHandler;
    this.force_binary.onclick = valueChangeHandler;
    this.force_hexadecimal.onclick = valueChangeHandler;
    this.force_round_nearest_value.onclick = valueChangeHandler;
    this.force_round_zero.onclick = valueChangeHandler;
    this.force_round_pos_infinity.onclick = valueChangeHandler;
    this.force_round_neg_infinity.onclick = valueChangeHandler;
    this.force_little_endian.onclick = valueChangeHandler;
    this.value_entered.analyzer = this;
    this.force_auto.analyzer = this;
    this.force_decimal.analyzer = this;
    this.force_binary.analyzer = this;
    this.force_hexadecimal.analyzer = this;
    this.force_round_nearest_value.analyzer = this;
    this.force_round_zero.analyzer = this;
    this.force_round_pos_infinity.analyzer = this;
    this.force_round_neg_infinity.analyzer = this;
    this.force_little_endian.analyzer = this;

    this.value_entered.focus();
  }

  //  handleHexRadio()
  //  ------------------------------------------------------------------------
  /*
   *  The force-little-endian checkbox has to be enabled/disabled, depending
   *  on the state of the force-hexadecimal radio button.
   */
  function handleHexRadio()
  {
    // Get references to the force_hexadecimal radio button and to the
    // force_little_endian
    // checkbox.
    var fieldset = this.parentNode.parentNode;
    var force_hexadecimal = null;
    var force_little_endian = null;
    var le_label = null;
    var inputs = fieldset.getElementsByTagName('input');
    for ( var i = 0; i < inputs.length; i++)
    {
      if ('little-endian' === inputs[i].getAttribute('class'))
      {
        force_little_endian = inputs[i];
        if (force_hexadecimal)
          break;
      }
      if ('hexadecimal' === inputs[i].getAttribute('value'))
      {
        force_hexadecimal = inputs[i];
        if (force_little_endian)
          break;
      }
    }
    le_label = force_little_endian.nextSibling.nextSibling;
    if (this === force_little_endian)
    {
      force_little_endian.last_state = force_little_endian.checked;
    }
    else
    {
      if (force_little_endian.last_state === null)
      {
        force_little_endian.last_state = force_little_endian.checked;
      }
      if (force_hexadecimal.checked)
      {
        //  Hex input selected: restore previous endian choice.
        force_little_endian.disabled = null;
        force_little_endian.checked = force_little_endian.last_state;
        le_label.style.color = '#000';
      }
      else
      {
        //  Hex input not selected: deselect endian choice
        force_little_endian.checked = false;
        force_little_endian.disabled = 'disabled';
        le_label.style.color = '#999';
      }
    }
  }

  // valueChangeHandler()
  // -------------------------------------------------------------------------
  /*
   * Respond to changed input value in an analyzer. Figure out the input format;
   * parse the value; generate other values; analyze the floating-point values.
   * This handler is called when the value of the input text field changes value
   * or loses focus, or when one of the input format radio buttons changes
   * state. The this.analyzer object lets you get at the other elements from any
   * event source.
   *
   */
  function valueChangeHandler(evt)
  {
    var analyzer = this.analyzer;
    var analyzerDiv = analyzer.value_entered.parentNode.parentNode;
    if (analyzer.value_entered.value === '')
    {
      return;
    }
    $('.loading').addClass('computing').removeClass('idle');
    var isLonely = null;
    if (analyzerDiv.className == 'analyzer block lonely-block')
    {
      isLonely = true;
    }
    if (isLonely == true)
    {
      analyzerDiv.className = 'busy block lonely-block';
    }
    else
    {
      analyzerDiv.className = 'busy block';
    }
    setTimeout(doUpdate, 0);

    // doUpdate()
    // -------------------------------------------------------------------------
    /*
     */
    function doUpdate()
    {
      var roundMode = null;
      if (analyzer.force_round_nearest_value.checked)
      {
        roundMode = 'rnv';
      }
      if (analyzer.force_round_zero.checked)
      {
        roundMode = 'rz';
      }
      if (analyzer.force_round_pos_infinity.checked)
      {
        roundMode = 'rpi';
      }
      if (analyzer.force_round_neg_infinity.checked)
      {
        roundMode = 'rni';
      }
      var endianMode = 'bigEndian';
      if (analyzer.force_little_endian.checked)
      {
        endianMode = 'littleEndian';
      }
      var value = null;
      if (analyzer.force_auto.checked)
      {
        value = new Numeric_Value(analyzer.value_entered.value, undefined, roundMode);
      }
      if (analyzer.force_decimal.checked)
      {
        value = new Numeric_Value(analyzer.value_entered.value, 10, roundMode);
      }
      if (analyzer.force_binary.checked)
      {
        value = new Numeric_Value(analyzer.value_entered.value, 2, roundMode);
      }
      if (analyzer.force_hexadecimal.checked)
      {
        //  Perform input endian-reversal here if requested.
        var value_entered_copy = analyzer.value_entered.value;
        if (endianMode === 'littleEndian' && (value_entered_copy.length % 2 === 0))
        {
          //  Reverse byte order
          var reversed = [];
          var num_bytes = value_entered_copy.length / 2;
          for (var i = 0; i < num_bytes; i++)
          {
            reversed[i + i]     = value_entered_copy[num_bytes + num_bytes - (2 + i + i)];
            reversed[i + i + 1] = value_entered_copy[num_bytes + num_bytes - (2 + i + i) + 1];
          }
          value_entered_copy = reversed.join('');
        }
        value = new Numeric_Value(value_entered_copy, 16, roundMode);
        if (endianMode === 'littleEndian')
        {
          value.syntax += ' (little endian)';
        }
      }
      analyzer.syntax_message.nodeValue = value.syntax;
      if (value.isValid)
      {
        if (value.isInfinity)
        {
          if (value.isOutOfRange)
          {
            analyzer.decimal_value.nodeValue = "Out of Range";
            analyzer.binary_value.nodeValue = "Out of Range";
          }
          else
          {
            analyzer.decimal_value.nodeValue = value.toString(10);
            analyzer.binary_value.nodeValue = value.toString(2);
          }
          analyzer.hex32_value.nodeValue = value.toString('ihex32');
          analyzer.hex64_value.nodeValue = value.toString('ihex64');
          analyzer.hex128_value.nodeValue = value.toString('ihex128');
          analyzer.hex32_sign_value.nodeValue = value.toString('ihex32s');
          analyzer.hex32_exponent_value.nodeValue = value.toString('ihex32e');
          analyzer.hex32_fraction_value.nodeValue = value.toString('ihex32f');
          analyzer.hex32_decimal_exponent_value.nodeValue = value
              .toString('ihex32de');
          analyzer.hex32_decimal_fraction_value.nodeValue = value
              .toString('ihex32df');
          analyzer.hex64_sign_value.nodeValue = value.toString('ihex64s');
          analyzer.hex64_exponent_value.nodeValue = value.toString('ihex64e');
          analyzer.hex64_fraction_value.nodeValue = value.toString('ihex64f');
          analyzer.hex64_decimal_exponent_value.nodeValue = value
              .toString('ihex64de');
          analyzer.hex64_decimal_fraction_value.nodeValue = value
              .toString('ihex64df');
          analyzer.hex128_sign_value.nodeValue = value.toString('ihex128s');
          analyzer.hex128_exponent_value.nodeValue = value.toString('ihex128e');
          analyzer.hex128_fraction_value.nodeValue = value.toString('ihex128f');
          analyzer.hex128_decimal_exponent_value.nodeValue = value
              .toString('ihex128de');
          analyzer.hex128_decimal_fraction_value.nodeValue = value
              .toString('ihex128df');
          analyzer.hex32_sign_symbol.nodeValue = value.toString('isv');
          analyzer.hex64_sign_symbol.nodeValue = value.toString('isv');
          analyzer.hex128_sign_symbol.nodeValue = value.toString('isv');
          analyzer.hex32_status.nodeValue = value.toString('i32Status');
          analyzer.hex64_status.nodeValue = value.toString('i64Status');
          analyzer.hex128_status.nodeValue = value.toString('i128Status');
        }
        else if (analyzer.value_entered.value.toLowerCase() === 'nan'
            || analyzer.value_entered.value.toLowerCase() === 'qnan'
            || analyzer.value_entered.value.toLowerCase() === 'snan')
        {
          var n = analyzer.value_entered.value.toLowerCase();
          if (n === 'qnan' || n === 'nan')
          {
            n = 'qNaN';
          }
          else if (n === 'snan')
          {
            n = 'sNaN';
          }
          analyzer.decimal_value.nodeValue = n;
          analyzer.binary_value.nodeValue = n;
          analyzer.hex32_value.nodeValue = n;
          analyzer.hex64_value.nodeValue = n;
          analyzer.hex128_value.nodeValue = n;
          analyzer.hex32_status.nodeValue = n;
          analyzer.hex32_sign_value.nodeValue = 'x';
          analyzer.hex32_exponent_value.nodeValue = '11111111';
          if (n == 'qNaN')
          {
            analyzer.hex32_fraction_value.nodeValue = '1xxxxxxxxxxxxxxxxxxxxxx';
          }
          else
          {
            analyzer.hex32_fraction_value.nodeValue = '01xxxxxxxxxxxxxxxxxxxxx';
          }
          analyzer.hex32_decimal_exponent_value.nodeValue = '+128';
          analyzer.hex32_decimal_fraction_value.nodeValue = n;
          analyzer.hex64_status.nodeValue = n;
          analyzer.hex64_sign_value.nodeValue = 'x';
          analyzer.hex64_exponent_value.nodeValue = '11111111111';
          if (n == 'qNaN')
          {
            analyzer.hex64_fraction_value.nodeValue = '1xxxxxxxxxxxxxxxxxxxxxxxxx' +
                                                      'xxxxxxxxxxxxxxxxxxxxxxxxxx';
          }
          else
          {
            analyzer.hex64_fraction_value.nodeValue = '01xxxxxxxxxxxxxxxxxxxxxxxx' +
                                                      'xxxxxxxxxxxxxxxxxxxxxxxxxx';
          }
          analyzer.hex64_decimal_exponent_value.nodeValue = '+1024';
          analyzer.hex64_decimal_fraction_value.nodeValue = n;
          analyzer.hex128_status.nodeValue = n;
          analyzer.hex128_sign_value.nodeValue = 'x';
          analyzer.hex128_exponent_value.nodeValue = '111111111111111';
          if (n == 'qNaN')
          {
            analyzer.hex128_fraction_value.nodeValue = '1xxxxxxxxxxxxxxxxxxxxxxxxxxx' +
                                                       'xxxxxxxxxxxxxxxxxxxxxxxxxxxx' +
                                                       'xxxxxxxxxxxxxxxxxxxxxxxxxxxx' +
                                                       'xxxxxxxxxxxxxxxxxxxxxxxxxxxx';
          }
          else
          {
            analyzer.hex128_fraction_value.nodeValue = '01xxxxxxxxxxxxxxxxxxxxxxxxxx' +
                                                       'xxxxxxxxxxxxxxxxxxxxxxxxxxxx' +
                                                       'xxxxxxxxxxxxxxxxxxxxxxxxxxxx' +
                                                       'xxxxxxxxxxxxxxxxxxxxxxxxxxxx';
          }
          analyzer.hex128_decimal_exponent_value.nodeValue = '+16384';
          analyzer.hex128_decimal_fraction_value.nodeValue = n;
          analyzer.hex32_sign_symbol.nodeValue = '+/-';
          analyzer.hex64_sign_symbol.nodeValue = '+/-';
          analyzer.hex128_sign_symbol.nodeValue = '+/-';
        }
        else
        {
          if (value.isOutOfRange)
          {
            analyzer.decimal_value.nodeValue = "Out of Range";
            analyzer.binary_value.nodeValue = "Out of Range";
            if (value.isSmallExtreme || value.isBigExtreme)
            {
              analyzer.hex32_value.nodeValue = "Out of Range";
              analyzer.hex64_value.nodeValue = "Out of Range";
              analyzer.hex128_value.nodeValue = "Out of Range";
              analyzer.hex32_status.nodeValue = "Out of Range";
              analyzer.hex32_sign_value.nodeValue = "Out of Range";
              analyzer.hex32_exponent_value.nodeValue = "Out of Range";
              analyzer.hex32_fraction_value.nodeValue = "Out of Range";
              analyzer.hex32_decimal_exponent_value.nodeValue = "Out of Range";
              analyzer.hex32_decimal_fraction_value.nodeValue = "Out of Range";
              analyzer.hex64_status.nodeValue = "Out of Range";
              analyzer.hex64_sign_value.nodeValue = "Out of Range";
              analyzer.hex64_exponent_value.nodeValue = "Out of Range";
              analyzer.hex64_fraction_value.nodeValue = "Out of Range";
              analyzer.hex64_decimal_exponent_value.nodeValue = "Out of Range";
              analyzer.hex64_decimal_fraction_value.nodeValue = "Out of Range";
              analyzer.hex128_status.nodeValue = "Out of Range";
              analyzer.hex128_sign_value.nodeValue = "Out of Range";
              analyzer.hex128_exponent_value.nodeValue = "Out of Range";
              analyzer.hex128_fraction_value.nodeValue = "Out of Range";
              analyzer.hex128_decimal_exponent_value.nodeValue = "Out of Range";
              analyzer.hex128_decimal_fraction_value.nodeValue = "Out of Range";
              analyzer.hex32_sign_symbol.nodeValue = "Out of Range";
              analyzer.hex64_sign_symbol.nodeValue = "Out of Range";
              analyzer.hex128_sign_symbol.nodeValue = "Out of Range";
            }
          }
          else
          {
            analyzer.decimal_value.nodeValue = value.toString(10);
            analyzer.binary_value.nodeValue = value.toString(2);
            analyzer.hex32_value.nodeValue = value.toString(32);
            analyzer.hex64_value.nodeValue = value.toString(64);
            analyzer.hex128_value.nodeValue = value.toString(128);
            analyzer.hex32_sign_value.nodeValue = value.toString('32s');
            analyzer.hex32_exponent_value.nodeValue = value.toString('32e');
            analyzer.hex32_fraction_value.nodeValue = value.toString('32f');
            analyzer.hex32_decimal_exponent_value.nodeValue = value.toString('32de');
            analyzer.hex32_decimal_fraction_value.nodeValue = value.toString('32df');
            analyzer.hex64_sign_value.nodeValue = value.toString('64s');
            analyzer.hex64_exponent_value.nodeValue = value.toString('64e');
            analyzer.hex64_fraction_value.nodeValue = value.toString('64f');
            analyzer.hex64_decimal_exponent_value.nodeValue = value.toString('64de');
            analyzer.hex64_decimal_fraction_value.nodeValue = value.toString('64df');
            analyzer.hex128_sign_value.nodeValue = value.toString('128s');
            analyzer.hex128_exponent_value.nodeValue = value.toString('128e');
            analyzer.hex128_fraction_value.nodeValue = value.toString('128f');
            analyzer.hex128_decimal_exponent_value.nodeValue = value.toString('128de');
            analyzer.hex128_decimal_fraction_value.nodeValue = value.toString('128df');
            analyzer.hex32_sign_symbol.nodeValue = value.toString('sv');
            analyzer.hex64_sign_symbol.nodeValue = value.toString('sv');
            analyzer.hex128_sign_symbol.nodeValue = value.toString('sv');
            analyzer.hex32_status.nodeValue = value.toString('32status');
            analyzer.hex64_status.nodeValue = value.toString('64status');
            analyzer.hex128_status.nodeValue = value.toString('128status');
          }
        }
      }
      else
      {
        analyzer.decimal_value.nodeValue = '--';
        analyzer.binary_value.nodeValue = '--';
        analyzer.hex32_value.nodeValue = '--';
        analyzer.hex64_value.nodeValue = '--';
        analyzer.hex128_value.nodeValue = '--';
        analyzer.hex32_sign_value.nodeValue = '--';
        analyzer.hex32_exponent_value.nodeValue = '--';
        analyzer.hex32_fraction_value.nodeValue = '--';
        analyzer.hex32_decimal_exponent_value.nodeValue = '--';
        analyzer.hex32_decimal_fraction_value.nodeValue = '--';
        analyzer.hex64_sign_value.nodeValue = '--';
        analyzer.hex64_exponent_value.nodeValue = '--';
        analyzer.hex64_fraction_value.nodeValue = '--';
        analyzer.hex64_decimal_exponent_value.nodeValue = '--';
        analyzer.hex64_decimal_fraction_value.nodeValue = '--';
        analyzer.hex128_sign_value.nodeValue = '--';
        analyzer.hex128_exponent_value.nodeValue = '--';
        analyzer.hex128_fraction_value.nodeValue = '--';
        analyzer.hex128_decimal_exponent_value.nodeValue = '--';
        analyzer.hex128_decimal_fraction_value.nodeValue = '--';
        analyzer.hex32_sign_symbol.nodeValue = '--';
        analyzer.hex64_sign_symbol.nodeValue = '--';
        analyzer.hex128_sign_symbol.nodeValue = '--';
        analyzer.hex32_status.nodeValue = '--';
        analyzer.hex64_status.nodeValue = '--';
        analyzer.hex128_status.nodeValue = '--';
      }
      if (isLonely == true)
      {
        analyzerDiv.className = 'analyzer block lonely-block';
      }
      else
      {
        analyzerDiv.className = 'analyzer block';
      }
      $('.loading').removeClass('computing').addClass('idle');
    }
  }
  // clickHandler()
  // -------------------------------------------------------------------------
  /*
   * Creates a new analyzer
   *
   */
  function clickHandler(evt)
  {
    if (instructionsVisible)
    {
      instructionsHandler();
    }
    num++;
    var a = document.createElement('div');
    a.setAttribute('class', 'analyzer block');
    a.setAttribute('id', 'block' + num);
    document.getElementById('analyzers-container').appendChild(a);
    $("#block" + num)
        .html(
            "<div class='identifier'><p>Analyzer "
                + num
                + "</p></div>"
                + "<img class='idle loading' id='loading"
                + num
                + "' title='progress' src='./images/ajax-loader.gif' alt=''/>"
                + "<fieldset class='input_format'>"
                + "  <legend><span class='analyzerlabel'>Input Format</span></legend>"
                + "  <div>"
                + "  <input type='radio' name='input-format"
                + num
                + "' value='auto' id='force-auto"
                + num
                + "' checked='checked' />"
                + "<label for='force-auto"
                + num
                + "'>auto</label>"
                + "</div>"
                + "<div>"
                + " <input type='radio' name='input-format"
                + num
                + "' value='decimal' id='force-decimal"
                + num
                + "' />"
                + "<label for='force-decimal"
                + num
                + "'>decimal</label>"
                + "</div>"
                + "<div>"
                + "<input type='radio' name='input-format"
                + num
                + "' value='binary' id='force-binary"
                + num
                + "' />"
                + "<label for='force-binary"
                + num
                + "'>binary</label>"
                + "</div>"
                + "<div>"
                + "<input type='radio' name='input-format"
                + num
                + "' value='hexadecimal' id='force-hexadecimal"
                + num
                + "' />"
                + "<label for='force-hexadecimal"
                + num
                + "'>hexadecimal</label>"
                + "</div>"
                + "<div class='input-option'> "
                + "  <input type='checkbox' name='little-endian' id='force-little-endian"
                + num
                + "'"
                + "  class='little-endian' disabled='disabled' /> "
                + "  <label for='force-little-endian" +
                + num
                + "'>Hexadecimal is little-endian "
                + "  (right-to-left)</label>"
                + "</div> "
                + "</fieldset>"
                + "<fieldset class='rounding_format'><legend>"
                + "<span class='analyzerlabel'>Rounding Mode</span></legend>"
                + "<div>"
                + "<input type='radio' name='rounding-format"
                + num
                + "' value='round-nearest-value' id='force-round-nearest-value"
                + num
                + "' checked='checked'  />"
                + "<label for='force-round-nearest-value"
                + num
                + "'>Round to the Nearest Value </label>           "
                + "</div>"
                + "<div>"
                + "<input type='radio' name='rounding-format"
                + num
                + "' value='round-zero' id='force-round-zero"
                + num
                + "' />"
                + "<label for='force-round-zero"
                + num
                + "'>Round toward Zero </label>          "
                + "</div>"
                + "<div>"
                + "<input type='radio' name='rounding-format"
                + num
                + "' value='round-pos-infinity' id='force-round-pos-infinity"
                + num
                + "' />"
                + "<label for='force-round-pos-infinity"
                + num
                + "'>Round toward Positive Infinity </label>            "
                + "</div>"
                + "<div>"
                + "<input type='radio' name='rounding-format"
                + num
                + "' value='round-neg-infinity' id='force-round-neg-infinity"
                + num
                + "' />"
                + "<label for='force-round-neg-infinity"
                + num
                + "'>Round toward Negative Infinity </label>"
                + "</div>"
                + "</fieldset>"
                + "<fieldset class='value_enter'>    "
                + "<legend><span class='analyzerlabel'>Value to analyze:</span></legend>"
                + "<input type='text' id='value-entered"
                + num
                + "' class='value-entered' />  "
                + "<p><span class='analyzerlabel'>Syntax Entered:</span> <span id='syntax_msg"
                + num
                + "'>none</span></p>"
                + "</fieldset>"
                + "<div id='result"
                + num
                + "' class='result'>   "
                + "<div class='dec_and_bin_results'>"
                + "<p><span class='analyzerlabel'>Decimal value:</span> <span id='decimal_value"
                + num
                + "'>0</span></p>"
                + "<p><span class='analyzerlabel'>Normalized binary value:</span>"
                + " <span id='binary_value"
                + num
                + "'>0</span></p>"
                + "</div>"
                + "<div class = 'hex32'>"
                + "<p><span class='analyzerlabel'>Binary32:</span> <span id='hex32_value"
                + num
                + "' class='hex32Value' >--</span></p> "
                + "<div id='hex32_sef"
                + num
                + "' class='hex32sef'>"
                + "<table>"
                + "<tr id='hex32_sef_labels"
                + num
                + "' class='hex32_sef_labels'>"
                + "<th><span class='analyzerlabel'>Status</span></th>"
                + "<th><span class='analyzerlabel'>Sign [1]</span></th>"
                + "<th><span class='analyzerlabel'>Exponent [8]</span></th>"
                + "<th><span class='analyzerlabel'>Significand [23]</span></th>"
                + "</tr>"
                + "<tr id='hex32_sef_results"
                + num
                + "' class='hex32_sef_results'>"
                + "<td><span id='hex32_status"
                + num
                + "'>---</span></td>"
                + "<td><span id='hex32_sign_value"
                + num
                + "'>-</span> (<span id='hex32_sign_symbol"
                + num
                + "'>-</span>)</td>"
                + "<td><span id='hex32_exponent_value"
                + num
                + "'>--</span> (<span id='hex32_decimal_exponent_value"
                + num
                + "'>--</span>)</td>"
                + "<td><span id='hex32_fraction_value"
                + num
                + "'>--</span> (<span id='hex32_decimal_fraction_value"
                + num
                + "'>--</span>)</td>"
                + "</tr>"
                + "</table>"
                + "</div>"
                + "</div>"
                + "<div class = 'hex64'>"
                + "<p><span class='analyzerlabel'>Binary64:</span> <span id='hex64_value"
                + num
                + "' class='hex64Value'>--</span></p> "
                + "<div id='hex64_sef"
                + num
                + "' class='hex64sef'>"
                + "<table>"
                + "<tr id='hex64_sef_labels"
                + num
                + "' class='hex64_sef_labels'>"
                + "<th><span class='analyzerlabel'>Status</span></th>"
                + "<th><span class='analyzerlabel'>Sign [1]</span></th>"
                + "<th><span class='analyzerlabel'>Exponent [11]</span></th>"
                + "<th><span class='analyzerlabel'>Significand [52]</span></th>"
                + "</tr>"
                + "<tr id='hex64_sef_results"
                + num
                + "' class='hex64_sef_results'>"
                + "<td><span id='hex64_status"
                + num
                + "'>---</span></td>"
                + "<td><span id='hex64_sign_value"
                + num
                + "'>-</span> (<span id='hex64_sign_symbol"
                + num
                + "'>-</span>)</td>"
                + "<td><span id='hex64_exponent_value"
                + num
                + "'>--</span> (<span id='hex64_decimal_exponent_value"
                + num
                + "'>--</span>)</td>"
                + "<td><span id='hex64_fraction_value"
                + num
                + "'>--</span> (<span id='hex64_decimal_fraction_value"
                + num
                + "'>--</span>)</td>"
                + "</tr>"
                + "</table>"
                + "</div> "
                + "</div> "
                + "<div class = 'hex128'>"
                + "<p><span class='analyzerlabel'>Binary128:</span> <span id='hex128_value"
                + num
                + "' class='hex128Value'>--</span></p> "
                + "<div id='hex128_sef"
                + num
                + "' class='hex128sef'>"
                + "<table>"
                + "<tr id='hex128_sef_labels"
                + num
                + "' class='hex128_sef_labels'>"
                + "<th><span class='analyzerlabel'>Status</span></th>"
                + "<th><span class='analyzerlabel'>Sign [1]</span></th>"
                + "<th><span class='analyzerlabel'>Exponent [15]</span></th>"
                + "<th><span class='analyzerlabel'>Significand [112]</span></th>"
                + "</tr>" + "<tr id='hex128_sef_results" + num
                + "' class='hex128_sef_results'>"
                + "<td><span id='hex128_status" + num + "'>---</span></td>"
                + "<td><span id='hex128_sign_value" + num
                + "'>-</span> (<span id='hex128_sign_symbol" + num
                + "'>-</span>)</td>" + "<td><span id='hex128_exponent_value"
                + num + "'>--</span> (<span id='hex128_decimal_exponent_value"
                + num + "'>--</span>)</td>"
                + "<td><span id='hex128_fraction_value" + num
                + "'>--</span> (<span id='hex128_decimal_fraction_value" + num
                + "'>--</span>)</td>" + "</tr>" + "</table>" + "</div>"
                + "</div>" + "</div> " + "<button id='kill-this-analyzer" + num
                + "' class='kill-this-analyzer' >Close This Analyzer</button>");
    var newAnalyzer = new Analyzer(
            document.getElementById('value-entered' + num),
            document.getElementById('force-auto' + num),
            document.getElementById('force-decimal' + num),
            document.getElementById('force-binary' + num),
            document.getElementById('force-hexadecimal' + num),
            document.getElementById('syntax_msg' + num).firstChild,
            document.getElementById('decimal_value' + num).firstChild,
            document.getElementById('binary_value' + num).firstChild,
            document.getElementById('hex32_value' + num).firstChild,
            document.getElementById('hex64_value' + num).firstChild,
            document.getElementById('hex128_value' + num).firstChild,
            document.getElementById('hex32_sef' + num).firstChild,
            document.getElementById('hex64_sef' + num).firstChild,
            document.getElementById('hex128_sef' + num).firstChild,
            document.getElementById('hex32_sign_value' + num).firstChild,
            document.getElementById('hex32_exponent_value' + num).firstChild,
            document.getElementById('hex32_decimal_exponent_value' + num).firstChild,
            document.getElementById('hex32_fraction_value' + num).firstChild,
            document.getElementById('hex32_decimal_fraction_value' + num).firstChild,
            document.getElementById('hex64_sign_value' + num).firstChild,
            document.getElementById('hex64_exponent_value' + num).firstChild,
            document.getElementById('hex64_decimal_exponent_value' + num).firstChild,
            document.getElementById('hex64_fraction_value' + num).firstChild,
            document.getElementById('hex64_decimal_fraction_value' + num).firstChild,
            document.getElementById('hex128_sign_value' + num).firstChild,
            document.getElementById('hex128_exponent_value' + num).firstChild,
            document.getElementById('hex128_decimal_exponent_value' + num).firstChild,
            document.getElementById('hex128_fraction_value' + num).firstChild,
            document.getElementById('hex128_decimal_fraction_value' + num).firstChild,
            document.getElementById('hex32_sign_symbol' + num).firstChild,
            document.getElementById('hex64_sign_symbol' + num).firstChild,
            document.getElementById('hex128_sign_symbol' + num).firstChild,
            document.getElementById('force-round-nearest-value' + num),
            document.getElementById('force-round-zero' + num),
            document.getElementById('force-round-pos-infinity' + num),
            document.getElementById('force-round-neg-infinity' + num),
            document.getElementById('hex32_status' + num).firstChild,
            document.getElementById('hex64_status' + num).firstChild,
            document.getElementById('hex128_status' + num).firstChild,
            document.getElementById('force-little-endian' + num)
            );

    analyzers.push(newAnalyzer);

    var initialBlock = getElementsByClass('lonely-block');
    if (initialBlock[0] !== undefined)
    {
      initialBlock[0].setAttribute('class', 'analyzer block');
    }
    var y = 0;
    for ( var i = 0; i < analyzers.length; i++)
    {
      if (analyzers[i] !== null)
      {
        y++;
      }
    }
    if (y == 1)
    {
      var AnalyzerNumber = analyzers.length;
      document.getElementById('block' + AnalyzerNumber).setAttribute('class',
          'analyzer block lonely-block');
    }
  }
  // closeHandler()
  // -------------------------------------------------------------------------
  /*
   * Closes an analyzer
   *  The analyzers array never shrinks: entries just get zapped. That way
   *  each one keeps its unique id.
   */
  function closeHandler(evt)
  {
    evt = evt ? evt : window.event;
    if (this.parentNode)
    {
      var AnalyzerNum = this.parentNode.id;
      var identifierNum = null;
      if (AnalyzerNum == 'block')
      {
        identifierNum = document.getElementById(AnalyzerNum).childNodes[1];
      }
      else
      {
        identifierNum = document.getElementById(AnalyzerNum).childNodes[0];
      }
      var AnalyzerName = identifierNum.textContent;
      var counter = 0;
      while (counter < AnalyzerName.length)
      {
        if (AnalyzerName[counter] == ' ')
        {
          break;
        }
        counter++;
      }
      //  Zap the analyzer being killed
      var Anum = AnalyzerName.substring(counter);
      analyzers[Anum - 1] = null;
      this.parentNode.setAttribute('class', 'killedAnalyzer');
      this.parentNode.innerHTML = '';
      //  Figure out how many are left: 0, 1, multiple
      var c = 0;      // number of zapped analyzers
      var found = ''; // index of last non-zapped analyzer
      for ( var i = 0; i < analyzers.length; i++)
      {
        if (analyzers[i] == null)
        {
          c++;
        }
        else
        {
          found = i + 1;
        }
      }
      //  If only one analyzer remaining, make it lonely
      if (c == analyzers.length - 1)
      {
        if (found == 1)
        {
          document.getElementById('block').setAttribute('class',
              'analyzer block lonely-block');
        }
        else
        {
          document.getElementById('block' + found).setAttribute('class',
              'analyzer block lonely-block');
        }
      }
      //  give focus to last analyzer found
      if (found) analyzers[found - 1].value_entered.focus();
    }
  }
  // killAllHandler()
  // -------------------------------------------------------------------------
  /*
   * Closes all the Analyzers
   */
  function killAllHandler()
  {
    for ( var i = 0; i < analyzers.length; i++)
    {
      analyzers[i] = null;
    }
    var destroy = getElementsByClass("analyzer");
    for ( var i = 0; i < destroy.length; i++)
    {
      destroy[i].setAttribute('class', 'killedAnalyzer');
      destroy[i].innerHTML = '';
    }
  }
  // instructionsHandler()
  // -------------------------------------------------------------------------
  /*
   * Toggles the instructions on/off
   */
  function instructionsHandler()
  {
    instructionsVisible = ! instructionsVisible;
    if (instructionsVisible)
    {
      document.getElementById('instructions').setAttribute('class',
          'yes-instructions');
      document.getElementById('show-instructions').innerHTML = 'Hide Instructions';
    }
    else
    {
      document.getElementById('instructions').setAttribute('class',
          'no-instructions');
      document.getElementById('show-instructions').innerHTML = 'Show Instructions';
    }
  }
});


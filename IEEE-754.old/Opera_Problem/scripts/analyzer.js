// $Id: analyzer.js,v 1.1 2010/03/31 22:40:01 vickery Exp vickery $
/*    This script implements the arithmetic and UI functions of the IEEE-754
 *    analyzers.  To be fully accurate, arithmetic is done on strings rather
 *    than on JavaScript numbers.
 *
 *    $Log: analyzer.js,v $
 *    Revision 1.1  2010/03/31 22:40:01  vickery
 *    Initial revision
 *
 *    Revision 1.1  2010/03/27 05:01:40  vickery
 *    Initial revision
 *
 */
window.onload = function()
{
  function Analyzer(valueEntered, forceAuto, forceDecimal, forceBinary, forceHexadecimal,
                    syntaxMessage, decimalValue, binaryValue)
  {
    this.value_entered              = valueEntered;
    this.force_auto                 = forceAuto;
    this.force_decimal              = forceDecimal;
    this.force_binary               = forceBinary;
    this.force_hexadecimal          = forceHexadecimal;
    this.syntax_message             = syntaxMessage;
    this.decimal_value              = decimalValue;
    this.binary_value               = binaryValue;
    this.value_entered.onchange     = valueChangeHandler;
    this.value_entered.onblur       = valueChangeHandler;
    this.force_auto.onclick         = valueChangeHandler;
    this.force_decimal.onclick      = valueChangeHandler;
    this.force_binary.onclick       = valueChangeHandler;
    this.force_hexadecimal.onclick  = valueChangeHandler;
    this.value_entered.analyzer     = this;
    this.force_auto.analyzer        = this;
    this.force_decimal.analyzer     = this;
    this.force_binary.analyzer      = this;
    this.force_hexadecimal.analyzer = this;
    this.value_entered.parentNode.style.border = '1px solid green';
  }

  //  valueChangeHandler()
  //  -------------------------------------------------------------------------
  /*  Respond to changed input value in an analyzer. Figure out the input
   *  format, parse the value, generate other values, analyze the floating-
   *  point values.
   *  This handler is called when the value of the input text field changes
   *  value or loses focus, or when one of the input format radio buttons
   *  changes state. The this.analyzer object lets you get at the other
   *  elements from any event source.
   *
   *  Hack of the day: This code can take a l-o-n-g time to run, so there is
   *  a need to give users visual feedback when it is busy. But changing the
   *  class of the div had no effect without a delay between setting the class
   *  and starting the calculations. 0 msec seems to work.
   */
  function valueChangeHandler(evt)
  {
    evt = evt ? evt : event;
    var analyzer    = this.analyzer;
    var analyzerDiv = analyzer.value_entered.parentNode;

    if (analyzer.value_entered.value === '') return;
    analyzerDiv.className = 'busy';
    setTimeout(doUpdate, 0);

    function doUpdate()
    {
      var value = null;
      if (analyzer.force_auto.checked)         value = new Numeric_Value(analyzer.value_entered.value);
      if (analyzer.force_decimal.checked)      value = new Numeric_Value(analyzer.value_entered.value, 10);
      if (analyzer.force_binary.checked)       value = new Numeric_Value(analyzer.value_entered.value, 2);
      if (analyzer.force_hexadecimal.checked)  value = new Numeric_Value(analyzer.value_entered.value, 16);
      analyzer.syntax_message.nodeValue = value.syntax;
      if (value.isValid)
      {
        analyzer.decimal_value.nodeValue = value.toString(10);
value.setBinaryDisplayDigits(22);
        analyzer.binary_value.nodeValue  = value.toString(2);
console.log(objToString(value));
      }
      else
      {
        analyzer.decimal_value.nodeValue = 'Not a valid number';
        analyzer.binary_value.nodeValue  = '--';
      }
      analyzerDiv.className = '';
    }
  }

  //  Array of the current set of analyzers.
  var analyzers = [ ];

  //  Initialization
  document.getElementById('need-js').style.display = 'none';
  analyzers.push ( new Analyzer(  document.getElementById('value-entered'),
                                  document.getElementById('force-auto'),
                                  document.getElementById('force-decimal'),
                                  document.getElementById('force-binary'),
                                  document.getElementById('force-hexadecimal'),
                                  document.getElementById('syntax_msg').firstChild,
                                  document.getElementById('decimal_value').firstChild,
                                  document.getElementById('binary_value').firstChild ));
};


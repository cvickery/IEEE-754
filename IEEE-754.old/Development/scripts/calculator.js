// $Id: calculator.js,v 1.1 2010/03/27 05:01:40 vickery Exp vickery $
/*    This script implements the arithmetic and UI functions of the IEEE-754 calculators.
 *    To be as accurate as possible, arithmetic is done on decimal strings rather than on
 *    JavaScript numbers.
 *
 *    $Log: calculator.js,v $
 *    Revision 1.1  2010/03/27 05:01:40  vickery
 *    Initial revision
 *
 */
window.onload = function()
{
  var Dec = new Decimal();
  function Calculator(decimal, single, double, decimal_value, binary_value)
  {
    this.decimal 				= decimal;
    this.single 				= single;
    this.double 				= double;
    this.decimal_value 	= decimal_value;
		this.binary_value 	= binary_value;
    decimal.calculator 	= single.calculator = double.calculator = this;
    decimal.onchange 		= decimalChangeHandler;
  }

  //  decimalChangeHandler()
  //  -------------------------------------------------------------------------
  /*  Respond to changed values in the decimal field of a calculator
   *    Parse and convert into normal form: i.fEe
   *    Display normal form in decimal_value
   *    Convert to single and double precision; update their values
   */
  function decimalChangeHandler(evt)
  {
    evt = evt ? evt : event;
		var value = Dec.parse(this.value);
    this.calculator.decimal_value.nodeValue = value;
		this.calculator.binary_value.nodeValue = value.toBinary();
		
  }

  //  Array of the current set of calculators.
  var calculators = [ ];

  //  Initialization
  document.getElementById('need-js').style.display = 'none';
  calculators.push
  (
    new Calculator( document.getElementById('decimal'),
                    document.getElementById('single'),
                    document.getElementById('double'),
                    document.getElementById('decimal-value').firstChild,
										document.getElementById('binary-value').firstChild )

  );
};

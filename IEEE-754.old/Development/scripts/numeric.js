// $Id: numeric.js,v 1.1 2010/03/31 22:41:22 vickery Exp vickery $
/*  Utiities for manipulating numeric strings.
 *  Routines for working with decimal (integer, real, rational), and hexadecimal
 *  (IEEE-754 single and double precision) strings.
 *
 *  File name changed from decimal to numeric during project development. Hence
 *  two "initial revisions" below.
 *
 *  $Log: numeric.js,v $
 *  Revision 1.1  2010/03/31 22:41:22  vickery
 *  Initial revision
 *
 *  Revision 1.1  2010/03/27 05:00:14  vickery
 *  Initial revision
 *
 *    1 -1/2 = 1 1/-2 <> -1 1/2: usually mixed numbers don't have negative
 *    fraction parts, but they are allowed here.
 *
 *  IEEE-754-2008 Binary Formats:
 *          binary32    binary64    binary128
 *   Sign      1           1            1
 *   Exp       8          11           15
 *   #frac    23          52          112
 *   Emax    +127       +1023       +16383
 *
 *  binary32:
 *   S 00000000 000000000000000000000000 ±0
 *   S 00000000 nnnnnnnnnnnnnnnnnnnnnnnn subnormal; no hidden 1
 *   x 11111111 0nnnnnnnnnnnnnnnnnnnnnnn sNaN
 *   x 11111111 1nnnnnnnnnnnnnnnnnnnnnnn qNaN
 *   S 11111111 000000000000000000000000 ±∞
 *   S 00000001 xxxxxxxxxxxxxxxxxxxxxxxx Emin (-126)
 *   S 11111110 xxxxxxxxxxxxxxxxxxxxxxxx Emax (+127)
 *
 *   S: 0 => +; 1 => -
 *   x: don't care
 *   n: must not be all zero
 *
 */

//  Development Support
//  ===========================================================================
var DEBUG = false;
if (typeof opera !== 'undefined')
{
  window.console = {};
  window.console.log = opera.postError;
}

  //  objToString()
  //  -------------------------------------------------------------------------
  /*  Debugging utility for displaying the properties of an object.
   */
  function objToString(obj)
  {
    var returnValue = '{';
    for (prop in obj)
    {
      if (typeof obj[prop] !== 'function') returnValue += prop + ':' + obj[prop] + ' ';
    }
    return returnValue + '}';
  }


//  Numeric Object
//  ===============================================================================================
/*  Public API:
 *
 *    Numeric.parseAuto(str)
 *        Determine whether the string is decimal, binary, or hex, and call
 *        the appropriate parser. Returns a numeric_object.
 *
 *    Numeric.parseDecimal(str)
 *        str may be a decimal integer, real, or rational string; returns a
 *        numeric_value object. Returns a numeric_object.
 *
 *    Numeric.parseBinary(str)
 *        str is a binary number in scientific notation (exponent optional).
 *        Returns a numeric_object.
 *
 *    Numeric.parseHexadecimal(str)
 *        str is the 8, 16, or 32 digit representation of an IEEE-754-2008
 *        binary32, binary 64, or binary128 value respectively.
 *        TODO What is this going to return?
 *
 *    numeric_value.toString(base)
 *        For displaying the decimal or binary value of an object returned by one of the parsers
 *        listed above.
 *        Returns the normalized value of the numeric value in base 2 or 10;
 *        the default base is 10.
 *        Repeating fractions are followed by an ellipsis. Recurrences are
 *        shown once in square brackets.
 *
 */
function Numeric()
{
  //  "Global Constants"
  //  ---------------------------------------------------------------------------------------------
  var BINARY_DIGITS_PER_DECIMAL_DIGIT = Math.log(10) / Math.LN2;
  var DECIMAL_RECURRENCE_LIMIT        = 1024;
  var BINARY_RECURRENCE_LIMIT         = BINARY_DIGITS_PER_DECIMAL_DIGIT * DECIMAL_RECURRENCE_LIMIT;
  var DISPLAY_FRACTION_LIMIT          = 128;

  if (DEBUG)
  {
    console.log('BINARY_DIGITS_PER_DECIMAL_DIGIT: ' + BINARY_DIGITS_PER_DECIMAL_DIGIT);
    console.log('DECIMAL_RECURRENCE_LIMIT:        ' + DECIMAL_RECURRENCE_LIMIT);
    console.log('BINARY_RECURRENCE_LIMIT:         ' + BINARY_RECURRENCE_LIMIT);
    console.log('DISPLAY_FRACTION_LIMIT:          ' + DISPLAY_FRACTION_LIMIT);
  }

  //  Regular expressions for input formats
  //  ---------------------------------------------------------------------------------------------
  var mixedRE = new RegExp(
      "^\\s*(([+\\-]?\\d+)([Ee](\\d+))?\\s+)?"  + // whole number
      "([+\\-]?\\d+)\\s*([Ee](\\d+))?\\s*"      + // numerator
      "\\/"                                     + // solidus for division slash
      "\\s*([+\\-]?\\d+)\\s*([Ee](\\d+))?\\s*$"); // denominator
  //  "Plain 'ol (decimal) number"
  var ponRE   = /^\s*([+\-])?(\d+)?(\.(\d*))?([Ee]([+\-]?\d+))?\s*$/;
  //  Binary
  var binRE     = /^\s*([+\-])?([01])?(\.([01]*))?([EeBb]([+\-]?\d+))?\s*$/;
  //  Hexadecimal floating-point
  var hex32RE   = /^\s*([0-9A-F]{8})\s*$/i;
  var hex64RE   = /^\s*([0-9A-F]{16})\s*$/i;
  var hex128RE  = /^\s*([0-9A-F]{32})\s*$/i;

  //  Numeric.setDecimalRecurrenceLimit()
  //  -------------------------------------------------------------------------
  /*    Precondition: newLimit is a non-negative integer.
   */
  Numeric.prototype.setDecimalRecurrenceLimit = function(newLimit)
  {
    if (DEBUG) console.log('setDecimalRecurrenceLimit( ' + newLimit + ' )');
    var oldLimit = DECIMAL_RECURRENCE_LIMIT;
    DECIMAL_RECURRENCE_LIMIT = newLimit;
    if (DEBUG) console.log('  return ' + oldLimit);
    return oldLimit;
  };

  //  Numeric.setBinaryRecurrenceLimit()
  //  -------------------------------------------------------------------------
  /*    Precondition: newLimit is a non-negative integer.
   */
  Numeric.prototype.setBinaryRecurrenceLimit = function(newLimit)
  {
    if (DEBUG) console.log('setBinaryRecurrenceLimit( ' + newLimit + ' )');
    var oldLimit = BINARY_RECURRENCE_LIMIT;
    BINARY_RECURRENCE_LIMIT = newLimit;
    if (DEBUG) console.log('  return ' + oldLimit);
    return oldLimit;
  };

  //  Numeric.numeric_value()
  //  =========================================================================
  /*  This function is invoked using the new operator to create numeric_value
   *  objects. These objects are returned by the parse_auto, parse_decimal,
   *  parse_binary, and parse_hexadecimal functions, and may be displayed by the
   *  toString method, which accepts an optional radix (2 or 10) argument.
   */
  var numeric_value = function()
  {
    if (DEBUG) console.log('numeric_value()');
    this.isNegative                 = false;
    this.decimal_integer            = '';
    this.decimal_fraction           = '';
    this.decimal_recurrence_start   = -1;
    this.decimal_recurrence         = '';
    this.decimal_exponent           = 0;
    this.isRepeatingDecimal         = true;
    this.binary_integer             = '';
    this.binary_fraction            = '';
    this.binary_recurrence_start    = -1;
    this.binary_recurrence          = '';
    this.binary_exponent            = 0;
    this.isRepeatingBinary          = true;

    this.isValid                    = false;
    this.isInfinity                 = false;
    this.isNaN                      = false;
    this.isSignalling               = false;
  };


  //  Numeric.parse_auto()
  //  ---------------------------------------------------------------------------
  /*    Determines the format of a string, and calls the appropriate parser.
   *    Checks first for decimal values (mixed or plain), then for binary,
   *    then for hexadecimal representation of floating-point values in that
   *    order.
   *    Exposed to outsiders as Numeric.parseAuto();
   */
    var parse_auto = function(inputString)
    {
      if (DEBUG) console.log('Numeric.parse_auto( ' + inputString + ' )');
      var returnValue = null;
      if (mixedRE.test(inputString) || ponRE.test(inputString))
      {
        returnValue = parse_decimal(inputString);
        if (DEBUG) console.log('  return ' + returnValue);
        return returnValue;
      }
      if (binRE.test(inputString))
      {
        returnValue = parse_binary(inputString);
        if (DEBUG) console.log('  return ' + returnValue);
        return returnValue;
      }
      if (hex32RE.test(inputString) || hex64RE.test(inputString) || hex128RE.test(inputString))
      {
        returnValue = parse_hexadecimal(inputString);
        if (DEBUG) console.log('  return ' + returnValue);
        return returnValue;
      }
      returnValue = new numeric_value();
      returnValue.checkSpecialValue(inputString);
      if (DEBUG) console.log('  return ' + returnValue);
      return returnValue;
    };
    this.parseAuto = parse_auto;

  //  Numeric.parse_decimal()
  //  ---------------------------------------------------------------------------
  /*  Parse a decimal string into a numeric_value. Returns a numeric_value
   *  object with decimal and binary parts initialized and normalized.
   *  Exposed to outsiders as Numeric.parseDecimal().
   */
    var parse_decimal = function(inputString)
    {
    if (DEBUG) console.log('Numeric.parse_decimal( ' + inputString + ' )');
    var returnValue = new numeric_value();

      //  Check for special values: NaN and Infinity
      returnValue.checkSpecialValue(inputString);
      if (returnValue.isValid)
      {
        if (DEBUG) console.log(' return ' + returnValue);
        return returnValue;
      }

      var mixed = mixedRE.exec(inputString);
      if (mixed)
      {
        var sign          = '+';
        var whole_number  = mixed[2];
        var numerator     = mixed[5];
        var denominator   = mixed[8];
        if (mixed[1])
        {
          if (whole_number[0] === '-' || whole_number === '+')
          {
            sign = whole_number[0];
            whole_number = whole_number.substr(1);
          }
          for (var i = 0; i < mixed[4]; i++)
          {
            whole_number = whole_number.concat('0');
          }
        }
        if (mixed[6])
        {
          for (var i = 0; i < mixed[7]; i++)
          {
            numerator = numerator.concat('0');
          }
        }
        if (mixed[9])
        {
          for (var i = 0; i < mixed[10]; i++)
          {
            denominator = denominator.concat('0');
          }
        }
        if (whole_number)
        {
           numerator = decimal_add(numerator, (decimal_multiply(whole_number, denominator, true)));
        }
        var value = decimal_divide(numerator, denominator);
        if (sign === '-') value.isNegative  = !value.isNegative;
        returnValue.isNegative              = value.isNegative;
        returnValue.decimal_integer         = value.integer_part;
        returnValue.decimal_fraction        = value.fraction_part;
        returnValue.isRepeatingDecimal      = value.hasRepeatingFraction;
        if ( !(value.recurrence_start < 0) )
        {
          returnValue.decimal_recurrence_start  = value.recurrence_start;
          returnValue.decimal_recurrence = value.fraction_part.substr(value.recurrence_start);
        }
      }

      //  Plain ol' number?
      var isBlank = /^\s*$/.test(inputString);
      var pon = ponRE.exec(inputString);
      if (pon && !isBlank)
      {
        if (pon[1]) returnValue.isNegative       = pon[1] === '-';
        if (pon[2]) returnValue.decimal_integer  = (pon[2] ? ltrim(pon[2]) : '');
        if (pon[4]) returnValue.decimal_fraction = (pon[4] ? rtrim(pon[4]) : '');
        if (pon[6]) returnValue.decimal_exponent = (pon[6] ? pon[6] - 0 : 0);
      }

      //  Check there was a non-empty value to parse
      if (returnValue.decimal_integer.length + returnValue.decimal_fraction.length <= 0)
      {
        if (DEBUG) console.log('  return ' + returnValue);
        return returnValue; //  not valid
      }

      //  Got a value: generate the binary equivalent
      returnValue.isValid = true;

      //  Working copies to use for conversion to binary
      var integer_part  = returnValue.decimal_integer;
      var fraction_part = returnValue.decimal_fraction;
      var exponent      = returnValue.decimal_exponent;

      //  Create 'pure' decimal number:
      //    Shift or right as needed to make decimal exponent zero.
       while (exponent > 0)
      {
        //  Shift left, filling in with recurrence digits or zeros if necessary
        if (fraction_part === '')
        {
          if (returnValue.decimal_recurrence.length > 0) fraction_part = returnValue.decimal_recurrence;
          else fraction_part = '0';
        }
        integer_part = integer_part.concat(fraction_part[0]);
        fraction_part = fraction_part.substr(1);
        exponent--;
      }
      while (exponent < 0)
      {
        //  Shift right, filling in with zeros if necessary
        if (integer_part.length === 0)
        {
          integer_part = '0';
        }
        fraction_part = integer_part[integer_part.length - 1].concat(fraction_part);
        integer_part = integer_part.substr(1);
        exponent++;
      }

      //  Generate binary integer part
      while (true)
      {
        var division_result = decimal_divide(integer_part, '2');
        returnValue.binary_integer =
          ((division_result.fraction_part === '5') ? '1' : '0').concat(returnValue.binary_integer);
        integer_part = division_result.integer_part;
        if (integer_part === '0') break;
      }
      //  Generate binary fraction Part

      //  If there is a recurrence string, it has to be replicated an appropriate number of times to
      //  get the desired binary precision.
      if (returnValue.decimal_recurrence.length > 0)
      {
        while (fraction_part.length < (BINARY_RECURRENCE_LIMIT / BINARY_DIGITS_PER_DECIMAL_DIGIT))
        {
          fraction_part = fraction_part.concat(returnValue.decimal_recurrence);
        }
      }

      var fraction_part_length = fraction_part.length;
      var fractions = [fraction_part];
      for (var i = 0; i < BINARY_RECURRENCE_LIMIT; i++)
      {
        //  Check whether the value of the fraction part has been exhausted
        //  yet, which occurs if the fraction part is empty or zero.
        if (fraction_part == 0)
        {
          returnValue.isRepeatingBinary = false;
          break;
        }
        var multiplication_result = decimal_multiply(fraction_part, '2', false);
        returnValue.binary_fraction = returnValue.binary_fraction.concat(multiplication_result.charAt(0));
        fraction_part = multiplication_result.substr(1);

        if (returnValue.decimal_recurrence.length > 0)
        {
          /*  Decimal recurrences get messed up by the multiplication: find the last complete
           *  one, if there is one, and pad the remainder of the fraction part with as many
           *  copies of the decimal recurrence as necessary to restore the original decimal
           *  fraction. I can't prove that returnValue catches all binary recurrences, but it catches
           *  the ones generated by decimal recurrences that the code detects.
           */
          var index = fraction_part.lastIndexOf(returnValue.decimal_recurrence);
          if (! (index < 0) )
          fraction_part = fraction_part.substr(0, index + returnValue.decimal_recurrence.length);
          while (fraction_part.length < fraction_part_length)
          {
            fraction_part = fraction_part.concat(returnValue.decimal_recurrence);
          }
          fraction_part = fraction_part.substr(0, fraction_part_length);
        }

        //  Check for binary recurrence
        for (var i = 0; i < fractions.length; i++)
        {
          if (fraction_part === fractions[i])
          {
            returnValue.binary_recurrence_start = i;
            returnValue.binary_recurrence = returnValue.binary_fraction.substr(i);
            break;
          }
        }
        if ( !(returnValue.binary_recurrence_start < 0) ) break;
        fractions.push(fraction_part);
      }
      returnValue = returnValue.normalize();
      if (DEBUG) console.log('  return ' + returnValue);
      return returnValue;
    };
    this.parseDecimal = parse_decimal;


  //  Numeric.parse_binary()
  //  -------------------------------------------------------------------------------------------
  /*    Optional sign; optional integer part; optional fraction part; optional exponent.
   *    But something has to be there!
   */
    var parse_binary = function(inputString)
    {
      if (DEBUG) console.log('Numeric.parse_binary( ' + inputString + ' )');
      var returnValue = new numeric_value();

      //  Check for special values: NaN and Infinity
      returnValue.checkSpecialValue(inputString);
      if (returnValue.isValid) return returnValue;

      var isBlank = /\s*$/.test(inputString);
      var bin = binRE.exec(inputString);

      if (bin && !isBlank)
      {
        if (bin[1]) returnValue.isNegative      = bin[1] === '-';
        if (bin[2]) returnValue.binary_integer  = (bin[2] ? ltrim(bin[2]) : '');
        if (bin[4]) returnValue.binary_fraction = (bin[4] ? rtrim(bin[4]) : '');
        if (bin[6]) returnValue.binary_exponent = (bin[6] ? bin[6] - 0 : 0);
        if (returnValue.binary_integer.length + returnValue.binary_fraction.length > 0)
        {
          returnValue = returnValue.binaryToDecimal();
          if (DEBUG) console.log('  return ' + returnValue);
          return returnValue;
        }
      }
      if (DEBUG) console.log('  return ' + returnValue);
      return returnValue;
    };
    this.parseBinary = parse_binary;


  //  Numeric.parse_hexadecimal()
  //  -------------------------------------------------------------------------------------------
  /*    8, 16, or 32 hex digits.
   */
    var parse_hexadecimal = function(inputString)
    {
      if (DEBUG) console.log('Numeric.parse_binary( ' + inputString + ' )');
      var returnValue = new numeric_value();
      if (DEBUG) console.log(' return ' + returnValue);
      return returnValue;
    };
    this.parseHexadecimal = parse_hexadecimal;

  //  numeric_value.checkSpecialValue()
  //  -------------------------------------------------------------------------
  /*    Checks is a string is NaN or Infinity, and sets the proper fields if
   *    it is.
   */
    numeric_value.prototype.checkSpecialValue = function(str)
    {
      if (DEBUG) console.log('numeric_value.checkSpecialValue( ' + str + ' )');
      switch (str.toLowerCase())
      {
        case '+infinity':
        case 'infinity':
          this.isValid    = true;
          this.isInfinity = true;
          this.isNegative = false;
          return;
        case '-infinity':
          this.isValid    = true;
          this.isInfinity = true;
          this.isNegative = true;
          return;
        case 'qnan':
        case 'nan':
          this.isValid      = true;
          this.isNaN        = true;
          this.isSignalling = false;
          return;
        case 'snan':
          this.isValid      = true;
          this.isNaN        = true;
          this.isSignalling = true;
          return;
        default:
          this.isValid      = false;
      }
      if (DEBUG) console.log(' return ' + this );
      return;
    };

  //  numeric_value.normalize()
  //  ---------------------------------------------------------------------------------------------
  /*  Once the decimal and binary parts of a numeric value have been determined, use this function
   *  to:
   *    1.  Normalize the decimal value
   *    2.  Normalize the binary value
   *    3.  Return this
   */
    numeric_value.prototype.normalize = function()
    {
      if (DEBUG) console.log('numeric_value.normalize('+ this +')');
      //  Normalize the decimal value
      while (this.decimal_integer.length > 1)
      {
        this.decimal_fraction =
          this.decimal_integer.charAt(this.decimal_integer.length - 1) + this.decimal_fraction;
        this.decimal_integer = this.decimal_integer.substr(0, this.decimal_integer.length - 1);
        this.decimal_exponent++;
      }

      //  Be sure there is exactly one copy of the recurrence string (if there is one).
      if (this.decimal_recurrence.length > 0)
      {
        if ( this.decimal_fraction.lastIndexOf(this.decimal_recurrence) < 0 )
        {
          throw 'decimal recurrence string not present in decimal fraction';
        }
        //  First, remove all trailing copies of the recurrence
        var recurrence_index = this.decimal_fraction.length - this.decimal_recurrence.length;
        while ( recurrence_index > -1)
        {
          if (this.decimal_fraction.substr(recurrence_index) === this.decimal_recurrence)
          {
            this.decimal_fraction = this.decimal_fraction.substr(0, recurrence_index);
            recurrence_index = this.decimal_fraction.length - this.decimal_recurrence.length;
          }
          else break;
        }
        //  ...and add back exactly one copy of it.
        this.decimal_recurrence_start = this.decimal_fraction.length;
        this.decimal_fraction = this.decimal_fraction.concat(this.decimal_recurrence);
      }

      //  Be sure the digit to the left of the decimal point is non-zero (unless the value is zero).
      while (this.decimal_integer === '0' && (this.decimal_fraction.length > 0))
      {
        this.decimal_integer = this.decimal_fraction.charAt(0);
        this.decimal_fraction = this.decimal_fraction.substr(1);
        this.decimal_exponent--;

        //  Adjust the decimal recurrence, if there is one.
        if (this.decimal_recurrence.length > 0)
        {
          this.decimal_recurrence_start--;
          if (this.decimal_recurrence_start < 0)
          {
            this.decimal_fraction = this.decimal_fraction.concat(this.decimal_integer);
            this.decimal_recurrence = this.decimal_fraction;
            this.decimal_recurrence_start = 0;
          }
        }
      }

      //  Normalize the binary value
      while (this.binary_integer.length > 1)
      {
        this.binary_fraction =
          this.binary_integer.charAt(this.binary_integer.length - 1).concat(this.binary_fraction);
        this.binary_integer = this.binary_integer.substr(0, this.binary_integer.length - 1);
        this.binary_exponent++;
        if (this.binary_recurrence_start > -1) this.binary_recurrence_start++;
     }
      //  Be sure there is exactly one copy of the recurrence string (if there is one).
      if (this.binary_recurrence.length > 0)
      {
        if ( this.binary_fraction.lastIndexOf(this.binary_recurrence) < 0 )
        {
          throw 'binary recurrence string not present in binary fraction';
        }
        //  First, remove all trailing copies of the recurrence...
        var recurrence_index = this.binary_fraction.length - this.binary_recurrence.length;
        while ( recurrence_index > -1)
        {
          if (this.binary_fraction.substr(recurrence_index) === this.binary_recurrence)
          {
            this.binary_fraction = this.binary_fraction.substr(0, recurrence_index);
            recurrence_index = this.binary_fraction.length - this.binary_recurrence.length;
          }
          else break;
        }
        //  ...and add back exactly one copy of it.
        this.binary_recurrence_start = this.binary_fraction.length;
        this.binary_fraction = this.binary_fraction.concat(this.binary_recurrence);
      }

      //  Be sure the digit to the left of the binary point is non-zero (unless the value is zero).
      while (this.binary_integer === '0' && (this.binary_fraction.length > 0))
      {
        this.binary_integer = this.binary_fraction.charAt(0);
        this.binary_fraction = this.binary_fraction.substr(1);
        this.binary_exponent--;

        //  Adjust the binary recurrence, if there is one.
        if (this.binary_recurrence.length > 0)
        {
          this.binary_recurrence_start--;
          if (this.binary_recurrence_start < 0)
          {
            this.binary_fraction = this.binary_fraction.concat(this.binary_integer);
            this.binary_recurrence = this.binary_fraction;
            this.binary_recurrence_start = 0;
          }
        }
      }

      //  Return the initialized object
      this.isValid = true;
      if (DEBUG) console.log('  return ' + this);
      return this;
    };

  //  numeric_value.binaryToDecimal()
  //  ------------------------------------------------------------------------
  /*  TODO This is diagnostic code for now: it returns a string representation
   *  of the decimal value.
   *  Generates the decimal components of a numeric_value after the binary
   *  components have been determined by parse_binary or parse_hexadecimal.
   *
   *  There is no way for the user to enter a recurring binary fraction in
   *  binary; that can only be done by entering a mixed decimal number.
   *  Therefore, binary numbers cannot generate repeating decimals either.
   *  Makes things simpler here.
   */
    numeric_value.prototype.binaryToDecimal = function()
    {
      if (DEBUG) console.log('numeric_value.binaryToDecimal(' + this +')');
      var integer_part = this.binary_integer;
      var fraction_part = this.binary_fraction;
      var exponent = this.binary_exponent;
      while (exponent > 0)
      {
        integer_part = integer_part.concat((fraction_part == 0) ? '0' : fraction_part[0]);
        fraction_part = fraction_part.substr(1);
        exponent--;
      }
      while (exponent < 0)
      {
        fraction_part = ((integer_part == 0) ? '0' : integer_part[integer_part.length - 1]).concat(integer_part);
        integer_part = integer_part.substr(0, integer_part.length - 1);
      }

      //  TODO Have to do decimal character arithmetic here:
      var decimal_integer_part = 0;
      var powerof2 = integer_part.length - 1;
      for (var i = 0; i < integer_part.length; i++)
      {
        if (integer_part[i] === '1') decimal_value += Math.pow(2,powerof2);
        powerof2--;
      }
      var decimal_fraction_part = 0;
      powerof2 = -1;
      for (var i = 0; i < fraction_part.length; i++)
      {
        if (fraction_part[i] === '1') decimal_value += Math.pow(2, powerof2);
        powerof2--;
      }
      if (DEBUG) console.log('  return ' + this);
      return this;
    };


  //  numeric_value.toString()
  //  -------------------------------------------------------------------------
  numeric_value.prototype.toString = function(base)
  {
    if (DEBUG) console.log('numeric_value.toString(' + base + ')');
    if (!this.isValid)    return 'Not a recognized number';
    if (this.isInfinity)  return (this.isNegative ? '-' : '+') + 'Infinity';
    if (this.isNaN)       return (this.isSignalling ? 's' : 'q') + 'NaN';

    var returnValue = (this.isNegative ? '-' : '');

    if ((arguments.length === 1) && (base === 2))
    {
      //  Generate string representation of binary value
      returnValue += this.binary_integer;
      if (this.binary_fraction != '')
      {
        if (this.binary_recurrence_start < 0)
        {
          //  Fraction, but no recurrence
          returnValue += '.' + this.binary_fraction.substr(0, DISPLAY_FRACTION_LIMIT);
          if (this.binary_fraction.length > DISPLAY_FRACTION_LIMIT)
          {
            returnValue += '... ';
          }
          if (this.binary_exponent !== 0)
          {
            returnValue += 'b' + this.binary_exponent;
          }
        }
        else
        {
          //  Fraction with recurrence
          returnValue += '.' + this.binary_fraction.substr(0, this.binary_recurrence_start) + '[' +
            this.binary_recurrence.substr(0, DISPLAY_FRACTION_LIMIT);
          if (this.binary_recurrence.length > DISPLAY_FRACTION_LIMIT)
          {
            returnValue += '... ';
          }
          returnValue += ']... ' + ((this.binary_exponent === 0) ? '' : ('b' + this.binary_exponent));
        }
      }
      else
      {
        returnValue += '.0';
        returnValue += ((this.binary_exponent === 0) ? '' : ('b' + this.binary_exponent));
      }
    }
    else
    {
      //  Generate string representation of decimal value
      returnValue += (this.decimal_integer);
      if (this.decimal_fraction != '')
      {
        if (this.decimal_recurrence_start < 0)
        {
          returnValue += '.' + this.decimal_fraction + (this.hasRepeatingDecimal ? '... ' : '') +
          ((this.decimal_exponent === 0) ? '' : ('e' + this.decimal_exponent));
        }
        else
        {
          returnValue += '.' + this.decimal_fraction.substr(0, this.decimal_recurrence_start) + '[' +
            this.decimal_fraction.substr(this.decimal_recurrence_start) + ']... ' +
            ((this.decimal_exponent === 0) ? '' : ('e' + this.decimal_exponent));
        }
      }
      else
      {
        returnValue += '.0';
        returnValue += ((this.decimal_exponent === 0) ? '' : ('e' + this.decimal_exponent));
      }
    }
    if (DEBUG) console.log('  return ' + returnValue);
    return returnValue;
  };


  //  prepArgs()
  //  ---------------------------------------------------------------------------
  /*  Convert strings of unsigned decimal digits into arrays of integers of
   *  equal length. Index positions correspond to positional power of 10.
   *  (That is, the digits are reversed).
   */
    function prepArgs()
    {
      if (DEBUG) console.log('prepArgs(' + arguments + ')');
      if ( arguments[0] === '' || arguments[1] === '')
      {
        throw 'prepArgs: empty argument(s)';
      }
      var result = {sign1:'+', arg1:[], sign2:'+', arg2:[]};
      var arg1 = arguments[0];
      var arg2 = arguments[1];
      if (arg1[0] === '-' || arg1[0] === '+')
      {
        result.sign1 = arg1[0];
        arg1 = arg1.substr(1);
      }
      if (arg2[0] === '-' || arg2[0] === '+')
      {
        result.sign2 = arg2[0];
        arg2 = arg2.substr(1);
      }
      while (arg1.length < arg2.length) arg1 = '0'.concat(arg1);
      while (arg2.length < arg1.length) arg2 = '0'.concat(arg2);

      for (var i = 0; i < arg1.length; i++)
      {
        result.arg1.unshift(arg1.charAt(i) - 0);
        result.arg2.unshift(arg2.charAt(i) - 0);
      }
      if (DEBUG) console.log('  return ' + result);
      return result;
    }

  //  trim()
  //  ---------------------------------------------------------------------------
  /*  Remove leading and trailing whitespace from a string.
   */
    function trim(arg)
    {
      if (DEBUG) console.log('trim(\'' + arg + '\')');
      var result = /^\s*(\S)*\s*$/.exec(arg);
      if (result && result[1])
      {
        if (DEBUG) console.log('  return ' + result[1]);
        return result[1];
      }
      if (DEBUG) console.log('  return \'\'');
      return '';
    }

  //  ltrim()
  //  ---------------------------------------------------------------------------
  /*    Remove leading zeros from a numeric string.
   */
    function ltrim(arg)
    {
      var result = arg;
      while ((result.length > 1) && result.charAt(0) === '0')
      {
        result = result.substr(1);
      }
      return result;
    }

  //  rtrim()
  //  ---------------------------------------------------------------------------
  /*    Remove trailing zeros from a numeric string.
   */
    function rtrim(arg)
    {
      var result = arg;
      while ((result.length > 0) && result.charAt(result.length - 1) === '0')
      {
        result = result.substr(0, result.length - 1);
      }
      return result;
    }

  //  compare()
  //  ---------------------------------------------------------------------------
  /*  Three-way compare the numeric values of two signed decimal strings.
   */
    function compare(arg1, arg2)
    {
      var a = arg1;
      var b = arg2;
      var sign_a = '+';
      var sign_b = '+';
      if (a[0] === '-' || a[0] ==- '+')
      {
        sign_a = a[0];
        a = a.substr(1);
      }
      if (b[0] === '-' || b[0] ==- '+')
      {
        sign_b = b[0];
        b = b.substr(1);
      }
      switch (sign_a + sign_b)
      {
        case '++':
          break;
        case '+-':
          return +1;
          break;
        case '-+':
          return -1;
          break;
        case '--':
          var t = a;
          var a = b;
          var b = t;
          break;
        default:
          throw 'compare: bad signs';
      }
      a = ltrim(a);
      b = ltrim(b);
      if (a.length > b.length) return +1;
      if (a.length < b.length) return -1;
      for (var i = 0;  i < a.length; i++)
      {
        if (a[i] > b[i]) return +1;
        if (a[i] < b[i]) return -1;
      }
      return 0;
    }
    this.compare = compare;

  //  decimal_add()
  //  ---------------------------------------------------------------------------
  /*  Add the augend and addend.
   */
    function decimal_add(arg1, arg2, trim)
    {
      if (DEBUG) console.log('decimal_add(' + arg1 + ', ' + arg2 + ', ' + trim + ')');
      var values = prepArgs(arg1, arg2);
      var augend = values.arg1;
      var addend = values.arg2;

      //  If signs of operands are different, it's subtraction.
      if (values.sign1 !== values.sign2)
      {
        if (arg1[0] === '-' || arg1[0] === '+') arg1 = arg1.substr(1);
        if (arg2[0] === '-' || arg2[0] === '+') arg2 = arg2.substr(1);
        var diff = '';
        if (compare(arg1, arg2) > 0)
        {
          diff = decimal_subtract(arg1, arg2, true);
          diff = values.sign1.concat(diff);
        }
        else
        {
          diff = decimal_subtract(arg2, arg1, true);
          diff = values.sign2.concat(diff);
        }
        if (DEBUG) console.log('  return ' + diff);
        return diff;
      }

      //  It's addition
      var sum = '';
      var carry = 0;
      for (var i = 0; i < augend.length; i++)
      {
        var digit_sum = augend[i] + addend[i] + carry;
        if (digit_sum > 9)
        {
          digit_sum -= 10;
          carry = 1;
        }
        else carry = 0;
        sum = String.fromCharCode(48 + digit_sum).concat(sum);
      }
      if (carry > 0) sum = '1'.concat(sum);
      if (trim)
      {
        sum = ltrim(sum);
      }
      if (DEBUG) console.log('  return ' + sum);
      return sum;
    }

  //  decimal_subtract()
  //  ---------------------------------------------------------------------------
  /*  Subtract the unsigned minuend from the unsigned subtrahend. The subtrahend
   *  must be numerically larger than the minuend. Returns a string the length
   *  of the subtrahend with leading zeros.
   *  Use the trim argument to trim the leading zeros.
   */
    function decimal_subtract(arg1, arg2, trim)
    {
      var arrays = prepArgs(arg1, arg2);
      var subtrahend = arrays.arg1;
      var minuend = arrays.arg2;

      var diff = '';
      for (var i = 0; i < subtrahend.length; i++)
      {
        var digit_diff = subtrahend[i] - minuend[i];
        if (digit_diff < 0)
        {
          digit_diff += 10;
          for (var j = i+1; j<subtrahend.length; j++)
          {
            subtrahend[j] -= 1;
            if (subtrahend[j] > -1) break;
            subtrahend[j] = 9;
          }
        }
        diff = String.fromCharCode(48 + digit_diff).concat(diff);
      }
      if (trim) return ltrim(diff);
      return diff;
    };

  //  decimal_multiply()
  //  ---------------------------------------------------------------------------
  /*  Multiplicand by multiplier; return the product.
   */
    function decimal_multiply(arg1, arg2, trim)
    {
      var multiplicand      = arg1;
      var multiplier        = arg2;
      var multiplicand_sign = '+';
      var multiplier_sign   = '+';

      //  Process signs of multiplicand and multiplier
      if (multiplicand[0] === '-' || multiplicand[0] === '+')
      {
        multiplicand_sign = multiplicand[0];
        multiplicand = multiplicand.substr(1);
      }
      if (multiplier[0] === '-' || multiplier[0] === '+')
      {
        multiplier_sign = multiplier[0];
        multiplier = multiplier.substr(1);
      }
      product_sign = (multiplier_sign === multiplicand_sign) ? '' : '-';

      var product = '0';
      for (var i = multiplier.length - 1; i >= 0; i--)
      {
        var multiplier_digit = multiplier.charAt(i) - '0';
        var partial_product = '';
        var carry = 0;
        for (var j = multiplicand.length - 1; j >= 0; j--)
        {
          var multiplicand_digit = multiplicand.charAt(j) - '0';
          var digit_product = (multiplier_digit * multiplicand_digit) + carry;
          carry = Math.floor(digit_product / 10);
          partial_product = String.fromCharCode((digit_product % 10) + 48).concat(partial_product);
        }
        for (var k = i; k < multiplier.length - 1; k++)
        {
          partial_product = partial_product.concat('0');
        }
        product = String.fromCharCode(carry + 48) + decimal_add(product, partial_product);
      }
      if (trim) product = ltrim(product);
      return product_sign.concat(product);
    };

  //  decimal_divide()
  //  ---------------------------------------------------------------------------
  /*  Used for evaluating rational numbers.
   *  Signed division of divisor by dividend, giving integer and fraction parts.
   *  The return object includes where the recurrence starts, if found.
   *    Algorithm (long division)
   *      Process optional sign characters of dividend and divisor.
   *      Check for division by zero.
   *      Calculate the integer part:
   *        If the divisor is larger than the dividend, the integer part is 0:
   *        the remainder is the dividend; the current position is zero; goto F.
   *        I: The remainder is the next n digits of the dividend, starting at the
   *        current position and continuing for the number of digits in the
   *        divisor. Count how many times you can sum the divisor without
   *        exceeding the remainder. Postpend that count to the integer part, and
   *        subtract the sum from the remainder to get the new remainder.
   *        Increment the current position. If there are enough digits left in the
   *        dividend, goto I.
   *      Calculate the fraction part:
   *        F: Count how many times you can sum the divisor without exceeding the
   *        dividend value in the next n digits of the dividend. Postpend that
   *        count to the fraction part, and subtract the sum from the remainder to
   *        get the new remainder.  If the remainder is zero, stop. If the
   *        remainder is on the remainder stack, note that position as the
   *        recurrence start, and stop. Otherwise, increment the current position and
   *        append the next digit of the dividend to the remainder, or zero if
   *        there is none.  If the fraction is shorter than DECIMAL_RECURRENCE_LIMIT, goto F.
   *      Return a numeric_value object with the sign, integer part, fraction
   *      part, and recurrence start position.
   */
    function decimal_divide(arg1, arg2)
    {
      if (DEBUG) console.log('decimal_divide(' + arg1 + ', ' + arg2 + ')');
      var decimal_integer_part      =  '';
      var decimal_fraction_part     =  '';
      var remainder                 =  '';
      var remainders                = [ ];
      var dividend_index            =   0;
      var digit_value               =   0;
      var decimal_recurrence_start  =  -1;
      var dividend_sign             = '+';
      var divisor_sign              = '+';
      var isNegative                = false;
      var hasRepeatingFraction      = true;
      var dividend                  = arg1;
      var divisor                   = arg2;

      //  Process signs of dividend and divisor
      if (dividend[0] === '-' || dividend[0] === '+')
      {
        dividend_sign = dividend[0];
        dividend = dividend.substr(1);
      }
      if (divisor[0] === '-' || divisor[0] === '+')
      {
        divisor_sign = divisor[0];
        divisor = divisor.substr(1);
      }
      isNegative = !(divisor_sign === dividend_sign);

      //  Divide by zero?
      if (compare(divisor, '0') === 0)
      {
        if (isNegative)
        {
          // Say object's isNegative value is false because the value is -Infinity already.
          return new numeric_value(false, -Infinity, '', -1, '', true);
        }
        else
        {
          return new numeric_value(false, +Infinity, '', -1, '', true);
        }
      }

      //  Result less than 1?
      if (compare(dividend, divisor) < 0)
      {
        //  yes; divisor is larger than dividend
        decimal_integer_part = '0';
        remainder = dividend;
      }
      else
      {
        //  Integer Part
        remainder = dividend.substr(0, divisor.length);
        while ((dividend_index + divisor.length) <= dividend.length)
        {
          digit_value = 0;
          while (compare(remainder, divisor) >= 0)
          {
            digit_value++;
            remainder = decimal_subtract(remainder, divisor, true);
          }
          decimal_integer_part = decimal_integer_part.concat(String.fromCharCode(48 + digit_value));
          if (dividend_index + divisor.length < dividend.length)
          {
            remainder = ltrim(remainder.concat(dividend[dividend_index + divisor.length]));
          }
          dividend_index++;
        }
      }
      decimal_integer_part = ltrim(decimal_integer_part);

      //  Fraction Part
      remainders[0] = remainder;
      while (decimal_fraction_part.length < DECIMAL_RECURRENCE_LIMIT)
      {
        if (dividend_index + divisor.length < dividend.length)
        {
          remainder = remainder.concat(dividend[dividend_index + divisor.length]);
        }
        else
        {
          remainder = remainder.concat('0');
        }
        digit_value = 0;
        while (compare(remainder, divisor) >= 0)
        {
          digit_value++;
          remainder = decimal_subtract(remainder, divisor, true);
        }
        decimal_fraction_part = decimal_fraction_part.concat(String.fromCharCode(48 + digit_value));
        remainder = ltrim(remainder);
        if (remainder === '0')
        {
          hasRepeatingFraction = false;
          break;
        }
        for (var i = 0; i < remainders.length; i++)
        {
          if (remainders[i] === remainder)
          {
            decimal_recurrence_start  = i;
            break;
          }
        }
        if (decimal_recurrence_start > -1) break;
        remainders.push(remainder);
        dividend_index++;
      }

      var returnValue =
              { isNegative:           isNegative,
                integer_part:         decimal_integer_part,
                fraction_part:        decimal_fraction_part,
                recurrence_start:     decimal_recurrence_start,
                hasRepeatingFraction: hasRepeatingFraction
              };
      if (DEBUG) console.log('  return ' + objToString(returnValue));
      return returnValue;
    };
}

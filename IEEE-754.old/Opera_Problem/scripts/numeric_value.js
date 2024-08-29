// $Id$
//    TODO  Regression Tests: 0123456A is not working
//    TODO  Regression Tests: 1/7 not working in Opera
/*  This is a refactoring of a previous script, numeric.js, and includes functions taken from that code.
 *  The main difference is the elimination of a separate object returned when a new value is created.
 *
 *    A Numeric_Value can be constructed from a string given in any of the following formats:
 *
 *      A decimal real number; scientific notation allowed.
 *      A mixed or rational number. All three elements of a mixed number (whole_part, numerator, denominator)
 *      must be integers but they may be signed and may include exponents.
 *      A binary number; scientific notation with decimal exponents allowed.
 *      An 8, 16, or 32 digit hexadecimal number representing IEEE-754 binary32, binary64, or binary128 values.
 *
 *    Regardless of the construction format, the returned object will contain "lotsa" information about the value.
 *
 *    Binary value are calculated with up to 128 bits of precision; decimal values up to 40 digits.
 *
 *    $Log$
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

  var first = true, returnValue = '{';
  for (var prop in obj)
  {
    if (typeof obj[prop] !== 'function')
    {
      returnValue += (first ? ' ' : ', ') + prop + ': ' + obj[prop];
      first = false;
    }
  }
  return returnValue + '}';
}

//	Numeric_Value
//	===============================================================================================
function Numeric_Value(input_string, parse_as)
{
  if (DEBUG) {console.log('Numeric_Value( ' + input_string + ', ' + parse_as + ' )');}
  //  Numeric_Value private static data
  //  =============================================================================================
  //

  //  Regular expressions for input formats
  //  ---------------------------------------------------------------------------------------------
  //  Mixed
  var mixedRE = new RegExp(
      "^\\s*(([+\\-]?\\d+)([Ee](\\d+))?\\s+)?"  + // optional whole number
      "([+\\-]?\\d+)\\s*([Ee](\\d+))?\\s*"      + // numerator
      "\\/"                                     + // solidus for division slash
      "\\s*([+\\-]?\\d+)\\s*([Ee](\\d+))?\\s*$"); // denominator
  //  Real
  var realRE    = /^\s*([+\-])?(\d+)?(\.(\d*))?([Ee]([+\-]?\d+))?\s*$/;
  //  Binary
  var binRE     = /^\s*([+\-])?([01]+)?(\.([01]*))?([EeBb]([+\-]?\d+))?\s*$/;
  //  Hexadecimal floating-point
  var hex32RE   = /^\s*([0-9A-F]{8})\s*$/i;
  var hex64RE   = /^\s*([0-9A-F]{16})\s*$/i;
  var hex128RE  = /^\s*([0-9A-F]{32})\s*$/i;

  //  Numeric_Value private static functions
  //  =============================================================================================
  //
  //  prepArgs()
  //  ---------------------------------------------------------------------------
  /*  Convert strings of unsigned decimal digits into arrays of integers of
   *  equal length. Index positions correspond to positional power of 10.
   *  (That is, the digits are reversed).
   */
    var prepArgs = function ()
    {
      if (DEBUG) {console.log('prepArgs(' + arguments[0] + ', ' + arguments[1] + ')'); }
      if (arguments.length !== 2 || arguments[0] === '' || arguments[1] === '')
      {
        throw 'prepArgs: missing or empty argument(s)';
      }
      var result = {sign1: '+', arg1:[], sign2: '+', arg2:[]};
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
      while (arg1.length < arg2.length) {arg1 = '0'.concat(arg1);}
      while (arg2.length < arg1.length) {arg2 = '0'.concat(arg2);}
      for (var i = 0; i < arg1.length; i++)
      {
        result.arg1.unshift(arg1.charAt(i) - 0);
        result.arg2.unshift(arg2.charAt(i) - 0);
      }
      if (DEBUG) {console.log('  return ' + objToString(result));}
      return result;
    };

  //  trim()
  //  ---------------------------------------------------------------------------
  /*  Remove leading and trailing whitespace from a string.
   */
    var trim = function (arg)
    {
      if (DEBUG) {console.log('trim(\'' + arg + '\')');}
      var result = /^\s*(\S)*\s*$/.exec(arg);
      if (result && result[1])
      {
        if (DEBUG) {console.log('  return ' + result[1]);}
        return result[1];
      }
      if (DEBUG) {console.log('  return \'\'');}
      return '';
    };

  //  ltrim()
  //  ---------------------------------------------------------------------------
  /*    Remove leading zeros from a numeric string.
   */
    var ltrim = function (arg)
    {
      var result = arg;
      while ((result.length > 1) && result.charAt(0) === '0')
      {
        result = result.substr(1);
      }
      return result;
    };

  //  rtrim()
  //  ---------------------------------------------------------------------------
  /*    Remove trailing zeros from a numeric string.
   */
    var rtrim = function (arg)
    {
      var result = arg;
      while ((result.length > 0) && result.charAt(result.length - 1) === '0')
      {
        result = result.substr(0, result.length - 1);
      }
      return result;
    };

  //  compare()
  //  ---------------------------------------------------------------------------
  /*  Three-way compare the numeric values of two signed decimal strings.
   */
    var compare = function (arg1, arg2)
    {
      var a = arg1;
      var b = arg2;
      var sign_a = '+';
      var sign_b = '+';
      if (a[0] === '-' || a[0] === '+')
      {
        sign_a = a[0];
        a = a.substr(1);
      }
      if (b[0] === '-' || b[0] === '+')
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
        case '-+':
          return -1;
        case '--':
          var t = a;
          a = b;
          b = t;
          break;
        default:
          throw 'compare: bad signs';
      }
      a = ltrim(a);
      b = ltrim(b);
      if (a.length > b.length) {return +1;}
      if (a.length < b.length) {return -1;}
      for (var i = 0;  i < a.length; i++)
      {
        if (a[i] > b[i]) {return +1;}
        if (a[i] < b[i]) {return -1;}
      }
      return 0;
    };

  //  decimal_subtract()
  //  ---------------------------------------------------------------------------
  /*  Subtract the unsigned minuend from the unsigned subtrahend. The subtrahend
   *  must be numerically larger than the minuend. Returns a string the length
   *  of the subtrahend with leading zeros.
   *  Use the trim argument to trim the leading zeros.
   */
    var decimal_subtract = function (arg1, arg2, trim)
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
            if (subtrahend[j] > -1) {break;}
            subtrahend[j] = 9;
          }
        }
        diff = String.fromCharCode(48 + digit_diff).concat(diff);
      }
      if (trim) {return ltrim(diff);}
      return diff;
    };

  //  decimal_add()
  //  ---------------------------------------------------------------------------
  /*  Add the augend and addend.
   */
    var decimal_add = function (arg1, arg2, trim)
    {
      if (DEBUG) {console.log('decimal_add(' + arg1 + ', ' + arg2 + ', ' + trim + ')');}
      var values = prepArgs(arg1, arg2);
      var augend = values.arg1;
      var addend = values.arg2;

      //  If signs of operands are different, it's subtraction.
      if (values.sign1 !== values.sign2)
      {
        if (arg1[0] === '-' || arg1[0] === '+') {arg1 = arg1.substr(1);}
        if (arg2[0] === '-' || arg2[0] === '+') {arg2 = arg2.substr(1);}
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
        if (DEBUG) {console.log('  return ' + diff);}
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
        else {carry = 0;}
        sum = String.fromCharCode(48 + digit_sum).concat(sum);
      }
      if (carry > 0) {sum = '1'.concat(sum);}
      if (trim)
      {
        sum = ltrim(sum);
      }
      if (DEBUG) {console.log('  return ' + sum);}
      return sum;
    };

  //  decimal_multiply()
  //  ---------------------------------------------------------------------------
  /*  Multiplicand by multiplier; return the product.
   */
    var decimal_multiply = function (arg1, arg2, trim)
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
      var product_sign = (multiplier_sign === multiplicand_sign) ? '' : '-';

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
      if (trim) {product = ltrim(product);}
      return product_sign.concat(product);
    };

  //  decimal_divide()
  //  ---------------------------------------------------------------------------
  /*  Signed division of divisor by dividend, giving integer and fraction parts.
   *  The return object indicates where the recurrence starts, if found.
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
   *      Return a division_result object with the sign, integer part, fraction
   *      part, and recurrence start position.
   */
    var decimal_divide = function (arg1, arg2, DECIMAL_RECURRENCE_LIMIT)
    {
      if (DEBUG) {console.log('decimal_divide(' + arg1 + ', ' + arg2 + ', ' + DECIMAL_RECURRENCE_LIMIT + ')');}

      var result = {
        isNegative                 : false,
        decimal_integer_part       : '0',
        decimal_fraction_part      : '',
        decimal_recurrence_start   : -1,
        isInfinity                 : false
      };

      var remainder                 =  '';
      var remainders                = [ ];
      var dividend_index            =   0;
      var digit_value               =   0;
      var dividend_sign             = '+';
      var divisor_sign              = '+';
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
      result.isNegative = (divisor_sign !== dividend_sign);

      //  Divide by zero?
      if (compare(divisor, '0') === 0)
      {
        result.isInfinity = true;
        return result;
      }

      //  Result less than 1?
      if (compare(dividend, divisor) < 0)
      {
        //  yes; divisor is larger than dividend
        result.decimal_integer_part = '0';
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
          result.decimal_integer_part = result.decimal_integer_part.concat(String.fromCharCode(48 + digit_value));
          if (dividend_index + divisor.length < dividend.length)
          {
            remainder = ltrim(remainder.concat(dividend[dividend_index + divisor.length]));
          }
          dividend_index++;
        }
      }
      result.decimal_integer_part = ltrim(result.decimal_integer_part);

      //  Fraction Part
      remainders[0] = remainder;
      while (result.decimal_fraction_part.length < DECIMAL_RECURRENCE_LIMIT)
      {
        if ( (dividend_index + divisor.length) < dividend.length )
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
        result.decimal_fraction_part = result.decimal_fraction_part.concat(String.fromCharCode(48 + digit_value));
        remainder = ltrim(remainder);
        if (remainder === '0')
        {
          break;
        }
        for (var i = 0; i < remainders.length; i++)
        {
console.log('remainders['+i+']: ' + typeof remainders[i] + ' |' + remainders[i] + '|');
          if (remainders[i] === remainder)
          {
console.log('  remainders match at ' + i);
            result.decimal_recurrence_start = i;
            break;
          }
          else console.log(typeof remainders[i] + ':' + typeof remainder + ' ' +remainders[i] + ' !== ' + remainder);
        }
        if (result.decimal_recurrence_start > -1) {break;}
        remainders.push(remainder);
        dividend_index++;
      }
      if (DEBUG) {console.log('  return ' + objToString(result));}
      return result;
    };

  //  analyze()
  //  ---------------------------------------------------------------------------------------------
  /*  Performs an IEEE-754 analysis of a numeric value.
   */
    var analyze = function(value)
    {
      this.binary_32.exponent_bits = 'xxxxxxxx';
    };

  //  binary_to_decimal()
  //  ---------------------------------------------------------------------------------------------
  /*  Normalize a binary number, and generate the decimal equivalent.
   *  Normalizing is necessary in case the user entered the binary number manually or entered the
   *  hexadecimal representation of a subnormal value.
   */
    var binary_to_decimal = function(value)
    {
      if (DEBUG) {console.log('binary_to_decimal: ' + value.binary_integer + '.' +
          value.binary_fraction + 'E' + value.binary_exponent);}
      //  Normalize the number, unless it is zero
      // Test if the value is zero and set value.isZero if it is.
      if (value.binary_integer === '0' && value.binary_fraction === '0' && value.binary_exponent === 0)
      {
        value.isZero = true;
        if (DEBUG) {console.log('  return ' + value.decimal_integer + '.' +
            value.decimal_fraction + 'E' + value.decimal_exponent);}
        return;
      }
      // Shift msb to units position, adjusting exponent.
      while (value.binary_integer > 1)
      {
        value.binary_fraction =
          value.binary_integer.charAt(value.binary_integer.length - 1).concat(value.binary_fraction);
        value.binary_integer = value.binary_integer.substr(0, value.binary_integer.length - 1);
        value.binary_exponent++;
      }
      while (value.binary_integer === '0')
      {
        value.binary_integer = value.binary_fraction.charAt(0);
        value.binary_fraction = value.binary_fraction.substr(1);
        value.binary_exponent--;
      }
      //  Generate the decimal value
      /*  Having normalized the binary number above, we now need a copy with an exponent of zero.
       *  Sigh.
       */
      var binary_integer = value.binary_integer;
      var binary_fraction = value.binary_fraction;
      var binary_exponent = value.binary_exponent;
      while (binary_exponent > 0)
      {
        binary_integer = binary_integer + binary_fraction[0];
        binary_fraction = binary_fraction.substr(1);
        if (binary_fraction === '') {binary_fraction = '0';}
        binary_exponent--;
      }
      while (binary_exponent < 0)
      {
        binary_fraction = binary_integer.charAt(binary_integer.length - 1).concat(binary_fraction);
        binary_integer = binary_integer.substr(0, binary_integer.length -1);
        if (binary_integer === '') {binary_integer = '0';}
        binary_exponent++;
      }

      //  Decimal integer part
      var power_of_two = '1';
      value.decimal_integer = '0';
      for (var i = binary_integer.length - 1; i > -1; i--)
      {
        if (binary_integer[i] === '1')
        {
          value.decimal_integer = decimal_add(value.decimal_integer, power_of_two, false);
        }
        power_of_two = decimal_add(power_of_two, power_of_two);
      }

      //  Decimal fraction part
      power_of_two = '1';
      value.decimal_fraction = '0';
      for (i = binary_fraction.length - 1; i > -1; i--)
      {
        if (binary_fraction[i] === '1')
        {
          value.decimal_fraction = decimal_add(value.decimal_fraction, power_of_two, false);
        }
        power_of_two = decimal_add(power_of_two, power_of_two);
      }
      var result = decimal_divide(value.decimal_fraction, power_of_two, value.DECIMAL_RECURRENCE_LIMIT);
      value.decimal_fraction = result.fraction_part;

      //  Normalize
      value.decimal_exponent = 0;
      while (value.decimal_integer > 9)
      {
        value.decimal_fraction = value.decimal_integer.charAt(value.decimal_integer.length -1).
          concat(value.decimal_fraction);
        value.decimal_integer = value.decimal_integer.substr(0, value.decimal_integer.length - 1);
        value.decimal_exponent++;
      }
      while (value.decimal_integer === '0')
      {
        value.decimal_integer = value.decimal_fraction[0];
        value.decimal_fraction = value.decimal_fraction.substr(1);
        value.decimal_exponent--;
      }
      if (DEBUG) {console.log('  return ' + value.decimal_integer + '.' +
          value.decimal_fraction + 'E' + value.decimal_exponent);}
      return;
    };

  //  Numeric_Value private instance functions
  //  =============================================================================================
  //
  //  parse_auto()
  //  ---------------------------------------------------------------------------------------------
  /*  Guesses the input format: mixed and real preferred to binary.
   */
    this.parse_auto = function (input_string)
    {
      if (DEBUG) {console.log('parse_auto( ' + input_string + ' )');}
      if (mixedRE.test(input_string))
      {
        this.parse_mixed(input_string);
        if (DEBUG) {console.log('  return mixed');}
        return;
      }
      if (realRE.test(input_string))
      {
        this.parse_real(input_string);
        if (DEBUG) {console.log('  return real');}
        return;
      }
      if (binRE.test(input_string))
      {
        this.parse_binary(input_string);
        if (DEBUG) {console.log('  return bin');}
        return;
      }
      if (hex32RE.test(input_string) || hex64RE.test(input_string) || hex128RE.test(input_string))
      {
        this.parse_hexadecimal(input_string);
        if (DEBUG) {console.log('  return hex');}
        return;
      }
      this.checkSpecialValue(input_string);
      if (DEBUG) {console.log('  return ' + this.isValid);}
      return;
    };

  //  parse_decimal()
  //  ---------------------------------------------------------------------------------------------
  /*  Disambiguate between real and mixed.
   */
    this.parse_decimal = function (input_string)
    {
      if (DEBUG) {console.log('parse_decimal( ' + input_string + ' )');}
      if (mixedRE.test(input_string))
      {
        this.parse_mixed(input_string);
        if (DEBUG) {console.log('  return mixed');}
        return;
      }
      if (realRE.test(input_string))
      {
        this.parse_real(input_string);
        if (DEBUG) {console.log('  return real');}
        return;
      }
      if (DEBUG) {console.log('  return ' + this.isValid);}
      return;
    };

  //  parse_mixed()
  //  ---------------------------------------------------------------------------------------------
  /*  Parse mixed numbers; handle recurrences, but only up to  DECIMAL_RECURRENCE_LIMIT.
   */
    this.parse_mixed = function (input_string)
    {
      if (DEBUG) {console.log('parse_mixed( ' + input_string + ' )');}
      this.isValid = false;
      //  Check for special values: NaNs and Infinities
      this.checkSpecialValue(input_string);
      if (this.isValid)
      {
        if (DEBUG) {console.log('  return special: ' + objToString(this));}
        return;
      }

      var mixed = mixedRE.exec(input_string);
      if (mixed)
      {
        var sign          = '+';
        var whole_number  = mixed[2];
        var numerator     = mixed[5];
        var denominator   = mixed[8];
        var i             = null;
        if (mixed[1])
        {
          if (whole_number[0] === '-' || whole_number === '+')
          {
            sign = whole_number[0];
            whole_number = whole_number.substr(1);
          }
          for (i = 0; i < mixed[4]; i++)
          {
            whole_number = whole_number.concat('0');
          }
        }
        if (mixed[6])
        {
          for (i = 0; i < mixed[7]; i++)
          {
            numerator = numerator.concat('0');
          }
        }
        if (mixed[9])
        {
          for (i = 0; i < mixed[10]; i++)
          {
            denominator = denominator.concat('0');
          }
        }
        if (whole_number)
        {
           numerator = decimal_add(numerator, (decimal_multiply(whole_number, denominator, true)));
        }
        var value = decimal_divide(numerator, denominator, this.DECIMAL_RECURRENCE_LIMIT);
        if (sign === '-') {value.isNegative  = !value.isNegative;}
        this.isNegative              = value.isNegative;
        this.decimal_integer         = value.decimal_integer_part;
        this.decimal_fraction        = value.decimal_fraction_part;
        if ( value.decimal_recurrence_start >= 0 )
        {
          this.decimal_recurrence_start  = value.decimal_recurrence_start;
          this.decimal_recurrence = value.decimal_fraction_part.substr(value.decimal_recurrence_start);
        }
        this.syntax = "Rational or mixed decimal number";
        this.isValid = true;
        //  TODO convert to binary
        this.binary_integer = 'not implemented yet';
        this.binary_fraction = 'not implemented yet';
        this.binary_exponent = 0;
      }
      else
      {
        this.syntax = "Not a valid rational or mixed decimal number";
        this.isValid = false;
      }
      if (DEBUG) {console.log('  return ' + this.isValid);}
      return;
    };

  //  parse_real()
  //  ---------------------------------------------------------------------------------------------
  /*  Parse real numbers. Recurrences not possible.
   */
    this.parse_real = function (input_string)
    {
      if (DEBUG) {console.log('parse_real( ' + input_string + ' )');}
      this.isValid = false;
      //  TODO
      if (DEBUG) {console.log('  return ' + this.isValid);}
      return;
    };

  //  parse_binary()
  //  ---------------------------------------------------------------------------------------------
  /*  Parse binary numbers.
   */
    this.parse_binary = function (input_string)
    {
      if (DEBUG) {console.log('parse_binary( ' + input_string + ' )');}
      var matches = binRE.exec(input_string);
      if (null === matches)
      {
        this.syntax = 'invalid binary number';
        this.isValid = false;
        if (DEBUG) {console.log('  return invalid binary');}
        return;
      }
      this.isNegative = (typeof matches[1] !== 'undefined') && (matches[1] === '-');
      this.binary_integer   = matches[2] ? matches[2] : '0';
      this.binary_fraction  = matches[4] ? matches[4] : '0';
      this.binary_exponent  = (matches[6] ? matches[6] : 0) - 0;
      this.isValid = true;
      this.syntax = 'binary';
      binary_to_decimal(this);
      if (DEBUG) {console.log('  return valid binary');}
      return;
    };


  //  parse_hexadecimal()
  //  ---------------------------------------------------------------------------------------------
  /*  Parse binary32, binary64, and binary128 values.
   *
   *  IEEE-754-2008 Binary Formats:
   *          binary32    binary64    binary128
   *   Sign      1           1            1
   *   Exp       8          11           15
   *   #frac    23          52          112
   *   Emax   +127       +1023       +16383
   *   Emin   -126       -1022       -16382
   *            (Emin <==> 1 - Emax)
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
   *  An infinitely precise result with magnitude at least b^emax × (b − ½ × b^(1−p)) 
   *  shall round to ∞ with no change in sign.
   *  
   *  Rounding: roundTiesToEven is the default for binary format implementations, and is used here.
   *  User selectable:  roundTowardPositive
   *                    roundTowardNegative
   *                    roundTowardZero
   *    The first two may result in +∞ and -∞, respectively.
   */
    this.parse_hexadecimal = function (input_string)
    {
      if (DEBUG) {console.log('parse_hexadecimal( ' + input_string + ' )');}
      this.isValid = false;
      if (! /^[\da-f]+$/i.test(input_string))
      {
        this.syntax = 'IEEE-754: invalid hexadecimal character(s)';
        if (DEBUG) {console.log('  return invalid hex char(s)');}
        return;
      }
      if (! ((input_string.length === 8) || (input_string.length === 16) || (input_string.length === 32)) )
      {
        this.syntax = 'IEEE-754: invalid number of hexadecimal digits (' + input_string.length + ')';
        if (DEBUG) {console.log('  return invalid hex length');}
        return;
      }

      //  Any hex string of a proper length must be valid
      this.isValid = true;

      //  Convert hex string to binary string
      var hex_bits = [  '0000', '0001', '0010', '0011', '0100', '0101', '0110', '0111',
                        '1000', '1001', '1010', '1011', '1100', '1101', '1110', '1111' ];
      var raw_bits = '';
      for (var i = 0; i < input_string.length; i++)
      {
        var hex_val = input_string[i];
        switch (hex_val.toLowerCase())
        {
          case '0': case '1': case '2': case '3': case '4':
          case '5': case '6': case '7': case '8': case '9':
            break;
          case 'a': hex_val = 10; break;
          case 'b': hex_val = 11; break;
          case 'c': hex_val = 12; break;
          case 'd': hex_val = 13; break;
          case 'e': hex_val = 14; break;
          case 'f': hex_val = 15; break;
          default:
            this.syntax = 'IEEE invalid hex character: ' + hex_val;
            if (DEBUG) {console.log('  return invalid hex char');}
            return;
        }
        raw_bits += hex_bits[hex_val];
      }

      this.isNegative = raw_bits[0] === '1';
      var exponent_end = 9;
      var Emax = 127;
      if (input_string.length === 16)
      {
        exponent_end = 12;
        Emax = 1023;
      }
      if (input_string.length === 32)
      {
        exponent_end = 16;
        Emax = 16383;
      }
      var raw_exponent = raw_bits.substring(1, exponent_end);
      var raw_fraction = raw_bits.substring(exponent_end);

      //  Zero or Subnormal?
      if (raw_exponent === '0')
      {
        this.binary_integer = '0';
        if (/^0*$/.test(raw_fraction))
        {
          this.isZero   = true;
          this.binary_fraction  = '0';
          this.binary_exponent  =  0;
          this.decimal_integer  = '0';
          this.decimal_fraction = '0';
          this.decimal_exponent =  0;
          this.syntax = 'IEEE zero';
          if (DEBUG) {console.log('  return Zero');}
          return;
        }
        this.isZero = false;
        this.binary_fraction = raw_fraction;
        this.binary_exponent = 1 - Emax;
        this.syntax = 'IEEE-754: subnormal';
        binary_to_decimal(this);
        if (DEBUG) {console.log('  return Subnormal');}
        return;
      }

      //  Infinity?
      if (/^1*$/.test(raw_exponent))
      {
        if (/^0+$/.test(raw_fraction))
        {
          this.isInfinity = true;
          this.syntax = 'IEEE-754: Infinity';
          if (DEBUG) {console.log('  return Infinity');}
          return;
        }
        else
        {
          this.isNaN = true;
          this.isSignalling = raw_fraction[0] === '0';
          this.signalling_info = raw_fraction.substring(1);
          this.syntax = 'IEEE-754: NaN';
          if (DEBUG) {console.log('  return NaN');}
          return;
        }
      }
      //  Regular number
      this.binary_integer  = '1'; // hidden bit
      this.binary_fraction = raw_fraction;
      this.binary_exponent = raw_exponent - Emax;
      this.syntax = 'IEEE-754: normal value';
      binary_to_decimal(this);
      analyze(this);
      if (DEBUG) {console.log('  return normal');}
      return;
    };

  //  checkSpecialValue()
  //  -------------------------------------------------------------------------
  /*    Checks is a string is NaN or Infinity, and sets the proper fields if
   *    it is.
   */
    this.checkSpecialValue = function (input_string)
    {
      if (DEBUG) {console.log('checkSpecialValue( ' + input_string + ' )');}
      switch (input_string.toLowerCase())
      {
        case '+infinity':
        case 'infinity':
          this.isValid    = true;
          this.isInfinity = true;
          this.isNegative = false;
          this.syntax     = 'infinity';
          return;
        case '-infinity':
          this.isValid    = true;
          this.isInfinity = true;
          this.isNegative = true;
          this.syntax     = 'infinity';
          return;
        case 'qnan':
        case 'nan':
          this.isValid      = true;
          this.isNaN        = true;
          this.isSignalling = false;
          this.syntax       = 'NaN';
          return;
        case 'snan':
          this.isValid      = true;
          this.isNaN        = true;
          this.isSignalling = true;
          this.syntax       = 'NaN';
          return;
        default:
          this.syntax       = 'unknown';
          this.isValid      = false;
      }
      if (DEBUG) {console.log('  return ' + this.isValid );}
      return;
    };


  //  Instance Data
  //  =============================================================================================
  /*
   *  Abstract value information
   */
    this.isNegative                 = false;
    this.decimal_integer            = '0';
    this.decimal_fraction           = '0';
    this.binary_integer             = '0';
    this.binary_fraction            = '0';
    this.decimal_recurrence_start   = -1;
    this.decimal_recurrence         = '';
    this.decimal_exponent           = 0;
    this.binary_recurrence_start    = -1;
    this.binary_recurrence          = '';
    this.binary_exponent            = 0;
    this.signalling_info            = '';
    this.syntax                     = '';
    this.isValid                    = false;
    this.isZero                     = false;
    this.isInfinity                 = false;
    this.isNaN                      = false;
    this.isSignalling               = false;

  //  binary32 information
  //  ---------------------------------------------------------------------------------------------
    this.binary_32_exponent_value   = null;
    this.binary_32_exponent_bits    = '';
    this.binary_32_fraction_bits    = '';

  //  binary64 information
  //  ---------------------------------------------------------------------------------------------
    this.binary_64_exponent_value   = null;
    this.binary_64_exponent_bits    = '';
    this.binary_64_fraction_bits    = '';

  //  binary128 information
  //  ---------------------------------------------------------------------------------------------
    this.binary_128_exponent_value  = null;
    this.binary_128_exponent_bits   = '';
    this.binary128_fraction_bits    = '';

  //  Control/Display Parameters
  //  ---------------------------------------------------------------------------------------------
  this.DECIMAL_RECURRENCE_LIMIT      = 128;  //  How long to look for a decimal recurrence when
                                             //  evaluating mixed numbers.
  this.BINARY_DISPLAY_DIGITS_LIMIT   = 128;  //  Used by toString(2)
  this.DECIMAL_DISPLAY_DIGITS_LIMIT  = 128;  //  Used by toString(10)

  //  Constructor
  //  =============================================================================================
  if (typeof parse_as === "undefined")
  {
    this.parse_auto(input_string);
    console.log(objToString(this));
    return;
  }
  switch (parse_as)
  {
    case 2:   this.parse_binary(input_string);
              break;
    case 10:  this.parse_decimal(input_string);
              break;
    case 16:  this.parse_hexadecimal(input_string);
              break;
    default:  alert("Numeric_Value: " + parse_as + " is an invalid constructor value");
  }
}

  //  Numeric_Value.prototype (public) functions
  //  =============================================================================================
  //
  //  Numeric_Value.prototype.setBinaryDisplayDigits()
  //  ---------------------------------------------------------------------------------------------
  Numeric_Value.prototype.setBinaryDisplayDigits = function (newValue)
  {
    var oldValue = this.BINARY_DISPLAY_DIGITS_LIMIT;
    this.BINARY_DISPLAY_DIGITS_LIMIT = newValue;
    return oldValue;
  };

  //  Numeric_Value.prototype.setDecimalDisplayDigits()
  //  ---------------------------------------------------------------------------------------------
  Numeric_Value.prototype.setDecimalDisplayDigits = function (newValue)
  {
    var oldValue = this.DECIMAL_DISPLAY_DIGITS_LIMIT;
    this.DECIMAL_DISPLAY_DIGITS_LIMIT = newValue;
    return oldValue;
  };

  //  Numeric_Value.prototype.setDecimalRecurrenceLimit()
  //  ---------------------------------------------------------------------------------------------
  Numeric_Value.prototype.setDecimalRecurrenceLimit = function (newValue)
  {
    var oldValue = this.DECIMAL_RECURRENCE_LIMIT;
    this.DECIMAL_RECURRENCE_LIMIT = newValue;
    return oldValue;
  };

  //  Numeric_Value.prototype.getSyntax()
  //  ---------------------------------------------------------------------------------------------
  /*  Returns the syntax message string.
   */
    Numeric_Value.prototype.getSyntax = function () { return this.syntax; };

  //  Numeric_Value.prototype.toString()
  //  ---------------------------------------------------------------------------------------------
  //  Returns the string representation of the numeric value. The radix may be either 2 or 10; the
  //  value is always normalized with one digit to the left of the radix point. Special cases
  //  (s|q NaN; +|- infinity; invalid number) are handled.
  Numeric_Value.prototype.toString = function (radix)
  {
    if (DEBUG) {console.log('Numeric_Value.toString(' + radix + ')');}
    if (!this.isValid)    {return 'Not a recognized number';}
    if (this.isInfinity)  {return (this.isNegative ? '-' : '+') + 'Infinity';}
    if (this.isNaN)       {return (this.isSignalling ? 's' : 'q') + 'NaN';}

    var returnValue = (this.isNegative ? '-' : '');
    if (this.isZero)
    {
      returnValue += '0.0';
      if (DEBUG) {console.log('  return zero');}
      return returnValue;
    }

    if ((typeof radix !== "undefined") && (radix === 2))
    {
      //  Generate string representation of binary value
      //  NOTE: Max number of bits displayed is BINARY_DISPLAY_DIGITS_LIMIT plus 1 for integer part
      returnValue += this.binary_integer;
      if (this.binary_fraction !== '')
      {
        if (this.binary_recurrence_start < 0)
        {
          //  Fraction, but no recurrence
          returnValue += '.' + this.binary_fraction.substr(0, this.BINARY_DISPLAY_DIGITS_LIMIT);
          if (this.binary_fraction.length > this.BINARY_DISPLAY_DIGITS_LIMIT)
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
            this.binary_recurrence.substr(0, this.BINARY_DISPLAY_DIGITS_LIMIT);
          if (this.binary_recurrence.length > this.BINARY_DISPLAY_DIGITS_LIMIT)
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
      //  TODO: limit the total number of digits displayed, as for binary values above.
      returnValue += (this.decimal_integer);
      if (this.decimal_fraction !== '')
      {
        if (this.decimal_recurrence_start < 0)
        {
          // you are going to find a problem here: has repeating decimal and recurrence start have been merged
          // ...or should be once parsing is fixed up.
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
    return returnValue;
  };


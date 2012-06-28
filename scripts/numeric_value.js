/*    A Numeric_Value can be constructed from a string given in any of the following formats:
 *
 *      A decimal real number; scientific notation allowed.
 *      A mixed or rational number. All three elements of a mixed number (whole_part, numerator,
 *      denominator) must be integers but they may include positive exponents. The number itself 
 *      may be positive or negative.
 *      A binary number; scientific notation (with decimal exponents) allowed.
 *      An 8, 16, or 32 digit hexadecimal number representing IEEE-754 binary32, binary64, or 
 *      binary128 values.
 *
 *    Regardless of the construction format, the returned object will contain "lotsa" information 
 *    about the value.
 *
 *    Binary value are calculated with up to 128 bits of precision; decimal values up to 40 digits.
 *
 *    
 */
//  Development Support
//  ===========================================================================
var DEBUG = false;
var debug_spaces = [];
var debug_space = '';
for ( var i = 0; i < 32; i++)
{
  debug_spaces.push(debug_space);
  debug_space = i + ': ';
}
var debug_depth = 0;
if (typeof opera !== 'undefined')
{
  window.console = {};
  window.console.log = opera.postError;
}
// objToString()
// ---------------------------------------------------------------------------
/*
 * Debugging utility for displaying the properties of an object.
 */
function objToString(obj)
{
  var first = true, returnValue = '{';
  for ( var prop in obj)
  {
    if (typeof obj[prop] !== 'function')
    {
      returnValue += (first ? ' ' : ', ') + prop + ': ' + obj[prop];
      first = false;
    }
  }
  return returnValue + '}';
}
// get_JSON_DecValues_enhanced()
// ---------------------------------------------------------------------------------------------
/*
 * Makes an AJAX call
 */
function get_JSON_DecValues_enhanced(binary_integer, binary_exponent,
    binary_fraction)
{
  var my_JSON_object = {}; // initialize a JSON object
  var bi = binary_integer;
  var be = binary_exponent;
  var bf = binary_fraction;
  var http_request;
  if (window.XMLHttpRequest)
  {
    // code for IE7+, Firefox, Chrome, Opera, Safari
    http_request = new XMLHttpRequest();
  }
  else
  {
    // code for IE6, IE5
    http_request = new ActiveXObject("Microsoft.XMLHTTP");
  }
  http_request.open("POST", "computeDec.php", false);
  http_request.setRequestHeader("Content-type", "application/x-www-form-urlencoded"); // Opera
  http_request.send("binary_integer=" + bi + "&binary_exponent=" + be + "&binary_fraction=" + bf);
  my_JSON_object = JSON.parse(http_request.responseText);
  return my_JSON_object;
}

// getJSONenhanced()
// ---------------------------------------------------------------------------------------------
/*
 * Makes an AJAX call
 */
function getJSONenhanced(decimal_integer, decimal_exponent, decimal_fraction,
    decimal_recurrence, decimal_recurrence_start)
{
  var my_JSON_object = {}; // initialize a JSON object
  var di = decimal_integer;
  var de = decimal_exponent;
  var df = decimal_fraction;
  var dr = decimal_recurrence;
  var drs = decimal_recurrence_start;
  var http_request;
  if (window.XMLHttpRequest)
  {
    // code for IE7+, Firefox, Chrome, Opera, Safari
    http_request = new XMLHttpRequest();
  }
  else
  {
    // code for IE6, IE5
    http_request = new ActiveXObject("Microsoft.XMLHTTP");
  }
  http_request.open("POST", "computeBin.php", false);
  http_request.setRequestHeader("Content-type", "application/x-www-form-urlencoded"); // Opera
  http_request.send("decimal_integer=" + di + "&decimal_exponent=" + de
      + "&decimal_fraction=" + df + "&decimal_recurrence=" + dr
      + "&decimal_recurrence_start=" + drs);
  my_JSON_object = JSON.parse(http_request.responseText);
  return my_JSON_object;
}

// getJSON()
// ---------------------------------------------------------------------------------------------
/*
 * Makes an AJAX call
 */
function getJSON(decimal_integer)
{
  var my_JSON_object = {}; // initialize a JSON object
  var num = decimal_integer;
  var http_request;
  if (window.XMLHttpRequest)
  {// code for IE7+, Firefox, Chrome, Opera, Safari
    http_request = new XMLHttpRequest();
  }
  else
  {// code for IE6, IE5
    http_request = new ActiveXObject("Microsoft.XMLHTTP");
  }
  http_request.open("POST", "computeBin.php", false);
  http_request.setRequestHeader("Content-type", "application/x-www-form-urlencoded"); // Opera
  http_request.send("number=" + num);
  my_JSON_object = JSON.parse(http_request.responseText);
  return my_JSON_object.result;
}

// Numeric_Value
// ===============================================================================================
function Numeric_Value(input_string, parse_as, round_mode)
{
  if (DEBUG)
  {
    console.log('Numeric_Value( ' + input_string + ', ' + parse_as + ' )');
    debug_depth = 0;
  }
  // Numeric_Value private static data
  // =============================================================================================
  //
  // Regular expressions for input formats
  // ---------------------------------------------------------------------------------------------
  // Mixed
  var mixedRE = new RegExp("^\\s*([+\\-])?\\s*" + // optional sign
  "((\\d+)([Ee][+]?(\\d+))?\\s+)?" + // optional whole number
  "(\\+?(\\d+))\\s*([Ee]\\+?(\\d+))?\\s*" + // numerator
  "\\/\\s*" + // solidus for division slash
  "(\\+?(\\d+))\\s*([Ee]\\+?(\\d+))?\\s*$"); // denominator
  // Real
  var realRE = /^\s*([+\-])?(\d+)?(\.(\d*))?([Ee]([+\-]?\d+))?\s*$/;
  // Binary
  var binRE = /^\s*([+\-])?([01]+)?(\.([01]*))?([EeBb]([+\-]?[\d]+))?\s*$/;
  // Hexadecimal floating-point
  var hex32RE = /^\s*([0-9A-F]{8})\s*$/i;
  var hex64RE = /^\s*([0-9A-F]{16})\s*$/i;
  var hex128RE = /^\s*([0-9A-F]{32})\s*$/i;
  // Numeric_Value private static functions
  // =============================================================================================
  //
  // prepArgs()
  // ---------------------------------------------------------------------------
  /*
   * Convert strings of unsigned decimal digits into arrays of integers of equal
   * length. Index positions correspond to positional power of 10. (That is, the
   * digits are reversed).
   */
  var prepArgs = function()
  {
    if (DEBUG)
    {
      console.log(debug_spaces[++debug_depth] + 'prepArgs(' + arguments[0]
          + ', ' + arguments[1] + ')');
    }
    if (arguments.length !== 2 || arguments[0] === '' || arguments[1] === '')
    {
      throw 'prepArgs: missing or empty argument(s)';
    }
    var result =
    {
      sign1 : '+',
      arg1 : [],
      sign2 : '+',
      arg2 : []
    };
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
    while (arg1.length < arg2.length)
    {
      arg1 = '0'.concat(arg1);
    }
    while (arg2.length < arg1.length)
    {
      arg2 = '0'.concat(arg2);
    }
    for ( var i = 0; i < arg1.length; i++)
    {
      result.arg1.unshift(arg1.charAt(i) - 0);
      result.arg2.unshift(arg2.charAt(i) - 0);
    }
    if (DEBUG)
    {
      console.log(debug_spaces[debug_depth--] + 'prepArgs returns '
          + objToString(result));
    }
    return result;
  };

  // ltrim()
  // ---------------------------------------------------------------------------
  /*
   * Remove leading zeros from a numeric string.
   */
  var ltrim = function(arg)
  {
    if (DEBUG)
    {
      console.log(debug_spaces[++debug_depth] + 'ltrim(' + arg + ')');
    }
    var result = arg;
    while ((result.length > 1) && result.charAt(0) === '0')
    {
      result = result.substr(1);
    }
    if (DEBUG)
    {
      console.log(debug_spaces[debug_depth--] + 'ltrim returns ' + result);
    }
    return result;
  };

  // compare()
  // ---------------------------------------------------------------------------
  /*
   * Three-way compare the numeric values of two signed decimal strings.
   */
  var compare = function(arg1, arg2)
  {
    if (DEBUG)
    {
      console.log(debug_spaces[++debug_depth] + 'compare(' + arg1 + ', ' + arg2
          + ')');
    }
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
        if (DEBUG)
        {
          console.log(debug_spaces[debug_depth--] + 'compare returns +1');
        }
        return +1;
      case '-+':
        if (DEBUG)
        {
          console.log(debug_spaces[debug_depth--] + 'compare returns -1');
        }
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
    if (DEBUG)
    {
      console
          .log(debug_spaces[debug_depth--] + 'compare will return something');
    }
    if (a.length > b.length)
    {
      return +1;
    }
    if (a.length < b.length)
    {
      return -1;
    }
    for ( var i = 0; i < a.length; i++)
    {
      if (a[i] > b[i])
      {
        return +1;
      }
      if (a[i] < b[i])
      {
        return -1;
      }
    }
    return 0;
  };

  // decimal_subtract()
  // ---------------------------------------------------------------------------
  /*
   * Subtract the unsigned minuend from the unsigned subtrahend. The subtrahend
   * must be numerically larger than the minuend. Returns a string the length of
   * the subtrahend with leading zeros. Use the trim argument to trim the
   * leading zeros.
   */
  var decimal_subtract = function(arg1, arg2, trim)
  {
    if (DEBUG)
    {
      console.log(debug_spaces[++debug_depth] + 'decimal_subtract(' + arg1
          + ', ' + arg2 + ', ' + trim + ')');
    }
    var arrays = prepArgs(arg1, arg2);
    var subtrahend = arrays.arg1;
    var minuend = arrays.arg2;
    var diff = '';
    for ( var i = 0; i < subtrahend.length; i++)
    {
      var digit_diff = subtrahend[i] - minuend[i];
      if (digit_diff < 0)
      {
        digit_diff += 10;
        for ( var j = i + 1; j < subtrahend.length; j++)
        {
          subtrahend[j] -= 1;
          if (subtrahend[j] > -1)
          {
            break;
          }
          subtrahend[j] = 9;
        }
      }
      diff = String.fromCharCode(48 + digit_diff).concat(diff);
    }
    if (DEBUG)
    {
      console.log(debug_spaces[debug_depth--] + 'decimal_subtract returns '
          + (trim ? ltrim(diff) : diff));
    }
    if (trim)
    {
      return ltrim(diff);
    }
    return diff;
  };

  // decimal_add()
  // ---------------------------------------------------------------------------
  /*
   * Add the augend and addend.
   */
  var decimal_add = function(arg1, arg2, trim)
  {
    if (DEBUG)
    {
      console.log(debug_spaces[++debug_depth] + 'decimal_add(' + arg1 + ', '
          + arg2 + ', ' + trim + ')');
    }
    var values = prepArgs(arg1, arg2);
    var augend = values.arg1;
    var addend = values.arg2;
    // If signs of operands are different, it's subtraction.
    if (values.sign1 !== values.sign2)
    {
      if (arg1[0] === '-' || arg1[0] === '+')
      {
        arg1 = arg1.substr(1);
      }
      if (arg2[0] === '-' || arg2[0] === '+')
      {
        arg2 = arg2.substr(1);
      }
      var diff = '';
      if (compare(arg1, arg2) > 0)
      {
        diff = decimal_subtract(arg1, arg2, trim);
        diff = values.sign1.concat(diff);
      }
      else
      {
        diff = decimal_subtract(arg2, arg1, trim);
        diff = values.sign2.concat(diff);
      }
      if (DEBUG)
      {
        console
            .log(debug_spaces[debug_depth--] + 'decimal_add returns ' + diff);
      }
      return diff;
    }
    // It's addition
    var sum = '';
    var carry = 0;
    for ( var i = 0; i < augend.length; i++)
    {
      var digit_sum = augend[i] + addend[i] + carry;
      if (digit_sum > 9)
      {
        digit_sum -= 10;
        carry = 1;
      }
      else
      {
        carry = 0;
      }
      sum = String.fromCharCode(48 + digit_sum).concat(sum);
    }
    sum = String.fromCharCode(48 + carry).concat(sum);
    if (DEBUG)
    {
      console.log(debug_spaces[debug_depth--] + 'decimal_add returns '
          + (trim ? ltrim(sum) : sum));
    }
    return (trim ? ltrim(sum) : sum);
  };

  // decimal_divide()
  // ---------------------------------------------------------------------------
  /*
   * Signed division of divisor by dividend, giving integer and fraction parts.
   * The return object indicates where the recurrence starts, if found.
   * Algorithm (long division) Process optional sign characters of dividend and
   * divisor. Check for division by zero. Calculate the integer part: If the
   * divisor is larger than the dividend, the integer part is 0: the remainder
   * is the dividend; the current position is zero; goto F. I: The remainder is
   * the next n digits of the dividend, starting at the current position and
   * continuing for the number of digits in the divisor. Count how many times
   * you can sum the divisor without exceeding the remainder. Postpend that
   * count to the integer part, and subtract the sum from the remainder to get
   * the new remainder. Increment the current position. If there are enough
   * digits left in the dividend, goto I. Calculate the fraction part: F: Count
   * how many times you can sum the divisor without exceeding the dividend value
   * in the next n digits of the dividend. Postpend that count to the fraction
   * part, and subtract the sum from the remainder to get the new remainder. If
   * the remainder is zero, stop. If the remainder is on the remainder stack,
   * note that position as the recurrence start, and stop. Otherwise, increment
   * the current position and append the next digit of the dividend to the
   * remainder, or zero if there is none. If the fraction is shorter than
   * DECIMAL_PRECISION, goto F. Return a division_result object with the sign,
   * integer part, fraction part, and recurrence start position.
   */
  var decimal_divide = function(arg1, arg2, DECIMAL_PRECISION)
  {
    if (DEBUG)
    {
      console.log(debug_spaces[++debug_depth] + 'decimal_divide(' + arg1 + ', '
          + arg2 + ', ' + DECIMAL_PRECISION + ')');
    }
    var result =
    {
      isNegative : false,
      decimal_integer_part : '0',
      decimal_fraction_part : '',
      decimal_recurrence_start : -1,
      isInfinity : false,
      addToDecimalExponent : 0
    // not sure about this yet
    };
    var remainder = '';
    var remainders = [];
    var dividend_index = 0;
    var digit_value = 0;
    var dividend_sign = '+';
    var divisor_sign = '+';
    var dividend = arg1;
    var divisor = arg2;
    // Process signs of dividend and divisor
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
    // Divide by zero?
    if (compare(divisor, '0') === 0)
    {
      result.isInfinity = true;
      if (DEBUG)
      {
        console.log(debug_spaces[debug_depth--]
            + 'decimal_divide returns inifinity');
      }
      return result;
    }
    // Result less than 1?
    if (compare(dividend, divisor) < 0)
    {
      // yes; divisor is larger than dividend
      result.decimal_integer_part = '0';
      remainder = dividend;
    }
    else
    {
      // Integer Part
      remainder = dividend.substr(0, divisor.length); // here
      while ((dividend_index + divisor.length) <= dividend.length)
      {
        digit_value = 0;
        while (compare(remainder, divisor) >= 0)
        {
          digit_value++;
          remainder = decimal_subtract(remainder, divisor, true);
        }
        result.decimal_integer_part = result.decimal_integer_part.concat(String
            .fromCharCode(48 + digit_value));
        if (dividend_index + divisor.length < dividend.length)
        {
          remainder = ltrim(remainder.concat(dividend[dividend_index
              + divisor.length]));
        }
        dividend_index++;
      }
    }
    result.decimal_integer_part = ltrim(result.decimal_integer_part);
    if (result.decimal_integer_part === '0')
    {
      remainders[0] = remainder;
      while (result.decimal_fraction_part.length < DECIMAL_PRECISION)
      {
        // dividen_index is initially 0
        if ((dividend_index + divisor.length) < dividend.length)
        {
          remainder = remainder
              .concat(dividend[dividend_index + divisor.length]);
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
        result.decimal_fraction_part = result.decimal_fraction_part
            .concat(String.fromCharCode(48 + digit_value));
        remainder = ltrim(remainder);
        if (remainder === '0')
        {
          break;
        }
        for ( var i = 0; i < remainders.length; i++)
        {
          if (remainders[i] === remainder)
          {
            result.decimal_recurrence_start = i;
            break;
          }
        }
        if (result.decimal_recurrence_start > -1)
        {
          break;
        }
        remainders.push(remainder);
        dividend_index++;
        if (result.decimal_fraction_part.charAt(0) == 0)
        {
          result.addToDecimalExponent++;
        }
        result.decimal_fraction_part = ltrim(result.decimal_fraction_part);
      }
    }// if
    else
    {
      remainders[0] = remainder;
      while (result.decimal_fraction_part.length < DECIMAL_PRECISION)
      {
        if ((dividend_index + divisor.length) < dividend.length)
        {
          remainder = remainder
              .concat(dividend[dividend_index + divisor.length]);
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
        result.decimal_fraction_part = result.decimal_fraction_part
            .concat(String.fromCharCode(48 + digit_value));
        remainder = ltrim(remainder);
        if (remainder === '0')
        {
          break;
        }
        for ( var i = 0; i < remainders.length; i++)
        {
          if (remainders[i] === remainder)
          {
            result.decimal_recurrence_start = i;
            break;
          }
        }
        if (result.decimal_recurrence_start > -1)
        {
          break;
        }
        remainders.push(remainder);
        dividend_index++;
      }
    }
    if (DEBUG)
    {
      console.log(debug_spaces[debug_depth--] + 'decimal_divide returns '
          + objToString(result));
    }
    return result;
  };

  // decimal_divide2()
  // ---------------------------------------------------------------------------
  var decimal_divide2 = function(arg1, arg2, DECIMAL_PRECISION)
  {
    if (DEBUG)
    {
      console.log(debug_spaces[++debug_depth] + 'decimal_divide(' + arg1 + ', '
          + arg2 + ', ' + DECIMAL_PRECISION + ')');
    }
    var result =
    {
      isNegative : false,
      decimal_integer_part : '0',
      decimal_fraction_part : '',
      decimal_recurrence_start : -1,
      isInfinity : false
    };
    var remainder = '';
    var remainders = [];
    var dividend_index = 0;
    var digit_value = 0;
    var dividend_sign = '+';
    var divisor_sign = '+';
    var dividend = arg1;
    var divisor = arg2;
    // Process signs of dividend and divisor
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
    // Divide by zero?
    if (compare(divisor, '0') === 0)
    {
      result.isInfinity = true;
      if (DEBUG)
      {
        console.log(debug_spaces[debug_depth--]
            + 'decimal_divide returns inifinity');
      }
      return result;
    }
    // Result less than 1?
    if (compare(dividend, divisor) < 0)
    {
      // yes; divisor is larger than dividend
      result.decimal_integer_part = '0';
      remainder = dividend;
    }
    else
    {
      remainder = dividend.substr(0, divisor.length);
      while ((dividend_index + divisor.length) <= dividend.length)
      {
        digit_value = 0;
        while (compare(remainder, divisor) >= 0)
        {
          digit_value++;
          remainder = decimal_subtract(remainder, divisor, true);
        }
        result.decimal_integer_part = result.decimal_integer_part.concat(String
            .fromCharCode(48 + digit_value));
        if (dividend_index + divisor.length < dividend.length)
        {
          remainder = ltrim(remainder.concat(dividend[dividend_index + divisor.length]));
        }
        dividend_index++;
      }
    }
    result.decimal_integer_part = ltrim(result.decimal_integer_part);
    // Fraction Part
    remainders[0] = remainder;
    while (result.decimal_fraction_part.length < DECIMAL_PRECISION)
    {
      if ((dividend_index + divisor.length) < dividend.length)
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
      result.decimal_fraction_part = result.decimal_fraction_part.concat(String
          .fromCharCode(48 + digit_value));
      remainder = ltrim(remainder);
      if (remainder === '0')
      {
        break;
      }
      for ( var i = 0; i < remainders.length; i++)
      {
        if (remainders[i] === remainder)
        {
          result.decimal_recurrence_start = i;
          break;
        }
      }
      if (result.decimal_recurrence_start > -1)
      {
        break;
      }
      remainders.push(remainder);
      dividend_index++;
    }
    if (DEBUG)
    {
      console.log(debug_spaces[debug_depth--] + 'decimal_divide returns '
          + objToString(result));
    }
    return result;
  };

  // analyze()
  // ---------------------------------------------------------------------------------------------
  /*
   * Performs an IEEE-754 analysis of a numeric value.
   */
  var analyze = function(value)
  {
    if (value.isNaN)
    {
      if (value.binary_exponent === 128)
      {
        // need 255 so this ok
        value.binary_32_exponent_value = value.binary_exponent + 127;
        // need 2047 so add an additional 896 to the excess and binary exponent
        value.binary_64_exponent_value = value.binary_exponent + 1023 + 896;
        // need 32767 so add an additional 16256 to the excess and binary exponent
        value.binary_128_exponent_value = value.binary_exponent + 16383 + 16256;
      }
      else if (value.binary_exponent === 1024)
      {
        // need 255 so you subtract 769 from the binary exponent
        value.binary_32_exponent_value = value.binary_exponent - 769;
        // need 2047 so this is ok
        value.binary_64_exponent_value = value.binary_exponent + 1023;
        // need 32767 so add an additional 15360 to the excess and binary exponent
        value.binary_128_exponent_value = value.binary_exponent + 16383 + 15360;
      }
      else if (value.binary_exponent === 16384)
      {
        // need 255 so subtract 16129
        value.binary_32_exponent_value = value.binary_exponent - 16129;
        // need 2047 so subtract 14337
        value.binary_64_exponent_value = value.binary_exponent - 14337;
        // need 32767 so this is ok
        value.binary_128_exponent_value = value.binary_exponent + 16383;
      }
    }
    else if (!value.isNaN)
    { 
      // for all regular values
      value.binary_32_exponent_value = value.binary_exponent + 127;
      value.binary_64_exponent_value = value.binary_exponent + 1023;
      value.binary_128_exponent_value = value.binary_exponent + 16383;
    }
    if ((value.binary_exponent >= -126) && (value.binary_exponent <= 127))
    {
      // value is hex32 normal
    }
    if ((value.binary_exponent >= -149) && (value.binary_exponent <= -127))
    {
      value.isHex32Denormal = true;
    }
    if (value.binary_exponent <= -150)
    {
      value.isHex32Underflow = true;
    }
    if (value.binary_exponent > 127)
    {
      value.isHex32Overflow = true;
    }
    if ((value.binary_exponent >= -1022) && (value.binary_exponent <= 1023))
    {
      // value is hex64 normal
    }
    if ((value.binary_exponent >= -1074) && (value.binary_exponent <= -1023))
    {
      value.isHex64Denormal = true;
    }
    if (value.binary_exponent <= -1075)
    {
      value.isHex64Underflow = true;
    }
    if (value.binary_exponent > 1023)
    {
      value.isHex64Overflow = true;
    }
    if ((value.binary_exponent >= -16382) && (value.binary_exponent <= 16383))
    {
      // value is hex128 normal
    }
    if ((value.binary_exponent >= -16494) && (value.binary_exponent <= -16383))
    {
      value.isHex128Denormal = true;
    }
    if (value.binary_exponent <= -16495)
    {
      value.isHex128Underflow = true;
    }
    if (value.binary_exponent > 16383)
    {
      value.isHex128Overflow = true;
    }
    if (value.isHex32Denormal === true)
    {
      value.binary_32_exponent_value = value.binary_exponent; // equal to -126
    }
    if (value.isHex64Denormal === true)
    {
      value.binary_64_exponent_value = value.binary_exponent; // equal to -126
    }
    if (value.isHex128Denormal === true)
    {
      value.binary_128_exponent_value = value.binary_exponent; // equal to -126
    }

    // create local copies
    var decimal_integer     = value.decimal_integer;
    var decimal_exponent    = value.decimal_exponent;
    var decimal_fraction    = value.decimal_fraction;
    var binary_integer      = value.binary_integer;
    var binary_exponent     = value.binary_exponent;
    var binary_fraction     = value.binary_fraction;
    value.decimal_integer   = value.binary_32_exponent_value + '';
    value.decimal_exponent  = 0;
    value.decimal_fraction  = 0;
    gen_bin_from_dec2(value, 32);

    // now reassign the original values with the local copies
    value.decimal_integer   = decimal_integer;
    value.decimal_exponent  = decimal_exponent;
    value.decimal_fraction  = decimal_fraction;
    value.binary_integer    = binary_integer;
    value.binary_exponent   = binary_exponent;
    value.binary_fraction   = binary_fraction;

    // the local copies should still be the same so they are ok to use
    value.decimal_integer   = value.binary_64_exponent_value + '';
    value.decimal_exponent  = 0;
    value.decimal_fraction  = 0;
    gen_bin_from_dec2(value, 64);

    // now reassign the original values with the local copies
    value.decimal_integer   = decimal_integer;
    value.decimal_exponent  = decimal_exponent;
    value.decimal_fraction  = decimal_fraction;
    value.binary_integer    = binary_integer;
    value.binary_exponent   = binary_exponent;
    value.binary_fraction   = binary_fraction;

    // the local copies should still be the same so they are ok to use
    value.decimal_integer   = value.binary_128_exponent_value + '';
    value.decimal_exponent  = 0;
    value.decimal_fraction  = 0;
    gen_bin_from_dec2(value, 128);

    // now reassign the original values with the local copies
    value.decimal_integer   = decimal_integer;
    value.decimal_exponent  = decimal_exponent;
    value.decimal_fraction  = decimal_fraction;
    value.binary_integer    = binary_integer;
    value.binary_exponent   = binary_exponent;
    value.binary_fraction   = binary_fraction;
    if (value.isHex32Denormal === true)
    {
      value.binary_32_exponent_bits = '00000000';
    }
    if (value.isHex64Denormal === true)
    {
      value.binary_64_exponent_bits = '00000000000';
    }
    if (value.isHex128Denormal === true)
    {
      value.binary_128_exponent_bits = '000000000000000';
    }
    adjustFractionBits(value);
    value.binary_integer  = '1';
    value.binary_exponent = '0';
    value.binary_fraction = value.binary_32_fraction_bits;
    gen_dec_from_bin2(value, 32);

    // now reassign the original values with the local copies
    value.decimal_integer   = decimal_integer;
    value.decimal_exponent  = decimal_exponent;
    value.decimal_fraction  = decimal_fraction;
    value.binary_integer    = binary_integer;
    value.binary_exponent   = binary_exponent;
    value.binary_fraction   = binary_fraction;

    // the local should still be the same so they are ok to use
    value.binary_integer  = '1';
    value.binary_exponent = '0';
    value.binary_fraction = value.binary_64_fraction_bits;
    gen_dec_from_bin2(value, 64);

    // now reassign the original values with the local copies
    value.decimal_integer   = decimal_integer;
    value.decimal_exponent  = decimal_exponent;
    value.decimal_fraction  = decimal_fraction;
    value.binary_integer    = binary_integer;
    value.binary_exponent   = binary_exponent;
    value.binary_fraction   = binary_fraction;
    value.binary_integer    = '1';
    value.binary_exponent   = '0';
    value.binary_fraction   = value.binary_128_fraction_bits;
    gen_dec_from_bin2(value, 128);

    // now reassign the original values with the local copies
    value.decimal_integer   = decimal_integer;
    value.decimal_exponent  = decimal_exponent;
    value.decimal_fraction  = decimal_fraction;
    value.binary_integer    = binary_integer;
    value.binary_exponent   = binary_exponent;
    value.binary_fraction   = binary_fraction;
    value.hex_String32      = convertToHex(value, 32);
    value.hex_String64      = convertToHex(value, 64);
    value.hex_String128     = convertToHex(value, 128);
  };

  // adjustFractionBits()
  // ----------------------------------------------------------------------------------------------
  /*  Adjust the binary fraction bits depending on input and desired outputs
   *  TODO Correct integer/exponent on carry out from left.
   */
  var adjustFractionBits = function(value)
  {
    // assign the b32, b64, b128 fraction bits to initially be equal to the bf
    value.binary_32_fraction_bits = value.binary_fraction;
    value.binary_64_fraction_bits = value.binary_fraction;
    value.binary_128_fraction_bits = value.binary_fraction;

    // this if statement needed if you entered a decimal value that is subnormal
    if (value.parseAs === 10)
    {
      // decimal input
      if (value.isHex32Denormal === true)
      {
        value.binary_32_fraction_bits = value.binary_integer + value.binary_fraction; 
        // also need the binary integer in front of the binary fraction
        var move = -126 - value.binary_32_exponent_value;
        for ( var i = 1; i <= move - 2; i++)
        {
          // the minus 1 here is to compensate for the binary_integer we prepended to the front of
          // the binary fraction
          value.binary_32_fraction_bits = '0' + value.binary_32_fraction_bits;
        }
      }
      if (value.isHex64Denormal === true)
      {
        value.binary_64_fraction_bits = value.binary_integer + value.binary_fraction; 
        // also need the binary integer in front of the binary fraction
        var move = -1022 - value.binary_64_exponent_value;
        for ( var i = 1; i <= move - 2; i++)
        { 
          // the minus 1 here is to compensate for the binary_integer we prepended to the front of
          // the binary fraction
          value.binary_64_fraction_bits = '0' + value.binary_64_fraction_bits;
        }
      }
      if (value.isHex128Denormal === true)
      {
        value.binary_128_fraction_bits = value.binary_integer + value.binary_fraction; 
        // also need the binary integer in front of the binary fraction
        var move = -16382 - value.binary_128_exponent_value;
        for ( var i = 1; i <= move - 2; i++)
        { 
          // the minus 1 here is to compensate for the binary_integer we prepended to the front of
          // the binary fraction
          value.binary_128_fraction_bits = '0' + value.binary_128_fraction_bits;
        }
      }
    }
    else if (value.parseAs === 2)
    {
      // this is for binary inputs that are denormal
      if (value.isHex32Denormal === true)
      {
        var bf = value.binary_fraction;
        bf = value.binary_integer + bf;
        var be = value.binary_exponent;
        while (be < -127)
        {
          // End this while loop 1 place early to end up with 23 fraction bits and not 24 (an extra
          // leading 0) so change this from !==-126 to < -127
          bf = '0' + bf;
          be++;
        }
        value.binary_32_fraction_bits = bf;
      }
      if (value.isHex64Denormal === true)
      {
        var bf  = value.binary_fraction;
        bf      = value.binary_integer + bf;
        var be  = value.binary_exponent;
        while (be < -1023)
        {
          // End this while loop 1 place early to end up with 52 fraction bits
          // and not 53
          // (an extra leading 0) so this should be <-1023
          bf = '0' + bf;
          be++;
        }
        value.binary_64_fraction_bits = bf;
      }
      if (value.isHex128Denormal === true)
      {
        var bf = value.binary_fraction;
        bf = value.binary_integer + bf;
        var be = value.binary_exponent;
        while (be < -16383)
        {
          // End this while loop 1 place early to end up with 112 fraction bits and not 113 (an
          // extra leading 0) so this should be <-16383
          bf = '0' + bf;
          be++;
        }
        value.binary_128_fraction_bits = bf;
      }
    }
    // hex value is subnormal
    else
    {
      if (value.isHex32Denormal === true && value.inputType === 'hex32')
      {
        var spot = value.binary_64_fraction_bits.indexOf('1');
        value.binary_64_fraction_bits = value.binary_64_fraction_bits.substr(spot + 1); 
        // We want the string from the position right *after* the first 1, thats why used spot +1
        var spot = value.binary_128_fraction_bits.indexOf('1');
        value.binary_128_fraction_bits = value.binary_128_fraction_bits.substr(spot + 1); 
        // Want the string from the position right *after* the first 1, thats why used spot +1
      }
      if (value.isHex32Denormal === true && 
          (value.inputType === 'hex64' || value.inputType === 'hex128'))
      {
        value.binary_32_fraction_bits = value.binary_integer + value.binary_32_fraction_bits;
      }
      if (value.isHex64Denormal === true && value.inputType === 'hex64')
      {
        var spot = value.binary_128_fraction_bits.indexOf('1');
        value.binary_128_fraction_bits = value.binary_128_fraction_bits.substr(spot + 1); 
        // Want the string from the position right *after* the first 1, thats why used spot +1
      }
      if (value.isHex64Denormal === true && value.inputType === 'hex128')
      {
        value.binary_64_fraction_bits = value.binary_integer + value.binary_32_fraction_bits;
      }
      if (value.isHex128Denormal === true)
      {
         ;
      }
    }
    // hex32
    if (value.binary_fraction.length === 23 && value.inputType === 'hex32')
    {
      while (value.binary_64_fraction_bits.length < 52)
      {
        value.binary_64_fraction_bits += '0';
      }
      while (value.binary_128_fraction_bits.length < 112)
      {
        value.binary_128_fraction_bits += '0';
      }
    }
    else if (value.binary_fraction.length === 52 && value.inputType === 'hex64')
    {
      value.binary_32_fraction_bits = value.binary_32_fraction_bits.substr(0, 23);
      while (value.binary_128_fraction_bits.length < 112)
      {
        value.binary_128_fraction_bits += '0';
      }
    }
    else if (value.binary_fraction.length === 112 && value.inputType === 'hex128')
    {
      value.binary_32_fraction_bits = value.binary_32_fraction_bits.substr(0, 23);
      value.binary_64_fraction_bits = value.binary_64_fraction_bits.substr(0, 52);
    }
    else
    {
      // if you didnt enter a hexadecimal input you will come in here example inputs: 5 or 0.1
      var hex32_bits_needed = 0, hex64_bits_needed = 0, hex128_bits_needed = 0;
      if (value.binary_recurrence === '')
      {
        if (value.parseAs === 2 && value.isHex32Denormal)
        {
          // these two still use the binary_fraction because they are not denormal
          hex32_bits_needed   = 23 - value.binary_32_fraction_bits.length;
          hex64_bits_needed   = 52 - value.binary_fraction.length;
          hex128_bits_needed  = 112 - value.binary_fraction.length;
        }
        else if (value.parseAs === 2 && value.isHex64Denormal)
        {
          hex32_bits_needed   = 23 - value.binary_fraction.length;
          hex64_bits_needed   = 52 - value.binary_64_fraction_bits.length;
          hex128_bits_needed  = 112 - value.binary_fraction.length;
        }
        else if (value.parseAs === 2 && value.isHex128Denormal)
        {
          hex32_bits_needed   = 23 - value.binary_fraction.length;
          hex64_bits_needed   = 52 - value.binary_fraction.length;
          hex128_bits_needed  = 112 - value.binary_128_fraction_bits.length;
        }
        else
        {
          hex32_bits_needed   = 23 - value.binary_fraction.length;
          hex64_bits_needed   = 52 - value.binary_fraction.length;
          hex128_bits_needed  = 112 - value.binary_fraction.length;
        }
		
        // need 23
        for ( var i = 1; i <= hex32_bits_needed; i++)
        {
          value.binary_32_fraction_bits += '0';
        }
        // need 52
        for ( var i = 1; i <= hex64_bits_needed; i++)
        {
          value.binary_64_fraction_bits += '0';
        }
        // need 112
        for ( var i = 1; i <= hex128_bits_needed; i++)
        {
          value.binary_128_fraction_bits += '0';
        }
        if (hex32_bits_needed < 0)
        {
          // limit it to 23 bits if too long
          if (value.roundMode === 'rz')
          {
            // this is essentially truncation
            value.binary_32_fraction_bits = value.binary_32_fraction_bits.substr(0, 23);
          }
          else if (value.roundMode === 'rni')
          {
            // if you have a positive number you just truncate("round down") (same as rz), if you
            // have a negative number you round up
            if (value.isNegative)
            {
              // Value is negative so round up
              value.binary_32_fraction_bits = value.binary_32_fraction_bits.substr(0, 23);
              var index = 22;
              var i = value.binary_32_fraction_bits[index]; 
              // Look at the one to the left of the rounding bit
              while ((index != -1) && i === '1')
              {
                index--;
                i = value.binary_32_fraction_bits[index];
              }
			  if(index == -1)
			  {
				//the fraction was all 0s
				//this means that the rounding will not only affect the fraction bits but also the exponent bits 
				var expIndex = 7;
				var j = value.binary_32_exponent_bits[expIndex];
				while ((expIndex != -1) && j === '1')
				{
				  expIndex--;
				  j = value.binary_32_exponent_bits[expIndex];
				}
				value.binary_32_exponent_bits = value.binary_32_exponent_bits.substr(0, expIndex);
				value.binary_32_exponent_bits = value.binary_32_exponent_bits + '1';
				value.binary_32_exponent_bits = value.binary_32_exponent_bits.substr(0, expIndex + 1);
				while (value.binary_32_exponent_bits.length < 8)
				{
				  value.binary_32_exponent_bits += '0';
				}
				//also have to correct the decimal exponent part
				//this means converting the new b32 exponent bits into decimal and then finding the difference between the decimal value and the excess (127)
				
				var tempBI = value.binary_integer;
				var tempBE = value.binary_exponent;
				var tempBF = value.binary_fraction;				  
				value.binary_integer  = value.binary_32_exponent_bits;
				value.binary_exponent = '0';
				value.binary_fraction = '0';
				gen_dec_from_bin2(value, 'R32');
				
				//reassign from local values
				value.binary_integer = tempBI;
				value.binary_exponent = tempBE;
				value.binary_fraction = tempBF;
			  }
              value.binary_32_fraction_bits = value.binary_32_fraction_bits.substr(0, index);
              value.binary_32_fraction_bits = value.binary_32_fraction_bits + '1';
              value.binary_32_fraction_bits = value.binary_32_fraction_bits.substr(0, index + 1);
              while (value.binary_32_fraction_bits.length < 23)
              {
                value.binary_32_fraction_bits += '0';
              }
              value.binary_32_fraction_bits = value.binary_32_fraction_bits.substr(0, 23);
            } // if for negative numbers
            else
            {
              // your value is positive so truncate
              value.binary_32_fraction_bits = value.binary_32_fraction_bits.substr(0, 23);
            }
          } // else if for rni
          else if (value.roundMode === 'rpi')
          {
            // If positive, round up; if negative, truncate ("round down") (same as rz)
            if (value.isNegative)
            {
              // Value is negative so truncate
              value.binary_32_fraction_bits = value.binary_32_fraction_bits.substr(0, 23);
            } // if for negative numbers
            else
            {
              // Value is positive so round up
              value.binary_32_fraction_bits = value.binary_32_fraction_bits.substr(0, 23);
              var index = 22;
              var i = value.binary_32_fraction_bits[index];
              while ((index != -1) && i === '1')
              {
                index--;
                i = value.binary_32_fraction_bits[index];
              }
			  if(index == -1)
			  {
				//the fraction was all 0s
				//this means that the rounding will not only affect the fraction bits but also the exponent bits 
				var expIndex = 7;
				var j = value.binary_32_exponent_bits[expIndex];
				while ((expIndex != -1) && j === '1')
				{
				  expIndex--;
				  j = value.binary_32_exponent_bits[expIndex];
				}
				value.binary_32_exponent_bits = value.binary_32_exponent_bits.substr(0, expIndex);
				value.binary_32_exponent_bits = value.binary_32_exponent_bits + '1';
				value.binary_32_exponent_bits = value.binary_32_exponent_bits.substr(0, expIndex + 1);
				while (value.binary_32_exponent_bits.length < 8)
				{
				  value.binary_32_exponent_bits += '0';
				}
				//also have to correct the decimal exponent part
				//this means converting the new b32 exponent bits into decimal and then finding the difference between the decimal value and the excess (127)
				
				var tempBI = value.binary_integer;
				var tempBE = value.binary_exponent;
				var tempBF = value.binary_fraction;				  
				value.binary_integer  = value.binary_32_exponent_bits;
				value.binary_exponent = '0';
				value.binary_fraction = '0';
				gen_dec_from_bin2(value, 'R32');
				
				//reassign from local values
				value.binary_integer = tempBI;
				value.binary_exponent = tempBE;
				value.binary_fraction = tempBF;
			  }
              value.binary_32_fraction_bits = value.binary_32_fraction_bits.substr(0, index);
              value.binary_32_fraction_bits = value.binary_32_fraction_bits + '1';
              value.binary_32_fraction_bits = value.binary_32_fraction_bits.substr(0, index + 1);
              while (value.binary_32_fraction_bits.length < 23)
              {
                value.binary_32_fraction_bits += '0';
              }
              value.binary_32_fraction_bits = value.binary_32_fraction_bits.substr(0, 23);
            } // else for positive numbers
          } // else if for rpi
          else//rnv
          {
            value.binary_32_fraction_bits = value.binary_32_fraction_bits.substr(0, 24); 
            // Include one extra bit for rounding
            if (value.binary_32_fraction_bits[23] === '0')
            {
              // it is the 23 spot because it starts at 0 if the far right bit is 0 then we can just
              // truncate back to 23 bits because it essentially rounds down to place
              value.binary_32_fraction_bits = value.binary_32_fraction_bits.substr(0, 23);
            }
            else
            {
              var index = 22;
              var i = value.binary_32_fraction_bits[index]; 
              // Look at the one to the left of the rounding bit
              while ((index != -1) && i === '1')
              {
                index--;
                i = value.binary_32_fraction_bits[index];
              }
			  if(index == -1)
			  {
				//the fraction was all 0s
				//this means that the rounding will not only affect the fraction bits but also the exponent bits 
				var expIndex = 7;
				var j = value.binary_32_exponent_bits[expIndex];
				while ((expIndex != -1) && j === '1')
				{
				  expIndex--;
				  j = value.binary_32_exponent_bits[expIndex];
				}
				value.binary_32_exponent_bits = value.binary_32_exponent_bits.substr(0, expIndex);
				value.binary_32_exponent_bits = value.binary_32_exponent_bits + '1';
				value.binary_32_exponent_bits = value.binary_32_exponent_bits.substr(0, expIndex + 1);
				while (value.binary_32_exponent_bits.length < 8)
				{
				  value.binary_32_exponent_bits += '0';
				}
				//also have to correct the decimal exponent part
				//this means converting the new b32 exponent bits into decimal and then finding the difference between the decimal value and the excess (127)
				
				var tempBI = value.binary_integer;
				var tempBE = value.binary_exponent;
				var tempBF = value.binary_fraction;				  
				value.binary_integer  = value.binary_32_exponent_bits;
				value.binary_exponent = '0';
				value.binary_fraction = '0';//value.binary_32_exponent_bits;
				gen_dec_from_bin2(value, 'R32');
				
				//reassign from local values
				value.binary_integer = tempBI;
				value.binary_exponent = tempBE;
				value.binary_fraction = tempBF;
				
			  }
              value.binary_32_fraction_bits = value.binary_32_fraction_bits.substr(0, index);
              value.binary_32_fraction_bits = value.binary_32_fraction_bits + '1';
              value.binary_32_fraction_bits = value.binary_32_fraction_bits.substr(0, index + 1);
              while (value.binary_32_fraction_bits.length < 23)
              {
                value.binary_32_fraction_bits += '0';
              }
              value.binary_32_fraction_bits = value.binary_32_fraction_bits.substr(0, 23);
            }
          }
        }
        if (hex64_bits_needed < 0)
        {
          // limit it to 52 bits if too long
          if (value.roundMode === 'rz')
          {
            value.binary_64_fraction_bits = value.binary_64_fraction_bits.substr(0, 52);
          }
          else if (value.roundMode === 'rni')
          {
            // If positive, truncate ("round down") (same as rz); if negative, round up
            if (value.isNegative)
            {
              // Value is negative so round up
              value.binary_64_fraction_bits = value.binary_64_fraction_bits.substr(0, 52);
              var index = 51;
              var i = value.binary_64_fraction_bits[index];
              while ((index != -1) && i === '1')
              {
                index--;
                i = value.binary_64_fraction_bits[index];
              }
			  if(index == -1)
			  {
				//the fraction was all 0s
				//this means that the rounding will not only affect the fraction bits but also the exponent bits
				var expIndex = 10;
				var j = value.binary_64_exponent_bits[expIndex];
				while ((expIndex != -1) && j === '1')
				{
				  expIndex--;
				  j = value.binary_64_exponent_bits[expIndex];
				}
				value.binary_64_exponent_bits = value.binary_64_exponent_bits.substr(0, expIndex);
				value.binary_64_exponent_bits = value.binary_64_exponent_bits + '1';
				value.binary_64_exponent_bits = value.binary_64_exponent_bits.substr(0, expIndex + 1);
				while (value.binary_64_exponent_bits.length < 11)
				{
				  value.binary_64_exponent_bits += '0';
				}
				//also have to correct the decimal exponent part
				//this means converting the new b64 exponent bits into decimal and then finding the difference between the decimal value and the excess (127)
				
				var tempBI = value.binary_integer;
				var tempBE = value.binary_exponent;
				var tempBF = value.binary_fraction;				  
				value.binary_integer  = value.binary_64_exponent_bits;
				value.binary_exponent = '0';
				value.binary_fraction = '0';
				gen_dec_from_bin2(value, 'R64');
				
				//reassign from local values
				value.binary_integer = tempBI;
				value.binary_exponent = tempBE;
				value.binary_fraction = tempBF;
			  }
              value.binary_64_fraction_bits = value.binary_64_fraction_bits.substr(0, index);
              value.binary_64_fraction_bits = value.binary_64_fraction_bits + '1';
              value.binary_64_fraction_bits = value.binary_64_fraction_bits.substr(0, index + 1);
              while (value.binary_64_fraction_bits.length < 52)
              {
                value.binary_64_fraction_bits += '0';
              }
              value.binary_64_fraction_bits = value.binary_64_fraction_bits
                  .substr(0, 52);
            }
            else
            {
              // Value is positive so truncate
              value.binary_64_fraction_bits = value.binary_64_fraction_bits.substr(0, 52);
            }
          }
          else if (value.roundMode === 'rpi')
          {
            if (value.isNegative)
            {
              // Value is negative so truncate
              value.binary_64_fraction_bits = value.binary_64_fraction_bits.substr(0, 52);
            }
            else
            {
              // Value is positive so round up
              value.binary_64_fraction_bits = value.binary_64_fraction_bits.substr(0, 52);
              var index = 51;
              var i = value.binary_64_fraction_bits[index]; 
              // Look at the one to the left of the rounding bit
              while ((index != -1) && i === '1')
              {
                index--;
                i = value.binary_64_fraction_bits[index];
              }
			  if(index == -1)
			  {
				//the fraction was all 0s
				//this means that the rounding will not only affect the fraction bits but also the exponent bits (maybe)
				var expIndex = 10;
				var j = value.binary_64_exponent_bits[expIndex];
				while ((expIndex != -1) && j === '1')
				{
				  expIndex--;
				  j = value.binary_64_exponent_bits[expIndex];
				}
				value.binary_64_exponent_bits = value.binary_64_exponent_bits.substr(0, expIndex);
				value.binary_64_exponent_bits = value.binary_64_exponent_bits + '1';
				value.binary_64_exponent_bits = value.binary_64_exponent_bits.substr(0, expIndex + 1);
				while (value.binary_64_exponent_bits.length < 11)
				{
				  value.binary_64_exponent_bits += '0';
				}
				//also have to correct the decimal exponent part
				//this means converting the new b64 exponent bits into decimal and then finding the difference between the decimal value and the excess (127)
				
				var tempBI = value.binary_integer;
				var tempBE = value.binary_exponent;
				var tempBF = value.binary_fraction;				  
				value.binary_integer  = value.binary_64_exponent_bits;
				value.binary_exponent = '0';
				value.binary_fraction = '0';
				gen_dec_from_bin2(value, 'R64');
				
				//reassign from local values
				value.binary_integer = tempBI;
				value.binary_exponent = tempBE;
				value.binary_fraction = tempBF;
			  }
              value.binary_64_fraction_bits = value.binary_64_fraction_bits.substr(0, index);
              value.binary_64_fraction_bits = value.binary_64_fraction_bits + '1';
              value.binary_64_fraction_bits = value.binary_64_fraction_bits.substr(0, index + 1);
              while (value.binary_64_fraction_bits.length < 52)
              {
                value.binary_64_fraction_bits += '0';
              }
              value.binary_64_fraction_bits = value.binary_64_fraction_bits.substr(0, 52);
            }
          }
          else//rnv
          {
            // Include one extra bit for rounding
            value.binary_64_fraction_bits = value.binary_64_fraction_bits.substr(0, 53);
            if (value.binary_64_fraction_bits[52] === '0')
            {
              // it is the 52 spot because it starts at 0 if the far right bit is 0 then we can just
              // truncate back to 52 bits because it essentially rounds down to place
              value.binary_64_fraction_bits = value.binary_64_fraction_bits.substr(0, 52);
            }
            else
            {
              var index = 51;
              var i = value.binary_64_fraction_bits[index]; 
              
              // Look at the one to the left of the rounding bit
              while ((index != -1) && i === '1')
              {
                index--;
                i = value.binary_64_fraction_bits[index];
              }
			  if(index == -1)
			  {
				//the fraction was all 0s
				//this means that the rounding will not only affect the fraction bits but also the exponent bits 
				var expIndex = 10;
				var j = value.binary_64_exponent_bits[expIndex];
				while ((expIndex != -1) && j === '1')
				{
				  expIndex--;
				  j = value.binary_64_exponent_bits[expIndex];
				}
				value.binary_64_exponent_bits = value.binary_64_exponent_bits.substr(0, expIndex);
				value.binary_64_exponent_bits = value.binary_64_exponent_bits + '1';
				value.binary_64_exponent_bits = value.binary_64_exponent_bits.substr(0, expIndex + 1);
				while (value.binary_64_exponent_bits.length < 11)
				{
				  value.binary_64_exponent_bits += '0';
				}
				//also have to correct the decimal exponent part
				//this means converting the new b64 exponent bits into decimal and then finding the difference between the decimal value and the excess (127)
				
				var tempBI = value.binary_integer;
				var tempBE = value.binary_exponent;
				var tempBF = value.binary_fraction;				  
				value.binary_integer  = value.binary_64_exponent_bits;
				value.binary_exponent = '0';
				value.binary_fraction = '0';
				gen_dec_from_bin2(value, 'R64');
				
				//reassign from local values
				value.binary_integer = tempBI;
				value.binary_exponent = tempBE;
				value.binary_fraction = tempBF;
			  }
              value.binary_64_fraction_bits = value.binary_64_fraction_bits.substr(0, index);
              value.binary_64_fraction_bits = value.binary_64_fraction_bits + '1';
              value.binary_64_fraction_bits = value.binary_64_fraction_bits.substr(0, index + 1);
              while (value.binary_64_fraction_bits.length < 52)
              {
                value.binary_64_fraction_bits += '0';
              }
              value.binary_64_fraction_bits = value.binary_64_fraction_bits.substr(0, 52);
            }
          }
        }
        if (hex128_bits_needed < 0)
        {
          // limit it to 112 bits if too long
          if (value.roundMode === 'rz')
          {
            value.binary_128_fraction_bits = value.binary_128_fraction_bits.substr(0, 112);
          }
          else if (value.roundMode === 'rni')
          {
            if (value.isNegative)
            {
              // Value is negative so round up
              value.binary_128_fraction_bits = value.binary_128_fraction_bits.substr(0, 112);
              var index = 111;
              var i = value.binary_128_fraction_bits[index]; 
              // Look at the one to the left of the rounding bit
              while ((index != -1) && i === '1')
              {
                index--;
                i = value.binary_128_fraction_bits[index];
              }
			  if(index == -1)
			  {
				//the fraction was all 0s
				//this means that the rounding will not only affect the fraction bits but also the exponent bits 
				var expIndex = 14;
				var j = value.binary_128_exponent_bits[expIndex];
				while ((expIndex != -1) && j === '1')
				{
				  expIndex--;
				  j = value.binary_128_exponent_bits[expIndex];
				}
				value.binary_128_exponent_bits = value.binary_128_exponent_bits.substr(0, expIndex);
				value.binary_128_exponent_bits = value.binary_128_exponent_bits + '1';
				value.binary_128_exponent_bits = value.binary_128_exponent_bits.substr(0, expIndex + 1);
				while (value.binary_128_exponent_bits.length < 15)
				{
				  value.binary_128_exponent_bits += '0';
				}
				//also have to correct the decimal exponent part
				//this means converting the new b128 exponent bits into decimal and then finding the difference between the decimal value and the excess (127)
				
				var tempBI = value.binary_integer;
				var tempBE = value.binary_exponent;
				var tempBF = value.binary_fraction;				  
				value.binary_integer  = value.binary_128_exponent_bits;
				value.binary_exponent = '0';
				value.binary_fraction = '0';
				gen_dec_from_bin2(value, 'R128');
				
				//reassign from local values
				value.binary_integer = tempBI;
				value.binary_exponent = tempBE;
				value.binary_fraction = tempBF;
			  }
              value.binary_128_fraction_bits = value.binary_128_fraction_bits.substr(0, index);
              value.binary_128_fraction_bits = value.binary_128_fraction_bits + '1';
              value.binary_128_fraction_bits = value.binary_128_fraction_bits.substr(0, index + 1);
              while (value.binary_128_fraction_bits.length < 112)
              {
                value.binary_128_fraction_bits += '0';
              }
              value.binary_128_fraction_bits = value.binary_128_fraction_bits.substr(0, 112);
            }
            else
            {
              // Value is positive so truncate
              value.binary_128_fraction_bits = value.binary_128_fraction_bits.substr(0, 112);
            }
          }
          else if (value.roundMode === 'rpi')
          {
            if (value.isNegative)
            {
              // Value is negative so truncate
              value.binary_128_fraction_bits = value.binary_128_fraction_bits.substr(0, 112);
            }
            else
            {
              // Value is positive so round up
              value.binary_128_fraction_bits = value.binary_128_fraction_bits
                  .substr(0, 112);
              var index = 111;
              var i = value.binary_128_fraction_bits[index]; 
              // Look at the one to the left of the rounding bit
              while ((index != -1) && i === '1')
              {
                index--;
                i = value.binary_128_fraction_bits[index];
              }
			  if(index == -1)
			  {
				//the fraction was all 0s
				//this means that the rounding will not only affect the fraction bits but also the exponent bits 
				var expIndex = 14;
				var j = value.binary_128_exponent_bits[expIndex];
				while ((expIndex != -1) && j === '1')
				{
				  expIndex--;
				  j = value.binary_128_exponent_bits[expIndex];
				}
				value.binary_128_exponent_bits = value.binary_128_exponent_bits.substr(0, expIndex);
				value.binary_128_exponent_bits = value.binary_128_exponent_bits + '1';
				value.binary_128_exponent_bits = value.binary_128_exponent_bits.substr(0, expIndex + 1);
				while (value.binary_128_exponent_bits.length < 15)
				{
				  value.binary_128_exponent_bits += '0';
				}
				//also have to correct the decimal exponent part
				//this means converting the new b128 exponent bits into decimal and then finding the difference between the decimal value and the excess (127)
				
				var tempBI = value.binary_integer;
				var tempBE = value.binary_exponent;
				var tempBF = value.binary_fraction;				  
				value.binary_integer  = value.binary_128_exponent_bits;
				value.binary_exponent = '0';
				value.binary_fraction = '0';
				gen_dec_from_bin2(value, 'R128');
				
				//reassign from local values
				value.binary_integer = tempBI;
				value.binary_exponent = tempBE;
				value.binary_fraction = tempBF;
			  }
              value.binary_128_fraction_bits = value.binary_128_fraction_bits.substr(0, index);
              value.binary_128_fraction_bits = value.binary_128_fraction_bits + '1';
              value.binary_128_fraction_bits = value.binary_128_fraction_bits.substr(0, index + 1);
              while (value.binary_128_fraction_bits.length < 112)
              {
                value.binary_128_fraction_bits += '0';
              }
              value.binary_128_fraction_bits = value.binary_128_fraction_bits.substr(0, 112);
            }
          }
          else//rnv
          {
            // Include one extra bit for rounding
            value.binary_128_fraction_bits = value.binary_128_fraction_bits.substr(0, 113); 
            if (value.binary_128_fraction_bits[112] === '0')
            {
              // it is the 52 spot because it starts at 0 if the far right bit is 0 then we can just
              // truncate back to 23 bits because it essentially rounds down to place
              value.binary_128_fraction_bits = value.binary_128_fraction_bits.substr(0, 112);
            }
            else
            {
              var index = 111;
              var i = value.binary_128_fraction_bits[index]; 
              // Look at the one to the left of the rounding bit
              while ((index != -1) && i === '1')
              {
                index--;
                i = value.binary_128_fraction_bits[index];
              }
			  if(index == -1)
			  {
				//the fraction was all 0s
				//this means that the rounding will not only affect the fraction bits but also the exponent bits 
				var expIndex = 14;
				var j = value.binary_128_exponent_bits[expIndex];
				while ((expIndex != -1) && j === '1')
				{
				  expIndex--;
				  j = value.binary_128_exponent_bits[expIndex];
				}
				value.binary_128_exponent_bits = value.binary_128_exponent_bits.substr(0, expIndex);
				value.binary_128_exponent_bits = value.binary_128_exponent_bits + '1';
				value.binary_128_exponent_bits = value.binary_128_exponent_bits.substr(0, expIndex + 1);
				while (value.binary_128_exponent_bits.length < 15)
				{
				  value.binary_128_exponent_bits += '0';
				}
				//also have to correct the decimal exponent part
				//this means converting the new b128 exponent bits into decimal and then finding the difference between the decimal value and the excess (127)
				
				var tempBI = value.binary_integer;
				var tempBE = value.binary_exponent;
				var tempBF = value.binary_fraction;				  
				value.binary_integer  = value.binary_128_exponent_bits;
				value.binary_exponent = '0';
				value.binary_fraction = '0';
				gen_dec_from_bin2(value, 'R128');
				
				//reassign from local values
				value.binary_integer = tempBI;
				value.binary_exponent = tempBE;
				value.binary_fraction = tempBF;
			  }
              value.binary_128_fraction_bits = value.binary_128_fraction_bits.substr(0, index);
              value.binary_128_fraction_bits = value.binary_128_fraction_bits + '1';
              value.binary_128_fraction_bits = value.binary_128_fraction_bits.substr(0, index + 1);
              while (value.binary_128_fraction_bits.length < 112)
              {
                value.binary_128_fraction_bits += '0';
              }
              value.binary_128_fraction_bits = value.binary_128_fraction_bits.substr(0, 112);
            }
          }
        }
      }
      else
      {
        // if there is a recurrence we dont simply want to append 0s and instead want to repeat the
        // recurring bits handles the b32 fraction bits
        var string = value.binary_fraction;
        while (string.length <= 24)
        {
          string = string + value.binary_recurrence;
        }
        if (value.roundMode === 'rz')
        {
          if (string.length > 23)
          {
            // this if is in case we accidently go over the limit by a few digits
            string = string.substr(0, 23);
          }
          value.binary_32_fraction_bits = string;
        }
        else if (value.roundMode === 'rni')
        {
          // If positive, truncate ("round down") (same as rz); if negative, round up
          if (value.isNegative)
          {
            if (string.length > 23)
            {
              string = string.substr(0, 23);
            }
            var index = 22;
            if (string.charAt(index) === '0')
            {
              string = string.substr(0, 22);
              string = string.concat('1');
            }
            else
            {
              var starr = [];
              starr = string.split('');
              string = '';
              while (starr[index] === '1' && (index > -1))
              {
                starr[index] = '0';
                index--;
              }
              starr[index] = '1';
              for ( var i = 0; i <= 22; i++)
              {
                string = string.concat(starr[i]);
              }
            }
            value.binary_32_fraction_bits = string;
          } // if negative
          else
          {
            // Value is positive, just truncate
            if (string.length > 23)
            {
              string = string.substr(0, 23);
            }
            value.binary_32_fraction_bits = string;
          }
        }
        else if (value.roundMode === 'rpi')
        {
          if (value.isNegative)
          {
            // Value is negative so truncate
            if (string.length > 23)
            {
              string = string.substr(0, 23);
            }
            value.binary_32_fraction_bits = string;
          }
          else
          {
            // Value is positive so round up
            if (string.length > 23)
            {
              string = string.substr(0, 23);
            }
            var index = 22;
            if (string.charAt(index) === '0')
            {
              string = string.substr(0, 22);
              string = string.concat('1');
            }
            else
            {
              var starr = [];
              starr = string.split('');
              string = '';
              while (starr[index] === '1' && (index > -1))
              {
                starr[index] = '0';
                index--;
              }
              starr[index] = '1';
              for ( var i = 0; i <= 22; i++)
              {
                string = string.concat(starr[i]);
              }
            }
            value.binary_32_fraction_bits = string;
          } // else is positive
        }
        else if (value.roundMode === 'rnv')
        {
          if (string.length > 24)
          {
            // This if is in case we accidently go over the limit by a few digits
            string = string.substr(0, 24);
          }
          value.binary_32_fraction_bits = string;
          if (value.binary_32_fraction_bits[23] === '0')
          {
            // it is the 23 spot because it starts at 0 if the far right bit is 0 then we can just
            // truncate back to 23 bits because it essentially rounds down to place
            value.binary_32_fraction_bits = value.binary_32_fraction_bits.substr(0, 23);
          }
          else
          {
            var index = 22;
            var i = value.binary_32_fraction_bits[index];
            // Look at the one to the left of the rounding bit
            while ((index != -1) && i === '1')
            {
              index--;
              i = value.binary_32_fraction_bits[index];
            }
            value.binary_32_fraction_bits = value.binary_32_fraction_bits.substr(0, index);
            value.binary_32_fraction_bits = value.binary_32_fraction_bits + '1';
            value.binary_32_fraction_bits = value.binary_32_fraction_bits.substr(0, index + 1);
            while (value.binary_32_fraction_bits.length < 23)
            {
              value.binary_32_fraction_bits += '0';
            }
            value.binary_32_fraction_bits = value.binary_32_fraction_bits.substr(0, 23);
          }
        }
        var string = value.binary_fraction;
        while (string.length <= 53)
        {
          string = string + value.binary_recurrence;
        }
        if (value.roundMode === 'rz')
        {
          if (string.length > 52)
          { 
            // this if is in case we accidently go over the limit by a few digits
            string = string.substr(0, 52);
          }
          value.binary_64_fraction_bits = string;
        }
        else if (value.roundMode === 'rni')
        {
          if (value.isNegative)
          {
            // Value is negative so round up
            if (string.length > 52)
            {
              string = string.substr(0, 52);
            }
            var index = 51;
            if (string.charAt(index) === '0')
            {
              string = string.substr(0, 51);
              string = string.concat('1');
            }
            else
            {
              var starr = [];
              starr = string.split('');
              string = '';
              while (starr[index] === '1' && (index > -1))
              {
                starr[index] = '0';
                index--;
              }
              starr[index] = '1';
              for ( var i = 0; i <= 51; i++)
              {
                string = string.concat(starr[i]);
              }
            }
            value.binary_64_fraction_bits = string;
          }
          else
          {
            // Value is positive so truncate
            if (string.length > 52)
            {
              string = string.substr(0, 52);
            }
            value.binary_64_fraction_bits = string;
          }
        }
        else if (value.roundMode === 'rpi')
        {
          if (value.isNegative)
          {
            // Value is negative so truncate
            if (string.length > 52)
            {
              string = string.substr(0, 52);
            }
            value.binary_64_fraction_bits = string;
          }
          else
          {
            // Value is positive so round up
            if (string.length > 52)
            {
              string = string.substr(0, 52);
            }
            var index = 51;
            if (string.charAt(index) === '0')
            {
              string = string.substr(0, 51);
              string = string.concat('1');
            }
            else
            {
              var starr = [];
              starr = string.split('');
              string = '';
              while (starr[index] === '1' && (index > -1))
              {
                starr[index] = '0';
                index--;
              }
              starr[index] = '1';
              for ( var i = 0; i <= 51; i++)
              {
                string = string.concat(starr[i]);
              }
            }
            value.binary_64_fraction_bits = string;
          }
        }
        else if (value.roundMode === 'rnv')
        {
          if (string.length > 53)
          { 
            // this if is in case we accidently go over the limit by a few digits
            string = string.substr(0, 53);
          }
          value.binary_64_fraction_bits = string;
          if (value.binary_64_fraction_bits[52] === '0')
          {
            // it is the 52 spot because it starts at 0 if the far right bit is 0 then we can just
            // truncate back to 23 bits because it essentially rounds down to place
            value.binary_64_fraction_bits = value.binary_64_fraction_bits.substr(0, 52);
          }
          else
          {
            var index = 51;
            var i = value.binary_64_fraction_bits[index]; 
            // Look at the one to the left of the rounding bit
            while ((index != -1) && i === '1')
            {
              index--;
              i = value.binary_64_fraction_bits[index];
            }
            value.binary_64_fraction_bits = value.binary_64_fraction_bits.substr(0, index);
            value.binary_64_fraction_bits = value.binary_64_fraction_bits + '1';
            value.binary_64_fraction_bits = value.binary_64_fraction_bits.substr(0, index + 1);
            while (value.binary_64_fraction_bits.length < 52)
            {
              value.binary_64_fraction_bits += '0';
            }
            value.binary_64_fraction_bits = value.binary_64_fraction_bits.substr(0, 52);
          }
        }
        var string = value.binary_fraction;
        while (string.length <= 113)
        {
          string = string + value.binary_recurrence;
        }
        if (value.roundMode === 'rz')
        {
          if (string.length > 112)
          { 
            // this if is in case we accidently go over the limit by a few digits
            string = string.substr(0, 112);
          }
          value.binary_128_fraction_bits = string;
        }
        else if (value.roundMode === 'rni')
        {
          if (value.isNegative)
          {
            // Value is negative so round up
            if (string.length > 112)
            {
              string = string.substr(0, 112);
            }
            var index = 111;
            if (string.charAt(index) === '0')
            {
              string = string.substr(0, 111);
              string = string.concat('1');
            }
            else
            {
              var starr = [];
              starr = string.split('');
              string = '';
              while (starr[index] === '1' && (index > -1))
              {
                starr[index] = '0';
                index--;
              }
              starr[index] = '1';
              for ( var i = 0; i <= 111; i++)
              {
                string = string.concat(starr[i]);
              }
            }
            value.binary_128_fraction_bits = string;
          }
          else
          {
            // Value is positive so truncate
            if (string.length > 112)
            {
              string = string.substr(0, 112);
            }
            value.binary_128_fraction_bits = string;
          }
        }
        else if (value.roundMode === 'rpi')
        {
          if (value.isNegative)
          {
            // Value is negative so truncate
            if (string.length > 112)
            {
              string = string.substr(0, 112);
            }
            value.binary_128_fraction_bits = string;
          }
          else
          {
            // Value is positive so round up
            if (string.length > 112)
            {
              string = string.substr(0, 112);
            }
            var index = 111;
            if (string.charAt(index) === '0')
            {
              string = string.substr(0, 111);
              string = string.concat('1');
            }
            else
            {
              var starr = [];
              starr = string.split('');
              string = '';
              while (starr[index] === '1' && (index > -1))
              {
                starr[index] = '0';
                index--;
              }
              starr[index] = '1';
              for ( var i = 0; i <= 111; i++)
              {
                string = string.concat(starr[i]);
              }
            }
            value.binary_128_fraction_bits = string;
          }
        }
        else if (value.roundMode === 'rnv')
        {
          if (string.length > 113)
          { 
            // this if is in case we accidently go over the limit by a few digits
            string = string.substr(0, 113);
          }
          value.binary_128_fraction_bits = string;
          if (value.binary_128_fraction_bits[112] === '0')
          {
            // it is the 52 spot because it starts at 0 if the far right bit is 0 then we can just
            // truncate back to 23 bits because it essentially rounds down to place
            value.binary_128_fraction_bits = value.binary_128_fraction_bits.substr(0, 112);
          }
          else
          {
            var index = 111;
            var i = value.binary_128_fraction_bits[index]; 
            // look at the one to the left of the rounding bit
            while ((index != -1) && i === '1')
            {
              index--;
              i = value.binary_128_fraction_bits[index];
            }
            value.binary_128_fraction_bits = value.binary_128_fraction_bits.substr(0, index);
            value.binary_128_fraction_bits = value.binary_128_fraction_bits + '1';
            value.binary_128_fraction_bits = value.binary_128_fraction_bits.substr(0, index + 1);
            while (value.binary_128_fraction_bits.length < 112)
            {
              value.binary_128_fraction_bits += '0';
            }
            value.binary_128_fraction_bits = value.binary_128_fraction_bits.substr(0, 112);
          }
        }
      }
    }
    return;
  };

  // gen_dec_from_bin2()
  // ---------------------------------------------------------------------------------------------
  /*
   * Generates a decimal number from binary but does not normalize that result
   */
  var gen_dec_from_bin2 = function(value, identifier)
  {
    // Normalize the number, unless it is zero
    // Test if the value is zero and set value.isZero if it is.
    if (value.binary_integer === '0' && value.binary_fraction === '0'
        && value.binary_exponent === 0)
    {
      value.isZero = true;
      if (DEBUG)
      {
        console.log(debug_spaces[debug_depth--] + 'gen_dec_from_bin returns '
            + value.decimal_integer + '.' + value.decimal_fraction + 'E'
            + value.decimal_exponent);
      }
      return;
    }
    // Shift msb to units position, adjusting exponent.
    while (value.binary_integer > 1)
    {
      value.binary_fraction = value.binary_integer.charAt(
          value.binary_integer.length - 1).concat(value.binary_fraction);
      value.binary_integer = value.binary_integer.substr(0,
          value.binary_integer.length - 1);
      // increment the exponent to indicate a place moved over by one
      value.binary_exponent++;
    }
    while (value.binary_integer === '0')
    {
      value.binary_integer = value.binary_fraction.charAt(0);
      value.binary_fraction = value.binary_fraction.substr(1);
      value.binary_exponent--;
    }
    var binary_integer = value.binary_integer;
    var binary_fraction = value.binary_fraction;
    var binary_exponent = value.binary_exponent;
    while (binary_exponent > 0)
    {
      binary_integer = binary_integer + binary_fraction[0];
      binary_fraction = binary_fraction.substr(1);
      if (binary_fraction === '')
      {
        binary_fraction = '0';
      }
      binary_exponent--;
    }
    while (binary_exponent < 0)
    {
      binary_fraction = binary_integer.charAt(binary_integer.length - 1)
          .concat(binary_fraction);
      binary_integer = binary_integer.substr(0, binary_integer.length - 1);
      if (binary_integer === '')
      {
        binary_integer = '0';
      }
      binary_exponent++;
    }

    // Decimal integer part
    var power_of_two = '1';
    value.decimal_integer = '0';
    for ( var i = binary_integer.length - 1; i > -1; i--)
    {
      if (binary_integer[i] === '1')
      {
        value.decimal_integer = decimal_add(value.decimal_integer,
            power_of_two, false);
      }
      power_of_two = decimal_add(power_of_two, power_of_two);
    }

    // Decimal fraction part
    power_of_two = '1';
    value.decimal_fraction = '0';
    for (i = binary_fraction.length - 1; i > -1; i--)
    {
      if (binary_fraction[i] === '1')
      {
        value.decimal_fraction = decimal_add(value.decimal_fraction,
            power_of_two, false);
      }
      power_of_two = decimal_add(power_of_two, power_of_two);
    }
    var result = decimal_divide2(value.decimal_fraction, power_of_two,
        value.DECIMAL_PRECISION);
    value.decimal_fraction = result.decimal_fraction_part;
    // Normalize
    value.decimal_exponent = 0;
	
	var vdi = ltrim(value.decimal_integer);
	
    while (value.decimal_integer > 9)
    {
      value.decimal_fraction = value.decimal_integer.charAt(
          value.decimal_integer.length - 1).concat(value.decimal_fraction);
      value.decimal_integer = value.decimal_integer.substr(0,
          value.decimal_integer.length - 1);
      value.decimal_exponent++;
    }
    while (value.decimal_integer === '0')
    {
      value.decimal_integer = value.decimal_fraction[0];
      value.decimal_fraction = value.decimal_fraction.substr(1);
      value.decimal_exponent--;
    }
    value.decimal_integer = ltrim(value.decimal_integer);

    var vdf = value.decimal_fraction;
	
    if (identifier === 32)
    {
      value.binary_32_fraction_value = vdf;
    }
    else if (identifier === 64)
    {
      value.binary_64_fraction_value = vdf;
    }
    else if (identifier === 128)
    {
      value.binary_128_fraction_value = vdf;
    }
	else if (identifier === 'R32')
	{
	  value.binary_32_exponent_value = vdi;
	}
	else if (identifier === 'R64')
	{
	  value.binary_64_exponent_value = vdi;
	}
	else if (identifier === 'R128')
	{
	  value.binary_128_exponent_value = vdi;	
	}
    return;
  };
  // eval_bin()
  // ---------------------------------------------------------------------------------------------
  /*
   * Evaluate an unsigned binary string, returning the equivalent decimal value.
   * Used to evaluate IEEE-754 exponent fields, so the value can be assumed to
   * be within range of values that can be represented exactly.
   */
  var eval_bin = function(bin_string)
  {
    var decimal_value = 0;
    var power_of_two = 1;
    for ( var i = bin_string.length - 1; i > -1; i--)
    {
      if (bin_string[i] === '1')
      {
        decimal_value += power_of_two;
      }
      else if (bin_string[i] !== '0')
      {
        throw 'eval_bin: invalid binary digit: ' + bin_strin[1]; // there is a
        // spelling
        // error here
        // ---------probably
        // need to
        // fix!!!!
      }
      power_of_two += power_of_two;
    }
    return decimal_value;
  };
  // gen_bin_from_dec2()
  // ---------------------------------------------------------------------------------------------
  /*
   * Generates a binary number from decimal but does not normalize that result
   */
  var gen_bin_from_dec2 = function(value, radix)
  {
    // Special case if the value is zero
    if (value.decimal_integer === '0' && value.decimal_fraction === '0'
        && value.decimal_exponent === 0)
    {
      value.isZero = true;
      value.binary_integer = '0';
      value.binary_fraction = '0';
      value.binary_exponent = 0;
      if (DEBUG)
      {
        console.log(debug_spaces[debug_depth--] + 'gen_bin_from_dec returns '
            + value.binary_integer + '.' + value.binary_fraction + 'E'
            + value.binary_exponent);
      }
      return;
    }
    // Create working copy of the decimal value
    var decimal_integer = value.decimal_integer;
    var decimal_fraction = value.decimal_fraction;
    var decimal_exponent = value.decimal_exponent;
    // Adjust the working copy so the exponent is zero
    while (decimal_exponent > 0)
    {
      if (decimal_fraction.length < 1)
      {
        if (value.decimal_recurrence_start > -1)
        {
          decimal_fraction = value.decimal_recurrence;
        }
        else
        {
          decimal_fraction = '0';
        }
      }
      decimal_integer += decimal_fraction[0];
      decimal_fraction = decimal_fraction.substr(1);
      decimal_exponent--;
    }
    while (decimal_exponent < 0)
    {
      if (decimal_integer.length < 1)
      {
        decimal_integer = '0';
      }
      decimal_fraction = decimal_integer[decimal_integer.length - 1]
          .concat(decimal_fraction);
      decimal_integer = decimal_integer.substr(0, decimal_integer.length - 1);
      decimal_exponent++;
    }
    var precision_so_far = 0;
    // Binary integer part
    value.binary_integer = '';
    var result = null;
    while (decimal_integer !== '0')
    {
      result = decimal_divide(decimal_integer, '2', value.DECIMAL_PRECISION);
      value.binary_integer = ((result.decimal_fraction_part === '0') ? '0'
          : '1').concat(value.binary_integer);
      decimal_integer = result.decimal_integer_part.substr(0);
      precision_so_far++;
    }
    decimal_integer = '0';
    var vbi = value.binary_integer;
    if (radix === 32)
    {
      while (vbi.length < 8)
      {
        vbi = '0' + vbi;
      }
      value.binary_32_exponent_bits = vbi;
    }
    else if (radix === 64)
    {
      while (vbi.length < 11)
      {
        vbi = '0' + vbi;
      }
      value.binary_64_exponent_bits = vbi;
    }
    else if (radix === 128)
    {
      while (vbi.length < 15)
      {
        vbi = '0' + vbi;
      }
      value.binary_128_exponent_bits = vbi;
    }
	
    return;
  };
  // gen_dec_from_bin_enhanced()
  // -------------------------------------------------------------------------
  /*
   * Generates a decimal number from a binary number
   */
  var gen_dec_from_bin_enhanced = function(value)
  {
    if (DEBUG)
    {
      console.log(debug_spaces[++debug_depth] + 'gen_dec_from_bin: '
          + value.binary_integer + '.' + value.binary_fraction + 'E'
          + value.binary_exponent);
    }
    // Normalize the number, unless it is zero
    // Test if the value is zero and set value.isZero if it is.
    if (value.binary_integer === '0' && value.binary_fraction === '0'
        && value.binary_exponent === 0)
    {
      value.isZero = true;
      if (DEBUG)
      {
        console.log(debug_spaces[debug_depth--] + 'gen_dec_from_bin returns '
            + value.decimal_integer + '.' + value.decimal_fraction + 'E'
            + value.decimal_exponent);
      }
      return;
    }
    // Create working copy of the decimal value
    var binary_integer = value.binary_integer;
    var binary_fraction = value.binary_fraction;
    var binary_exponent = value.binary_exponent;
    var binfractemp = value.binary_fraction;
    var bigExtreme = false;
    while (binary_exponent > 0)
    {
      bigExtreme = true;
      binary_integer = binary_integer + binary_fraction[0];
      binary_fraction = binary_fraction.substr(1);
      if (binary_fraction === '')
      {
        binary_fraction = '0';
      }
      binary_exponent--;
      if (binary_integer.length > 17000)
      {
        break;
      }
    }
    var smallExtreme = false;
    while (binary_exponent < 0)
    {
      smallExtreme = true;
      binary_fraction = binary_integer.charAt(binary_integer.length - 1)
          .concat(binary_fraction);
      binary_integer = binary_integer.substr(0, binary_integer.length - 1);
      if (binary_integer === '')
      {
        binary_integer = '0';
      }
      binary_exponent++;
      if (binary_fraction.length > 17000)
      {
        break;
      }
    }
    if ((bigExtreme == true) && (binary_integer.length > 16400))
    {
      // value.isInfinity = true;
      value.isBigExtreme = true;
      value.isOutOfRange = true;
      return;
    }
    else if ((smallExtreme == true) && (binary_fraction.length > 16495))
    {
      // value.isZero = true;
      value.isSmallExtreme = true;
      value.isOutOfRange = true;
      return;
    }
    binary_integer = value.binary_integer; // these are to reset these values
    // back to the originals
    binary_fraction = value.binary_fraction;
    binary_exponent = value.binary_exponent;
    var JSONResults = get_JSON_DecValues_enhanced(binary_integer,
        binary_exponent, binary_fraction);
    value.decimal_integer = JSONResults.di;
    value.decimal_exponent = (JSONResults.de * 1);
    value.decimal_fraction = JSONResults.df;
    value.decimal_recurrence = JSONResults.dr;
    if (value.decimal_recurrence === "(null)"
        || value.decimal_recurrence === "0")
    {
      value.decimal_recurrence = '';
    }
    value.decimal_recurrence_start = (JSONResults.drs * 1);
    value.binary_recurrence = JSONResults.br;
    if (value.binary_recurrence === "(null)" || value.binary_recurrence === "0")
    {
      value.binary_recurrence = '';
    }
    value.binary_recurrence_start = (JSONResults.brs * 1);
    // these are the normalized binary values
    value.binary_integer = JSONResults.bi;
    value.binary_exponent = (JSONResults.be * 1);
    value.binary_fraction = JSONResults.bf;
    if (value.isIEEESubnormal == true)
    {
      value.binary_fraction = binfractemp;
    }
    return;
  };
  // gen_bin_from_dec_enhanced
  // -------------------------------------------------------------------------
  /*
   * Generates a binary number from a decimal number
   */
  var gen_bin_from_dec_enhanced = function(value)
  {
    if (DEBUG)
    {
      console.log(debug_spaces[++debug_depth] + 'gen_bin_from_dec: '
          + value.decimal_integer + '.' + value.decimal_fraction + 'E'
          + value.decimal_exponent);
    }
    // Special case if the value is zero
    if (value.decimal_integer === '0' && value.decimal_fraction === '0'
        && value.decimal_exponent === 0)
    {
      value.isZero = true;
      value.binary_integer = '0';
      value.binary_fraction = '0';
      value.binary_exponent = 0;
      if (DEBUG)
      {
        console.log(debug_spaces[debug_depth--] + 'gen_bin_from_dec returns '
            + value.binary_integer + '.' + value.binary_fraction + 'E'
            + value.binary_exponent);
      }
      return;
    }
    // Create working copy of the decimal value
    var decimal_integer = value.decimal_integer;
    var decimal_fraction = value.decimal_fraction;
    var decimal_exponent = value.decimal_exponent;
    var bigExtreme = false;
    // Adjust the working copy so the exponent is zero
    while (decimal_exponent > 0)
    {
      bigExtreme = true;
      if (decimal_fraction.length < 1)
      {
        if (value.decimal_recurrence_start > -1)
        {
          decimal_fraction = value.decimal_recurrence;
        }
        else
        {
          decimal_fraction = '0';
        }
      }
      decimal_integer += decimal_fraction[0];
      decimal_fraction = decimal_fraction.substr(1);
      decimal_exponent--;
      if (decimal_integer.length > 5001)
      {
        break;
      }
    }
    var smallExtreme = false;
    while (decimal_exponent < 0)
    {
      smallExtreme = true;
      if (decimal_integer.length < 1)
      {
        decimal_integer = '0';
      }
      decimal_fraction = decimal_integer[decimal_integer.length - 1]
          .concat(decimal_fraction);
      decimal_integer = decimal_integer.substr(0, decimal_integer.length - 1);
      decimal_exponent++;
      if (decimal_fraction.length > 5001)
      {
        break;
      }
    }
    if ((bigExtreme == true) && (decimal_integer.length > 5000))
    {
      // value.isInfinity = true;
      value.isBigExtreme = true;
      value.isOutOfRange = true;
      return;
    }
    else if ((smallExtreme == true) && (decimal_fraction.length > 4968))
    {
      // value.isZero = true;
      value.isSmallExtreme = true;
      value.isOutOfRange = true;
      return;
    }
    decimal_integer = value.decimal_integer; // these are to reset these values
    // back to the originals
    decimal_fraction = value.decimal_fraction;
    decimal_exponent = value.decimal_exponent;
    decimal_recurrence = value.decimal_recurrence;
    if (decimal_recurrence == "")
    {
      decimal_recurrence = "0";
    }
    decimal_recurrence_start = value.decimal_recurrence_start;
    var JSONResults = getJSONenhanced(decimal_integer, decimal_exponent,
        decimal_fraction, decimal_recurrence, decimal_recurrence_start);
    value.binary_integer = JSONResults.bi;
    value.binary_exponent = (JSONResults.be * 1);
    value.binary_fraction = JSONResults.bf;
    value.decimal_recurrence = JSONResults.dr;
    if (value.decimal_recurrence === "(null)" || value.decimal_recurrence === "0")
    {
      value.decimal_recurrence = '';
    }
    value.decimal_recurrence_start = (JSONResults.drs * 1);
    value.binary_recurrence = JSONResults.br;
    if (value.binary_recurrence === "(null)" || value.binary_recurrence === "0")
    {
      value.binary_recurrence = '';
    }
    value.binary_recurrence_start = (JSONResults.brs * 1);
    return;
  };
  // Numeric_Value private instance functions
  // =============================================================================================
  //
  // parse_auto()
  // ---------------------------------------------------------------------------------------------
  /*
   * Guesses the input format: mixed and real preferred to binary.
   */
  this.parse_auto = function(input_string)
  {
    if (DEBUG)
    {
      console.log(debug_spaces[++debug_depth] + 'parse_auto( ' + input_string
          + ' )');
    }
    // check to see if it is a mixed number
    regexInfo = mixedRE.exec(input_string);
    if (regexInfo)
    {
      this.inputType = 'mixed';
      this.parseAs = 10;
      this.parse_mixed(regexInfo);
      if (DEBUG)
      {
        console.log(debug_spaces[debug_depth--]
            + 'parse_auto returns parse_mixed()');
      }
      return;
    }
    // if it's not a mixed number then check if it is a real number
    regexInfo = realRE.exec(input_string);
    if (regexInfo)
    {
      this.inputType = 'real';
      this.parseAs = 10;
      this.parse_real(regexInfo);
      if (DEBUG)
      {
        console.log(debug_spaces[debug_depth--]
            + 'parse_auto returns parse_real()');
      }
      return;
    }
    // if binary call parse binary
    if (binRE.test(input_string))
    {
      this.parseAs = 2;
      this.parse_binary(input_string);
      if (DEBUG)
      {
        console.log(debug_spaces[debug_depth--]
            + 'parse_auto returns parse_binary()');
      }
      return;
    }
    // if hexadecimal call parse hexadecimal
    if (hex32RE.test(input_string) || hex64RE.test(input_string)
        || hex128RE.test(input_string))
    {
      this.parseAs = 16;
      this.parse_hexadecimal(input_string);
      if (DEBUG)
      {
        console.log(debug_spaces[debug_depth--]
            + 'parse_auto returns parse_hexadecimal()');
      }
      return;
    }
    // if special value call that function
    this.checkSpecialValue(input_string);
    if (DEBUG)
    {
      console.log(debug_spaces[debug_depth--]
          + 'parse_auto returns checkSpecialValue()');
    }
    return;
  };
  // parse_decimal()
  // ---------------------------------------------------------------------------------------------
  /*
   * Disambiguate between real and mixed.
   */
  this.parse_decimal = function(input_string)
  {
    if (DEBUG)
    {
      console.log(debug_spaces[++debug_depth] + 'parse_decimal( '
          + input_string + ' )');
    }
    var regexInfo = mixedRE.exec(input_string);// if it is a mixed number call
    // parse mixed
    if (regexInfo)
    {
      this.inputType = 'mixed';
      this.parse_mixed(regexInfo);
      if (DEBUG)
      {
        console.log(debug_spaces[debug_depth--] + 'parse_decimal returns parse_mixed()');
      }
      return;
    }
    regexInfo = realRE.exec(input_string);// if it is not a mixed number check
    // to see if it is real and call parse real
    if (regexInfo)
    {
      this.inputType = 'real';
      this.parse_real(regexInfo);
      if (DEBUG)
      {
        console.log(debug_spaces[debug_depth--] + 'parse_decimal returns parse_real()');
      }
      return;
    }
    else
    {
      this.syntax = 'Invalid decimal number';
    }
    if (DEBUG)
    {
      console.log(debug_spaces[debug_depth--] + 'parse_decimal returns ' + this.isValid);
    }
    return;
  };
  // parse_mixed()
  // ---------------------------------------------------------------------------------------------
  /*
   * Calculates the decimal value of a rational or mixed number, then generates
   * the binary representation.
   * 
   * Can only be reached if an input string has been recognized as a valid mixed
   * number string.
   * 
   * Inputs: Optional sign, optional unsigned whole number, optionally with
   * positive exponent Optionally signed positive numerator, optionally with
   * positive exponent Optionally signed positive denominator, optionally with
   * positive exponent
   * 
   * Algorithm: Eliminate extraneous powers of ten from numerator and
   * denominator. Divide; add integer part to whole number; save decimal
   * fraction. Use gen_bin_from_dec to generate binary parts.
   */
  this.parse_mixed = function(mixed_info)
  {
    if (DEBUG)
    {
      console.log(debug_spaces[++debug_depth] + 'parse_mixed( '
          + objToString(mixed_info) + ' )');
    }
    this.isValid = false;
    var value_sign = mixed_info[1] ? mixed_info[1] : '+';
    // check the first (left most) value to see if it is a sign, if there is none value_sign becomes
    // a '+' by default
    var whole_value = mixed_info[3] ? ltrim(mixed_info[3]) : '0'; 
    // value of the whole # ex. 5 1/2
    var whole_exponent = mixed_info[5] ? mixed_info[5] : 0;
    // a possible exponent for the whole number 5e1
    var numerator_value = ltrim(mixed_info[7]);
    // value of numerator
    var numerator_exponent = mixed_info[9] ? mixed_info[9] : 0;
    // a possible exponent for the numerator
    var denominator_value = ltrim(mixed_info[11]);
    // the denominator
    var denominator_exponent = mixed_info[13] ? mixed_info[13] : 0;
    // a possible exponent for the denominator
    if (denominator_value === '0')
    { 
      // Divide by 0 means either +infinity or -infinity (e.g. -1/0)
      this.isValid = true;
      this.syntax = 'Decimal number';
      this.isInfinity = true;
      if (value_sign === '-')
      {
        this.isNegative = true;
      }
      return;
    }
    // Make sure exponents are numeric
    whole_exponent -= 0;
    numerator_exponent -= 0;
    denominator_exponent -= 0;
    // Expand whole number - so essentially converts the number to standard form
    while (whole_exponent > 0)
    {
      whole_value = whole_value.concat('0');
      whole_exponent--;
    }
    // Reduce fraction: eliminate irrelevent powers of ten from numerator and
    // denominator
    var min_exponent = (numerator_exponent < denominator_exponent) ? numerator_exponent
        : denominator_exponent;
    numerator_exponent -= min_exponent;
    denominator_exponent -= min_exponent;
    while ((numerator_value[numerator_value.length - 1] === '0')
        && (denominator_value[denominator_value.length - 1] === '0'))
    {
      numerator_value = numerator_value.substr(0, numerator_value.length - 1);
      denominator_value = denominator_value.substr(0,
          denominator_value.length - 1);
    }
    // Reduce fraction: make numerator and denominator exponents match
    while (numerator_exponent > denominator_exponent)
    {
      numerator_value = numerator_value.concat('0');
      numerator_exponent--;
    }
    while (denominator_exponent > numerator_exponent)
    {
      denominator_value = denominator_value.concat('0');
      denominator_exponent--;
    }
    // Compute the value of the fraction part
    var value = 0;
    if (denominator_value.length > 41)
    {
      value = decimal_divide2(numerator_value, denominator_value,
          denominator_value.length);
    }
    else
    {
      value = decimal_divide2(numerator_value, denominator_value,
          this.DECIMAL_PRECISION);
    }
    if (value.decimal_integer_part > 0)
    {
      whole_value = decimal_add(whole_value, value.decimal_integer_part, true);
    }
    this.isNegative = value_sign === '-';
    this.decimal_integer = whole_value;
    this.decimal_fraction = value.decimal_fraction_part;
    this.decimal_exponent = whole_exponent;
    if (value.decimal_recurrence_start >= 0)
    {
      this.decimal_recurrence_start = value.decimal_recurrence_start;
      this.decimal_recurrence = value.decimal_fraction_part
          .substr(value.decimal_recurrence_start);
    }
    this.isValid = true;
    this.syntax = "Decimal number";
    gen_bin_from_dec_enhanced(this);
    analyze(this);
    if (DEBUG)
    {
      console.log(debug_spaces[debug_depth--] + 'parse_mixed returns '
          + objToString(this));
    }
    return;
  };
  // parse_real()
  // ---------------------------------------------------------------------------------------------
  /*
   * Parse real numbers. Decimal recurrences not possible. Can only be reached
   * if an input string has been recognized as a valid real number string.
   */
  this.parse_real = function(real_info)
  {
    if (DEBUG)
    {
      console.log(debug_spaces[++debug_depth] + 'parse_real( '
          + objToString(real_info) + ' )');
    }
    this.isNegative = (typeof real_info[1] !== 'undefined')
        && (real_info[1] === '-');
    this.decimal_integer = real_info[2] ? ltrim(real_info[2]) : '0';
    this.decimal_fraction = real_info[4] ? real_info[4] : '0';
    this.decimal_exponent = (real_info[6] ? real_info[6] : 0) - 0;
    this.syntax = 'Decimal (Real number)';
    if (/^\s*([+\-])?0*(\.0*)?([EeBb]([+\-]?[\d]+))?\s*$/.test(input_string))
    {
      this.binary_integer = '0';
      this.binary_fraction = '0';
      this.binary_exponent = 0;
      this.decimal_integer = '0';
      this.decimal_fraction = '0';
      this.decimal_exponent = 0;
      this.isZero = true;
      this.isValid = true;
      return;
    }
    gen_bin_from_dec_enhanced(this);
    this.isValid = true;
    analyze(this);
    if (DEBUG)
    {
      console.log(debug_spaces[debug_depth--] + 'parse_real returns '
          + objToString(this));
    }
    return;
  };
  // parse_binary()
  // ---------------------------------------------------------------------------------------------
  /*
   * Parse binary numbers.
   */
  this.parse_binary = function(input_string)
  {
    this.inputType = 'binary';
    if (DEBUG)
    {
      console.log(debug_spaces[++debug_depth] + 'parse_binary( ' + input_string
          + ' )');
    }
    var matches = binRE.exec(input_string);
    // matches will either be the string if it matches or null
    if (null === matches)
    {
      this.syntax = 'Invalid binary number';
      this.isValid = false;
      if (DEBUG)
      {
        console.log(debug_spaces[debug_depth--]
            + 'parse_binary returns \'invalid binary\'');
      }
      return;
    }
    this.isNegative = (typeof matches[1] !== 'undefined')
        && (matches[1] === '-');// this determines if it is negative or not
    this.binary_integer = matches[2] ? ltrim(matches[2]) : '0'; // sets the binary
    // integer part - it is the number before the decimal point
    this.binary_fraction = matches[4] ? matches[4] : '0'; // sets the binary
    // fraction part
    this.binary_exponent = (matches[6] ? matches[6] : 0) - 0; // sets the binary
    // exponent part
    this.syntax = 'Binary number'; // sets the syntax
    if (/^\s*([+\-])?0*(\.0*)?([EeBb]([+\-]?[\d]+))?\s*$/.test(input_string))
    {
      this.binary_integer = '0';
      this.binary_fraction = '0';
      this.binary_exponent = 0;
      this.decimal_integer = '0';
      this.decimal_fraction = '0';
      this.decimal_exponent = 0;
      this.isZero = true;
      this.isValid = true;
      return;
    }
    if (this.binary_integer === '0' && this.binary_fraction === '1'
        && (this.binary_exponent >= 2))
    {
      this.binary_integer = '1';
      this.binary_exponent--;
      var i = 0;
      while (i < this.binary_exponent)
      {
        this.binary_integer = this.binary_integer + '0';
        i++;
      }
      this.binary_fraction = '0';
      this.binary_exponent = 0;
    }
    gen_dec_from_bin_enhanced(this);
    this.isValid = true;
    analyze(this);
    if (DEBUG)
    {
      console.log(debug_spaces[debug_depth--] + 'parse_binary returns '
          + objToString(this));
    }
    return;
  };
  // convertToHex()
  // -----------------------------------------------------------------------------------------------
  // Converts a binary string to a Hexadecimal value.
  var convertToHex = function(value, hexType)
  {
    var hex_bits =
    [ '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D',
        'E', 'F' ];
    var binary_string = '';
    var sign_bit = value.isNegative * 1;
    var exponent_bits = 0;
    var fraction_bits = 0;
    if (hexType === 32)
    {
      exponent_bits = value.binary_32_exponent_bits;
      if (value.parseAs === 10)
      {
        if (value.isHex32Denormal === true)
        { // use the original binary fraction bits instead of the shifted b32
          // fraction bits
          value.binary_32_fraction_bits = value.binary_integer
              + value.binary_fraction;
          var move = -126 - value.binary_32_exponent_value; // the -126 comes
          // from one less
          // than the excess
          // (127) and then
          // negate it so it
          // becomes -126
          for ( var i = 1; i <= move - 1; i++)
          {
            value.binary_32_fraction_bits = '0' + value.binary_32_fraction_bits;
          } // for
          if (value.binary_recurrence === '')
          {// if there is no recurrence this is fine
            var hex32_bits_needed = 23 - value.binary_fraction.length;
            // need 23
            for ( var i = 1; i <= hex32_bits_needed; i++)
            {
              value.binary_32_fraction_bits += '0';
            }// for
            if (hex32_bits_needed < 0)
            {// limit it to 23 bits if too long
              value.binary_32_fraction_bits = value.binary_32_fraction_bits
                  .substr(0, 23);
            }// if
          }// if
        }// if for checking denormal
        fraction_bits = value.binary_32_fraction_bits;
      }// if for parse as 10
      else if (value.parseAs === 2 && value.isHex32Denormal)
      {
        // Use the b32 fraction bits that were altered in the adjustfraction bits method
        // not the regular binary fraction
        fraction_bits = value.binary_32_fraction_bits;
      }
      else
      {
        if (value.isHex32Denormal === true
            && ((value.inputType != 'hex64') && (value.inputType != 'hex128')))
        {
          // Use the original binary fraction bits instead of the shifted b32 fraction bits
          fraction_bits = value.binary_fraction;
        }
        else if (value.isHex32Denormal === true &&
                (value.inputType === 'hex64' || value.inputType === 'hex128'))
        {
          fraction_bits = '0' + value.binary_32_fraction_bits;
        }
        else
        {
          fraction_bits = value.binary_32_fraction_bits;
        }
      }
    } // if hexType === 32
    else if (hexType === 64)
    {
      exponent_bits = value.binary_64_exponent_bits;
      if (value.parseAs === 10)
      {
        if (value.isHex64Denormal === true)
        {
          // The -1022 comes from one less than the excess (1023) and then negate it so it becomes
          // -1022
          value.binary_64_fraction_bits = value.binary_integer
              + value.binary_fraction;
          var move = -1022 - value.binary_64_exponent_value;
          for ( var i = 1; i <= move - 1; i++)
          {
            value.binary_64_fraction_bits = '0' + value.binary_64_fraction_bits;
          }
          if (value.binary_recurrence === '')
          {
            // if there is no recurrence this is fine
            // need 52
            var hex64_bits_needed = 52 - value.binary_fraction.length;
            for ( var i = 1; i <= hex64_bits_needed; i++)
            {
              value.binary_64_fraction_bits += '0';
            }
            if (hex64_bits_needed < 0)
            {
              // limit it to 52 bits if too long
              value.binary_64_fraction_bits = value.binary_64_fraction_bits.substr(0, 52);
            }
          }
        } // if checking denormal
        fraction_bits = value.binary_64_fraction_bits;
      } // if value.parseAs===10
      else if (value.parseAs === 2 && value.isHex64Denormal)
      {
        // I am including both of these in the if because if it is parseAS===2
        // (a binary input and not denormal it was working fine before so I dont
        // was to change it)
        // Use the b64 fraction bits that were altered in the adjustfraction bits method not the
        // regular binary fraction
        fraction_bits = value.binary_64_fraction_bits;
      }
      else
      {
        if (value.isHex64Denormal === true && (value.inputType != 'hex128'))
        {
          // Use the original binary fraction bits instead of the shifted b64 fraction bits
          fraction_bits = value.binary_fraction;
        }
        else if (value.isHex64Denormal === true && value.inputType === 'hex128')
        {
          fraction_bits = '0' + value.binary_64_fraction_bits;
        }
        else
        {
          fraction_bits = value.binary_64_fraction_bits;
        }
      }
    } // else if hextype===64
    else if (hexType === 128)
    {
      exponent_bits = value.binary_128_exponent_bits;
      if (value.parseAs === 10)
      {
        if (value.isHex128Denormal === true)
        {
          value.binary_128_fraction_bits = value.binary_integer + value.binary_fraction;
          var move = -16382 - value.binary_128_exponent_value;
          // The -16382 comes from one less than the excess (16383) and then negate it so it
          // becomes -16382
          for ( var i = 1; i <= move - 1; i++)
          {
            value.binary_128_fraction_bits = '0'
                + value.binary_128_fraction_bits;
          } // for
          if (value.binary_recurrence === '')
          {
            // if there is no recurrence this is fine
            // need 112
            var hex128_bits_needed = 112 - value.binary_fraction.length;
            for ( var i = 1; i <= hex128_bits_needed; i++)
            {
              value.binary_128_fraction_bits += '0';
            }
            if (hex128_bits_needed < 0)
            {
              // limit it to 112 bits if too long
              value.binary_128_fraction_bits = value.binary_128_fraction_bits
                  .substr(0, 112);
            }
          }
        } // if checking denormal
        fraction_bits = value.binary_128_fraction_bits;
      } // if value.parseAs===10
      else if (value.parseAs === 2 && value.isHex128Denormal)
      {
        // Use the b128 fraction bits that were altered in the adjustfraction bits method not the
        // regular binary fraction
        fraction_bits = value.binary_128_fraction_bits;
      }
      else
      {
        if (value.isHex128Denormal === true)
        {
          // Use the original binary fraction bits instead of the shifted b128 fraction bits
          fraction_bits = value.binary_fraction;
        }
        else
        {
          fraction_bits = value.binary_128_fraction_bits;
        }
      }
    } // else if hexType===128
    else
    {
      return;
    }
    // Concatenate all the binary bits into a single string
    binary_string = sign_bit + exponent_bits + fraction_bits;
    if (hexType === 32)
    {
      binary_string = binary_string.substr(0, 32);
    }
    if (hexType === 64)
    {
      binary_string = binary_string.substr(0, 64);
    }
    if (hexType === 128)
    {
      binary_string = binary_string.substr(0, 128);
    }
    var raw_bits = '';
    var i = 0;
    while (i < binary_string.length)
    {
      var hex_val = binary_string.substr(i, 4);
      var temp = '0';
      // ensures that all hex_val are 4 bits long
      while (hex_val.length < 4)
      {
        hex_val = temp + hex_val;
      }
      switch (hex_val)
      {
        case '0000':
          hex_val = 0;
          break;
        case '0001':
          hex_val = 1;
          break;
        case '0010':
          hex_val = 2;
          break;
        case '0011':
          hex_val = 3;
          break;
        case '0100':
          hex_val = 4;
          break;
        case '0101':
          hex_val = 5;
          break;
        case '0110':
          hex_val = 6;
          break;
        case '0111':
          hex_val = 7;
          break;
        case '1000':
          hex_val = 8;
          break;
        case '1001':
          hex_val = 9;
          break;
        case '1010':
          hex_val = 10;
          break;
        case '1011':
          hex_val = 11;
          break;
        case '1100':
          hex_val = 12;
          break;
        case '1101':
          hex_val = 13;
          break;
        case '1110':
          hex_val = 14;
          break;
        case '1111':
          hex_val = 15;
          break;
        default:
          alert("error from convertToHex");
          break;
        return;
    }
    raw_bits += hex_bits[hex_val];
    i = i + 4;
  }
  return raw_bits;
} ;
  // parse_hexadecimal()
  // ---------------------------------------------------------------------------------------------
  /*
   * Parse binary32, binary64, and binary128 values.
   * 
   * IEEE-754-2008 Binary Formats: binary32 binary64 binary128 Sign 1 1 1 Exp 8
   * 11 15 #frac 23 52 112 Emax +127 +1023 +16383 Emin -126 -1022 -16382 (Emin
   * <==> 1 - Emax)
   * 
   * binary32: S 00000000 000000000000000000000000 ±0 S 00000000
   * nnnnnnnnnnnnnnnnnnnnnnnn subnormal; no hidden 1 x 11111111
   * 0nnnnnnnnnnnnnnnnnnnnnnn sNaN x 11111111 1nnnnnnnnnnnnnnnnnnnnnnn qNaN S
   * 11111111 000000000000000000000000 ±∞ S 00000001 xxxxxxxxxxxxxxxxxxxxxxxx
   * Emin (-126) S 11111110 xxxxxxxxxxxxxxxxxxxxxxxx Emax (+127)
   * 
   * S: 0 => +; 1 => - x: don't care n: must not be all zero
   * 
   * An infinitely precise result with magnitude at least b^emax × (b − ½ ×
   * b^(1−p)) shall round to ∞ with no change in sign.
   * 
   * Rounding: roundTiesToEven is the default for binary format implementations,
   * and is used here. User selectable: roundTowardPositive roundTowardNegative
   * roundTowardZero The first two may result in +∞ and -∞, respectively.
   */
  this.parse_hexadecimal = function(input_string)
  {
    if (DEBUG)
    {
      console.log(debug_spaces[++debug_depth] + 'parse_hexadecimal( '
          + input_string + ' )');
    }
    this.isValid = false;
    // must match the regular expression for hexadecimal format or fail
    if (!/^[\da-f]+$/i.test(input_string))
    {
      this.syntax = 'Invalid hexadecimal';
      if (DEBUG)
      {
        console.log(debug_spaces[debug_depth--]
            + 'parse_hexadecimal returns \'invalid hex char(s)\'');
      }
      return;
    }
    // must be the correct length of one of the 3 type of floating point numbers
    // or fail
    if (!((input_string.length === 8)  ||
          (input_string.length === 16) ||
          (input_string.length === 32)))
    {
      this.syntax = 'Invalid number of hexadecimal digits ('
          + input_string.length + ')';
      if (DEBUG)
      {
        console.log(debug_spaces[debug_depth--]
            + 'parse_hexadecimal returns \'invalid hex length\'');
      }
      return;
    }
    // Any hex string of a proper length must be valid
    this.isValid = true;
    if (input_string.length === 8)
    {
      this.inputType = 'hex32';
      this.syntax = '32-bit hexadecimal';
    }
    if (input_string.length === 16)
    {
      this.inputType = 'hex64';
      this.syntax = '64-bit hexadecimal';
    }
    if (input_string.length === 32)
    {
      this.inputType = 'hex128';
      this.syntax = '128-bit hexadecimal';
    }
    // Convert hex string to binary string
    var hex_bits =
    [ '0000', '0001', '0010', '0011', '0100', '0101', '0110', '0111', '1000',
        '1001', '1010', '1011', '1100', '1101', '1110', '1111' ];
    var raw_bits = '';
    for ( var i = 0; i < input_string.length; i++)
    {
      var hex_val = input_string[i];
      // Convert the letters into the corresponding numbers
      switch (hex_val.toLowerCase())
      {
        case '0':
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
        case '7':
        case '8':
        case '9':
          break;
        case 'a':
          hex_val = 10;
          break;
        case 'b':
          hex_val = 11;
          break;
        case 'c':
          hex_val = 12;
          break;
        case 'd':
          hex_val = 13;
          break;
        case 'e':
          hex_val = 14;
          break;
        case 'f':
          hex_val = 15;
          break;
        default:
          this.syntax = 'IEEE invalid hex character: ' + hex_val;
          if (DEBUG)
          {
            console.log(debug_spaces[debug_depth--]
                + 'parse_hexadecimal returns invalid hex char');
          }
          return;
      }
      // Use the hex_value as a key into the hex_array to get the appropriate binary value
      raw_bits += hex_bits[hex_val];
    }
    //  Extract the sign bit
    this.isNegative = raw_bits[0] === '1';
    var exponent_end = 9; // setting initial values assuming binary32
    var Emax = 127;       // setting initial values assuming binary32
    if (input_string.length === 16) // if binary64
    {
      exponent_end = 12;
      Emax = 1023;
    }
    if (input_string.length === 32) // if binary128
    {
      exponent_end = 16;
      Emax = 16383;
    }
    // Extract the exponent field
    var raw_exponent = raw_bits.substring(1, exponent_end);
    //  Extract the fraction field
    var raw_fraction = raw_bits.substring(exponent_end);
    // Zero or Subnormal?
    if (raw_exponent === '00000000'     ||
        raw_exponent === '00000000000'  ||
        raw_exponent === '000000000000000')
    {
      this.binary_integer = '0';
      // Confirm that this is a ZERO case and return
      if (/^0*$/.test(raw_fraction))
      {
        this.isZero = true;
        this.binary_fraction = '0';
        this.binary_exponent = 0;
        this.decimal_integer = '0';
        this.decimal_fraction = '0';
        this.decimal_exponent = 0;
        if (DEBUG)
        {
          console.log(debug_spaces[debug_depth--]
              + 'parse_hexadecimal returns \'zero\'');
        }
        return;
      }
      // Confirm it is a subnormal number
      this.isZero = false;
      this.binary_fraction = raw_fraction;
      this.binary_exponent = 1 - Emax;
      this.isIEEESubnormal = true;

      //  Generate corresponding decimal value, and do the analysis
      gen_dec_from_bin_enhanced(this);
      analyze(this);
      if (DEBUG)
      {
        console.log(debug_spaces[debug_depth--]
            + 'parse_hexadecimal returns \'subnormal\'');
      }
      return;
    }
    // Infinity?
    if (/^1*$/.test(raw_exponent))
    {
      // this confrims the number is INFINITY and returns
      if (/^0+$/.test(raw_fraction))
      {
        this.isInfinity = true;
        if (input_string.length === 8)
        {
          this.syntax = '32-bit hexadecimal';
        }
        else if (input_string.length === 16)
        {
          this.syntax = '64-bit hexadecimal';
        }
        else
        {
          this.syntax = '128-bit hexadecimal';
        }
        if (DEBUG)
        {
          console.log(debug_spaces[debug_depth--]
              + 'parse_hexadecimal returns \'infinity\'');
        }
        return;
      }
      // this confirms the number is NAN
      else
      {
        this.isNaN = true;
        this.isSignalling = raw_fraction[0] === '0';
        this.signalling_info = raw_fraction.substring(1);
        if (input_string.length === 8)
        {
          this.syntax = '32-bit hexadecimal';
        }
        else if (input_string.length === 16)
        {
          this.syntax = '64-bit hexadecimal';
        }
        else
        {
          this.syntax = '128-bit hexadecimal';
        }
        if (DEBUG)
        {
          console.log(debug_spaces[debug_depth--]
              + 'parse_hexadecimal returns \'NaN\'');
        }
        this.binary_integer = '1'; // hidden bit
        this.binary_fraction = raw_fraction;
        this.binary_exponent = eval_bin(raw_exponent) - Emax;
        analyze(this);
        return;
      }
    }
    // Regular number
    this.binary_integer = '1'; // hidden bit
    this.binary_fraction = raw_fraction;
    this.binary_exponent = eval_bin(raw_exponent) - Emax;
    // Prints out the correct syntax message depending on the hex format input
    if (input_string.length === 8)
    {
      this.syntax = '32-bit hexadecimal';
    }
    else if (input_string.length === 16)
    {
      this.syntax = '64-bit hexadecimal';
    }
    else
    {
      this.syntax = '128-bit hexadecimal';
    }
    gen_dec_from_bin_enhanced(this);
    analyze(this);
    if (DEBUG)
    {
      console.log(debug_spaces[debug_depth--]
          + 'parse_hexadecimal returns \'normal\'');
    }
    return;
  };
  // checkSpecialValue()
  // -------------------------------------------------------------------------
  /*
   * Checks is a string is NaN or Infinity, and sets the proper fields if it is.
   */
  this.checkSpecialValue = function(input_string)
  {
    if (DEBUG)
    {
      console.log(debug_spaces[++debug_depth] + 'checkSpecialValue( '
          + input_string + ' )');
    }
    switch (input_string.toLowerCase())
    {
      case '+infinity':
      case 'infinity':
        this.isValid = true;
        this.isInfinity = true;
        this.isNegative = false;
        this.syntax = 'Special value';
        break;
      case '-infinity':
        this.isValid = true;
        this.isInfinity = true;
        this.isNegative = true;
        this.syntax = 'Special value';
        break;
      case 'qnan':
      case 'nan':
        this.isValid = true;
        this.isNaN = true;
        this.isSignalling = false;
        this.syntax = 'Special value';
        break;
      case 'snan':
        this.isValid = true;
        this.isNaN = true;
        this.isSignalling = true;
        this.syntax = 'Special value';
        break;
      default:
        this.syntax = 'Unrecognized input';
        this.isValid = false;
        break;
    }
    if (DEBUG)
    {
      console.log(debug_spaces[debug_depth--] + 'checkSpecialValue returns '
          + objToString(this));
    }
    return;
  };
  // Instance Data
  // =============================================================================================
  /*
   * Abstract value information.
   * 
   * Recurrences: Less than -1 means there is none. -1 means it includes one
   * integer digit. Anything else means it starts that many positions to the
   * right of the radix point.
   */
  this.isNegative = false;
  this.decimal_integer = '0';
  this.decimal_fraction = '0';
  this.binary_integer = '0';
  this.binary_fraction = '0';
  this.decimal_recurrence_start = -1;
  this.decimal_recurrence = '';
  this.decimal_exponent = 0;
  this.binary_recurrence_start = -1;
  this.binary_recurrence = '';
  this.binary_exponent = 0;
  this.signalling_info = '';
  this.syntax = '';
  this.isValid = false;
  this.isZero = false;
  this.isInfinity = false;
  this.isNaN = false;
  this.isSignalling = false;
  this.isOutOfRange = false;
  this.isSmallExtreme = false;
  this.isBigExtreme = false;
  // binary32 information
  // ---------------------------------------------------------------------------------------------
  this.binary_32_exponent_value = null;
  this.binary_32_fraction_value = null;
  this.binary_32_exponent_bits = '';
  this.binary_32_fraction_bits = '';
  this.hex_String32 = '';
  this.isHex32Denormal = false;
  this.isHex32Underflow = false;
  this.isHex32Overflow = false;
  // binary64 information
  // ---------------------------------------------------------------------------------------------
  this.binary_64_exponent_value = null;
  this.binary_64_exponent_bits = '';
  this.binary_64_fraction_bits = '';
  this.hex_String64 = '';
  this.isHex64Denormal = false;
  this.isHex64Underflow = false;
  this.isHex64Overflow = false;
  // binary128 information
  // ---------------------------------------------------------------------------------------------
  this.binary_128_exponent_value = null;
  this.binary_128_exponent_bits = '';
  this.binary128_fraction_bits = '';
  this.hex_String128 = '';
  this.isHex128Denormal = false;
  this.isHex128Underflow = false;
  this.isHex128Overflow = false;
  // Control/Display Parameters
  // ---------------------------------------------------------------------------------------------
  this.BINARY_PRECISION = 128; // Only 112 plus guard bits needed for binary128
  this.DECIMAL_PRECISION = 40; // 1 + ceil(2^128)
  this.BINARY_DISPLAY_DIGITS_LIMIT = 128; // Used by toString(2)
  this.DECIMAL_DISPLAY_DIGITS_LIMIT = 128; // Used by toString(10)
  // Constructor
  // =============================================================================================
  this.roundMode = round_mode;
  this.parseAs = parse_as;
  this.inputType = '';
  this.isIEEESubnormal = false;
  if (typeof parse_as === "undefined")
  {
    this.parse_auto(input_string);
    if (DEBUG)
    {
      console.log('constructor returns ' + objToString(this));
    }
    return;
  }
  switch (parse_as)
  {
    case 2:
      this.parse_binary(input_string);
      break;
    case 10:
      this.parse_decimal(input_string);
      break;
    case 16:
      this.parse_hexadecimal(input_string);
      break;
    default:
      alert("Numeric_Value: " + parse_as + " is an invalid constructor value");
  }
}
// Numeric_Value.prototype (public) functions
// =============================================================================================
//
// Numeric_Value.prototype.setBinaryDisplayDigits()
// ---------------------------------------------------------------------------------------------
Numeric_Value.prototype.setBinaryDisplayDigits = function(newValue)
{
  var oldValue = this.BINARY_DISPLAY_DIGITS_LIMIT;
  this.BINARY_DISPLAY_DIGITS_LIMIT = newValue;
  return oldValue;
};
// Numeric_Value.prototype.setDecimalDisplayDigits()
// ---------------------------------------------------------------------------------------------
Numeric_Value.prototype.setDecimalDisplayDigits = function(newValue)
{
  var oldValue = this.DECIMAL_DISPLAY_DIGITS_LIMIT;
  this.DECIMAL_DISPLAY_DIGITS_LIMIT = newValue;
  return oldValue;
};
// Numeric_Value.prototype.setDecimalPrecision()
// ---------------------------------------------------------------------------------------------
Numeric_Value.prototype.setDecimalPrecision = function(newValue)
{
  var oldValue = this.DECIMAL_PRECISION;
  this.DECIMAL_PRECISION = newValue;
  return oldValue;
};
// Numeric_Value.prototype.setBinamryPrecision()
// ---------------------------------------------------------------------------------------------
Numeric_Value.prototype.setBinaryPrecision = function(newValue)
{
  var oldValue = this.BINARY_PRECISION;
  this.BINARY_PRECISION = newValue;
  return oldValue;
};
// Numeric_Value.prototype.getSyntax()
// ---------------------------------------------------------------------------------------------
/*
 * Returns the syntax message string.
 */
Numeric_Value.prototype.getSyntax = function()
{
  return this.syntax;
};
// Numeric_Value.prototype.toString()
// ---------------------------------------------------------------------------------------------
/*
 * Returns the string representation of the numeric value. The radix may be
 * either 2 or 10; the value is always normalized with one digit to the left of
 * the radix point. Special cases (s|q NaN; +|- infinity; invalid number) are
 * handled. Recurrences are enclosed in square brackets.
 */
Numeric_Value.prototype.toString = function(radix)
{
  if (DEBUG)
  {
    console.log(debug_spaces[++debug_depth] + 'Numeric_Value.toString(' + radix
        + ')');
  }
  if (!this.isValid)
  {
    return 'Not a recognized number';
  }
  if (this.isInfinity)
  {
    if (radix === 'ihex32')
    {
      if (!this.isNegative)
      {
        return '7F800000 (+Infinity)';
      }
      else
      {
        return 'FF800000 (-Infinity)';
      }
    }
    else if (radix === 'ihex32s')
    {
      return this.isNegative * 1;
    }
    else if (radix === 'ihex32e')
    {
      return '11111111';
    }
    else if (radix === 'ihex32f')
    {
      return '00000000000000000000000';
    }
    else if (radix === 'ihex32de')
    {
      return '+128';
    }
    else if (radix === 'ihex32df')
    {
      return '0';
    }
    else if (radix === 'i32Status')
    {
      return 'Overflow';
    }
    if (radix === 'ihex64')
    {
      if (!this.isNegative)
      {
        return '7FF0000000000000 (+Infinity)';
      }
      else
      {
        return 'FFF0000000000000 (-Infinity)';
      }
    }
    else if (radix === 'ihex64s')
    {
      return this.isNegative * 1;
    }
    else if (radix === 'ihex64e')
    {
      return '11111111111';
    }
    else if (radix === 'ihex64f')
    {
      return '0000000000000000000000000000000000000000000000000000';
    }
    else if (radix === 'ihex64de')
    {
      return '+1024';
    }
    else if (radix === 'ihex64df')
    {
      return '0';
    }
    else if (radix === 'i64Status')
    {
      return 'Overflow';
    }
    if (radix === 'ihex128')
    {
      if (!this.isNegative)
      {
        return '7FFF0000000000000000000000000000 (+Infinity)';
      }
      else
      {
        return 'FFFF0000000000000000000000000000 (-Infinity)';
      }
    }
    else if (radix === 'ihex128s')
    {
      return this.isNegative * 1;
    }
    else if (radix === 'ihex128e')
    {
      return '111111111111111';
    }
    else if (radix === 'ihex128f')
    {
      return '0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000';
    }
    else if (radix === 'ihex128de')
    {
      return '+16384';
    }
    else if (radix === 'ihex128df')
    {
      return '0';
    }
    else if (radix === 'i128Status')
    {
      return 'Overflow';
    }
    else if (radix === 'isv')
    {
      var sign_symbol = '+';
      if (this.isNegative)
      {
        sign_symbol = '-';
      }
      return sign_symbol;
    }
    return (this.isNegative ? '-' : '+') + 'Infinity';
  }
  if (this.isNaN)
  {
    if (radix === 32)
    {
      if (this.binary_32_fraction_bits == 0)
      {
        if (this.isNegative)
        {
          return this.hex_String32 + ' (-Infinity)';
        }
        return this.hex_String32 + ' (+Infinity)';
      }
      else
      {
        return this.hex_String32;
      }
    }
    else if (radix === '32s')
    {
      return this.isNegative * 1;
    }
    else if (radix === '32e')
    {
      return this.binary_32_exponent_bits;
    }
    else if (radix === '32f')
    {
      return this.binary_32_fraction_bits;
    }
    else if (radix === '32de')
    {
      var sign = '+';
      if (this.binary_32_exponent_value < 0)
      {
        sign = '-';
      }
      else if (this.binary_32_exponent_value - 127 == 0)
      {
        sign = '';
      }
      if (this.binary_32_exponent_value - 127 < 0)
      {
        return this.binary_32_exponent_value - 127;
      }
      else
      {
        return sign + (this.binary_32_exponent_value - 127);
      }
    }
    else if (radix === 64)
    {
      if (this.binary_64_fraction_bits == 0)
      {
        if (this.isNegative)
        {
          return this.hex_String64 + ' (-Infinity)';
        }
        return this.hex_String64 + ' (+Infinity)';
      }
      else
      {
        return this.hex_String64;
      }
    }
    else if (radix === '64s')
    {
      return this.isNegative * 1;
    }
    else if (radix === '64e')
    {
      return this.binary_64_exponent_bits;
    }
    else if (radix === '64f')
    {
      return this.binary_64_fraction_bits;
    }
    else if (radix === '64de')
    {
      var sign = '+';
      if (this.binary_64_exponent_value < 0)
      {
        sign = '-';
      }
      else if (this.binary_64_exponent_value - 1023 == 0)
      {
        sign = '';
      }
      if (this.binary_64_exponent_value - 1023 < 0)
      {
        return this.binary_64_exponent_value - 1023;
      }
      else
      {
        return sign + (this.binary_64_exponent_value - 1023);
      }
    }
    else if (radix === 128)
    {
      if (this.binary_128_fraction_bits == 0)
      {
        if (this.isNegative)
        {
          return this.hex_String128 + ' (-Infinity)';
        }
        return this.hex_String128 + ' (+Infinity)';
      }
      else
      {
        return this.hex_String128;
      }
    }
    else if (radix === '128s')
    {
      return this.isNegative * 1;
    }
    else if (radix === '128e')
    {
      return this.binary_128_exponent_bits;
    }
    else if (radix === '128f')
    {
      return this.binary_128_fraction_bits;
    }
    else if (radix === '128de')
    {
      var sign = '+';
      if (this.binary_128_exponent_value < 0)
      {
        sign = '-';
      }
      else if (this.binary_128_exponent_value - 16383 == 0)
      {
        sign = '';
      }
      if (this.binary_128_exponent_value - 16383 < 0)
      {
        return this.binary_128_exponent_value - 16383;
      }
      else
      {
        return sign + (this.binary_128_exponent_value - 16383);
      }
    }
    else if (radix === 'sv')
    {
      var sign_symbol = '+';
      if (this.isNegative)
      {
        sign_symbol = '-';
      }
      return sign_symbol;
    }
    else if (radix === '32status')
    {
      if (this.binary_32_fraction_bits == 0)
      {
        return 'Overflow';
      }
    }
    else if (radix === '64status')
    {
      if (this.binary_64_fraction_bits == 0)
      {
        return 'Overflow';
      }
    }
    else if (radix === '128status')
    {
      if (this.binary_128_fraction_bits == 0)
      {
        return 'Overflow';
      }
    }
    else if (radix === '32df')
    {
      if (this.binary_32_fraction_bits == 0)
      {
        return '0';
      }
    }
    else if (radix === '64df')
    {
      if (this.binary_64_fraction_bits == 0)
      {
        return '0';
      }
    }
    else if (radix === '128df')
    {
      if (this.binary_128_fraction_bits == 0)
      {
        return '0';
      }
    }
    return (this.isSignalling ? 's' : 'q') + 'NaN';
  }
  var returnValue = (this.isNegative ? '-' : '');
  if (this.isZero && (radix === 2 || radix === 10))
  {
    returnValue += '0.0';
    if (DEBUG)
    {
      console.log(debug_spaces[debug_depth--] + 'return zero');
    }
    return returnValue;
  }
  if ((typeof radix !== "undefined") && (radix === 2))
  {
    // Generate the string representation of the value in binary
    // -----------------------------------------------------------------------------------------
    /*
     * Binary values are always normalized so that the most significant bit is
     * the integer part of the number. Except for subnormals, this bit is
     * implicit in IEEE-754 values. If there is a binary recurrence, it is
     * displayed inside square brackets to the right of the binary point.
     * 
     * The maximum number of bits displayed is BINARY_DISPLAY_DIGITS_LIMIT, plus
     * 1 for the integer part.
     */
    var removeLeadingZeros = this.binary_integer;
    while ((removeLeadingZeros.length > 1)
        && removeLeadingZeros.charAt(0) === '0')
    {
      removeLeadingZeros = removeLeadingZeros.substr(1);
    }
    this.binary_integer = removeLeadingZeros;
    returnValue += this.binary_integer;
    if (this.binary_fraction === '0')
    {
      this.binary_fraction = '';
    }
    if (this.binary_fraction !== '')
    {
      if (this.isIEEESubnormal == true)
      {// so this will handle the denormalized normalized binary value
        var bf = this.binary_fraction;
        while ((bf.length > this.binary_exponent)
            && bf.charAt(bf.length - 1) === '0')
        {
          bf = bf.substr(0, bf.length - 1);
        }
        this.binary_fraction = bf;
        // then simply reassign the binary fraction to return value
        returnValue = '.'
            + this.binary_fraction.substr(0, this.BINARY_DISPLAY_DIGITS_LIMIT);
        var index = 1; // 0 character is the . so we can start at 1
        var count = 0;
        while (returnValue.charAt(index) === '0')// so this will end as soon as
        // you find the first non zero
        // value
        {
          index++;
          count++;// the count tells us how many spots we had to move over so
          // then you add that to the binary exponent
        }
        count++; // add one more time for the time you failed the while loop
        // but still moved over to normalize
        count = count * -1; // we need it to be negative
        returnValue = returnValue.substr(index, 1) + '.'
            + returnValue.substr(index + 1);
        if (returnValue.charAt(returnValue.length - 1) === '.')
        { // add a single trailing zero if needed
          returnValue = returnValue + '0';
        }
        if (this.isNegative)
        {// add a negative sign if negative
          returnValue = '-' + returnValue;
        }
        if (this.binary_fraction.length > this.BINARY_DISPLAY_DIGITS_LIMIT)
        {
          returnValue += '... ';
        }
        if (this.binary_exponent !== 0)
        {
          returnValue += 'b' + this.binary_exponent;
        }
      }
      else if (this.binary_recurrence_start < 0)
      {
        // Fraction, but no recurrence
        var bf = this.binary_fraction;
        while ((bf.length > this.binary_exponent)
            && bf.charAt(bf.length - 1) === '0')
        {
          bf = bf.substr(0, bf.length - 1);
        }
        this.binary_fraction = bf;
        if (this.binary_fraction === '')
        {
          this.binary_fraction = '0';
        }
        // then simply reassign the binary fraction to return value
        returnValue += '.'
            + this.binary_fraction.substr(0, this.BINARY_DISPLAY_DIGITS_LIMIT);
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
        // Fraction with recurrence
        returnValue += '.'
            + this.binary_fraction.substr(0, this.binary_recurrence_start)
            + '['
            + this.binary_recurrence
                .substr(0, this.BINARY_DISPLAY_DIGITS_LIMIT);
        if (this.binary_recurrence.length > this.BINARY_DISPLAY_DIGITS_LIMIT)
        {
          returnValue += '... ';
        }
        returnValue += ']...'
            + ((this.binary_exponent === 0) ? '' : ('B' + this.binary_exponent));
      }
    }
    else
    {
      returnValue += '.0';
      returnValue += ((this.binary_exponent === 0) ? ''
          : ('B' + this.binary_exponent));
    }
  }
  else if (radix === 32)
  {
    if (this.isHex32Underflow || this.isZero)
    {
      if (this.isNegative)
      {
        return '80000000';
      }
      else
      {
        return '00000000';
      }
    }
    else if ((this.hex_String32.length != 8) || this.isHex32Overflow)
    {
      if (!this.isNegative)
      {
      if(this.roundMode == 'rz'){
      return '7F7FFFFF';  
      }
      else if(this.roundMode == 'rpi'){
      return '7F800000 (+Infinity)';  
      }
      else if(this.roundMode == 'rni'){
      return '7F7FFFFF';  
      }
      else{//for roundMode rnv
          return '7F800000 (+Infinity)'; // if positive overflow
      }
      }
      else
      {
      if(this.roundMode == 'rz'){
      return 'FF7FFFFF';  
      }
      else if(this.roundMode == 'rpi'){
      return 'FF7FFFFF';  
      }
      else if(this.roundMode == 'rni'){
      return 'FF800000 (-Infinity)';  
      }
      else{//for roundMode rnv
      return 'FF800000 (-Infinity)'; // if negative overflow
      }
      }
    }
    return this.hex_String32;
  }
  else if (radix === '32s')
  {
    return this.isNegative * 1;
  }
  else if (radix === '32e')
  {
    if (this.isHex32Underflow || this.isZero)
    {
      return '00000000';
    }
    if ((this.hex_String32.length != 8) || this.isHex32Overflow)
    {
    if(this.roundMode == 'rz'){
    return '11111110';  
    }
    else if(this.roundMode == 'rpi'){
        if (!this.isNegative){
      return '11111111';  
    }
    else return '11111110';
    }
    else if(this.roundMode == 'rni'){
        if (!this.isNegative){
      return '11111110';  
    }
    else return '11111111';
    }
    else{//for roundMode rnv
    return '11111111';
    }
    }
    return this.binary_32_exponent_bits;
  }
  else if (radix === '32f')
  {
    if (this.isHex32Underflow || this.isZero)
    {
      return '00000000000000000000000';
    }
    else if ((this.hex_String32.length != 8) || this.isHex32Overflow)
    {
    if(this.roundMode == 'rz'){
    return '1.11111111111111111111111';  
    }
    else if(this.roundMode == 'rpi'){
        if (!this.isNegative){
      return '00000000000000000000000';  
    }
    else return '1.11111111111111111111111';
    }
    else if(this.roundMode == 'rni'){
        if (!this.isNegative){
      return '1.11111111111111111111111';  
    }
    else return '00000000000000000000000';
    }
    else{//for roundMode rnv
    return '00000000000000000000000';
    }
    }
    else if (this.isHex32Denormal === true)
    {
      if (this.parseAs === 10 || this.parseAs === 2)
      {
        return '0.' + this.binary_32_fraction_bits;
      }
      else
      {
        return '0.' + this.binary_32_fraction_bits;
      }
    }
    return '1.' + this.binary_32_fraction_bits;
  }
  else if (radix === '32de')
  {
    if (this.isHex32Underflow || this.isZero)
    {
      return '-126';
    }
    else if ((this.hex_String32.length != 8) || this.isHex32Overflow)
    {
    if(this.roundMode == 'rz'){
    return '+127';  
    }
    else if(this.roundMode == 'rpi'){
        if (!this.isNegative){
      return '+128';  
    }
    else return '+127';
    }
    else if(this.roundMode == 'rni'){
        if (!this.isNegative){
      return '+127';  
    }
    else return '+128';
    }
    else{//for roundMode rnv
      return '+128';
    }
    }
    else if (this.isHex32Denormal === true)
    {
      return 0 - 126;
    }
    var sign = '+';
    if (this.binary_32_exponent_value < 0)
    {
      sign = '-';
    }
    else if (this.binary_32_exponent_value - 127 == 0)
    {
      sign = '';
    }
    if (this.binary_32_exponent_value - 127 < 0)
    {
      return this.binary_32_exponent_value - 127;
    }
    else
    {
      return sign + (this.binary_32_exponent_value - 127);
    }
  }
  else if (radix === '32df')
  {
    if (this.isHex32Underflow || this.isZero)
    {
      return '0';
    }
    if ((this.hex_String32.length != 8) || this.isHex32Overflow)
    {
    if(this.roundMode == 'rz'){
    return '1.99999988079071044921875';  
    }
    else if(this.roundMode == 'rpi'){
        if (!this.isNegative){
      return '0';  
    }
    else return '1.99999988079071044921875';
    }
    else if(this.roundMode == 'rni'){
        if (!this.isNegative){
      return '1.99999988079071044921875';  
    }
    else return '0';
    }
    else{//for roundMode rnv
        return '0';
    }
    }
    else if (this.isHex32Denormal === true)
    {
      return '0.' + this.binary_32_fraction_value;
    }
    return '1.' + this.binary_32_fraction_value;
  }
  else if (radix === '32status')
  {
    if (this.isHex32Overflow)
    {
    return 'Overflow';
    }
    if (this.isHex32Underflow)
    {
      return 'Underflow';
    }
    if (this.isHex32Denormal)
    {
      return 'Subnormal';
    }
    return 'Normal';
  }
  else if (radix === 64)
  {
    if (this.isHex64Underflow || this.isZero)
    {
      if (this.isNegative)
      {
        return '8000000000000000';
      }
      else
      {
        return '0000000000000000';
      }
    }
    else if ((this.hex_String64.length != 16) || this.isHex64Overflow)
    {
      if (!this.isNegative)
      {
    if(this.roundMode == 'rz'){
      return '7FEFFFFFFFFFFFFF';  
    }
    else if(this.roundMode == 'rpi'){
      return '7FF0000000000000 (+Infinity)';  
    }
    else if(this.roundMode == 'rni'){
      return '7FEFFFFFFFFFFFFF';  
    }
    else{//for roundMode rnv
      return '7FF0000000000000 (+Infinity)'; // if positive overflow
    }
      }
      else
      {
    if(this.roundMode == 'rz'){
      return 'FFEFFFFFFFFFFFFF';  
    }
    else if(this.roundMode == 'rpi'){
      return 'FFEFFFFFFFFFFFFF';  
    }
    else if(this.roundMode == 'rni'){
      return 'FFF0000000000000(-Infinity)';  
    }
    else{//for roundMode rnv
      return 'FFF0000000000000(-Infinity)'; // if negative overflow
    }
      }
    }
    return this.hex_String64;
  }
  else if (radix === '64s')
  {
    return this.isNegative * 1;
  }
  else if (radix === '64e')
  {
    if (this.isHex64Underflow || this.isZero)
    {
      return '00000000000';
    }
    else if ((this.hex_String64.length != 16) || this.isHex64Overflow)
    {
    if(this.roundMode == 'rz'){
    return '11111111110';  
    }
    else if(this.roundMode == 'rpi'){
        if (!this.isNegative){
      return '11111111111';  
    }
    else return '11111111110';
    }
    else if(this.roundMode == 'rni'){
        if (!this.isNegative){
      return '11111111110';  
    }
    else return '11111111111';
    }
    else{//for roundMode rnv
    return '11111111111';
    }
    }
    return this.binary_64_exponent_bits;
  }
  else if (radix === '64f')
  {
    if (this.isHex64Underflow || this.isZero)
    {
      return '0000000000000000000000000000000000000000000000000000';
    }
    else if ((this.hex_String64.length != 16) || this.isHex64Overflow)
    {
    if(this.roundMode == 'rz'){
    return '1.1111111111111111111111111111111111111111111111111111';  
    }
    else if(this.roundMode == 'rpi'){
        if (!this.isNegative){
      return '0000000000000000000000000000000000000000000000000000';  
    }
    else return '1.1111111111111111111111111111111111111111111111111111';
    }
    else if(this.roundMode == 'rni'){
        if (!this.isNegative){
      return '1.1111111111111111111111111111111111111111111111111111';  
    }
    else return '0000000000000000000000000000000000000000000000000000';
    }
    else{//for roundMode rnv
        return '0000000000000000000000000000000000000000000000000000';
    }
    }
    else if (this.isHex64Denormal === true)
    {
      if (this.parseAs === 10 || this.parseAs === 2)
      {
        return '0.' + this.binary_64_fraction_bits;
      }
      else
      {
        return '0.' + this.binary_64_fraction_bits.substr(0, 51);
      }
    }
    return '1.' + this.binary_64_fraction_bits;
  }
  else if (radix === '64de')
  {
    if (this.isHex64Underflow || this.isZero)
    {
      return '-1022';
    }
    else if ((this.hex_String64.length != 16) || this.isHex64Overflow)
    {
    if(this.roundMode == 'rz'){
    return '+1023';  
    }
    else if(this.roundMode == 'rpi'){
        if (!this.isNegative){
      return '+1024';  
    }
    else return '+1023';
    }
    else if(this.roundMode == 'rni'){
        if (!this.isNegative){
      return '+1023';  
    }
    else return '+1024';
    }
    else{//for roundMode rnv
        return '+1024';
    }
    }
    else if (this.isHex64Denormal === true)
    {
      return 0 - 1022;
    }
    var sign = '+';
    if (this.binary_64_exponent_value < 0)
    {
      sign = '-';
    }
    else if (this.binary_64_exponent_value - 1023 == 0)
    {
      sign = '';
    }
    if (this.binary_64_exponent_value - 1023 < 0)
    {
      return this.binary_64_exponent_value - 1023;
    }
    else
    {
      return sign + (this.binary_64_exponent_value - 1023);
    }
  }
  else if (radix === '64df')
  {
    if (this.isHex64Underflow || this.isZero)
    {
      return '0';
    }
    if ((this.hex_String64.length != 16) || this.isHex64Overflow)
    {
    if(this.roundMode == 'rz'){
    return '1.9999999999999997779553950749686919152736';  
    }
    else if(this.roundMode == 'rpi'){
        if (!this.isNegative){
      return '0';  
    }
    else return '1.9999999999999997779553950749686919152736';
    }
    else if(this.roundMode == 'rni'){
        if (!this.isNegative){
      return '1.9999999999999997779553950749686919152736';  
    }
    else return '0';
    }
    else{//for roundMode rnv
        return '0';
    }
    }
    else if (this.isHex64Denormal === true)
    {
      return '0.' + this.binary_64_fraction_value;
    }
    return '1.' + this.binary_64_fraction_value;
  }
  else if (radix === '64status')
  {
    if (this.isHex64Overflow)
    {
    return 'Overflow';
    }
    if (this.isHex64Underflow)
    {
      return 'Underflow';
    }
    if (this.isHex64Denormal)
    {
      return 'Subnormal';
    }
    return 'Normal';
  }
  else if (radix === 128)
  {
    if (this.isHex128Underflow || this.isZero)
    {
      if (this.isNegative)
      {
        return '80000000000000000000000000000000';
      }
      else
      {
        return '00000000000000000000000000000000';
      }
    }
    else if ((this.hex_String128.length != 32) || this.isHex128Overflow)
    {
      if (!this.isNegative)
      {
    if(this.roundMode == 'rz'){
      return '7FFEFFFFFFFFFFFFFFFFFFFFFFFFFFFF';  
    }
    else if(this.roundMode == 'rpi'){
      return '7FFF0000000000000000000000000000 (+Infinity)';  
    }
    else if(this.roundMode == 'rni'){
      return '7FFEFFFFFFFFFFFFFFFFFFFFFFFFFFFF';  
    }
    else{//for roundMode rnv
      return '7FFF0000000000000000000000000000 (+Infinity)'; // if positive
    }
      // overflow
      }
      else
      {
    if(this.roundMode == 'rz'){
      return 'FFFEFFFFFFFFFFFFFFFFFFFFFFFFFFFF';  
    }
    else if(this.roundMode == 'rpi'){
      return 'FFFEFFFFFFFFFFFFFFFFFFFFFFFFFFFF';  
    }
    else if(this.roundMode == 'rni'){
      return 'FFFF0000000000000000000000000000 (-Infinity)';  
    }
    else{//for roundMode rnv
      return 'FFFF0000000000000000000000000000 (-Infinity)'; // if negative
    }
        // overflow
      }
    }
    return this.hex_String128;
  }
  else if (radix === '128s')
  {
    return this.isNegative * 1;
  }
  else if (radix === '128e')
  {
    if (this.isHex128Underflow || this.isZero)
    {
      return '000000000000000';
    }
    else if ((this.hex_String128.length != 32) || this.isHex128Overflow)
    {
    if(this.roundMode == 'rz'){
    return '111111111111110';  
    }
    else if(this.roundMode == 'rpi'){
        if (!this.isNegative){
      return '111111111111111';  
    }
    else return '111111111111110';
    }
    else if(this.roundMode == 'rni'){
        if (!this.isNegative){
      return '111111111111110';  
    }
    else return '111111111111111';
    }
    else{//for roundMode rnv
    return '111111111111111';
    }
    }
    return this.binary_128_exponent_bits;
  }
  else if (radix === '128f')
  {
    if (this.isHex128Underflow || this.isZero)
    {
      return '00000000000000000000000000000000000000000000000000000000' +
             '00000000000000000000000000000000000000000000000000000000';
    }
    else if ((this.hex_String128.length != 32) || this.isHex128Overflow)
    {
    if(this.roundMode == 'rz'){
    return '1.1111111111111111111111111111111111111111111111111111111111' + 
         '111111111111111111111111111111111111111111111111111111';  
    }
    else if(this.roundMode == 'rpi'){
        if (!this.isNegative){
      return '00000000000000000000000000000000000000000000000000000000' +
           '00000000000000000000000000000000000000000000000000000000';  
    }
    else return '1.1111111111111111111111111111111111111111111111111111111111' + 
              '111111111111111111111111111111111111111111111111111111';  
    }
    else if(this.roundMode == 'rni'){
        if (!this.isNegative){
      return '1.1111111111111111111111111111111111111111111111111111111111' + 
             '111111111111111111111111111111111111111111111111111111';  
    }
    else return '00000000000000000000000000000000000000000000000000000000' +
            '00000000000000000000000000000000000000000000000000000000';
    }
    else{//for roundMode rnv
      return '00000000000000000000000000000000000000000000000000000000' +
         '00000000000000000000000000000000000000000000000000000000';
    }
    }
    else if (this.isHex128Denormal === true)
    {
      if (this.parseAs === 10 || this.parseAs === 2)
      {
        return '0.' + this.binary_128_fraction_bits;
      }
      else
      {
        return '0.' + this.binary_128_fraction_bits.substr(0, 111);
      }
    }
    return '1.' + this.binary_128_fraction_bits;
  }
  else if (radix === '128de')
  {
    if (this.isHex128Underflow || this.isZero)
    {
      return '-16382';
    }
    else if ((this.hex_String128.length != 32) || this.isHex128Overflow)
    {
    if(this.roundMode == 'rz'){
    return '+16383';  
    }
    else if(this.roundMode == 'rpi'){
        if (!this.isNegative){
      return '+16384';  
    }
    else return '+16383';
    }
    else if(this.roundMode == 'rni'){
        if (!this.isNegative){
      return '+16383';  
    }
    else return '+16384';
    }
    else{//for roundMode rnv
    return '+16384';
    }
    }
    else if (this.isHex128Denormal === true)
    {
      return 0 - 16382;
    }
    var sign = '+';
    if (this.binary_128_exponent_value < 0)
    {
      sign = '-';
    }
    else if (this.binary_128_exponent_value - 16383 == 0)
    {
      sign = '';
    }
    if (this.binary_128_exponent_value - 16383 < 0)
    {
      return this.binary_128_exponent_value - 16383;
    }
    else
    {
      return sign + (this.binary_128_exponent_value - 16383);
    }
  }
  else if (radix === '128df')
  {
    if (this.isHex128Underflow || this.isZero)
    {
      return '0';
    }
    else if ((this.hex_String128.length != 32) || this.isHex128Overflow)
    {
    if(this.roundMode == 'rz'){
    return '1.9999999999999999999999999999999998074070';  
    }
    else if(this.roundMode == 'rpi'){
        if (!this.isNegative){
      return '0';  
    }
    else return '1.9999999999999999999999999999999998074070';
    }
    else if(this.roundMode == 'rni'){
        if (!this.isNegative){
      return '1.9999999999999999999999999999999998074070';  
    }
    else return '0';
    }
    else{//for roundMode rnv
        return '0';
    }
    }
    else if (this.isHex128Denormal === true)
    {
      return '0.' + this.binary_128_fraction_value;
    }
    return '1.' + this.binary_128_fraction_value;
  }
  else if (radix === '128status')
  {
    if (this.isHex128Overflow)
    {
    return 'Overflow';
    }
    if (this.isHex128Underflow)
    {
      return 'Underflow';
    }
    if (this.isHex128Denormal)
    {
      return 'Subnormal';
    }
    return 'Normal';
  }
  else if (radix === 'sv')
  {
    var sign_symbol = '+';
    if (this.isNegative)
    {
      sign_symbol = '-';
    }
    return sign_symbol;
  }
  else
  {
    // Generate string representation of the value in decimal.
    // -----------------------------------------------------------------------------------------
    /*
     * If the integer part of the value is greater than zero, the value is
     * normalized so there there is one digit to the left of the decimal point.
     * If the integer part is zero, the value is shown with the most significant
     * digit immediately to the right of the decimal point. If there is a
     * recurrence, it is shown inside square brackets inside the fraction part
     * of the value, even if the integer part is part of the pattern.
     * 
     * The maximum number of digits is DECIMAL_DISPLAY_DIGITS, plus one for the
     * integer part.
     */
    returnValue += (this.decimal_integer);
    if (this.decimal_fraction !== '')
    {
      if (this.decimal_recurrence_start < 0)
      {
        returnValue += '.'
            + this.decimal_fraction
                .substr(0, this.DECIMAL_DISPLAY_DIGITS_LIMIT);
        if (this.decimal_fraction.length > this.DECIMAL_DISPLAY_DIGITS_LIMIT)
        {
          returnValue += '... ';
        }
        if (this.decimal_exponent !== 0)
        {
          returnValue += 'E' + this.decimal_exponent;
        }
      }
      else
      {
        // Fraction with recurrence
        returnValue += '.'
            + this.decimal_fraction.substr(0, this.decimal_recurrence_start)
            + '['
            + this.decimal_fraction.substr(this.decimal_recurrence_start)
            + ']...'
            + ((this.decimal_exponent === 0) ? ''
                : ('E' + this.decimal_exponent));
      }
    }
    else
    {
      // No fraction part
      returnValue += '.0';
      returnValue += ((this.decimal_exponent === 0) ? ''
          : ('E' + this.decimal_exponent));
    }
  }
  return returnValue;
};

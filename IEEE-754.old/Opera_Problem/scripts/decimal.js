// $Id: decimal.js,v 1.1 2010/03/27 05:00:14 vickery Exp vickery $
/*  Arithmetic on unsigned decimal strings.
 *  Designed to allow users to enter rational numbers with an unlimited number
 *  of digits in the numerator and denominator. Will implement multiplication
 *  when needed. Addition and subtraction work with and return unsigned
 *  integers.
 *    TODO  Represent NaN, +Infinity, and -Infinity
 *
 *  $Log: decimal.js,v $
 *  Revision 1.1  2010/03/27 05:00:14  vickery
 *  Initial revision
 *
 */

//  The Decimal Library constructor
//  ============================================================================
/*  Public functions are add(), subtract(), multiply(), and divide().
 *  Internal functions are prepArgs() and compare().
 *  compare() returns -1, 0, or +1
 *  add(), subtract(), and multiply() return numeric strings.
 *  divide() returns an object that will print a numeric string, but the
 *  integer, fraction, and recurrence_start values can be accessed.
 */
function Decimal()
{
  var DECIMAL_PRECISION = 512;
  var BINARY_PRECISION  = 512;

  //  setDecimalPrecision()
  //  -------------------------------------------------------------------------
  function setDecimalPrecision(newPrecision)
  {
    var oldPrecision = DECIMAL_PRECISION;
    DECIMAL_PRECISION = newPrecision;
    return oldPrecision;
  }

  //  setBinaryPrecision()
  //  -------------------------------------------------------------------------
  function setBinaryPrecision(newPrecision)
  {
    var oldPrecision = BINARY_PRECISION;
    BINARY_PRECISION = newPrecision;
    return oldPrecision;
  }

  //  decimal_value()
  //  =========================================================================
  var decimal_value = function(i, f, s, r, e)
  {
    this.integer_part     = i;
    this.fraction_part    = f;
    this.isNegative       = s;
    this.recurrence_start = r;
    this.exponent         = e;
  };

  //  decimal_value.normalize()
  //  -------------------------------------------------------------------------
  /*  One digit to the left of the decimal point; no zeros to the right of
   *  the decimal point unless it's the start of the recurrence.
   */
  decimal_value.prototype.normalize = function()
  {
    var recurrence_string = '';
    var recurrence_start = this.recurrence_start;
    var integer_part = ltrim(this.integer_part);
    var fraction_part = this.fraction_part;
    if (integer_part.length > 1)
    {
      if (recurrence_start > -1)
      {
        recurrence_string = fraction_part.substr(recurrence_start);
      }
      while (integer_part.length > 1)
      {
        fraction_part =
          integer_part.charAt(integer_part.length - 1) + fraction_part;
        integer_part = integer_part.substr(0, integer_part.length - 1);
        this.exponent++;
      }
      if (recurrence_string.length > 0)
      {
        while (fraction_part.length >= (recurrence_string.length * 2))
        {
          fraction_part = fraction_part.substr(0, fraction_part.length = recurrence_string.length);
        }
        recurrence_start = fraction_part.length - recurrence_string.length;
      }
    }
    else if (integer_part === '0')
    {
      while (fraction_part.charAt(0) === '0')
      {
        if (recurrence_start === 0) break;
        if (recurrence_start > -1) recurrence_start--;
        fraction_part = fraction_part.substr(1);
        this.exponent--;
      }
    }
    this.integer_part     = integer_part;
    this.fraction_part    = fraction_part;
    this.recurrence_start = recurrence_start;
    return this;
  }

  //  decimal_value.toBinary()
  //  -------------------------------------------------------------------------
  /*  Convert a decimal_value object to a normalized binary string
   */
  decimal_value.prototype.toBinary = function()
  {
    var binary_integer = '';
    var decimal_integer = this.integer_part;
    var decimal_fraction = this.fraction_part;
    var decimal_exponent = this.exponent;
    while (compare(decimal_exponent, 0) > 0)
    {
      // TODO shift left, filling in with recurrence digits if necessary
    }
    while (compare(decimal_exponent, 0) < 0)
    {
      //  TODO shift right ...
    }
    for (var i = 0; i < BINARY_PRECISION; i++)
    {
      var division_result = divide(decimal_integer, '2');
      binary_integer = binary_integer.concat((division_result.fraction_part === '5') ? '1' : '0');
      decimal_integer = division_result.integer_part;
      if (decimal_integer === '0') break;
    }
    //  TODO fraction part;
    return binary_integer;
  }
  //  decimal_value.toString()
  //  --------------------------
  decimal_value.prototype.toString = function()
  {
    var result = (this.isNegative ? '-' : '') + this.integer_part;
    if (this.fraction_part != '')
    {
      if (this.recurrence_start < 0)
      {
        return  result + '.' + this.fraction_part +
          ((this.exponent === 0) ? '' : ('E' + this.exponent));
      }
      else
      {
        return result + '.' + this.fraction_part.substr(0, this.recurrence_start) + '[' +
          this.fraction_part.substr(this.recurrence_start) + ']...' +
          ((this.exponent === 0) ? '' : ('E' + this.exponent));
      }
    }
    else
    {
      return result + ((this.exponent === 0) ? '' : ('E' + this.exponent));
    }
  }

//  prepArgs()
//  ---------------------------------------------------------------------------
/*  Convert strings of unsigned decimal digits into arrays of integers of
 *  equal length. Index positions correspond to positional power of 10.
 *  (That is, the digits are reversed).
 */
  function prepArgs()
  {
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

    return result;
  }

//  trim()
//  ---------------------------------------------------------------------------
/*  Remove leading and trailing whitespace from a string.
 */
  function trim(arg)
  {
    var result = /^\s*(\S)*\s*$/.exec(arg);
    if (result && result[1]) return result[1];
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

//  parse()
//  ---------------------------------------------------------------------------
/*  Parse a string into a decimal_object. The input string may be signed. Values
 *  may be integers, fractional decimals, rationals, or mixed numbers. All
 *  values may use exponential notation, but rationals and mixed numbers may use
 *  only positive exponents.
 */
  function parse(inputString)
  {
    var isNegative            = false;
    var integer_part          = '';
    var fraction_part         = '';
    var exponent              = '0';

    var mixedRE = new RegExp(
        "^\\s*(([+\\-]?\\d+)([Ee](\\d+))?\\s+)?"  + // whole number
        "([+\\-]?\\d+)\\s*([Ee](\\d+))?\\s*"      + // numerator
        "\\/"                                     + // solidus for division slash
        "\\s*([+\\-]?\\d+)\\s*([Ee](\\d+))?\\s*$"); // denominator
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
         numerator = add(numerator, (multiply(whole_number, denominator)));
      }
      var value = divide(numerator, denominator);
      if (sign === '-') value.isNegative = !value.isNegative;
      return value.normalize();
    }

    //  Plain ol' number?
    var pon = /^\s*([+\-])?(\d+)?(\.(\d*))?([Ee]([+\-]?\d+))?\s*$/.exec(inputString);
    if (pon)
    {
      if (pon[1]) isNegative    = pon[1] === '-';
      if (pon[2]) integer_part  = pon[2];
      if (pon[4]) fraction_part = pon[4];
      if (pon[6]) exponent      = pon[6];
      if (integer_part.length + fraction_part.length > 0)
      {
        var value =
          new decimal_value(ltrim(integer_part), rtrim(fraction_part), isNegative, -1, exponent);
        return value.normalize();
      }
    }
    return "not recognized as a number";
  }
  this.parse = parse;


//  add()
//  ---------------------------------------------------------------------------
/*  Add the augend and addend.
 */
  function add(arg1, arg2, trim)
  {
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
        diff = subtract(arg1, arg2, true);
        diff = values.sign1.concat(diff);
      }
      else
      {
        diff = subtract(arg2, arg1, true);
        diff = values.sign2.concat(diff);
      }
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
    return sum;
  }
  this.add = add;


//  subtract()
//  ---------------------------------------------------------------------------
/*  Subtract the unsigned minuend from the unsigned subtrahend. The subtrahend
 *  must be numerically larger than the minuend. Returns a string the length
 *  of the subtrahend with leading zeros.
 *  Use the trim argument to trim the leading zeros.
 */
  function subtract(arg1, arg2, trim)
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
  this.subtract = subtract;

//  multiply()
//  ---------------------------------------------------------------------------
/*  Multiplicand by multiplier; return the product.
 */
  function multiply(arg1, arg2)
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
      product = String.fromCharCode(carry + 48) + add(product, partial_product);
    }
    return (multiplier_sign !== multiplicand_sign ? '-' : '') + ltrim(String.fromCharCode(carry + 48) + product);
  };
  this.multiply = multiply;

//  divide()
//  ---------------------------------------------------------------------------
/*  Signed division of divisor by dividend, giving integer and fraction parts.
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
 *        there is none.  If the fraction is shorter than DECIMAL_PRECISION, goto F.
 *      Return a decimal_value object with the sign, integer part, fraction
 *      part, and recurrence start position.
 */
  function divide(arg1, arg2)
  {
    var integer_part      =  '';
    var fraction_part     =  '';
    var remainder         =  '';
    var remainders        = [ ];
    var dividend_index    =   0;
    var digit_value       =   0;
    var recurrence_start  =  -1;
    var dividend_sign     = '+';
    var divisor_sign      = '+';
    var dividend          = arg1;
    var divisor           = arg2;

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

    //  Divide by zero?
    if (compare(divisor, '0') === 0) return new decimal_value(Infinity, '', -1);

    //  Result less than 1?
    if (compare(dividend, divisor) < 0)
    {
      //  yes; divisor is larger than dividend
      integer_part = '0';
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
          remainder = subtract(remainder, divisor, true);
        }
        integer_part = integer_part.concat(String.fromCharCode(48 + digit_value));
        if (dividend_index + divisor.length < dividend.length)
        {
          remainder = ltrim(remainder.concat(dividend[dividend_index + divisor.length]));
        }
        dividend_index++;
      }
    }
    integer_part = ltrim(integer_part);

    //  Fraction Part
    remainders[0] = remainder;
    while (fraction_part.length < DECIMAL_PRECISION)
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
        remainder = subtract(remainder, divisor, true);
      }
      fraction_part = fraction_part.concat(String.fromCharCode(48 + digit_value));
      remainder = ltrim(remainder);
      if (remainder === '0') break;
      for (var i = 0; i < remainders.length; i++)
      {
        if (remainders[i] === remainder)
        {
          recurrence_start = i;
          break;
        }
      }
      if (recurrence_start > -1) break;
      remainders.push(remainder);
      dividend_index++;
    }

    return new decimal_value( integer_part,
                              fraction_part,
                              divisor_sign !== dividend_sign,
                              recurrence_start, 0);
  };
  this.divide = divide;
}

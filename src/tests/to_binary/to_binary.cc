//  to_binary.cc
/*  Convert decimal value < 1.0 entered on the command line to a pure binary 
 *  fraction.
 *  Used as a sanity check for the analyzer web page.
 *  Note: The code doesn't free any of the memory it allocates dynamically.
 *        Either there is enough available to process a single decimal value, 
 *        or there isn't.
 *
 *  Uses a regular expression to parse command line, so the code must be linked to libpcre.
 *
 *  Christopher Vickery
 *  January 2012
 */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#include <pcre.h>
#define OVECCOUNT 30

//  parse_arg()
//  ---------------------------------------------------------------------------
/*  Parse an unsigned decimal argument string into a pure decimal fraction 
 *  string, with the decimal point assumed at the left end.
 *    Syntax:
 *    integer_part.fraction_part[e[+|-]exponent_part]
 *    Example:
 *      750.0e-3 => 7500
 */
  char *
  parse_arg(char *arg)
  {
    //  Use regex to parse the argument
    const char *error;
          int   error_offset;
          int   ovector[OVECCOUNT];
    const char *pattern = "^\\s*(\\d+)\\.(\\d+)([eE]([+-]?\\d+))?\\s*$";
    pcre *re = pcre_compile(pattern, 0, &error, &error_offset, NULL);
    if (re == NULL)
    {
      fprintf(stderr, "PCRE compilation failed at offset %d: %s\n",
                      error_offset, error);
      exit(EXIT_FAILURE);
    }

    int rc = pcre_exec(re, NULL, arg, strlen(arg), 0, 0, ovector, OVECCOUNT);
    if (rc < 3)
    {
      fprintf(stderr, "%s is not a valid argument\n", arg);
      exit(EXIT_FAILURE);
    }

    //  Extract the integer part
    char *integer_part = (char *)"";
    int  integer_len = ovector[3] - ovector[2];
    char *integer_str = (char *)malloc(integer_len + 1);
    strncpy(integer_str, arg + ovector[2], integer_len);
    // Trim leading zeros from integer part
    while (integer_len > 0 && '0' == *integer_str)
    {
      integer_str++;
      integer_len--;
    }

    integer_str[integer_len] = '\0';
    integer_part = integer_str;
    
    //  Extract the fraction part
    //char *fraction_part = (char *)"";
    int  fraction_len = ovector[5] - ovector[4];
    char *fraction_part = (char *) malloc(fraction_len + 1);
    strncpy(fraction_part, arg + ovector[4], fraction_len);
    fraction_part[fraction_len] = '\0';
    //fraction_part = fraction_str;
    
    //  If there is an exponent, get its value and use it to insert or remove
    //  the proper number of zeros at the left end of the result.
    char *exponent_part = (char *)"0";
    int  exponent_val = 0;
    if (rc > 3)
    {
      int exponent_len = ovector[9] - ovector[8];
      exponent_part = (char *)malloc(exponent_len + 1);
      strncpy (exponent_part, arg + ovector[8], exponent_len);
      exponent_val = atoi(exponent_part);
    }
    int num_leading_zeros = 0;
    if (exponent_val < 0)
    {
      num_leading_zeros = - strlen(integer_part) - exponent_val;
      if (num_leading_zeros < 0)
      {
        //  A negative number of leading zeros means the argument had an integer
        //  part even after scaling using the exponent value.
        fprintf(stderr, "%s is not less than 1.0\n", arg);
        exit(EXIT_FAILURE);
      }
    }
    if (exponent_val > 0)
    {
      //  Positive exponent: there must be no integer part; trim leading zeros
      if (0 == strlen(integer_part))
      {
        while ((exponent_val > 0) && (fraction_len > 0) && '0' == *fraction_part)
        {
          fraction_part++;
          fraction_len--;
          exponent_val--;
        }
      }
      if (exponent_val > 0)
      {
        //  If the exponent is still positive, the value is too large
        fprintf(stderr, "%s is not less than 1.0\n", arg);
        exit(EXIT_FAILURE);
      }
    }
    //  Construct the string to return, and do so
    int return_len = num_leading_zeros + integer_len + fraction_len;
    char *return_value = (char *) malloc(return_len + 1);
    memset(return_value, '\0', return_len + 1);
    memset(return_value, '0', num_leading_zeros);
    strcat(return_value, integer_part);
    strncat (return_value, fraction_part, fraction_len);
    return return_value;
  }

//  Structure for returning one bit of the fraction from the next_bit function
struct result_t
{
  int   bit;
  char *fraction;
};

//  next_bit()
//  ---------------------------------------------------------------------------
/*  Extracts most significant bit of the fraction, returning the fraction,
 *  doubled, and the bit.
 */
  result_t
  next_bit(char *fraction)
  {
    int len = strlen(fraction);
    int c   = 0;
    result_t  return_value;
    return_value.fraction = (char*) malloc(1 + len);
    memset(return_value.fraction, '\0', len);
    for (int i = len -1; i > -1; i--)
    {
      int v = fraction[i] - '0';
      int sum = v + v + c;
      c = sum / 10;
      return_value.fraction[i] = (sum % 10) + '0';
    }
    return_value.bit = c;
    return return_value;
  }

//  not_zero()
//  ---------------------------------------------------------------------------
  bool
  not_zero(char *arg)
  {
    while (char ch = *arg++)
    {
      if (ch != '0') return true;
    }
    return false;
  }

//  main()
//  ---------------------------------------------------------------------------
/*  Command line argument, if present, is a normalized decimal number:
 *    d.fff...[e+|-nnn...]
 *    That is, one digit to the left of the decimal point, a fraction of any
 *    length, and an optional signed exponent introduced by an e.
 *    Note: this is for fractions only, so the exponent must be negative.
 */
  int
  main(int argc, char *argv[])
  {
    char *arg = (char *) "0.5"; //  Default argument
    char *val = NULL;
    if (argc == 2)
    {
      arg = argv[1];
    }
    val = parse_arg(arg);
    printf("decimal: .%s\n"
           " binary: .", val);
    
    //  Generate up to 115 significant bits
    int num_significant_bits    = 0;
    bool have_first_significant = false;
    result_t next;
    int i = 0;
    do
    {
      // Uncomment to group bits by fours
      //if (!(i++ % 4) && (i != 1)) printf(" ");
      next = next_bit(val);
      printf("%d", next.bit);
      strcpy(val, next.fraction);
      if (next.bit) have_first_significant = true;
      if (have_first_significant && (++num_significant_bits > 114))
      {
        printf("...\n");
        exit(EXIT_SUCCESS);
      }
    } while (not_zero(next.fraction));
    printf("\n");
  }


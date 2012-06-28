//  floating-point_analysis.cc

/*  Standard C includes functions for analyzing floating-point values:
 *    significand() Returns the value of the significand, including the hidden
 *                  bit.
 *    frexp()       Returns the significand and exponent, but in this case the
 *                  significand is normalized (shifted right one bit) to have a
 *                  zero integer part.
 *
 *  Both functions come in a standard form, which accepts and returns doubles.
 *  There are also forms ending in 'f' [significandf(), frexpf()] and 'l' that
 *  take and return floats and long doubles, respectively.
 *
 *  On my development system, signficandf() and significandl() are not
 *  available, but frexpf() and frexpl() are, so the code below deals with that,
 *  and the calls to significand() should be changed on systems that support all
 *  three forms.
 *
 *  Christopher Vickery
 *  January 1, 2012
 */
#include <locale.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <math.h>

union alias32_t
{
  u_int32_t integer;
  float     real;
};
union alias64_t
{
  u_int64_t integer;
  double    real;
};

union __attribute__ ((__packed__)) alias128_t
{
  u_int64_t   integer[2];
  long double real;
};

static const char *bin_table[] = 
{
  "0000", "0001", "0010", "0011",
  "0100", "0101", "0110", "0111",
  "1000", "1001", "1010", "1011",
  "1100", "1101", "1110", "1111",
};
//  main()
//  ----------------------------------------------------------------------------
/*  Run significand and frexp against a real number in all three floating-point
 *  formats.
 */
  int main(int argc, char *argv[])
  {
    setlocale(LC_ALL, "");
    //  Command line argument, if present is a real number.
    //  If omitted, an arbitrary value is used.
    float       f = 123.75;
    double      d = 123.75;
    long double l = 123.75;

    if (argc == 2)
    {
      f = strtod(argv[1],  NULL);
      d = strtod(argv[1],  NULL);
      l = strtold(argv[1], NULL);
    }

    alias32_t binary32;
    alias64_t binary64;
    alias128_t  binary128;
    binary32.real   = f;
    binary64.real   = d;
    binary128.real  = l;
    int sign32  = (binary32.integer & 0x80000000) >> 31;
    int sign64  = (binary64.integer & 0x8000000000000000) >> 63;
    int exp32   = (binary32.integer & 0x7f800000) >> 23;
    int exp64   = (binary64.integer & 0x7ff0000000000000) >> 52;
    int mant32  = (binary32.integer & 0x007FFFFF);
    long mant64 = (binary64.integer & 0x000FFFFFFFFFFFFF);

    //  Binary representation of 23-bit significand field for Binary32
    char char_mant32[34]  = "";
    for (int i = 0; i < 6; i++)
    {
      int bin = 20 - (i * 4);
      int hex = (mant32 >> bin) & ((i == 0) ? 0x07 : 0x0F);
      strcat(char_mant32, bin_table[hex]);
      if (i == 0)
      {
        //  Only three bits from leftmost nibble
        memmove(char_mant32, char_mant32 + 1, 4);
      }
      strcat(char_mant32, " ");
    }

    //  Bionary representation of 52-bit significand field for Binary64
    char char_mant64[81]  = "";
    for (int i = 0; i < 13; i++)
    {
      int bin = 48 - (i << 2);
      int hex = (mant64 >> bin) & 0x0F;
      strcat(char_mant64, bin_table[hex]);
      strcat(char_mant64, " ");
    }

    u_int64_t x[] = 
    {
      0x0BADC0DE0BADC0DE,
      0x0BADC0DE0BADC0DE,
    };
    //  Fields for Binary32 and Binary64
    printf( "Binary32\n"
            "  Value:       %g (%08X)\n"
            "  Sign:        %d\n"
            "  Exponent:    %d (%d)\n"
            "  Signficand:  %'d (%06X)\n"
            "               %s\n"
            "Binary64\n"
            "  Value:       %g (%016lX)\n"
            "  Sign:        %d\n"
            "  Exponent:    %d (%d)\n"
            "  Signficand:  %'ld (%012lX)\n"
            "               %s\n"
            "Binary128\n"
            "  Value:       %Lg (%016lX%016lX)\n",
            binary32.real,  (unsigned) binary32.integer, 
            sign32, exp32, exp32 - 127, mant32, mant32, char_mant32,
            binary64.real,  (long unsigned) binary64.integer, 
            sign64, exp64, exp64 - 1023, mant64, mant64, char_mant64,
            binary128.real,
//            (unsigned long)x[0], (unsigned long)x[1]); 
            (unsigned long)binary128.integer[0],
            (unsigned long)binary128.integer[1]);

    //  Show the significand. Should be the same as the decimal value shown by
    //  http://babbage.cs.qc.cuny.edu/IEEE-754.
    printf( "significand()\n"
            "  f: %.10f\n"
            "  d: %.10f\n"
            "  l: %.10f\n", significand(f), significand(d), significand(l));

    //  Show the fraction and exponent. In this case, double the fraction so it
    //  has a 1 to the left of the decimal point, and adjust the exponent to
    //  match. Again, results should agree with the analyzer on babbage.
    int         exp_f, exp_d, exp_l;
    float       frac_f = frexpf(f, &exp_f);
    double      frac_d = frexp(d,  &exp_d);
    long double frac_l = frexpl(l, &exp_l);
    printf ("frexp():\n"
            "  f: %.10f %d\n"
            "  d: %.10f %d\n"
            "  l: %.10Lf %d\n", 
            frac_f + frac_f, exp_f - 1, 
            frac_d + frac_d, exp_d - 1, 
            frac_l + frac_l, exp_l - 1);
    exit(EXIT_SUCCESS);
  }


//  floating-point_test.cc

//  Test floating-point exception reporting for operations on Binary32 operands.
//  Christopher Vickery
//  Queens College of CUNY

/*  Utility program to work with Binary32 floating-point numbers entered as
 *  hexadecimal values. The FP flags reported here should agree with the Status
 *  reported by the IEEE-754 Floating-Point Analyzer at
 *  http://babbage.cs.qc.cuny.edu/IEEE-754 in all cases. The FE flags reported
 *  here, however, have been observed to vary across platforms.
 *
 *  This code is distributed under an MIT-style license: you are free to use it
 *  in any way you wish provided only that you cite the author if you publish or
 *  sell it.
 */

/*  History
 *  -------
 *  December 29, 2011
 *  Read floating-point arguments from the command line, divide, and report the
 *  results, along with any FE_xxx flags that are set as a result.
 *
 *  December 30, 2011
 *  Changed flags from -n and -d to -1 and -2 and implemented all four
 *  operations, with flags (a, s, m, d) to suppress the ones not wanted.
 *  Re-coded the structs for flag names and values to use the macros themselves
 *  for the values rather than hand-coding their numbers, making the code not
 *  platform-specific.
 *  Reversed the hex and decimal order in the outputs; changed to g format for
 *  the decimals.
 *  Changed program name from underflow_test to floating-point_test.
 */

//  Sample runs:
//  ---------------------------------------------------------------------------
/*
 *  $ ./floating-point_test
 *  $ ./floating-point_test -asm -1 3F800000 -2 7e800000
 *  $ ./floating-point_test -asm -1 3F800000 -2 7e7fffff
 *  $ ./floating-point_test -asm -1 3F800000 -2 7f000001
 *  $ ./floating-point_test -asm -1 0AFFFFFF -2 4A000000
 */

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <sys/types.h>

#include <math.h>
#include <fenv.h>

//  Flag names and values
struct flags_t
{
  const char *name;
  const int   value;
};

//  FE flag macros
static const flags_t fe_flags[] =
  {
    {"FE_INEXACT",          FE_INEXACT},
    {"FE_UNDERFLOW",        FE_UNDERFLOW},
    {"FE_OVERFLOW",         FE_OVERFLOW},
    {"FE_DIVBYZERO",        FE_DIVBYZERO},
    {"FE_INVALID",          FE_INVALID},
  };

//  FP flag macros
static const flags_t  fp_flags[] =
  {
    {"FP_NAN",          FP_NAN},
    {"FP_INFINITE",     FP_INFINITE},
    {"FP_ZERO",         FP_ZERO},
    {"FP_NORMAL",       FP_NORMAL},
    {"FP_SUBNORMAL",    FP_SUBNORMAL},
  };

static const int num_fe_flags = sizeof(fe_flags) / sizeof(flags_t);
static const int num_fp_flags = sizeof(fp_flags) / sizeof(flags_t);

//  Alias for hex input of Binary32 values
union alias32_t {
  float               real;
  u_int32_t           hex;
  };

//  Alias for hex64 input of Binary64 values
union alias64_t {
  double              real;
  u_int64_t           hex;
  };

//  Alias for hex128 input of Binary128 values
union alias128_t {
  long double         real;
  u_int64_t           hex[2];
  };

//  get_fe_str()
//  ----------------------------------------------------------------------------
/*  Returns the string representation of the currently set of FE flags.
 *  Caller is responsible for freeing the returned string.
 */
  char *
  get_fe_str()
  {
    int   fe_exceptions = fetestexcept(FE_ALL_EXCEPT);
    char *fe_flags_str  = (char*) malloc(1024);
    for (int i = 0; i < num_fe_flags; i++)
    {
      if ((fe_exceptions & fe_flags[i].value) == fe_flags[i].value)
      {
        if (0 != strlen(fe_flags_str)) fe_flags_str = strcat(fe_flags_str, " | ");
        fe_flags_str = strcat(fe_flags_str, fe_flags[i].name);
      }
    }
  }

//  get_fp_str()
//  ----------------------------------------------------------------------------
/*  Like get_fe_str() only different. Provide a floating-point argument.
 *  Caller doesn't have to free anything.
 */
  template <class T>
  const char *
  get_fp_str(T arg)
  {
    //  Generate the fp_ results
    int fp_type = fpclassify(arg);
    for (int i = 0; i < num_fp_flags; i++)
    {
      if (fp_type == fp_flags[i].value)
      {
        return fp_flags[i].name;
      }
    }
    return NULL;
  }

//  validate_hex()
//  ---------------------------------------------------------------------------
/*  Verify that a string is a valid hex constant with 8, 16, or 32 digits.
 *    Returns the hex-only string (no 0X), or NULL if not valid.
 */
  void *
  validate_hex(const char *str)
  {
    static const char hex_chars[] = "0123456789ABCDEFabcdef";
    char *arg = (char*)malloc(33);

    //  Strip leading 0x or 0X
    if (!strncmp(str, "0x", 2) || !strncmp(str, "0X", 2))
    {
      strcpy(arg, &str[2]);
    }
    else
    {
      strcpy(arg, str);
    }

    //  Validate hexiness
    bool is_hex = true;
    for (int i = 0; i < strlen(arg); i++)
    {
      if (NULL == strchr(hex_chars, arg[i]))
      {
        is_hex = false;
        break;
      }
    }

    //  Validate siziness
    if (is_hex)
    {
      int len = strlen(arg);
      if (len ==  8 || len == 16 || len == 32 ) return arg;
    }
    return NULL;
  }

//  main()
//  ---------------------------------------------------------------------------
/*  Process command line arguments; do the calculations; report the results.
 */
  int
  main(int argc, char *argv[], char *envp[])
  {
    //  The following pragma has no effect on the calculations in this program
    //  on my devlopment system, whether it is 'ON' or 'OFF.'
#pragma STDC FENV_ACCESS ON

    //  Verify environment
    //  -------------------------------------------------------------------------
    int float_size = -1, double_size = -1, long_double_size = -1;
    bool do_32 = true, do_64 = true, do_128 = true;

    if (getenv("NO_FLOAT"))  do_32  = false;
    if (getenv("NO_DOUBLE")) do_64  = false;
    if (getenv("NO_QUAD"))  do_128  = false;
    if (do_32)
    {
      float_size  = (sizeof(float) << 3);
    }
    if (do_64)
    {
      double_size = (sizeof(double) << 3);
    }
    if (do_128)
    {
      long_double_size = (sizeof(long double) << 3);
    }
    if ((do_32  && (float_size  != 32)) ||
        (do_64  && (double_size != 64)) ||
        (do_128 && (long_double_size != 128))
       )
    {
      fprintf(stderr, 
          "\nERROR: There is a mismatch between the way this program requires "
          "floating-point\nvalues to be stored and how they are actually stored "
          "on this machine:\n"
          "  Type          Required   Found\n"
          "  float         32 bits   %3d bits\n"
          "  double        64 bits   %3d bits\n"
          "  long double  128 bits   %3d bits\n"
          "You can disable unsupported data types by setting environment "
          " variables:\n"
          "  NO_FLOAT   No Binary32  support\n"
          "  NO_DOUBLE  No Binary64  support\n"
          "  NO_QUAD    No Binary128 support\n"
          "As things stand now: unable to proceed.\n",
          float_size, double_size, long_double_size);
      exit(EXIT_FAILURE);
    }
    //  Default operators
    bool add = true, sub = true, mul = true, div = true;

    //  32-bit arguments, their defaults (1.0), and the result.
    alias32_t arg32_1, arg32_2, result32;
    memset(&arg32_1, '\0', sizeof(alias32_t));
    memset(&arg32_2, '\0', sizeof(alias32_t));
    arg32_1.real = 1.0;
    arg32_2.real = 1.0;

    //  64-bit arguments, their defaults (1.0), and the result.
    alias64_t arg64_1, arg64_2, result64;
    memset(&arg64_1, '\0', sizeof(alias64_t));
    memset(&arg64_2, '\0', sizeof(alias64_t));
    arg64_1.real = 1.0;
    arg64_2.real = 1.0;

    //  128-bit arguments, their defaults (1.0), and the result.
    alias128_t arg128_1, arg128_2, result128;
    memset(&arg128_1, '\0', sizeof(alias128_t));
    memset(&arg128_2, '\0', sizeof(alias128_t));
    arg128_1.real = 1.0;
    arg128_2.real = 1.0;

    /*  Two arguments of the same size will be processed. If the user enters
     *  different sized values for command line arguments -1 and -2, the larger
     *  will be downsized using the rounding mode in effect.
     *
     *  With no command line values, the 32-bit default values will be used.
     */

    int arg1_width = 32, arg2_width = 32;
    int rounding_mode = FE_TONEAREST;

    //  Process command line options, if present.
    //  -------------------------------------------------------------------------
    /*    1 Hex first operand (addend, minuend, muliplicand, arg32_1)
     *    2 Hex second operand (augend, subtrahend, multiplier, arg32_2)
     *    a Suppress Add
     *    s Suppress Subtract
     *    m Suppress Multiply
     *    d Suppress Divide
     */
    int ch = NULL;
    while ((ch = getopt(argc, argv, "1:2:asmdUDNZ")) != -1)
    {
      switch (ch)
      {
        case '1':
          {
            char *arg = (char *)validate_hex(optarg);
            int len = 0;
            if (arg) len = strlen(arg) << 2;
            switch (len)
            {
              case 32:
                arg32_1.hex   = (u_int32_t) strtoul(arg, NULL, 16);
                arg64_1.real  = arg32_1.real;
                arg128_1.real = arg32_1.real;
                arg1_width = 32;
                break;
              case 64:
                arg64_1.hex   = strtoull(arg, NULL, 16);
                arg32_1.real  = arg64_1.real;
                arg128_1.real = arg64_1.real;
                arg1_width = 64;
                break;
              case 128:
                {
                  char left[17] = "", right[17] = "";
                  strncat(left,  arg, 16);
                  strncat(right, arg + 16,   16);
                  arg128_1.hex[0] = strtoull(left,  NULL, 16);
                  arg128_1.hex[1] = strtoull(right, NULL, 16);
                  arg32_1.real = arg128_1.real;
                  arg64_1.real = arg128_1.real;
                  arg1_width = 128;
                  break;
                }
              default:
              fprintf(stderr, "%s (%d): invalid hexadecimal operand\n", optarg, len);
              exit(EXIT_FAILURE);
            }
printf("%f\n%lf\n%Lf\n", arg32_1.real, arg64_1.real, arg128_1.real);
printf("%08X\t\t\t  %s\n%016lX\t\t  %s\n%016lX%016lX  %s\n",
    (unsigned int)arg32_1.hex,  get_fp_str(arg32_1.real),
    (unsigned long)arg64_1.hex, get_fp_str(arg64_1.real), 
    (unsigned long)arg128_1.hex[0], (unsigned long)arg128_1.hex[1], get_fp_str(arg128_1.real));
          }
          break;
        case '2': 
           {
            char *arg = (char *)validate_hex(optarg);
            int len = 0;
            if (arg) len = strlen(arg) << 2;
            switch (len)
            {
              case 32:
                arg32_2.hex = (u_int32_t) strtoul(arg, NULL, 16);
                break;
              case 64:
                arg64_2.hex = strtoull(arg, NULL, 16);
                break;
              case 128:
                {
                  char left[17] = "", right[17] = "";
                  strncat(left,  arg, 16);
                  strncat(right, arg + 16,   16);
                  arg128_2.hex[0] = strtoull(left,  NULL, 16);
                  arg128_2.hex[1] = strtoull(right, NULL, 16);
                  break;
                }
              default:
              fprintf(stderr, "%s (%d): invalid hexadecimal operand\n", optarg, len);
              exit(EXIT_FAILURE);
            }
printf("%08X\t%s\n%016lX\n%016lX%016lX\n",
    (unsigned int)arg32_2.hex, get_fp_str(arg32_2.real), 
    (unsigned long)arg64_2.hex, 
    (unsigned long)arg128_2.hex[0], (unsigned long)arg128_2.hex[1]);
          }
          break;
        //  Operations
        case 'a': add = false;
                  break;
        case 's': sub = false;
                  break;
        case 'm': mul = false;
                  break;
        case 'd': div = false;
                  break;
        //  Rounding modes
        case 'U': rounding_mode = FE_UPWARD;
                  break;
        case 'D': rounding_mode = FE_DOWNWARD;
                  break;
        case 'N': rounding_mode = FE_TONEAREST;
                  break;
        case 'Z': rounding_mode = FE_TOWARDZERO;
                  break;
        default:  fprintf(stderr, "Invalid option: %c\n", ch);
                  exit(EXIT_FAILURE);
      }
    }

    //  Display arguments and their types
    //  -------------------------------------------------------------------------
    //  Using the chosen rounding mode, convert both operands to the same width.

    fesetround(rounding_mode);
    int width = (arg1_width > arg2_width) ? arg1_width : arg2_width;
    if (arg1_width != width)
    {
      // TODO
    }
    //  Argument 1
    const int   arg32_1_type     = fpclassify(arg32_1.real);
    const char *arg32_1_type_str = "";
    for (int i = 0; i < num_fp_flags; i++)
    {
      if (arg32_1_type == fp_flags[i].value)
      {
        arg32_1_type_str = fp_flags[i].name;
        break;
      }
    }
    //  Argument 2
    const int   arg32_2_type     = fpclassify(arg32_2.real);
    const char *arg32_2_type_str = "";
    for (int i = 0; i < num_fp_flags; i++)
    {
      if (arg32_2_type == fp_flags[i].value)
      {
        arg32_2_type_str = fp_flags[i].name;
        break;
      }
    }
    printf("\nArgument 1: %08X (%s)\nArgument 2: %08X (%s)\n",
        arg32_1.hex,  arg32_1_type_str, arg32_2.hex,  arg32_2_type_str);

    //  Addition
    //  -------------------------------------------------------------------------
    if (add)
    {
      feclearexcept(FE_ALL_EXCEPT);
      result32.real = arg32_1.real + arg32_2.real;

      //  Generate the fe_ results
      int   fe_exceptions = fetestexcept(FE_ALL_EXCEPT);
      char *fe_flags_str  = (char*) malloc(1024);
      for (int i = 0; i < num_fe_flags; i++)
      {
        if ((fe_exceptions & fe_flags[i].value) == fe_flags[i].value)
        {
          if (0 != strlen(fe_flags_str)) fe_flags_str = strcat(fe_flags_str, " | ");
          fe_flags_str = strcat(fe_flags_str, fe_flags[i].name);
        }
      }

      //  Generate the fp_ results
      int fp_type = fpclassify(result32.real);
      const char* fp_type_str = "";
      for (int i = 0; i < num_fp_flags; i++)
      {
        if (fp_type == fp_flags[i].value)
        {
          fp_type_str = fp_flags[i].name;
          break;
        }
      }

      //  Display the results
      printf( "\nAddition\n--------\n"
              "  Addend:      %08X (%g)\n"
              "  Augend:      %08X (%g)\n"
              "  Result:      %08X (%g)\n"
              "  FE Flags:    %d (%s)\n"
              "  FP Type:     %s\n",
          arg32_1.hex,        arg32_1.real,
          arg32_2.hex,        arg32_2.real,
          result32.hex,      result32.real,
          fe_exceptions,  fe_flags_str,
          fp_type_str);
    }

    //  Subtraction
    //  -------------------------------------------------------------------------
    if (sub)
    {
      feclearexcept(FE_ALL_EXCEPT);
      result32.real = arg32_1.real - arg32_2.real;

      //  Generate the fe_ results
      int fe_exceptions   = fetestexcept(FE_ALL_EXCEPT);
      char *fe_flags_str  = (char*) malloc(1024);
      for (int i = 0; i < num_fe_flags; i++)
      {
        if ((fe_exceptions & fe_flags[i].value) == fe_flags[i].value)
        {
          if (0 != strlen(fe_flags_str)) fe_flags_str = strcat(fe_flags_str, " | ");
          fe_flags_str = strcat(fe_flags_str, fe_flags[i].name);
        }
      }

      //  Generate the fp_ results
      int fp_type = fpclassify(result32.real);
      const char* fp_type_str = "";
      for (int i = 0; i < num_fp_flags; i++)
      {
        if (fp_type == fp_flags[i].value)
        {
          fp_type_str = fp_flags[i].name;
          break;
        }
      }

      //  Display the results
      printf( "\nSubtraction\n--------\n"
              "  Minuend:     %08X (%g)\n"
              "  Subtrahend:  %08X (%g)\n"
              "  Result:      %08X (%g)\n"
              "  FE Flags:    %d (%s)\n"
              "  FP Type:     %s\n",
          arg32_1.hex,        arg32_1.real,
          arg32_2.hex,        arg32_2.real,
          result32.hex,      result32.real,
          fe_exceptions,  fe_flags_str,
          fp_type_str);
    }

    //  Multiplication
    //  -------------------------------------------------------------------------
    if (mul)
    {
      feclearexcept(FE_ALL_EXCEPT);
      result32.real = arg32_1.real * arg32_2.real;

      //  Generate the fe_ results
      int fe_exceptions   = fetestexcept(FE_ALL_EXCEPT);
      char *fe_flags_str  = (char*) malloc(1024);
      for (int i = 0; i < num_fe_flags; i++)
      {
        if ((fe_exceptions & fe_flags[i].value) == fe_flags[i].value)
        {
          if (0 != strlen(fe_flags_str)) fe_flags_str = strcat(fe_flags_str, " | ");
          fe_flags_str = strcat(fe_flags_str, fe_flags[i].name);
        }
      }

      //  Generate the fp_ results
      int fp_type = fpclassify(result32.real);
      const char* fp_type_str = "";
      for (int i = 0; i < num_fp_flags; i++)
      {
        if (fp_type == fp_flags[i].value)
        {
          fp_type_str = fp_flags[i].name;
          break;
        }
      }

      //  Display the results
      printf( "\nMultiplication\n--------\n"
              "  Multiplicand:  %08X (%g)\n"
              "  Multiplier:    %08X (%g)\n"
              "  Result:        %08X (%g)\n"
              "  FE Flags:      %d (%s)\n"
              "  FP Type:       %s\n",
          arg32_1.hex,        arg32_1.real,
          arg32_2.hex,        arg32_2.real,
          result32.hex,      result32.real,
          fe_exceptions,  fe_flags_str,
          fp_type_str);
    }

    //  Division
    //  -------------------------------------------------------------------------
    if (div)
    {
      feclearexcept(FE_ALL_EXCEPT);
      result32.real = arg32_1.real / arg32_2.real;

      //  Generate the fe_ results
      int fe_exceptions   = fetestexcept(FE_ALL_EXCEPT);
      char *fe_flags_str  = (char*) malloc(1024);
      for (int i = 0; i < num_fe_flags; i++)
      {
        if ((fe_exceptions & fe_flags[i].value) == fe_flags[i].value)
        {
          if (0 != strlen(fe_flags_str)) fe_flags_str = strcat(fe_flags_str, " | ");
          fe_flags_str = strcat(fe_flags_str, fe_flags[i].name);
        }
      }

      //  Generate the fp_ results
      int fp_type = fpclassify(result32.real);
      const char* fp_type_str = "";
      for (int i = 0; i < num_fp_flags; i++)
      {
        if (fp_type == fp_flags[i].value)
        {
          fp_type_str = fp_flags[i].name;
          break;
        }
      }

      //  Display the results
      printf( "\nDivision\n--------\n"
              "  Numerator:    %08X (%g)\n"
              "  Denominator:  %08X (%g)\n"
              "  Result:       %08X (%g)\n"
              "  FE Flags:     %d (%s)\n"
              "  FP Type:      %s\n",
          arg32_1.hex,    arg32_1.real,
          arg32_2.hex,    arg32_2.real,
          result32.hex,     result32.real,
          fe_exceptions,  fe_flags_str,
          fp_type_str);
    }
    printf("\n");
    exit(EXIT_SUCCESS);
  }


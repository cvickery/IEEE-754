//  ieee_754.cc
/*
 *  Print IEEE-754 representations of decimal numbers.
 *  
 *  C. Vickery
 */

//  inttypes.h should be stdint.h, but the latter doesn't work on
//  gcc 3.4.1 on solaris 8, and the former does work there as well as
//  on gcc 3.4.4 on cygwin, so I'm using the latter.
#include <inttypes.h>

#include <stdio.h>
#include <stdlib.h>

//  main()
//  -------------------------------------------------------------------
/*
 *  Prompts user to enter a number, then prints the hex representation
 *  of the 32 and 64 bit IEEE-754 representations.
 */
  int
  main(int argc, char *argv[])
  {
    //  Figure out whether this is a big-endian or little-endian
    //  processor.
    typedef enum { big, little } endian_t;
    union
    {
      uint64_t  word64;
      uint32_t  words32[2];
    } endian_union;
    endian_union.word64 = 1;
    endian_t endian = endian_union.words32[0] ? little : big;
#ifdef DEBUG
    printf("This is a %s-endian machine\n", (endian == big) ?
        "big" : "little");
#endif

    //  Get the user's value and alias parts of it to ints so they can
    //  be printed in hex.
    double    *dpointer, dvalue;
    float     *fpointer, fvalue;
    int       *int_pointer, *hi_pointer, *lo_pointer;

    printf("Enter a value: ");
    scanf("%lg", &dvalue);
    printf("\n");

    fvalue   = dvalue;
    printf("% -8.8g\n", fvalue);
    fpointer = &fvalue;
    int_pointer = (int *) fpointer;
    printf(" %08X\n\n", *int_pointer);

    printf("% -16.16g\n", dvalue);
    dpointer = &dvalue;
    hi_pointer = (int *) dpointer;
    lo_pointer = hi_pointer++;
    if ( endian == big )
    {
      int_pointer = hi_pointer;
      hi_pointer = lo_pointer;
      lo_pointer = int_pointer;
    }
    printf(" %08X%08X\n", *hi_pointer, *lo_pointer);
    exit(0);
  }


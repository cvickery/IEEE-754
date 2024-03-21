//  btd: converts binary number to a decimal number
//  Michael Lubow
//  November 2011

#include <stdio.h>
#include <string>
#include "gmp.h"

using namespace std;

//  main()
//  -------------------------------------------------------------------
/*  Command line arguments are three strings of digits:
 *    integer   (binary digits)
 *    exponent  (decimal value)
 *    fraction  (binary digits)
 *  Outputs are normalized decimal and binary representations
 *  of the input value, one part per line:
 *    decimal integer
 *    decimal fraction
 *    decimal exponent
 *    decimal recurrence digits
 *    decimal recurrence start position
 *    binary recurrence digits
 *    binary recurrence start
 *    binary integer
 *    binary fraction
 *    binary exponent
*/
  int main(int argc, char* argv[])
  {

    const int BINARY_PRECISION = 128;
    int       decimal_exponent;
    int       binary_exponent_v;
    string    binary_integer_v;
    string    binary_fraction_v;
    string    decimal_fraction;
    string    decimal_integer;
    int       decimal_recurrence_start = -1;
    int       binary_recurrence_start = -1;
    string    decimal_recurrence = "0";
    string    binary_recurrence = "0";
    string    temp;
    int       precision_so_far = 0;

    binary_integer_v = argv[1];
    binary_exponent_v = atoi(argv[2]);
    binary_fraction_v = argv[3];

    mpz_t result;
    mpz_init(result);

    string binfractemp = binary_fraction_v;

    // The n versions of the variable are the ones that are normalized and used
    // for the binary ouput but are not used for generating the decimal values
    string binary_integer_n = binary_integer_v;
    string binary_fraction_n = binary_fraction_v;
    int binary_exponent_n = binary_exponent_v;

    while(atoi(binary_integer_n.c_str()) > 1)
    {
      temp = binary_integer_n[binary_integer_n.length()-1];
      binary_fraction_n =  temp + binary_fraction_n;
      binary_integer_n = binary_integer_n.substr(0, binary_integer_n.length() - 1);
      binary_exponent_n++;
    }

    while (binary_integer_n == "0")
    {
      binary_integer_n = binary_fraction_n[0];
      binary_fraction_n = binary_fraction_n.substr(1);
      binary_exponent_n--;
    }

    if (binary_fraction_n.empty())
    {
      binary_fraction_n = "0";
    }

    //these are copies of the originals

    string binary_integer   = binary_integer_v;
    string binary_fraction  = binary_fraction_v;
    int binary_exponent     = binary_exponent_v;

    while (binary_exponent > 0)
    {
      binary_integer = binary_integer + binary_fraction[0];
      binary_fraction = binary_fraction.substr(1);
      if (binary_fraction.empty())
      {
        binary_fraction = "0";
      }
        binary_exponent--;
    }

    while (binary_exponent < 0)
    {
      temp = binary_integer[binary_integer.length() - 1];
      binary_fraction =  temp + binary_fraction;
      binary_integer = binary_integer.substr(0, binary_integer.length() - 1);
      if (binary_integer.empty())
      {
        binary_integer = "0";
      }
      binary_exponent++;
    }

    //  Decimal integer part
    decimal_integer = "0";

    mpz_t power_of_two;
    mpz_init(power_of_two);
    mpz_set_ui(power_of_two, 1);

    mpz_t di;
    mpz_init(di);
    mpz_set_ui(di, 0);

    for (int i = binary_integer.length() - 1; i > -1; i--)
    {
      //  if it's a 1 you add the decimal integer to the power of two (power of
      //  two starts at 1)
      if (binary_integer[i] == '1')
      {
        mpz_add(di, di, power_of_two);
      }
      mpz_add(power_of_two, power_of_two, power_of_two); //double the power_of_two
    }

    //  Decimal fraction part
    //  reset the power_of_two back to 1
    mpz_set_ui(power_of_two, 1);

    mpz_t df;
    mpz_init(df);
    mpz_set_ui(df, 0);

    decimal_fraction = "0";

    for (int i = binary_fraction.length() - 1; i > -1; i--)
    {
      //  if it is 1 add the decimal fraction to the power of two
      if (binary_fraction[i] == '1')
      {
        mpz_add(df, df, power_of_two);
      }
      mpz_add(power_of_two, power_of_two, power_of_two); //double the power_of_two
    }

    mpf_set_default_prec(1000);
    mpf_t decf;
    mpf_init(decf);
    mpf_set_z(decf, df);
    int n = 10;

    mpf_t powtwo;
    mpf_init(powtwo);
    mpf_set_z(powtwo, power_of_two);

    mpf_div(decf, decf, powtwo);


    //  Normalize
    decimal_exponent = 0;

    char* ditemp;
    char* dftemp;

    ditemp = mpz_get_str(NULL, 10, di);
    decimal_integer = ditemp;

    mp_exp_t a;

    dftemp = mpf_get_str(NULL, &a, 10, 10000, decf);
    decimal_fraction = dftemp;

    while( a <0)
    {
      decimal_fraction = "0" + decimal_fraction;
      a++;
    }

    while (decimal_integer.length()>1)
    {
      temp = decimal_integer[decimal_integer.length()-1];
      decimal_fraction =  temp + decimal_fraction;
      decimal_integer = decimal_integer.substr(0, decimal_integer.length() - 1);
      decimal_exponent++;
    }

    while (decimal_integer == "0")
    {
      decimal_integer = decimal_fraction[0];
      decimal_fraction = decimal_fraction.substr(1);
      decimal_exponent--;
    }

    if (decimal_integer.empty() == true)
    {
      decimal_integer = "0";
    }

    if (decimal_fraction.empty()==true)
    {
      decimal_fraction = "0";
    }

    string tempDI = decimal_integer;
    while (tempDI[0] == '0')
    {
      tempDI = tempDI.substr(1);
    }
    if (tempDI == "") tempDI = "0";

    decimal_integer = tempDI;

    printf("%s\n", decimal_integer.c_str());
    printf("%s\n", decimal_fraction.c_str());
    printf("%d\n", decimal_exponent);
    printf("%s\n", decimal_recurrence.c_str());
    printf("%d\n", decimal_recurrence_start);
    printf("%s\n", binary_recurrence.c_str());
    printf("%d\n", binary_recurrence_start);
    // These bottom three are the normalized binary values that also have to be
    // returned to the Javascript
    printf("%s\n", binary_integer_n.c_str());
    printf("%s\n", binary_fraction_n.c_str());
    printf("%d\n", binary_exponent_n);

    return 0;
  }


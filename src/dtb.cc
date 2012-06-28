//  dtb: converts decimal number to a binary number
//  Michael Lubow
//  November 2011

#include <iostream>
#include <string>
#include <vector>
#include <gmp.h>

using namespace std;

//  main()
//  -------------------------------------------------------------------
/*  Command line arguments:
 *    decimal integer
 *    decimal exponent
 *    decimal fraction
 *    decimal recurrence
 *    decimal recurrence start position
 *  Outputs:
 *    binary integer
 *    binary fraction
 *    binary  exponent
 *    decimal recurrence
 *    decimal recurrence start
 *    binary  recurrence
 *    binary  recurrence start
 */
  int main(int argc, char* argv[])
  {
    const int BINARY_PRECISION = 128;
    int       decimal_exponent;
    string    binary_integer;
    string    binary_fraction;
    string    decimal_fraction;
    string    di;
    string    decimal_recurrence = "0";
    int       decimal_recurrence_start = -1;
    string    binary_recurrence = "0";
    string    temp;
    int       precision_so_far = 0;
    int       binary_exponent = 0;

    di = argv[1];
    decimal_exponent = atoi(argv[2]);
    decimal_fraction = argv[3];
    decimal_recurrence = argv[4];
    decimal_recurrence_start = atoi(argv[5]);

    mpz_t result;
    mpz_init(result);


    //adjust the working copy so that the exponent is zero
    while (decimal_exponent > 0)
    {
      if (decimal_fraction.length() < 1)
      {
        if (decimal_recurrence_start > -1)
        {
          decimal_fraction = decimal_recurrence;
        }
        else
        {
          decimal_fraction = "0";
        }
      }
      di += decimal_fraction[0];
      decimal_fraction = decimal_fraction.substr(1);
      decimal_exponent--;
    }

    while (decimal_exponent < 0)
    {
      if (di.length() < 1) { di = "0";}
      temp = di[di.length() - 1];
      decimal_fraction = temp.append(decimal_fraction);
      di = di.substr(0, di.length() - 1);
      decimal_exponent++;
    }

    mpz_t decimal_integer;
    mpz_init(decimal_integer);
    //create local copy
    mpz_set_str(decimal_integer, di.c_str(), 10);

    while ((mpz_cmp_d(decimal_integer, 0) > 0))
    {
      mpz_t temp_dec;
      mpz_init(temp_dec);
      mpz_set(temp_dec, decimal_integer);

      mpz_tdiv_q_ui(result, decimal_integer, 2);
      mpz_set(decimal_integer, result);

      mpz_mod_ui(result, temp_dec, 2);

      if(mpz_cmp_d(result, 1)==0){//there is a remainder
        binary_integer = "1" + binary_integer;
      }
      else{//there is not a remainder
        binary_integer = "0" + binary_integer;
      }
      precision_so_far++;
    }

    if (binary_integer.empty()) { binary_integer = "0"; }
    int binary_recurrence_start = -1;

    //  If there is a decimal recurrence, be sure there is one complete copy available
    if ((atoi((decimal_recurrence.c_str())) > -1) &&
        (decimal_fraction.length() < decimal_recurrence.length()))
    {
      decimal_fraction = decimal_fraction + decimal_recurrence;
    }

    if (decimal_fraction.empty()) { decimal_fraction = "0"; }

    vector<string> decimal_fractions;
    decimal_fractions.push_back(decimal_fraction);

    int   pos = 0;
    bool  hasAlteredPSF = false;
    bool  foundFirstOne = false;
    int   count = 0;

    mpz_t intSum;
    mpz_init(intSum);
    string sum;
    char* tempSum;

    mpf_set_default_prec(20000);
    mpf_t df;
    mpf_init(df);
    mpf_set_str(df, ("0." + decimal_fraction).c_str(), 10);

    int n = 30;

    mpf_t temp_df;
    mpf_init(temp_df);

    mpf_t dr_temp;
    mpf_init(dr_temp);

    // adding another mpf here for recurrences that don't start at 0
    mpf_t superR; // stands for superRecurrence
    mpf_init(superR);
    mpf_set(superR, df);

    mpf_t powToMul; //  the power to multiply superR by to get decimal point to
                    //  the right of the recurrence spot
    mpf_init(powToMul);
    mpf_set_ui(powToMul, 1);

    for (int i = 0; i <=decimal_recurrence_start; i++)
    {
      mpf_mul_ui(powToMul, powToMul, 10);
    }

    mpf_mul(superR, superR, powToMul);

    long superRL; // stands for superRLong
    superRL = mpf_get_ui(superR); //  do away with the decimal stuff, leaving
                                  //  just the numbers to the left of the
                                  //  decimal point
    superRL = superRL + 1;
    int rac = 0;  //  recurrence array count
    int rArr[1000];
    superRL = superRL%10;
    rArr[rac] = superRL;
    rac++;

    mpf_t dfs [50000];
    for (int i =0; i<50000; i++)
    {
      mpf_init(dfs[i]);
    }

    int a = 0;
    bool binaryRecurrenceFound = false;
    mpf_set(dfs[a], df);
    a++;
    mpf_add(df, df, df);
    mpf_t poft; //  this is the power of ten variable, only used when there are
                //  decimal recurrences
    mpf_init(poft);
    int lofr = 0; // the length of the decimal recurrence
    lofr = decimal_recurrence.length();
    mpf_t d;
    mpf_init(d);
    mpf_set_ui(d, 1);
    for (int i = 0; i < lofr; i++)
    {
      mpf_div_ui(d, d, 10);
    }
    mpf_set(poft, d);
    // the variable drs tells us this, 0 is right next to the decimal, 1 is 1
    // away from this decimal and so on
    // need to locate the decimal recurrence string
    int drs = decimal_recurrence_start;
    // now we need to further move the decimal point to account for the distance
    // the recurrence starts from the decimal point
    for (int i =0 ; i < drs; i++)
    {
      // divide the poft by 10 for every spot the recurrence is away from the
      // decimal point example if drs is 1 you do poft/10 one time so 0.1 would
      // become 0.01
      mpf_div_ui(poft, poft, 10);
    }

    // now we need the power of ten that we will be comparing the "sum" to, to
    // decide whether to add anything to the "sum"
    // this is based on the drs, if drs = 0 then we compare to 1.0, if drs = 1
    // we compare to .1
    mpf_t e;
    mpf_init(e);
    mpf_set_ui(e, 1);
    for(int i = 0; i < drs; i++)
    {
      mpf_div_ui(e, e, 10);
    }
    mpf_t eCompare;
    mpf_init(eCompare);
    mpf_set(eCompare, e);

    if (decimal_recurrence_start> -1)
    {
      //so do this only for recurring numbers
      if (decimal_recurrence_start == 0)
      {
        if (mpf_cmp(df, eCompare) >= 0)
        {
          mpf_add(df, df, poft);
        }
        else
        {
        }
      }
      else
      {
        mpf_set(superR, df);
        mpf_mul(superR, superR, powToMul);
        superRL = mpf_get_ui(superR); // this should do away with the decimal
                                      // stuff leaving just the numbers to the
                                      // left of the decimal point
        superRL = superRL + 1;
        superRL = superRL % 10;
        rArr[rac] = superRL;
        if (rArr[rac] < rArr[rac-1])
        {
          rArr[rac] = rArr[rac] + 1; // add one to the value in the array
          mpf_add(df, df, poft);
        }
        rac++;
      }
    }

    int j = 0;
   	int limit = 0;
	int firstOne = -1;
	bool limitOK = false;
    while ((j<17000) && (mpf_cmp_ui(df, 0) > 0) && (binary_recurrence_start == -1))
    {
      mpf_set(dr_temp, df);
      mpf_set(temp_df, df);

      if (mpf_cmp_ui(temp_df, 1) >= 0)
      {
        mpf_sub_ui(temp_df, temp_df, 1);
      }

      for (int i = 0; i < a; i++)
      {
        if (mpf_eq(temp_df, dfs[i], 112) != 0)
        {
          // Binary recurrence found
          binaryRecurrenceFound = true;
          binary_recurrence_start =i;
          binary_recurrence = binary_fraction.substr(binary_recurrence_start);
          break;
        }
      }

      if (mpf_cmp_ui(df, 1) >= 0)
      {
        binary_fraction = binary_fraction + "1";
        mpf_sub_ui(df, df, 1);
        mpf_set(dfs[a], df);
        a++;
      }
      else
      {
        binary_fraction = binary_fraction + "0";
        mpf_set(dfs[a], df);
        a++;
      }

      mpf_add(df, df, df);

      if (decimal_recurrence_start> -1)
      {
        // do this only for recurring numbers
        float a = mpf_get_d(df);
        float b = mpf_get_d(eCompare);
        if (decimal_recurrence_start == 0)
        {
          if (mpf_cmp(df, eCompare) >= 0)
          {
            mpf_add(df, df, poft);
          }
          else if (a == b)
          {
            mpf_add(df, df, poft);
          }
          else
          {
          }
        }
        else
        {
          mpf_set(superR, df);
          mpf_mul(superR, superR, powToMul);
          // do away with the decimal stuff leaving just the numbers to the left
          // of the decimal point
          superRL = mpf_get_ui(superR);
          superRL = superRL + 1;
          superRL = superRL%10;
          rArr[rac] = superRL;
          if (rArr[rac] < rArr[rac-1])
          {
            rArr[rac] = rArr[rac] + 1; //add one to the value in the array
            mpf_add(df, df, poft);
          }
          rac++;
        }
      }

      if (mpf_cmp_ui(df, 0)==0)
      {
        break;
      }
      j++;
      if(binary_recurrence_start!=-1){
         binary_recurrence = binary_recurrence + binary_fraction[binary_fraction.length()-1];
      }
      if(binary_fraction.length() >= 120){
		if(j%120 == 0 && firstOne==-1){
			firstOne = binary_fraction.find_first_of("1");
			if(firstOne != -1){ 
				limit = firstOne + 120;
				limitOK=true;
			}
		}
	  }
     if(j == limit && limitOK ==true){
		break;
	 }
    } //end of while
    mpz_clear(intSum);
    mpf_clear(df);

    // Normalize binary value
    while (binary_integer.length()>1)
    {
      temp = binary_integer.at(binary_integer.length()-1);
      binary_fraction = temp.append(binary_fraction);
      binary_integer = binary_integer.substr(0, binary_integer.length() - 1);
      binary_exponent++;
      if (binary_recurrence_start > -1)
      {
        binary_recurrence_start++;
      }
    }

    while (binary_integer == "0")
    {
      binary_integer = binary_fraction[0];
      binary_fraction = binary_fraction.substr(1);
      binary_exponent--;
      if (binary_recurrence_start > -1)
      {
        binary_recurrence_start--;
        if (binary_fraction.length() < binary_recurrence.length())
        {
          binary_recurrence_start = binary_fraction.length();
          binary_fraction = binary_fraction.append(binary_recurrence);
        }
      }
    }


    if (binary_fraction.empty())
    {
      binary_fraction = "0";
    }

    printf("%s\n", binary_integer.c_str());
    printf("%s\n", binary_fraction.c_str());
    printf("%d\n", binary_exponent);
    printf("%s\n", decimal_recurrence.c_str());
    printf("%d\n", decimal_recurrence_start);
    printf("%s\n", binary_recurrence.c_str());
    printf("%d\n", binary_recurrence_start);

    return 0;
  }




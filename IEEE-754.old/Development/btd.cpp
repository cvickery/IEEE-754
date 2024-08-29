// BinToDecMPIRCommandLineVer1.cpp : main project file.

#include <iostream>
#include <sstream>
#include <string>
#include <vector>
#include <gmp.h>

using namespace std;

int main(int argc, char* argv[]){

	const int BINARY_PRECISION = 128;
	int decimal_exponent;
	int binary_exponent_v;
	string binary_integer_v;
	string binary_fraction_v;
	string decimal_fraction;
	string decimal_integer;
	//gmp_printf("Please enter a binary integer:");
	//cin >> binary_integer_v;
	//gmp_printf("Please enter a binary exponent:");
	//cin >> binary_exponent_v;
	//gmp_printf("Please enter a binary fraction:");
	//cin >> binary_fraction_v;
	int decimal_recurrence_start = -1;
	int binary_recurrence_start = -1;
	string decimal_recurrence = "0";
	string binary_recurrence = "0";
    string temp; //helper variable
	int precision_so_far = 0;

	//the below lines are for command line
	binary_integer_v = argv[1];
	binary_exponent_v = atoi(argv[2]);
	binary_fraction_v = argv[3];
	

	mpz_t result;
	mpz_init(result);


	string binfractemp = binary_fraction_v;


	//the n versions of the variable are the ones that are normalized and used for the binary ouput but are not used for generating the decimal values
	string binary_integer_n = binary_integer_v; 
	string binary_fraction_n = binary_fraction_v;
	int binary_exponent_n = binary_exponent_v;

	//this while loop is just to move the decimal place to the left to normalize the binary number
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

	//not 100% sure about this but will probably need this line
	if(binary_fraction_n.empty()){
		binary_fraction_n = "0";
	}


	//will want to print these 3 variables in the end
	
	//debug
	//cout << binary_integer_n << endl;
	//cout << binary_fraction_n << endl;
	//cout << binary_exponent_n << endl;

	//everything above is good

	//exit(1);



	//these are copies of the originals

      string binary_integer = binary_integer_v;
      string binary_fraction = binary_fraction_v;
      int binary_exponent = binary_exponent_v;

	  while (binary_exponent > 0)
      {
        binary_integer = binary_integer + binary_fraction[0];
        binary_fraction = binary_fraction.substr(1);
		if (binary_fraction.empty()) {binary_fraction = "0";}
        binary_exponent--;
      }
	  
      while (binary_exponent < 0)
      {
		temp = binary_integer[binary_integer.length()-1];
       // binary_fraction = binary_fraction + temp;
		 binary_fraction =  temp + binary_fraction;
        binary_integer = binary_integer.substr(0, binary_integer.length() -1);
		if (binary_integer.empty()) {binary_integer = "0";}
        binary_exponent++;
      }

	  //debug
	  //cout << binary_integer << "bi" << endl;
   //   cout << binary_fraction << "bf" << endl;
   //   cout << binary_exponent << "be" << endl;
	  //cout << binary_integer.length() << endl;

      //  Decimal integer part
	  //int power_of_two = 1;
	    decimal_integer = "0";

	  mpz_t power_of_two;
	  mpz_init(power_of_two);
	  mpz_set_ui(power_of_two, 1);

	  mpz_t di;
	  mpz_init(di);
	  mpz_set_ui(di, 0);


	  //debug
  	//  cout << "decimal integer " << decimal_integer << endl;
	  //cout << decimal_integer.c_str() << endl;
	  //cout << atoi(decimal_integer.c_str()) << endl;
	  //cout << atoi(decimal_integer.c_str()) + 1 << endl;


      for (int i = binary_integer.length() - 1; i > -1; i--)//so for loop starts at the back of the binary string ex.1011 iterates it this way 1101
      {
        if (binary_integer[i] == '1')//if its a 1 you add the decimal integer to the power of two (power of two starts at 1)
        {
          //decimal_integer = decimal_add(value.decimal_integer, power_of_two, false);

			//stringstream out;
			//out << (atoi(decimal_integer.c_str()) + power_of_two);
			//decimal_integer = out.str();


			mpz_add(di, di, power_of_two);


			//decimal_integer = (atoi(decimal_integer.c_str()) + power_of_two);//this line here didn't work because I had to convert the int back into a string
			//debug
			//cout << "the decimal integer is: " << decimal_integer << endl;
        }
        //power_of_two = decimal_add(power_of_two, power_of_two);
		//power_of_two = power_of_two + power_of_two;
		mpz_add(power_of_two, power_of_two, power_of_two); //double the power_of_two
      }
		//debug
	//gmp_printf("power_of_two %Zd\n", power_of_two);
	//gmp_printf("at the end of the for loop the di is %Zd\n", di);

	  //exit(1);





      //  Decimal fraction part
      //power_of_two = 1;
		mpz_set_ui(power_of_two, 1);//reset the power_of_two back to 1


	  mpz_t df;
	  mpz_init(df);
	  mpz_set_ui(df, 0);


      decimal_fraction = "0";

	  //debug
	  //cout << "The binary fraction is " << binary_fraction << endl;
      for (int i = binary_fraction.length() - 1; i > -1; i--)//so again we're taking the binary fraction and iterating through it backwards
      {
        if (binary_fraction[i] == '1')//if it is 1 add the decimal fraction to the power of two
        {
			//stringstream out2;
			//out2 << (atoi(decimal_fraction.c_str()) + power_of_two);
			//decimal_fraction = out2.str();
          //value.decimal_fraction = decimal_add(value.decimal_fraction, power_of_two, false);
			//decimal_fraction = (atoi(decimal_fraction.c_str()) + power_of_two);//this line here didn't work because I had to convert the int back into a string

			mpz_add(df, df, power_of_two);


        }
        //power_of_two = decimal_add(power_of_two, power_of_two);
		//power_of_two = power_of_two + power_of_two;
		mpz_add(power_of_two, power_of_two, power_of_two); //double the power_of_two
      }

	  //debug
	//gmp_printf("power_of_two %Zd\n", power_of_two);
	//gmp_printf("at the end of the for loop the df is %Zd\n", df);


	//exit(1);
//-------------------------------------------------------------------------------------------------------------------everything above this line looks ok so far
	//debug
	//cout << endl << "This is the midpoint" << endl << endl;

      //var result = decimal_divide(value.decimal_fraction, power_of_two, value.DECIMAL_PRECISION);  //tien
      //value.decimal_fraction = result.decimal_fraction_part;


	  //decimal_fraction = atoi(decimal_fraction.c_str())/power_of_two; //this line is no longer good because we are not using the string decimal_fraction

	//mpz_cdiv_q (df, df, power_of_two);	//this doesn't work because it is doing int division

	  //debug
	//gmp_printf("after the division the df is %Zd\n", df);

	//so what if we convert df to a mpzf from a mpzt here

	mpf_set_default_prec(1000);
	mpf_t decf;
	mpf_init(decf);
	mpf_set_z(decf, df);
	int n = 10;

	//debug
	//gmp_printf ("decf %.*Ff\n", n, decf);

	//so all I did above was take the value of the mpz_t df and make it the value of the mpf_t decf

	//looks like I need to change power_of_two to mpf_t also to get the div function to work

	mpf_t powtwo;
	mpf_init(powtwo);
	mpf_set_z(powtwo, power_of_two);

	mpf_div(decf, decf, powtwo);

	//debug
	//gmp_printf ("after division decf %.*Ff\n", n, decf);







	  ////not sure if this should be included
	  //if(decimal_fraction.empty()){
		 // decimal_fraction = "0";
	  //}

	  ////---------
	  //decimal_fraction = "0";//this needs to leave soon

	  ////debug
	  //cout << "the deimcal fraction after decimal divide is " << decimal_fraction << endl;
		


      //  Normalize
      decimal_exponent = 0;
	  
	  //not sure what this is about
	 // if(result.addToDecimalExponent!=0){
		//decimal_exponent = decimal_exponent - result.addToDecimalExponent +1;  
	 // }
	  //--------------------------
	  

	//lets convert the di and df mpz_t back into strings now
		char* ditemp;
		char* dftemp;

		ditemp = mpz_get_str(NULL, 10, di);
		decimal_integer = ditemp;
		//debug
		//cout << "after converting the mpz_t di back to a string the decimal_integer is :" <<decimal_integer <<":" <<endl;
	
		mp_exp_t a;//really not sure about this

		dftemp = mpf_get_str(NULL, &a, 10, 10000, decf);
		decimal_fraction = dftemp;
		//debug
		//cout << "after converting the mpz_f decf back to a string the decimal_fraction is :" <<decimal_fraction <<":" <<endl;

		//gmp_printf("this is the exponent returned %d\n", a);

		while(a<0){
			decimal_fraction = "0" + decimal_fraction;
			a++;
		}
	
		//debug
		//cout <<"the new decimal fraction is " << decimal_fraction << endl;

		//cout << "debugging under this line" << endl;

		//cout << decimal_integer.c_str() << endl;

	  //while (atoi(decimal_integer.c_str()) > 9)//this doesn't work because decimal_integer when converted to an int with atoi might be larger than an int and therefore different compilers will change what this comparison gives you
												//instead use the mpz_t di for the comparison
	 // while(mpz_cmp_ui(di, 9)>0)//if di is bigger than 9 it will return a 1

		  //there's a problem doing it this way because the mpz_t is never decreased

		//cout << "decimal_integer length " << decimal_integer.length() << endl;

		while(decimal_integer.length()>1) //my logic here is that decimal_integers greater than 9 will be a least 2 or more
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





	//debug
  	//  cout << "decimal integer " << decimal_integer << endl;
	  //cout << "decimal fraction " << decimal_fraction << endl;
	  //cout << "decimal exponent " << decimal_exponent << endl;


	  if(decimal_integer.empty()==true){
			decimal_integer = "0";
	  }

	  if(decimal_fraction.empty()==true){
			decimal_fraction = "0";
	  }

		
     // decimal_integer = ltrim(decimal_integer); 

		//this is to replace the ltrim above
		string tempDI = decimal_integer;
		while(tempDI[0] == '0'){
			tempDI = tempDI.substr(1);
		}
		if(tempDI == "") tempDI = "0";

		decimal_integer = tempDI;



	//not sure about this	  
	  //if(value.syntax=="IEEE-754: subnormal"){
		 // binary_fraction = binfractemp;
	  //}
	//-------------------
	
	//cout << endl << endl << endl << endl << endl << endl << endl << endl;
	printf("%s\n", decimal_integer.c_str());//c_str() converts a string to a char array
	printf("%s\n", decimal_fraction.c_str());
	printf("%d\n", decimal_exponent);
	printf("%s\n", decimal_recurrence.c_str());
	printf("%d\n", decimal_recurrence_start);
	printf("%s\n", binary_recurrence.c_str());
	printf("%d\n", binary_recurrence_start);
	printf("%s\n", binary_integer_n.c_str());//these bottom three are the normalized binary values that also have to be returned to the Javascript
	printf("%s\n", binary_fraction_n.c_str());
	printf("%d\n", binary_exponent_n);

	return 0;
}

/*    This script implements the arithmetic and UI functions of the IEEE-754
 *    analyzers.  To be fully accurate, arithmetic is done on strings rather
 *    than on JavaScript numbers.
 */
 
 
window.onload = function()
{
    function getElementsByClass (theClass)
    {
        var elementArray = [];
        if (typeof document.all != "undefined")
        {
            elementArray = document.all;
        }
        else
        {
            elementArray = document.getElementsByTagName("*");
        }
        var matchedArray = [];
        var pattern = new RegExp("(^| )" + theClass + "( |$)");
        for (var i = 0; i < elementArray.length; i++)
        {
            if (pattern.test(elementArray[i].className))
            {
                matchedArray[matchedArray.length] = elementArray[i];
            }
        }
        return matchedArray;
    };    
    
    
  //  Analyzer()
  //  -------------------------------------------------------------------------
  /*  
   */
  function Analyzer(valueEntered, forceAuto, forceDecimal, forceBinary, forceHexadecimal,
                    syntaxMessage, decimalValue, binaryValue, hex32Value, hex64Value, 
                    hex128Value, hex32sef, hex64sef, hex128sef, hex32SignValue, hex32ExponentValue, hex32DecimalExponentValue, hex32FractionValue, hex32DecimalFractionValue,
                    hex64SignValue, hex64ExponentValue, hex64DecimalExponentValue, hex64FractionValue, hex64DecimalFractionValue, hex128SignValue, hex128ExponentValue, hex128DecimalExponentValue, 
                    hex128FractionValue, hex128DecimalFractionValue, hex32SignSymbol, hex64SignSymbol, hex128SignSymbol, forceNearestValue, forceZero, forcePosInfinity, forceNegInfinity, hex32Status, hex64Status, hex128Status)
  {
    this.value_entered                  = valueEntered;
    this.force_auto                        = forceAuto;
    this.force_decimal                  = forceDecimal;
    this.force_binary                     = forceBinary;
    this.force_hexadecimal                = forceHexadecimal;
    this.syntax_message                   = syntaxMessage;
    this.decimal_value                  = decimalValue;
    this.binary_value                   = binaryValue;
    this.hex32_value                    = hex32Value;
    this.hex64_value                    = hex64Value;
    this.hex128_value                    = hex128Value;
    this.hex32_sef                        = hex32sef;
    this.hex64_sef                        = hex64sef;
    this.hex128_sef                        = hex128sef;
    this.hex32_sign_value                = hex32SignValue;
    this.hex32_exponent_value            = hex32ExponentValue;
    this.hex32_decimal_exponent_value    = hex32DecimalExponentValue;
    this.hex32_fraction_value            = hex32FractionValue;
    this.hex32_decimal_fraction_value     = hex32DecimalFractionValue;
    this.hex64_sign_value                = hex64SignValue;
    this.hex64_exponent_value            = hex64ExponentValue;
    this.hex64_decimal_exponent_value    = hex64DecimalExponentValue;
    this.hex64_fraction_value            = hex64FractionValue;
    this.hex64_decimal_fraction_value    = hex64DecimalFractionValue;
    this.hex128_sign_value                = hex128SignValue;
    this.hex128_exponent_value            = hex128ExponentValue;
    this.hex128_decimal_exponent_value    = hex128DecimalExponentValue
    this.hex128_fraction_value            = hex128FractionValue;
    this.hex128_decimal_fraction_value    = hex128DecimalFractionValue;
    this.hex32_sign_symbol                = hex32SignSymbol;
    this.hex64_sign_symbol                = hex64SignSymbol;
    this.hex128_sign_symbol                = hex128SignSymbol;
    this.force_round_nearest_value        = forceNearestValue;
    this.force_round_zero                = forceZero;
    this.force_round_pos_infinity        = forcePosInfinity;
    this.force_round_neg_infinity        = forceNegInfinity;
    this.hex32_status                    = hex32Status;
    this.hex64_status                    = hex64Status;
    this.hex128_status                    = hex128Status;

    this.value_entered.onchange     = valueChangeHandler;
    this.force_auto.onclick         = valueChangeHandler;
    this.force_decimal.onclick      = valueChangeHandler;
    this.force_binary.onclick       = valueChangeHandler;
    this.force_hexadecimal.onclick  = valueChangeHandler;

    this.force_round_nearest_value.onclick        = valueChangeHandler;
    this.force_round_zero.onclick                = valueChangeHandler;
    this.force_round_pos_infinity.onclick        = valueChangeHandler;
    this.force_round_neg_infinity.onclick        = valueChangeHandler;

    this.value_entered.analyzer     = this;
    this.force_auto.analyzer        = this;
    this.force_decimal.analyzer     = this;
    this.force_binary.analyzer      = this;
    this.force_hexadecimal.analyzer = this;
    
    this.force_round_nearest_value.analyzer        = this;
    this.force_round_zero.analyzer                = this;
    this.force_round_pos_infinity.analyzer        = this;
    this.force_round_neg_infinity.analyzer        = this;
  }






  //  valueChangeHandler()
  //  -------------------------------------------------------------------------
  /*  Respond to changed input value in an analyzer. Figure out the input
   *  format, parse the value, generate other values, analyze the floating-
   *  point values.
   *  This handler is called when the value of the input text field changes
   *  value or loses focus, or when one of the input format radio buttons
   *  changes state. The this.analyzer object lets you get at the other
   *  elements from any event source.
   *
   */
  function valueChangeHandler(evt)
  {
    evt = evt ? evt : event;
    var analyzer    = this.analyzer;
    var analyzerDiv = analyzer.value_entered.parentNode.parentNode;  
    
    if (analyzer.value_entered.value === '') return;
    $('.loading').addClass('computing').removeClass('idle');
    
    if(analyzerDiv.className == 'analyzer block lonely-block'){
        var isLonely = true;    
    }    
    
    if(isLonely == true){
        analyzerDiv.className = 'busy block lonely-block';
    }
    else{
        analyzerDiv.className = 'busy block';
    }
    
    setTimeout(doUpdate, 0);


  //  doUpdate()
  //  -------------------------------------------------------------------------
  /*  
   */

    function doUpdate()
    {
      var roundMode = null;
      
          if(analyzer.force_round_nearest_value.checked)        roundMode = 'rnv';
        if(analyzer.force_round_zero.checked)                roundMode = 'rz';
        if(analyzer.force_round_pos_infinity.checked)        roundMode = 'rpi';
        if(analyzer.force_round_neg_infinity.checked)        roundMode = 'rni';    

      
      
      var value = null;
      if (analyzer.force_auto.checked)         value = new Numeric_Value(analyzer.value_entered.value,undefined, roundMode);
      if (analyzer.force_decimal.checked)      value = new Numeric_Value(analyzer.value_entered.value, 10, roundMode);
      if (analyzer.force_binary.checked)       value = new Numeric_Value(analyzer.value_entered.value, 2, roundMode);
      if (analyzer.force_hexadecimal.checked)  value = new Numeric_Value(analyzer.value_entered.value, 16, roundMode);
      analyzer.syntax_message.nodeValue = value.syntax;
      if (value.isValid)
      {
          if(value.isInfinity){
              if(value.isOutOfRange){
                analyzer.decimal_value.nodeValue = "Out of Range";
                analyzer.binary_value.nodeValue  = "Out of Range";
              }
              else{
                analyzer.decimal_value.nodeValue = value.toString(10);
                analyzer.binary_value.nodeValue  = value.toString(2);
              }
              analyzer.hex32_value.nodeValue = value.toString('ihex32');
              analyzer.hex64_value.nodeValue = value.toString('ihex64');
              analyzer.hex128_value.nodeValue = value.toString('ihex128');
              
              analyzer.hex32_sign_value.nodeValue = value.toString('ihex32s');
              analyzer.hex32_exponent_value.nodeValue = value.toString('ihex32e');
              analyzer.hex32_fraction_value.nodeValue = value.toString('ihex32f');
              analyzer.hex32_decimal_exponent_value.nodeValue = value.toString('ihex32de');
              analyzer.hex32_decimal_fraction_value.nodeValue = value.toString('ihex32df');
    
              analyzer.hex64_sign_value.nodeValue = value.toString('ihex64s');
              analyzer.hex64_exponent_value.nodeValue = value.toString('ihex64e');
              analyzer.hex64_fraction_value.nodeValue = value.toString('ihex64f');
              analyzer.hex64_decimal_exponent_value.nodeValue = value.toString('ihex64de');
              analyzer.hex64_decimal_fraction_value.nodeValue = value.toString('ihex64df');
              
              analyzer.hex128_sign_value.nodeValue = value.toString('ihex128s');
              analyzer.hex128_exponent_value.nodeValue = value.toString('ihex128e');
              analyzer.hex128_fraction_value.nodeValue = value.toString('ihex128f');
              analyzer.hex128_decimal_exponent_value.nodeValue = value.toString('ihex128de');
              analyzer.hex128_decimal_fraction_value.nodeValue = value.toString('ihex128df');
              
              analyzer.hex32_sign_symbol.nodeValue = value.toString('isv');
              analyzer.hex64_sign_symbol.nodeValue = value.toString('isv');
              analyzer.hex128_sign_symbol.nodeValue = value.toString('isv');
  
              analyzer.hex32_status.nodeValue = value.toString('i32Status');
              analyzer.hex64_status.nodeValue = value.toString('i64Status');
              analyzer.hex128_status.nodeValue = value.toString('i128Status');
          }
          else if(analyzer.value_entered.value.toLowerCase()==='nan' || analyzer.value_entered.value.toLowerCase()==='qnan' || analyzer.value_entered.value.toLowerCase()==='snan'){

            var n = analyzer.value_entered.value.toLowerCase();
            if(n === 'qnan' || n==='nan') n = 'qNaN';
            else if( n==='snan') n = 'sNaN';
              
            analyzer.decimal_value.nodeValue = n;
            analyzer.binary_value.nodeValue  = n;
            
            analyzer.hex32_value.nodeValue = n;
            analyzer.hex64_value.nodeValue = n;
            analyzer.hex128_value.nodeValue = n;
            
            analyzer.hex32_sign_value.nodeValue = n;
            analyzer.hex32_exponent_value.nodeValue = n;
            analyzer.hex32_fraction_value.nodeValue = n;
            analyzer.hex32_decimal_exponent_value.nodeValue = n;
            analyzer.hex32_decimal_fraction_value.nodeValue = n;
    
            analyzer.hex64_sign_value.nodeValue = n;
            analyzer.hex64_exponent_value.nodeValue = n;
            analyzer.hex64_fraction_value.nodeValue = n;
            analyzer.hex64_decimal_exponent_value.nodeValue = n;
            analyzer.hex64_decimal_fraction_value.nodeValue = n;
            
            analyzer.hex128_sign_value.nodeValue = n;
            analyzer.hex128_exponent_value.nodeValue = n;
            analyzer.hex128_fraction_value.nodeValue = n;
            analyzer.hex128_decimal_exponent_value.nodeValue = n;
            analyzer.hex128_decimal_fraction_value.nodeValue = n;
            
            analyzer.hex32_sign_symbol.nodeValue = n;
            analyzer.hex64_sign_symbol.nodeValue = n;
            analyzer.hex128_sign_symbol.nodeValue = n;

          }
          
          else{
              if(value.isOutOfRange){
                analyzer.decimal_value.nodeValue = "Out of Range";
                analyzer.binary_value.nodeValue  = "Out of Range";
              }
              
              else{
                analyzer.decimal_value.nodeValue = value.toString(10);
                analyzer.binary_value.nodeValue  = value.toString(2);
              }
            
              analyzer.hex32_value.nodeValue = value.toString(32);
              analyzer.hex64_value.nodeValue = value.toString(64);
              analyzer.hex128_value.nodeValue = value.toString(128);
              
              analyzer.hex32_sign_value.nodeValue = value.toString('32s');
              analyzer.hex32_exponent_value.nodeValue = value.toString('32e');
              analyzer.hex32_fraction_value.nodeValue = value.toString('32f');
              analyzer.hex32_decimal_exponent_value.nodeValue = value.toString('32de');
              analyzer.hex32_decimal_fraction_value.nodeValue = value.toString('32df');
      
              analyzer.hex64_sign_value.nodeValue = value.toString('64s');
              analyzer.hex64_exponent_value.nodeValue = value.toString('64e');
              analyzer.hex64_fraction_value.nodeValue = value.toString('64f');
              analyzer.hex64_decimal_exponent_value.nodeValue = value.toString('64de');
              analyzer.hex64_decimal_fraction_value.nodeValue = value.toString('64df');
                    
              analyzer.hex128_sign_value.nodeValue = value.toString('128s');
              analyzer.hex128_exponent_value.nodeValue = value.toString('128e');
              analyzer.hex128_fraction_value.nodeValue = value.toString('128f');
              analyzer.hex128_decimal_exponent_value.nodeValue = value.toString('128de');
              analyzer.hex128_decimal_fraction_value.nodeValue = value.toString('128df');
              
              analyzer.hex32_sign_symbol.nodeValue = value.toString('sv');
              analyzer.hex64_sign_symbol.nodeValue = value.toString('sv');
              analyzer.hex128_sign_symbol.nodeValue = value.toString('sv');
              
              analyzer.hex32_status.nodeValue = value.toString('32status');
              analyzer.hex64_status.nodeValue = value.toString('64status');
              analyzer.hex128_status.nodeValue = value.toString('128status');
          }
      }
      else
      {
        analyzer.decimal_value.nodeValue = 'Not a valid number';
        analyzer.binary_value.nodeValue  = '--';
      }
      
      if(isLonely==true){
          analyzerDiv.className = 'analyzer block lonely-block'; 
      }
      else{
          analyzerDiv.className = 'analyzer block'; 
      }
     $('.loading').removeClass('computing').addClass('idle');
    }
  }
  


  //  clickHandler()
  //  -------------------------------------------------------------------------
  /*  Creates a new analayzer
   *
   */

    function clickHandler(evt)
    {
        if(icount==1){
            instructionsHandler();
        }
        num++;
        var a = document.createElement('div');
        a.setAttribute('class', 'analyzer block');
        a.setAttribute('id', 'block'+num);
                
        document.getElementById('bloc').appendChild(a);
        
        $("#block"+num).html(
          "<div class='identifier'><p>Analyzer " + num +"</p></div>" +
          "<img class='idle loading' id='loading"+ num +"' title='progress' src='images/ajax-loader.gif' alt=''/>" +
          "<fieldset class='input_format'><legend><span class='analyzerlabel'>Input Format</span></legend>" +
            "<div>"+
                "<input type='radio' name='input-format"+ num +"' value='auto' id='force-auto"+ num +"' checked='checked' />"+
                "<label for='force-auto"+ num +"'>auto</label>"+
            "</div>"+
            "<div>"+
                " <input type='radio' name='input-format"+ num +"' value='decimal' id='force-decimal"+ num +"' />" +
                "<label for='force-decimal"+ num +"'>decimal</label>"+
            "</div>"+
            "<div>"+
                "<input type='radio' name='input-format"+ num +"' value='binary' id='force-binary"+ num +"' />"+
                "<label for='force-binary"+ num +"'>binary</label>"+
            "</div>"+
            "<div>"+
                "<input type='radio' name='input-format"+ num +"' value='hexadecimal' id='force-hexadecimal"+ num +"' />"+
                "<label for='force-hexadecimal"+ num +"'>hexadecimal</label>"+
            "</div>"+
          "</fieldset>"+          
          "<fieldset class='rounding_format'><legend><span class='analyzerlabel'>Rounding Mode</span></legend>"+
            "<div>"+
                "<input type='radio' name='rounding-format"+ num +"' value='round-nearest-value' id='force-round-nearest-value"+ num +"' checked='checked'  />"+
                "<label for='force-round-nearest-value"+ num +"'>Round to the Nearest Value </label>           "+ 
            "</div>"+
            "<div>"+
                "<input type='radio' name='rounding-format"+ num +"' value='round-zero' id='force-round-zero"+ num +"' />"+
                "<label for='force-round-zero"+ num +"'>Round toward Zero </label>          "+
            "</div>"+
            "<div>"+
                "<input type='radio' name='rounding-format"+ num +"' value='round-pos-infinity' id='force-round-pos-infinity"+ num +"' />"+
                "<label for='force-round-pos-infinity"+ num +"'>Round toward Positive Infinity </label>            "+
            "</div>"+
            "<div>"+
                "<input type='radio' name='rounding-format"+ num +"' value='round-neg-infinity' id='force-round-neg-infinity"+ num +"' />"+
                "<label for='force-round-neg-infinity"+ num +"'>Round toward Negative Infinity </label>"+
            "</div>"+
          "</fieldset>"+
          "<div class='value_enter'>    "+
              "<label for='value-entered"+ num +"'><span class='analyzerlabel'>Enter value:</span> </label><input type='text' id='value-entered"+ num +"' />  "+    
              "<p><span class='analyzerlabel'>Syntax Entered:</span> <span id='syntax_msg"+ num +"'>none</span></p>"+
          "</div>"+
          "<div id='result"+ num +"' class='result'>   "+ 
               "<div class='dec_and_bin_results'>" +
                "<p><span class='analyzerlabel'>Decimal value:</span> <span id='decimal_value"+ num +"'>0</span></p>"+
                "<p><span class='analyzerlabel'>Normalized binary value:</span> <span id='binary_value"+ num +"'>0</span></p>"+
            "</div>"+
            "<div class = 'hex32'>"+
                "<p><span class='analyzerlabel'>Binary32:</span> <span id='hex32_value"+ num +"' class='hex32Value' >0</span></p> "+
                "<div id='hex32_sef"+ num +"' class='hex32sef'>"+
                     "<table>"+
                        "<tr id='hex32_sef_labels"+ num +"' class='hex32_sef_labels'>"+
                            "<th><p><span class='analyzerlabel'>Status</span></p></th>"+
                            "<th><p><span class='analyzerlabel'>Sign</span></p></th>"+
                            "<th><p><span class='analyzerlabel'>Exponent</span></p></th>"+
                            "<th><p><span class='analyzerlabel'>Significand</span></p></th>"+
                        "</tr>"+
                        "<tr id='hex32_sef_results"+ num +"' class='hex32_sef_results'>"+
                            "<td><p><span id='hex32_status"+ num +"'>-</span></p></td>"+
                            "<td><p><span id='hex32_sign_value"+ num +"'>0</span> (<span id='hex32_sign_symbol"+ num +"'>+</span>)</p></td>"+
                            "<td><p><span id='hex32_exponent_value"+ num +"'>0</span> (<span id='hex32_decimal_exponent_value"+ num +"'>0</span>)</p></td>"+
                            "<td><p><span id='hex32_fraction_value"+ num +"'>0</span> (<span id='hex32_decimal_fraction_value"+ num +"'>0</span>)</p></td>"+
                        "</tr>"+
                    "</table>"+
                "</div>"+
            "</div>" +        
            "<div class = 'hex64'>"+
                "<p><span class='analyzerlabel'>Binary64:</span> <span id='hex64_value"+ num +"' class='hex64Value'>0</span></p> "+
                "<div id='hex64_sef"+ num +"' class='hex64sef'>"+
                     "<table>"+
                        "<tr id='hex64_sef_labels"+ num +"' class='hex64_sef_labels'>"+
                            "<th><p><span class='analyzerlabel'>Status</span></p></th>"+
                            "<th><p><span class='analyzerlabel'>Sign</span></p></th>"+
                            "<th><p><span class='analyzerlabel'>Exponent</span></p></th>"+
                            "<th><p><span class='analyzerlabel'>Significand</span></p></th>"+
                        "</tr>"+
                        "<tr id='hex64_sef_results"+ num +"' class='hex64_sef_results'>"+
                            "<td><p><span id='hex64_status"+ num +"'>-</span></p></td>"+
                            "<td><p><span id='hex64_sign_value"+ num +"'>0</span> (<span id='hex64_sign_symbol"+ num +"'>+</span>)</p></td>"+
                            "<td><p><span id='hex64_exponent_value"+ num +"'>0</span> (<span id='hex64_decimal_exponent_value"+ num +"'>0</span>)</p></td>"+
                            "<td><p><span id='hex64_fraction_value"+ num +"'>0</span> (<span id='hex64_decimal_fraction_value"+ num +"'>0</span>)</p></td>"+
                        "</tr>"+
                    "</table>"+
                "</div> "+
            "</div> "+
            "<div class = 'hex128'>"+
                "<p><span class='analyzerlabel'>Binary128:</span> <span id='hex128_value"+ num +"' class='hex128Value'>0</span></p> "+
                 "<div id='hex128_sef"+ num +"' class='hex128sef'>"+
                     "<table>"+
                        "<tr id='hex128_sef_labels"+ num +"' class='hex128_sef_labels'>"+
                            "<th><p><span class='analyzerlabel'>Status</span></p></th>"+
                            "<th><p><span class='analyzerlabel'>Sign</span></p></th>"+
                            "<th><p><span class='analyzerlabel'>Exponent</span></p></th>"+
                            "<th><p><span class='analyzerlabel'>Significand</span></p></th>"+
                        "</tr>"+
                        "<tr id='hex128_sef_results"+ num +"' class='hex128_sef_results'>"+
                            "<td><p><span id='hex128_status"+ num +"'>-</span></p></td>"+
                            "<td><p><span id='hex128_sign_value"+ num +"'>0</span> (<span id='hex128_sign_symbol"+ num +"'>+</span>)</p></td>"+
                            "<td><p><span id='hex128_exponent_value"+ num +"'>0</span> (<span id='hex128_decimal_exponent_value"+ num +"'>0</span>)</p></td>"+
                            "<td><p><span id='hex128_fraction_value"+ num +"'>0</span> (<span id='hex128_decimal_fraction_value"+ num +"'>0</span>)</p></td>"+
                        "</tr>"+
                    "</table>"+
                "</div>"+
         " </div>"+
         "</div> "+
         "<button id='kill-this-analyzer"+ num +"' class='kill-this-analyzer' >Close This Analyzer</button>"
        );
        
        
       analyzers.push ( new Analyzer(  document.getElementById('value-entered' + num),
                                      document.getElementById('force-auto'+ num),
                                      document.getElementById('force-decimal'+ num),
                                      document.getElementById('force-binary'+ num),
                                      document.getElementById('force-hexadecimal'+ num),
                                      document.getElementById('syntax_msg'+ num).firstChild,
                                      document.getElementById('decimal_value'+ num).firstChild,
                                      document.getElementById('binary_value'+ num).firstChild, 
                                      document.getElementById('hex32_value'+ num).firstChild,
                                      document.getElementById('hex64_value'+ num).firstChild,
                                      document.getElementById('hex128_value'+ num).firstChild,
                                      document.getElementById('hex32_sef'+ num).firstChild,
                                      document.getElementById('hex64_sef'+ num).firstChild,
                                      document.getElementById('hex128_sef'+ num).firstChild,
                                      document.getElementById('hex32_sign_value'+ num).firstChild,
                                      document.getElementById('hex32_exponent_value'+ num).firstChild,
                                      document.getElementById('hex32_decimal_exponent_value'+ num).firstChild,
                                      document.getElementById('hex32_fraction_value'+ num).firstChild,
                                      document.getElementById('hex32_decimal_fraction_value' + num).firstChild,
                                      document.getElementById('hex64_sign_value'+ num).firstChild,
                                      document.getElementById('hex64_exponent_value'+ num).firstChild,
                                      document.getElementById('hex64_decimal_exponent_value'+ num).firstChild,
                                      document.getElementById('hex64_fraction_value'+ num).firstChild,
                                      document.getElementById('hex64_decimal_fraction_value'+ num).firstChild,
                                      document.getElementById('hex128_sign_value'+ num).firstChild,
                                      document.getElementById('hex128_exponent_value'+ num).firstChild,
                                      document.getElementById('hex128_decimal_exponent_value'+ num).firstChild,
                                      document.getElementById('hex128_fraction_value'+ num).firstChild,
                                      document.getElementById('hex128_decimal_fraction_value'+ num).firstChild,
                                      document.getElementById('hex32_sign_symbol'+ num).firstChild,
                                      document.getElementById('hex64_sign_symbol'+ num).firstChild,
                                      document.getElementById('hex128_sign_symbol'+ num).firstChild,
                                      document.getElementById('force-round-nearest-value'+ num),
                                      document.getElementById('force-round-zero'+ num),
                                      document.getElementById('force-round-pos-infinity'+ num),
                                      document.getElementById('force-round-neg-infinity'+ num),
                                      document.getElementById('hex32_status'+ num).firstChild,
                                      document.getElementById('hex64_status'+ num).firstChild,
                                      document.getElementById('hex128_status'+ num).firstChild));
        
    
    killAnalyzer = getElementsByClass("kill-this-analyzer");
    for(var i =0; i<killAnalyzer.length; i++){
        killAnalyzer[i].onclick = closeHandler;
    }
    top = top + 5;    
    left = left + 3;
    
    document.getElementById('classic').setAttribute('class', 'classic');
    
    var initialBlock = getElementsByClass('lonely-block');
    if(initialBlock[0] !== undefined){
        initialBlock[0].setAttribute('class', 'analyzer block');
    }
    
    var y = 0;

    for(var i = 0; i<analyzers.length; i++){
        if(analyzers[i]!== null){
            y++;
        }        
    }
    
    if(y==1){
        var AnalyzerNumber = analyzers.length;
        document.getElementById('block' + AnalyzerNumber).setAttribute('class', 'analyzer block lonely-block');
    }

}
    
    //  closeHandler()
  //  -------------------------------------------------------------------------
  /*  Closes an analyzer
   */

    function closeHandler(){
         var AnalyzerNum = this.parentNode.id;
         if(AnalyzerNum == 'block'){
             var identifierNum = document.getElementById(AnalyzerNum).childNodes[1];
         }
         else{
             var identifierNum = document.getElementById(AnalyzerNum).childNodes[0];
         }
         var AnalyzerName = identifierNum.textContent;
         var counter = 0;
         while(counter < AnalyzerName.length){
             if(AnalyzerName[counter] == ' '){
                 break;
             }
             counter++;
         }
         
         var Anum = AnalyzerName.substring(counter);
          analyzers[Anum-1] = null;
        
        this.parentNode.setAttribute('class', 'killedAnalyzer');
        this.parentNode.innerHTML = '';
    
        var isAllNull = true;
        
        for(var i = 0; i<analyzers.length; i++){
            if(analyzers[i]!== null){
                isAllNull = false;
            }
        }
        if(isAllNull == true){
            document.getElementById('classic').setAttribute('class', 'classic-clear');
        }
        
        var c = 0;
        var found;
        for(var i = 0; i<analyzers.length; i++){
            if(analyzers[i] == null){
                c++;    
            }
            else{
                found = i+1;    
            }
        }
        if(c == analyzers.length-1){
            if(found==1){
                document.getElementById('block').setAttribute('class', 'analyzer block lonely-block');
            }
            else{
                document.getElementById('block'+found).setAttribute('class', 'analyzer block lonely-block');
            }
        }
        
    }
    
      //  killAllHandler()
  //  -------------------------------------------------------------------------
  /*  Closes all the Analyzers
   */

    function killAllHandler(){
        for(var i =0; i<analyzers.length; i++){
            analyzers[i] = null;
        }
        var destroy = getElementsByClass("analyzer");
        for(var i = 0; i<destroy.length; i++){
            destroy[i].setAttribute('class', 'killedAnalyzer');
            destroy[i].innerHTML = '';
        }
        top = 20;
        left = 23;
        for(var i = 0; i<analyzers.length; i++){
            if(analyzers[i]=== null){
                document.getElementById('classic').setAttribute('class', 'classic-clear');
            }
        }
    }
    
      //  instructionsHandler()
  //  -------------------------------------------------------------------------
  /*  Toggles the instructions on/off
   */
    function instructionsHandler(){
        icount = (icount+1)%2;
        if(icount ==1){
            document.getElementById('instructions').setAttribute('class', 'yes-instructions');    
            document.getElementById('show-instructions').innerHTML = 'Hide Instructions';
        }
        else{
            document.getElementById('instructions').setAttribute('class', 'no-instructions');
            document.getElementById('show-instructions').innerHTML = 'Show Instructions';
        }
    };

  //  Array of the current set of analyzers.
  var analyzers = [ ];

  //  Initialization
  document.getElementById('need-js').style.display = 'none';
  var num = 1;
  var icount = 0;
  var addAnalyzer = document.getElementById('add-an-analyzer');
  addAnalyzer.onclick = clickHandler;
  
  var killAnalyzer = getElementsByClass("kill-this-analyzer");
  for(var i =0; i<killAnalyzer.length; i++){
      killAnalyzer[i].onclick = closeHandler;
  }
  
  var killAll = document.getElementById("kill-all");
  killAll.onclick = killAllHandler;
  
  var showInstructions = document.getElementById("show-instructions");
  showInstructions.onclick = instructionsHandler;
  
  var top = 25;
  var left = 26;

  analyzers.push ( new Analyzer(  document.getElementById('value-entered'),
                                  document.getElementById('force-auto'),
                                  document.getElementById('force-decimal'),
                                  document.getElementById('force-binary'),
                                  document.getElementById('force-hexadecimal'),
                                  document.getElementById('syntax_msg').firstChild,
                                  document.getElementById('decimal_value').firstChild,
                                  document.getElementById('binary_value').firstChild, 
                                  document.getElementById('hex32_value').firstChild,
                                  document.getElementById('hex64_value').firstChild,
                                  document.getElementById('hex128_value').firstChild,
                                  document.getElementById('hex32_sef').firstChild,
                                    document.getElementById('hex64_sef').firstChild,
                                    document.getElementById('hex128_sef').firstChild,
                                  document.getElementById('hex32_sign_value').firstChild,
                                  document.getElementById('hex32_exponent_value').firstChild,
                                  document.getElementById('hex32_decimal_exponent_value').firstChild,
                                  document.getElementById('hex32_fraction_value').firstChild,
                                    document.getElementById('hex32_decimal_fraction_value').firstChild,
                                  document.getElementById('hex64_sign_value').firstChild,
                                  document.getElementById('hex64_exponent_value').firstChild,
                                  document.getElementById('hex64_decimal_exponent_value').firstChild,
                                  document.getElementById('hex64_fraction_value').firstChild,
                                    document.getElementById('hex64_decimal_fraction_value').firstChild,
                                  document.getElementById('hex128_sign_value').firstChild,
                                  document.getElementById('hex128_exponent_value').firstChild,
                                  document.getElementById('hex128_decimal_exponent_value').firstChild,
                                  document.getElementById('hex128_fraction_value').firstChild,
                                    document.getElementById('hex128_decimal_fraction_value').firstChild,
                                  document.getElementById('hex32_sign_symbol').firstChild,
                                  document.getElementById('hex64_sign_symbol').firstChild,
                                  document.getElementById('hex128_sign_symbol').firstChild,
                                  document.getElementById('force-round-nearest-value'),
                                  document.getElementById('force-round-zero'),
                                  document.getElementById('force-round-pos-infinity'),
                                  document.getElementById('force-round-neg-infinity'),
                                  document.getElementById('hex32_status').firstChild,
                                  document.getElementById('hex64_status').firstChild,
                                    document.getElementById('hex128_status').firstChild));
};


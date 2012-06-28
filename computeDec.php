<?php
  $bi = $_POST['binary_integer'];
  $be = $_POST['binary_exponent'];
  $bf = $_POST['binary_fraction'];

  $result = array();

  exec("./bin/btd $bi $be $bf", $result);


  $arr = array( 'di' => $result[0], 'df' => $result[1], 'de' => $result[2], 
                'dr' => $result[3], 'drs' => $result[4], 'br' => $result[5], 
                'brs' => $result[6], 'bi' => $result[7], 'bf' => $result[8], 'be' =>$result[9]);

  echo json_encode($arr); 

 ?>

<?php
  $di = $_POST['decimal_integer'];
  $de = $_POST['decimal_exponent'];
  $df = $_POST['decimal_fraction'];
  $dr = $_POST['decimal_recurrence'];
  $drs = $_POST['decimal_recurrence_start'];

  $result = array();

  exec("./bin/dtb $di $de $df $dr $drs", $result);

  $arr = array( 'bi' => $result[0], 'bf' => $result[1], 'be' => $result[2], 
                'dr' => $result[3], 'drs' => $result[4], 'br' => $result[5], 
                'brs' => $result[6]);

echo json_encode($arr); 

 ?>

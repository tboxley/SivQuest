<?php
  header('Content-type: text/javascript');
  $output=['imgs'=>[]];
  foreach(glob("../img/{*.png,*/*.png}",GLOB_BRACE) as $v) {
    $output['imgs'][]=substr($v,7,-4);
  }

  echo json_encode($output);

?>
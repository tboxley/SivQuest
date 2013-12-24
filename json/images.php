<?php
  header('Content-type: text/javascript');
  $output=['imgs'=>[]];
  foreach(glob("../img/*") as $v) {
    $output['imgs'][]=substr($v,7,-4);
  }

  echo json_encode($output);

?>
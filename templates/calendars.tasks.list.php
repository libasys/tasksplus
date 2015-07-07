<h3><i class="ioc ioc-tasks"></i> <?php p($l->t('Tasks')); ?></h3>
<ul id="taskList">
<?php
 $aTimeArray=array('today'=>'today','tomorrow'=>'tomorrow','week'=>'This Week','commingsoon'=>'Coming soon','missed'=>'Missed','notermin'=>'Without Time');
 
 foreach($aTimeArray as $key => $value){
 	  if(array_key_exists($key,$_['taskOutPutbyTime']) && $_['taskOutPutbyTime'][$key] != false){
 	  	print_unescaped('<li class="headTasks">'.$l->t($value).'</li>'.$_['taskOutPutbyTime'][$key]); 
 	  }
 }
 
?>
</ul>
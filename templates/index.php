<?php
	script($_['calappname'], '3rdparty/jquery.webui-popover');
	style($_['calappname'], '3rdparty/jquery.webui-popover');
	
	script($_['appname'], 'app');
	script($_['calappname'],'3rdparty/jquery.timepicker');
	script('core', 'tags');
	style($_['calappname'],'3rdparty/jquery.timepicker');
	style($_['calappname'], '3rdparty/fontello/css/animation');
	style($_['calappname'], '3rdparty/fontello/css/fontello');
	style($_['appname'], 'style');
	script($_['calappname'], '3rdparty/tag-it');
	style($_['calappname'], '3rdparty/jquery.tagit');
			
?>
<input type="hidden" name="mailNotificationEnabled" id="mailNotificationEnabled" value="<?php p($_['mailNotificationEnabled']) ?>" />
<input type="hidden" name="allowShareWithLink" id="allowShareWithLink" value="<?php p($_['allowShareWithLink']) ?>" />
<input type="hidden" name="mailPublicNotificationEnabled"  value="<?php p($_['mailPublicNotificationEnabled']) ?>" />
<div id="searchresults" class="hidden" data-appfilter="<?php p($_['appname']) ?>"></div>

<div id="app-navigation">
	<div style="padding:5px 10px;">
	<i id="showcal" title="<?php p($l->t('Show Calendar for day selection')); ?>" style="font-size:22px;" class="ioc ioc-calendar"></i> 
		<button id="newTodoButton" class="button" style="width:80%;"><?php p($l->t('New Todo ...')); ?></button>
	<div id="datepicker"></div>
	</div>
	<div id="tasks_lists">	</div>
	
</div>
<div id="app-content">
	<div id="loading"></div>
	<div id="tasksListOuter">
		<h3 id="taskmanagertitle" data-date="" style="text-align:center;"><?php p($l->t('All')); ?>  <?php p($l->t('Tasks')); ?></h3>
	
	<div id="tasks_list"></div>
   <div id="totaskfound">
   <?php p($l->t('No Todos')); ?>
   </div>	
	</div>
</div>
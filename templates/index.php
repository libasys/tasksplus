<input type="hidden" name="mailNotificationEnabled" id="mailNotificationEnabled" value="<?php p($_['mailNotificationEnabled']) ?>" />
<input type="hidden" name="allowShareWithLink" id="allowShareWithLink" value="<?php p($_['allowShareWithLink']) ?>" />
<input type="hidden" name="mailPublicNotificationEnabled"  value="<?php p($_['mailPublicNotificationEnabled']) ?>" />
<div id="searchresults" class="hidden" data-appfilter="<?php p($_['appname']) ?>"></div>
<div id="loading">
	<i style="margin-top:20%;" class="ioc-spinner ioc-spin"></i>
</div>
<div id="app-navigation">
	<div style="padding:5px 10px;">
	<button id="newTodoButton" class="button" style="width:100%;"><?php p($l->t('New Todo ...')); ?></button>
	</div>
	<div id="tasks_lists">
		
		
		
	</div>
</div>
<div id="app-content">
	<div id="tasksListOuter">
		<h3 id="taskmanagertitle" data-date="" style="text-align:center;"><?php p($l->t('All')); ?>  <?php p($l->t('Tasks')); ?></h3>
	
	<div id="tasks_list"></div>
	
	
	</div>
</div>
<div id="dialogSmall" style="width:0;height:0;top:0;left:0;display:none;"></div>
<div id="dialogmore" title="Basic dialog" style="top:0;left:0;display:none;"></div>
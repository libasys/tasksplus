
	<ul id="calendarList">
		
	<?php 
		 
	print_unescaped($_['calendarslist']);
	   
	   
	 ?>
	 <!--our clone for editing or creating -->	
<li class="app-navigation-entry-edit calclone" id="calendar-clone" data-calendar="">
	<input id="bgcolor" name="bgcolor" type="hidden" value="#333399" />
	<input type="text" name="displayname" value="" placeholder="<?php p($l->t('Displayname')) ?>" />
	<input type="text" name="caldavuri" readonly="readonly" value="" />
	<button class="icon-checkmark"></button>
</li>	
	 </ul>
	 <br style="clear:both;" />
		 <ul id="taskssum">
		 	<li class="taskstimerow" data-id="showall" title="<?php p($l->t('All')); ?> <?php p($l->t('Tasks')); ?> "><span class="descr"><?php p($l->t('All')); ?> <?php p($l->t('Tasks')); ?> </span> <span class="iCount">0</span></li>
		 	<li class="taskstimerow" data-id="prio" title="<?php p($l->t('Priority').' '.$l->t('high').' '.$l->t('Tasks')); ?>"><span class="descr"><?php p($l->t('Priority').' '.$l->t('high')); ?></span><span class="iCount">0</span></li>
	
		 	<li class="taskstimerow" data-id="alltasksdone" title="<?php p($l->t('Completed')); ?> <?php p($l->t('Tasks')); ?>"><span class="descr"><?php p($l->t('Completed')); ?> <?php p($l->t('Tasks')); ?> </span><span class="iCount">0</span></li>
		 	<li class="taskstimerow" data-id="sharedtasks" title="<?php p($l->t('Shared')); ?> <?php p($l->t('Tasks')); ?>"><span class="descr"><?php p($l->t('Shared')); ?> <?php p($l->t('Tasks')); ?> </span><span class="iCount">0</span></li>
		 </ul>
		 <br style="clear:both;" />
		 <ul id="taskstime">
		 	<li class="taskstimerow" data-id="today" title="<?php p($l->t('Tasks')); ?>  <?php p($l->t('on')); ?> <?php p($_['aTaskTime']['today']); ?>"><span class="descr"><?php p($l->t('Tasks')); ?> <?php p($l->t('today')); ?></span><span class="iCount">0</span></li>
		 	<li class="taskstimerow" data-id="tomorrow" title="<?php p($l->t('Tasks')); ?>  <?php p($l->t('on')); ?> <?php p($_['aTaskTime']['tomorrow']); ?>"><span class="descr"><?php p($l->t('Tasks')); ?>  <?php p($l->t('tomorrow')); ?></span><span class="iCount">0</span></li>
		 	<li class="taskstimerow" data-id="actweek" title="<?php p($l->t('Tasks')); ?>   <?php p($_['aTaskTime']['actweek']); ?>"><span class="descr"><?php p($l->t('This Week')); ?></span><span class="iCount">0</span></li>
	       	<li class="taskstimerow" data-id="comingsoon" title="<?php p($l->t('Coming soon')); ?>"><span class="descr"><?php p($l->t('Coming soon')); ?> </span><span class="iCount">0</span></li>
		 	<li class="taskstimerow" data-id="withoutdate" title="<?php p($l->t('Tasks')); ?>  <?php p($l->t('Without Time')); ?>"><span class="descr"><?php p($l->t('Without Time')); ?></span><span class="iCount">0</span></li>
		 	<li class="taskstimerow" data-id="missedactweek" title="<?php p($l->t('Missed')); ?> <?php p($l->t('Tasks')); ?>"><span class="descr"><?php p($l->t('Missed')); ?> <?php p($l->t('Tasks')); ?></span><span class="iCount">0</span></li>
		 	</ul>
		 <br style="clear:both;" />
	     
    
	 <h3 ><label id="showCategory"><i style="font-size:22px;" class="ioc ioc-angle-down ioc-rotate-270"></i>&nbsp;<i class="ioc ioc-tags"></i> <?php p($l->t('Category')); ?></label><i id="addGroup" class="ioc ioc-add"></i></h3>
	 <ul id="categoryTasksList">
	 </ul>
		
</div>
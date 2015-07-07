<div id="edit-event">
 
<form name="taskForm" id="taskForm" action=" ">
    <input type="hidden" name="tid" id="taskid" value="<?php p($_['id']); ?>" />
     <input type="hidden" name="cid" value="<?php p($_['calId']); ?>" />
     <input type="hidden" name="orgid" value="<?php p($_['orgId']); ?>" />
     <input type="hidden" name="subtaskids" value="<?php p($_['subtaskids']); ?>" />
    <input type="hidden" name="hiddenfield" value="" />
    <input  type="hidden" name="taskcategories" id="taskcategories" value="<?php p($_['vtodo']->categories); ?>" />
    <input type="hidden" name="mytaskmode" id="mytaskmode" value="<?php p($_['mymode']); ?>" />		
<input type="hidden" name="mytaskcal" id="mytaskcal" value="<?php p($_['mycal']); ?>" />		
				<input type="hidden" name="read_worker" id="hiddenCalSelection" value="<?php p($_['calendar']); ?>">
				<input type="text" style="width:304px; font-size:16px; color:#555;padding:5px;"  placeholder="<?php p($l->t("Title of the Event"));?>" value="<?php p($_['vtodo']->summary); ?>" maxlength="100" id="tasksummary" name="tasksummary" autofocus="autofocus"/>
			   <?php if((array_key_exists($_['calId'],$_['cal_permissions']) && ($_['cal_permissions'][$_['calId']] & OCP\PERMISSION_CREATE))){ ?>
			   
			    <div id="sCalSelect" class="combobox">
			    <div class="selector">Please select</div>
			    <ul>
			    	<?php
			    	  foreach($_['calendar_options'] as $calInfo){
			    	  	if($calInfo['permissions'] & OCP\PERMISSION_CREATE)	{
			    	  	$selected='';	
						$addCheckedClass='';
						
			    	  	if($_['calendar']==$calInfo['id']){
			    	  		$selected='class="isSelected"';
							$addCheckedClass='isSelectedCheckbox';
						}	
			    	  	print_unescaped('<li data-id="'.$calInfo['id'].'" data-color="'.$calInfo['calendarcolor'].'" '.$selected.'><span class="colCal '.$addCheckedClass.'" style="background:'.$calInfo['calendarcolor'].'"></span>'.$calInfo['displayname'].'</li>');
			    	  	}  
					}
			    	?>
			        
			    </ul>
			</div>
			<?php } ?>
			<br />
			<input type="text" style="width:306px;"  placeholder="<?php p($l->t("Location of the Event"));?>" value="<?php p($_['vtodo']->location); ?>" maxlength="100" id="tasklocation"  name="tasklocation" />
             <?php if($_['permissions'] & OCP\PERMISSION_SHARE) { ?>
           
              <a href="#" class="share action permanent icon-share" 
                data-item-type="<?php p($_['sharetodo']) ?>" 
			    data-item="<?php p($_['sharetodoprefix']) ?><?php p($_['id']) ?>" 
			    data-link="true"
			    data-title="<?php p($_['vtodo']->summary); ?>"
				data-possible-permissions="<?php p( $_['permissions']) ?>"
				title="<?php p($l->t('Share Event')) ?>"
				>
			</a>
        
       <?php } ?>	
     <br style="clear:both;" />  	
<div id="accordion" style="width:99%;">
	<h3>
		
		<span id="ldatetime" style="font-weight:normal;font-size:12px;"><?php p($l->t('Add Start, Due Date')); ?></span>
	</h3>
	<div>
    <span class="labelLeftSmall"><?php p($l->t('Start')); ?></span> 
    <input type="text" name="startdate" id="startdate" class="textField" style="font-family:Arial,fontello;font-size:14px;width:110px;" placeholder="&#xe827;"   value="<?php p($_['TaskStartDate']); ?>" />
    <input type="text" name="startdate_time" id="startdate_time" class="textField"  placeholder="&#xe800;" style="font-family:Arial,fontello;font-size:14px;width:50px;" size="5" value="<?php p($_['TaskStartTime']); ?>" />
	 <br class="clearing"  />
     <span class="labelLeftSmall"><?php p($l->t('Due')); ?></span> 
    <input type="text" name="sWV" id="sWV" class="textField" style="font-family:Arial,fontello;font-size:14px;width:110px;" placeholder="&#xe827;"   value="<?php p($_['TaskDate']); ?>" />
    <input type="text" name="sWV_time" id="sWV_time" class="textField"  placeholder="&#xe800;" style="font-family:Arial,fontello;font-size:14px;width:50px;" size="5" value="<?php p($_['TaskTime']); ?>" />
	 <br class="clearing"  />
	 
	</div>
	 <h3>
	 	<?php
			if(isset($_['accessclass']) && $_['accessclass'] == 'CONFIDENTIAL'){
				print_unescaped('<i title="'.$l->t('Show As').'" class="ioc ioc-eye" style="font-size:14px;"></i>');
			}
			if(isset($_['accessclass']) && $_['accessclass'] == 'PRIVATE'){
				print_unescaped('<i title="'.$l->t('Show As').'" class="ioc ioc-lock" style="font-size:14px;"></i>');
			}
			if(isset($_['priority']) && (int)$_['priority']>0){
				print_unescaped('<i title="'.$l->t('Priority').'" class="ioc ioc-flash priority priority-'.( $_['priority'] ? $_['priority'] : 'n').'" style="border-radius:5px;font-weight:normal;float:none;text-shadow:none;margin-left:5px;font-size:14px;"></i>');
			}
			if(isset($_['percentCompleted']) && (int)$_['percentCompleted']>0){
				print_unescaped(' '.$l->t('Completed').' '.$_['percentCompleted'].'%, ');
			}
		?>
		<span id="lreminder" style="font-weight:normal;"><?php p($l->t('Add Reminder, Priority, Show- /Complete Status')); ?></span>
	</h3>
	<div>
	 <input type="hidden" id="reminder" name="reminder" value="<?php p($_['reminder']); ?>">
	<input type="hidden" name="sReminderRequest" id="sReminderRequest" value="<?php p($_['reminder_rules']); ?>" />
			<span class="labelLeft"><?php p($l->t("Reminder"));?></span>
			<span>
					<div id="sReminderSelect" class="combobox" style="margin:0;margin-top:10px;margin-bottom:-10px;">
					<div class="comboSelHolder">	
				    <div class="selector">Please select</div>
				    <div class="arrow-down"></div>
				    </div>
				    <ul>
				    	<?php
			    	  foreach($_['reminder_options'] as $KEY => $VALUE){
			    	  	$selected='';	
						$addCheckedClass='';
			    	  	if($_['reminder']==$KEY){
			    	  		$selected='class="isSelected"';
							$addCheckedClass='isSelectedCheckbox';
						}	
			    	  	print_unescaped('<li data-id="'.$KEY.'"  '.$selected.'><span class="colCal '.$addCheckedClass.'"></span>'.$VALUE.'</li>');
			    	  	 
					}
			    	?>
				    </ul>
			   </div>
			   </span>
			<br style="clear:both;" />
				<div id="reminderoutput">&nbsp;</div>	
	 <span class="labelLeft"><?php p($l->t('Completed')); ?></span> 
	 <div id="slider" style="width:60%;float:left;margin-top:10px;margin-left:5px;"><div style="float:left;margin-left:-3px;margin-top:-2px;font-size:11px;z-index:10;position:absolute;" id="percentVal"></div></div>
	 <input type="hidden" name="percCompl" id="percCompl" value="<?php p($_['percentCompleted']); ?>" />
       <br class="clearing"  />
        <span class="labelLeft"><?php p($l->t('Show As')); ?></span>
        <div id="sliderShowAs" style="width:61%;float:left;height:16px;margin-top:6px;"><div style="float:left;margin-left:0px;margin-top:-2px;z-index:10;position:absolute;color:#fff;text-shadow:1px 1px 1px #333 ;" id="showAsVal">frei</div></div>
        <input type="hidden" id="accessclass" name="accessclass" value="<?php p($_['accessclass']); ?>" />
        <br class="clearing"  />
        <span class="labelLeft"><?php p($l->t('Priority')); ?></span>
        <div id="sliderPriority" style="width:60%;float:left;margin-top:10px;margin-left:5px;"><div style="float:left;margin-left:-3px;margin-top:-2px;z-index:10;font-size:11px;position:absolute;" id="prioVal">frei</div></div>
        <input type="hidden" id="priority" name="priority" value="<?php p($_['priority']); ?>" />
       
		<br class="clearing"  />		
	</div>
		<h3><?php p($l->t("Notice"));?><span class="lnotice ioc ioc-checkmark"></span>, <?php p($l->t("Tags"));?><span class="ltag ioc ioc-checkmark"></span> <?php p($l->t("or"));?> <?php p($l->t("URL"));?><span class="lurl ioc ioc-checkmark"></span> <?php p($l->t("add"));?></h3>

	<div>
     <ul id="tagmanager" style="width:96%;line-height:20px;margin-top:6px;margin-bottom:5px;"></ul>
 	 <input type="text" style="width:96%;font-family:Arial, fontello;font-size:14px;" size="200" placeholder="&#xe84f; <?php p($l->t("URL"));?>" value="<?php p(isset($_['link']) ? $_['link'] : '') ?>" maxlength="200"  name="link" />
      <br class="clearing"  />
    <textarea class="textClass pflicht" style="width:95%;height: 50px;font-family:Arial, fontello;font-size:14px;"  placeholder="&#xe845; <?php p($l->t("Description of the Event"));?>" name="noticetxt"><?php p($_['vtodo']->description); ?></textarea>
     <br class="clearing"  />
   </div>
  </div>
  
     <div id="showOwnReminderDev">	
		 <select name="reminderAdvanced" id="reminderAdvanced">
					<?php
					print_unescaped(OCP\html_select_options($_['reminder_advanced_options'], $_['reminder_advanced']));
					?>
			</select><br />
		 	<span id="reminderTable" class="advancedReminder">
					   <input type="number" style="width:30px;padding:2px;float:left;" min="1" max="365" maxlength="3" name="remindertimeinput" id="remindertimeinput" value="<?php p($_['remindertimeinput']); ?>" />
						<select id="remindertimeselect" name="remindertimeselect" style="min-width:120px;">
							<?php
							print_unescaped(OCP\html_select_options($_['reminder_time_options'], $_['remindertimeselect']));
							?>
						</select>
					</span>
					<span id="reminderdateTable" class="advancedReminder">
						<span><?php p($l->t("Date"));?></span> <input type="text" style="width:85px;" value="<?php p($_['reminderdate']);?>" name="reminderdate" id="reminderdate">
						&nbsp;
						<input type="text" style="padding:2px; width:40px;" value="<?php p($_['remindertime']);?>" name="remindertime" id="remindertime">
					</span>
						<span id="reminderemailinputTable" class="advancedReminder">
							<span><?php p($l->t("Email"));?></span> <input type="text" style="width:140px;" name="reminderemailinput" id="reminderemailinput" value="<?php p($_['reminderemailinput']); ?>" />
						</span><br style="clear:both;" />
					<span style="width:100%;border-top:1px solid #bbb;display:block;margin-top:5px;padding-top:4px;">
				<div class="button-group" style="float:right;">
				<button id="remCancel" class="button"><?php p($l->t("Cancel"));?></button> 
				<button id="remOk" style="font-weight:bold;color:#0098E4; min-width:60px;"  class="button"><?php p($l->t("OK"));?></button>
				</div>
			</span>		
		</div>
    
    
  

  
 </form>  
 
  <div id="actions" style="border-top:1px solid #bbb;width:100%;padding-top:5px;margin-top:10px;">
  	<div  class="button-group" style="width:30%; float:left;">
	     <?php if($_['permissions'] & OCP\PERMISSION_DELETE) { ?>
		<button id="deleteTodo-submit" class="button"><?php p($l->t("Delete"));?></button> 
		<?php } ?>
		</div>
		
      <div  class="button-group" style="float:right;">
		<button id="editTodo-cancel" class="button"><?php p($l->t("Cancel"));?></button> 
		
		 <?php if($_['permissions'] & OCP\PERMISSION_UPDATE) { ?>
		<button id="editTodo-submit" class="button"  style="min-width:60px;"><?php p($l->t("OK"));?></button> 
		<?php } ?>
	   </div>
	</div>
 </div>  	       
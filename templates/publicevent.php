<div id="notification-container">
	<div id="notification" style="display: none;"></div>
</div>

<input type="hidden" id="isPublic" name="isPublic" value="1">
<input type="hidden" name="sRuleRequest" id="sRuleRequestSingle" value="<?php p($_['repeat_rules']); ?>" />
<header><div id="header">
		<a href="<?php print_unescaped(link_to('', 'index.php')); ?>"
			title="<?php p($theme -> getLogoClaim()); ?>" id="owncloud">
			<div class="logo-icon svg"></div>
		</a>
		<div class="header-right">
			
			<span id="details"><?php p($l->t('%s shared the Todo "%s" with you',
						array($_['displayName'], $_['title']))) ?></span>
		</div>
		
	</div>
	</header>

<div id="eventPublic">
	<div id="eventPublicInner">
		<div style="position:absolute;right:5px;float:right;display:block;">
	
	<?php
					
					if(count($_['categories']) > 0 && $_['categories']!='' ) { 
							if(is_array($_['categories'])){
								$output='';
								foreach($_['categories'] as $categorie) {
									$output.='<span class="catColPrev" style="float:left;margin:2px;position:relative;background-color:#6D7D94	; color:#fff;" title="'.$categorie.'">'.substr(trim($categorie),0,1).'</span>';
								}
								print_unescaped($output);
							}
					 }
					  print_unescaped('<span class="colCal" title="'.$_['aCalendar']['displayname'].'" style="float:left;margin-left:8px;padding:5px;margin-top:2px;position:relative;background-color:'.$_['aCalendar']['calendarcolor'].';">&nbsp;</span>');
					 ?>	
		 			<a href="<?php print_unescaped(\OC::$server->getURLGenerator()->linkToRoute($_['calAppName'].'.export.exportEvents')) ?>?t=<?php p($_['token']); ?>" title="export as ics file"><i style="font-size:30px;" class="ioc ioc-download"></i></a> 
	
			</div>		 	
		<br /><br />			 
<table class="shareevent" width="100%" align="center">
		<tr>
			<td style="font-size:20px;color:#0098E4; font-weight:bold;line-height:26px;">
				<?php p(isset($_['title']) ? $_['title'] : '') ?>
			</td>
		</tr>
		<?php if($_['location']!=''){ ?>
		<tr><td>
			<i class="ioc ioc-location"></i> <a id="showLocation" style="font-size:16px; line-height:26px; color:#818181;" target="_blank" href="http://maps.google.com/maps?q=<?php p(isset($_['location']) ? $_['location'] : '') ?>&amp;z=20" data-geo="data-geo"><?php p(isset($_['location']) ? $_['location'] : '') ?></a>

		</td></tr>
		<?php } ?>	
	</table>
	
	<table class="shareevent" width="100%">
		<?php if($_['TaskStartDate']!=''){ ?>
		<tr>
			<th class="leftDescr">
		<i class="ioc ioc-clock"></i> <?php p($l->t('Start')); ?>  <?php p($l->t('on')); ?>
		</th>
		<td>
			<?php p($_['TaskStartDate']); ?> <?php p($_['TaskStartTime']); ?>
		</td>
		</tr>
		<?php } ?>	
		<?php if($_['TaskDate']!=''){ ?>
		<tr>
			<th class="leftDescr">
		<i class="ioc ioc-clock"></i> <?php p($l->t('Due')); ?>  <?php p($l->t('on')); ?>
		</th>
		<td>
			<?php p($_['TaskDate']); ?> <?php p($_['TaskTime']); ?>
		</td>
		</tr>
		<?php } ?>	
	</table>
	<table class="shareevent" width="100%">
		<tr>
			<th class="leftDescr">
		<i class="ioc ioc-flash"></i> <?php p($l->t('Priority')); ?>
		</th>
		<td>
			<?php p($_['priorityOptions']); ?>
		</td>
		</tr>
		<tr>
			<th class="leftDescr">
		<i class="ioc ioc-info-1"></i> <?php p($l->t('Status')); ?>
		</th>
		<td>
			<?php p($_['cptlStatus']); ?>
		</td>
		</tr>
		<tr>
			<th class="leftDescr">
		<i class="ioc ioc-tasks"></i> <?php p($l->t('Completed')); ?>
		</th>
		<td>
			<div class="cOuter"><div class="cInner" style="width:<?php p($_['percentComplete']); ?>%;"><?php p($_['percentComplete']); ?>%</div></div>
		</td>
		</tr>
	</table>
	
		
		   <?php if($_['description']!=''){ ?>
		<table class="shareevent" width="100%">
			<tr>
				<th class="leftDescr" style="vertical-align: top;"><i class="ioc ioc-notice"></i> <?php p($l->t("Notice"));?> </th>
				<td style="white-space:normal;">
					<div class="noticeShareShow">
					<?php p(isset($_['description']) ? $_['description'] : '') ?>
					</div>
				 </td>	
					</tr>
		</table> 
		 <?php } ?>
		
		<table class="shareevent" width="100%">
		
		
		<?php if($_['link']!=''){ ?>
			
			<tr>
				<th class="leftDescr"><i class="ioc ioc-link-ext"></i>  <?php p($l->t("URL"));?></th>
				<td>
					<a  target="_blank" href="<?php p($_['link']) ?>"  title="<?php p($_['link']) ?>"><?php p($l->t("Link"));?></a>
					
				</td>
			</tr>
		
	<?php } ?>	
	</table>
	</div>
</div>

	
	<footer>
		<p class="info">
			<?php print_unescaped($theme->getLongFooter()); ?>
		</p>
	</footer>

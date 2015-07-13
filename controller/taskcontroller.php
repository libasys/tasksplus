<?php
/**
 * ownCloud - TasksPlus
 *
 * @author Sebastian Doell
 * @copyright 2015 sebastian doell sebastian@libasys.de
 *
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU AFFERO GENERAL PUBLIC LICENSE
 * License as published by the Free Software Foundation; either
 * version 3 of the License, or any later version.
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU AFFERO GENERAL PUBLIC LICENSE for more details.
 *
 * You should have received a copy of the GNU Affero General Public
 * License along with this library.  If not, see <http://www.gnu.org/licenses/>.
 *
 */
 
 
namespace OCA\TasksPlus\Controller;

use \OCA\TasksPlus\App as TasksApp;
use \OCA\TasksPlus\Timeline;
use \OCA\TasksPlus\Share\Backend\Vtodo;

use \OCA\CalendarPlus\App as CalendarApp;
use \OCA\CalendarPlus\Calendar as CalendarCalendar;
use \OCA\CalendarPlus\VObject;
use \OCA\CalendarPlus\Object;

use \OCP\AppFramework\Controller;
use \OCP\AppFramework\Http\JSONResponse;
use \OCP\AppFramework\Http\TemplateResponse;
use \OCP\IRequest;
use \OCP\Share;
use \OCP\IConfig;

class TaskController extends Controller {

	private $userId;
	private $l10n;
	private $configInfo;

	public function __construct($appName, IRequest $request, $userId, $l10n, IConfig $settings) {
		parent::__construct($appName, $request);
		$this -> userId = $userId;
		$this->l10n = $l10n;
		$this->configInfo = $settings;
	}
	
	/**
	 * @NoAdminRequired
	 */
	public function getTasks() {
		$sMode = (string) $this -> params('mode');
		$calId = (int) $this -> params('calid');
		$atasksModeAllowed = array('dayselect'=>1,'showall'=>1,'today'=>1,'tomorrow'=>1,'actweek'=>1,'withoutdate'=>1,'missedactweek'=>1,'alltasks'=>1,'alltasksdone'=>1,'sharedtasks'=>1,'comingsoon'=>1);
		$tasks = array();
		
		if(intval($calId) > 0 && $sMode === '') {
			$cDataTimeLine = new Timeline();
			$cDataTimeLine->setTimeLineMode('');
			$cDataTimeLine->setCalendarId($calId);
			$tasks = $cDataTimeLine->generateCalendarSingleOutput();
		}
		
		// Get Timelined tasks
		if($sMode !== '' && $atasksModeAllowed[$sMode] && $sMode !== 'sharedtasks'){
			$calendars = CalendarCalendar::allCalendars($this->userId, true);
			$activeCalendars = '';
			foreach($calendars as $calendar) {
				$isAktiv= $calendar['active'];
				
				if($this ->configInfo -> getUserValue($this -> userId,CalendarApp::$appname, 'calendar_'.$calendar['id'])!=''){
				    $isAktiv=$this ->configInfo -> getUserValue($this -> userId,CalendarApp::$appname, 'calendar_'.$calendar['id']);
			    }	
				if(!array_key_exists('active', $calendar)){
					$isAktiv = 1;
				}
				if((int)$isAktiv === 1 && (int) $calendar['issubscribe'] === 0) {
					$activeCalendars[] = $calendar;
				}
			}
			
		   	$cDataTimeLine=new Timeline();
		   
		   	if($sMode === 'dayselect'){
			   	$sDay = $this -> params('sday');	
			   	$timeStampDay=strtotime($sDay);
			   	$cDataTimeLine->setTimeLineDay($timeStampDay);
		   	}
		   
		   	$cDataTimeLine->setTimeLineMode($sMode);
		   	$cDataTimeLine->setCalendars($activeCalendars);
		   	$tasks=$cDataTimeLine->generateTasksAllOutput();
		}
		
		//Get Shared Tasks
		if($sMode !== '' && $atasksModeAllowed[$sMode] && $sMode === 'sharedtasks'){
			
			$singletodos = \OCP\Share::getItemsSharedWith(CalendarApp::SHARETODO, Vtodo::FORMAT_TODO);
			if(is_array($singletodos)){
				$tasks = $singletodos;
		   }	
		}
		
		$response = new JSONResponse();
		$response -> setData($tasks);
		return $response;
		
	}

	/**
	 * @NoAdminRequired
	 */
	public function setCompleted() {
		$id = $this -> params('id');
		$checked = $this -> params('checked');
			
		$vcalendar = TasksApp::getVCalendar( $id, true, true );
		$vtodo = $vcalendar->VTODO;
		
		$aTask= TasksApp::getEventObject($id, true, true);	
		$aCalendar= CalendarCalendar::find($aTask['calendarid']);		
		TasksApp::setComplete($vtodo, $checked ? 100 : 0, null);
		TasksApp::edit($id, $vcalendar->serialize());
		$user_timezone = CalendarApp::getTimezone();
		$task_info[] = TasksApp::arrayForJSON($id, $vtodo, $user_timezone, $aCalendar, $aTask);		
		
		$subTaskIds='';
		if($aTask['relatedto'] === ''){
			$subTaskIds=TasksApp::getSubTasks($aTask['eventuid']);
			if($subTaskIds !== ''){
			  $tempIds=explode(',',$subTaskIds);	
			  foreach($tempIds as $subIds){
			  	$vcalendar = TasksApp::getVCalendar( $subIds, true, true );
				$vtodo = $vcalendar->VTODO;
				TasksApp::setComplete($vtodo, $checked ? 100 : 0, null);
				TasksApp::edit($subIds, $vcalendar->serialize());
				$task_info[] = TasksApp::arrayForJSON($subIds, $vtodo, $user_timezone, $aCalendar, $aTask);
			  }
			}
		}
		
		$response = new JSONResponse();
		$response -> setData($task_info);
		return $response;
		
	}
	
	/**
	 * @NoAdminRequired
	 */
	public function setCompletedPercentMainTask() {
			
		$id = $this -> params('id');
		
		$aTask= TasksApp::getEventObject($id, true, true);	
		if($aTask['relatedto'] === ''){
			$subTaskIds= TasksApp::getSubTasks($aTask['eventuid']);
			if($subTaskIds !== ''){
				  $tempIds = explode(',',$subTaskIds);
				$iSubTasksComplete=0;	
				  foreach($tempIds as $subIds){
				  	$vcalendar = TasksApp::getVCalendar( $subIds, true, true );
					$vtodo = $vcalendar->VTODO;
					if($vtodo->{'PERCENT-COMPLETE'}){
						 $iSubTasksComplete+= (int) $vtodo->getAsString('PERCENT-COMPLETE');
					}
				  }
				  
				  if($iSubTasksComplete > 0){
				  	
				  	 $gesamtCptl =  ($iSubTasksComplete * 100) / (100 * count($tempIds));
			  	 	 $gesamtCptl=round($gesamtCptl);
					 
				  	$vcalendar1 = TasksApp::getVCalendar( $id, true, true );
					$vtodoMain = $vcalendar1->VTODO;
					TasksApp::setComplete($vtodoMain,$gesamtCptl,null);
					TasksApp::edit($id, $vcalendar1->serialize());
					
					$params=[
						'id' => $id,
						'percentCptl' => $gesamtCptl,
					];
					$response = new JSONResponse();
					$response -> setData($params);
					return $response;
				  }
			}
		}
	}
	
	/**
	 * @NoAdminRequired
	 */
	public function buildLeftNavigation() {
			
		$calendars = CalendarCalendar::allCalendars($this->userId, true);
		
		$activeCalendars = '';
		foreach($calendars as $calendar) {
			$isAktiv= $calendar['active'];
			
			if($this ->configInfo -> getUserValue($this -> userId,CalendarApp::$appname, 'calendar_'.$calendar['id'])!=''){
			    $isAktiv = $this ->configInfo -> getUserValue($this -> userId,CalendarApp::$appname, 'calendar_'.$calendar['id']);
		    }	
			if(!array_key_exists('active', $calendar)){
				$isAktiv = 1;
			}
			if((int)$isAktiv === 1 && (int)$calendar['issubscribe'] === 0) {
				$activeCalendars[] = $calendar;
			}
		}
		
		$cDataTimeLine=new Timeline();
		$cDataTimeLine->setCalendars($activeCalendars);
		$outputTodoNav=$cDataTimeLine->generateTodoOutput();
		
		$mySharees = Object::getCalendarSharees();
	    $activeCal= $this ->configInfo -> getUserValue($this -> userId,CalendarApp::$appname, 'choosencalendar');
		
		$outputCalendar = '';
		
		foreach($activeCalendars as $calInfo){
	     
		    $rightsOutput='';
			$share='';
			$isActiveUserCal='';
			 $notice='';
			 if($activeCal === $calInfo['id']){
			 	$isActiveUserCal = 'isActiveCal';
			 }
			 
			 if((is_array($activeCal) && array_key_exists($calInfo['id'], $activeCal))) {
			 	$sharedescr = $activeCal[$calInfo['id']];	
			 	$share = '<i class="ioc ioc-share toolTip" title="<b>'.  CalendarApp::$l10n->t('Shared with').'</b><br>'.$sharedescr.'"></i>'; 	
			 }
			 
			$displayName = '<span class="descr">'.$calInfo['displayname'].' '.$share.'</span>';
			
	         if($calInfo['userid'] !== $this->userId){
	  	       
	         	if(\OCP\Share::getItemSharedWithByLink(CalendarApp::SHARECALENDAR, CalendarApp::SHARECALENDARPREFIX.$calInfo['id'], $calInfo['userid'])){
	         		$notice='<b>Notice</b><br>'.(string)$this->l10n->t('This calendar is also shared by Link for public!').'<br>';
	         	}
				
			    $rightsOutput = CalendarCalendar::permissionReader($calInfo['permissions']);
	  	        $displayName='<span class="toolTip descr" title="'.$notice.(string)$this->l10n->t('Calendar').' '.$calInfo['displayname'].'<br />('.$rightsOutput.')">'.$calInfo['displayname'].' (' . CalendarApp::$l10n->t('by') . ' ' .$calInfo['userid'].')</span>';
	        }
			 $countCalEvents=0;
			 if(array_key_exists($calInfo['id'], $outputTodoNav['aCountCalEvents'])) {
			 	$countCalEvents = $outputTodoNav['aCountCalEvents'][(string)$calInfo['id']];
			 	}
			 
		   	$outputCalendar.= '<li class="calListen '.$isActiveUserCal.'" data-permissions="'.$calInfo['permissions'].'" data-id="'.$calInfo['id'].'"><span class="colCal" style="background-color:'.$calInfo['calendarcolor'].';color:'.CalendarCalendar::generateTextColor($calInfo['calendarcolor']).';">'.substr($calInfo['displayname'],0,1).'</span> '.$displayName.'<span class="iCount">'.$countCalEvents.'</span></li>';
	     
	   }
		
		
		
		$params = [
			'calendarslist' => $outputCalendar,
			'tasksCount' => $outputTodoNav['tasksCount'],
			'aTaskTime' => $outputTodoNav['aTaskTime'],
			
		];
		
		$response = new TemplateResponse($this->appName, 'tasks.list', $params, '');
		
		return $response;
		
	}
	/**
	 * @NoAdminRequired
	 */
	public function addSharedTask() {
		
		$taskid = $this -> params('taskid');
		$calid = $this -> params('calid');
		
		TasksApp::addSharedTask($taskid,$calid);

		$response = new JSONResponse();
		return $response;
		
	}
	
	/**
	 * @NoAdminRequired
	 */
	public function addCategoryTask() {
		
		$id = $this -> params('id');
		$category = $this -> params('category');
		
		if (!empty($id)) {
			$data = TasksApp::getEventObject($id, false, false);
			$vcalendar = VObject::parse($data['calendardata']);
			$vtodo = $vcalendar -> VTODO;
			$orgId = $data['org_objid'];
		
			if ($vtodo -> CATEGORIES) {
				$aCategory = $vtodo -> getAsArray('CATEGORIES');
				$sCatNew = '';
				$aCatNew = array();
				foreach ($aCategory as $sCat) {
					$aCatNew[$sCat] = 1;
					if ($sCatNew == '') {
						$sCatNew = $sCat;
					} else {
						$sCatNew .= ',' . $sCat;
					}
				}
				if (!array_key_exists($category, $aCatNew)) {
					$sCatNew .= ',' . $category;
				}
				$vtodo -> setString('CATEGORIES', $sCatNew);
			} else {
				$vtodo -> setString('CATEGORIES', $category);
			}
		
			$vtodo -> setDateTime('LAST-MODIFIED', 'now');
			$vtodo -> setDateTime('DTSTAMP', 'now');
		
			TasksApp::edit($id, $vcalendar -> serialize(), $orgId);
		
			$lastmodified = $vtodo -> __get('LAST-MODIFIED') -> getDateTime();
			
			$params=[
				'lastmodified' =>  (int)$lastmodified -> format('U')
			];
			
			$response = new JSONResponse();
			$response -> setData($params);
			
			return $response;
		}

		
		
	}
	
	/**
	 * @NoAdminRequired
	 */
	public function newTask() {
		//relatedto,hiddenfield, read_worker,$_POST,mytaskcal, mytaskmode
		$relatedto = $this -> params('relatedto');
		$hiddenPostField = $this -> params('hiddenfield');
		$myTaskCal = $this -> params('mytaskcal');
		$myTaskMode = $this -> params('mytaskmode');
		
		if(isset($hiddenPostField) && $hiddenPostField === 'newitTask'){
			$cid = $this -> params('read_worker');	
			$postRequestAll = $this -> getParams();
			$vcalendar = TasksApp::createVCalendarFromRequest($postRequestAll);
			
			$id = Object::add($cid, $vcalendar->serialize());
			
			$vcalendar1 = TasksApp::getVCalendar( $id, true, true );
			$vtodo = $vcalendar1->VTODO;
				
			$aTask= TasksApp::getEventObject($id, true, true);	
			$aCalendar= CalendarCalendar::find($aTask['calendarid']);
			$user_timezone = CalendarApp::getTimezone();
			$task_info = TasksApp::arrayForJSON($id, $vtodo, $user_timezone, $aCalendar, $aTask);
			
			$response = new JSONResponse();
			$response -> setData($task_info);
			return $response;
		}
		
		if(isset($relatedto) && $relatedto !== ''){
			$calMainId=TasksApp::getCalIdByUID($relatedto);
		}
		
		$calendarsArrayTmp = CalendarCalendar::allCalendars($this->userId, true);
		//Filter Importent Values
		$calendar_options = array();
		$checkArray=array();
		$checkShareArray=array();
		$bShareCalId='';
		foreach($calendarsArrayTmp as $calendar) {
			
			$isAktiv = $calendar['active'];
			
			if($this ->configInfo -> getUserValue($this -> userId,CalendarApp::$appname, 'calendar_'.$calendar['id'])!=''){
			    $isAktiv=$this ->configInfo -> getUserValue($this -> userId,CalendarApp::$appname, 'calendar_'.$calendar['id']);
		    }	
			if(!array_key_exists('active', $calendar)){
				$isAktiv= 1;
			}
			if((int)$isAktiv === 1 && $calendar['userid'] !== $this->userId) {
				$sharedCalendar = \OCP\Share::getItemSharedWithBySource(CalendarApp::SHARECALENDAR, CalendarApp::SHARECALENDARPREFIX.$calendar['id']);
				if ($sharedCalendar && ($sharedCalendar['permissions'] & \OCP\PERMISSION_CREATE)) {
					array_push($calendar_options, $calendar);
					$checkShareArray[$calendar['id']] = $calendar['id'];	
				}
			}	
			if($isAktiv === 1 && $calendar['userid'] === $this->userId) {
				array_push($calendar_options, $calendar);
				$checkArray[$calendar['id']]=$calendar['id'];	
			}	
				
			
		}
		
		
		$priorityOptionsArray= TasksApp::getPriorityOptionsFilterd();
		$access_class_options = CalendarApp::getAccessClassOptions();
		
		$priorityOptions = TasksApp::generateSelectFieldArray('priority','',$priorityOptionsArray,false);
		
		$activeCal = '';
		if($this->configInfo->getUserValue($this->userId,CalendarApp::$appname, 'choosencalendar')){
			$activeCal = $this->configInfo->getUserValue($this->userId,CalendarApp::$appname, 'choosencalendar');
		}
		
		$reminder_options = CalendarApp::getReminderOptions();
		$reminder_advanced_options = CalendarApp::getAdvancedReminderOptions();
		$reminder_time_options = CalendarApp::getReminderTimeOptions();
		$activeCal=$this->configInfo->getUserValue($this->userId,CalendarApp::$appname, 'choosencalendar');
		if(intval($activeCal) > 0 && $activeCal !== ''){
			if($myTaskMode !== 'calendar' || $myTaskCal === 0) {
				$activeCal = $activeCal;
			}else {
				$activeCal = $myTaskCal;
			}
		}
		
		//reminder
		$reminderdate='';
		$remindertime='';
		
		
		$params = [
			'priorityOptions' => $priorityOptions,
			'relatedToUid' => $relatedto,
			'access_class_options' => $access_class_options,
			'calendar_options' => $calendar_options,
			'calendar' => $activeCal,
			'mymode' => $myTaskMode,
			'mycal' => $myTaskCal,
			'bShareCalId' => $bShareCalId,
			'accessclass' => '',
			'reminder_options' => $reminder_options,
			'reminder' => 'none',
			'reminder_time_options' => $reminder_time_options,
			'reminder_advanced_options' => $reminder_advanced_options,
			'reminder_advanced' => 'DISPLAY',
			'remindertimeselect' => '',
			'remindertimeinput' => '',
			'reminderemailinput' => '',
			'reminder_rules' => '',
			'reminderdate' => '',
			'remindertime' => '',
		];
		
		$response = new TemplateResponse($this->appName, 'event.new',$params, '');
		
		return $response;
	}

	/**
	 * @NoAdminRequired
	 */
	public function editTask() {
		//relatedto,hiddenfield, read_worker,$_POST,mytaskcal, mytaskmode
		$id = $this -> params('tid');
		$hiddenPostField = $this -> params('hiddenfield');
		$myTaskCal = $this -> params('mytaskcal');
		$myTaskMode = $this -> params('mytaskmode');
		
		$data = TasksApp::getEventObject($id, false, false);
		$object = VObject::parse($data['calendardata']);
		$calId = Object::getCalendarid($id); 
		$orgId=$data['org_objid'];
		
		//Search for Main Task
		$mainTaskId='';
		if($data['relatedto'] !== ''){
			$mainTaskId=TasksApp::getEventIdbyUID($data['relatedto']);
		}
		//Search for Sub Tasks
		$subTaskIds='';
		if($data['relatedto'] === ''){
			$subTaskIds=TasksApp::getSubTasks($data['eventuid']);
		}
		
		if(isset($hiddenPostField) && $hiddenPostField==='edititTask' && $id > 0){
			$cid = $this -> params('read_worker');		
			$postRequestAll = $this -> getParams();	
			TasksApp::updateVCalendarFromRequest($postRequestAll, $object);
			TasksApp::edit($id, $object->serialize(), $orgId);
			
			if($mainTaskId === ''){
				$mainTaskId = $id;
			}
			
			if($calId !== intval($cid)){
				Object::moveToCalendar($id, intval($cid));
				 if($subTaskIds !== ''){
				 	$tempIds = explode(',',$subTaskIds);
					  foreach($tempIds as $subIds){
					  	Object::moveToCalendar($subIds, intval($cid));
					  }
				 }
			}
			$params=[
				'mainid' => $mainTaskId
			];
			
			$response = new JSONResponse();
			$response -> setData($params);
			
			return $response;
		}
		
		    $vtodo = $object -> VTODO;
			$object = Object::cleanByAccessClass($id, $object);
			$accessclass = $vtodo -> getAsString('CLASS');
			
			if(empty($accessclass)){
				$accessclass = 'PUBLIC';
			}
			
			//\OCP\Util::writeLog($this->appName,'ACCESS: '.$accessclass, \OCP\Util::DEBUG);
			
			$permissions = TasksApp::getPermissions($id, TasksApp::TODO, $accessclass);
			$link = strtr($vtodo -> getAsString('URL'), array('\,' => ',', '\;' => ';'));
		 
			$TaskDate = ''; 
			$TaskTime = '';
			if($vtodo->DUE){
				 	$dateDueType = $vtodo->DUE->getValueType();
						    
					 if($dateDueType === 'DATE'){
					 	$TaskDate = $vtodo->DUE -> getDateTime() -> format('d.m.Y');
						$TaskTime ='';
					 }
					 if($dateDueType === 'DATE-TIME'){
					 	$TaskDate = $vtodo->DUE -> getDateTime() -> format('d.m.Y');
						$TaskTime = $vtodo->DUE -> getDateTime() -> format('H:i');
					 }
				
			}
			
			$TaskStartDate='';
			$TaskStartTime='';
			if ( $vtodo->DTSTART) {
					 $dateStartType=$vtodo->DTSTART->getValueType();	
					if($dateStartType === 'DATE'){
					 	$TaskStartDate = $vtodo->DTSTART -> getDateTime() -> format('d.m.Y');
						$TaskStartTime ='';
					 }
					 if($dateStartType === 'DATE-TIME'){
					 	$TaskStartDate = $vtodo->DTSTART -> getDateTime() -> format('d.m.Y');
						$TaskStartTime = $vtodo->DTSTART -> getDateTime() -> format('H:i');
					 }
			}
		
		
		$priority= $vtodo->getAsString('PRIORITY');
		
		$calendarsArrayTmp = CalendarCalendar::allCalendars($this->userId, true);
		//Filter Importent Values
		$calendar_options = array();
		$checkArray = array();
		$checkShareArray = array();
		$bShareCalId = '';
		
		foreach($calendarsArrayTmp as $calendar) {
				
			$isAktiv= $calendar['active'];
			
			if($this ->configInfo -> getUserValue($this -> userId,CalendarApp::$appname, 'calendar_'.$calendar['id'])!=''){
			    $isAktiv=$this ->configInfo -> getUserValue($this -> userId,CalendarApp::$appname, 'calendar_'.$calendar['id']);
		    }	
			if(!array_key_exists('active', $calendar)){
				$isAktiv= 1;
			}
			if((int)$isAktiv === 1 && $calendar['userid'] !== $this->userId || $mainTaskId !== '') {
				$sharedCalendar = \OCP\Share::getItemSharedWithBySource(CalendarApp::SHARECALENDAR, CalendarApp::SHARECALENDARPREFIX.$calendar['id']);
				if ($sharedCalendar && ($sharedCalendar['permissions'] & \OCP\PERMISSION_UPDATE) && $mainTaskId === '') {
					array_push($calendar_options, $calendar);
					$checkShareArray[$calendar['id']] = $sharedCalendar['permissions'];	
				}
			}	
			if($isAktiv === 1 && $calendar['userid'] === $this->userId) {
				array_push($calendar_options, $calendar);
				$checkShareArray[$calendar['id']] = \OCP\PERMISSION_ALL;	
			}		
	
			
		}
		
		
		if(!array_key_exists($calId,$checkShareArray)){
			$bShareCalId='hide';
		}
		
		$priorityOptionsArray= TasksApp::getPriorityOptionsFilterd();
		$priorityOptions= TasksApp::generateSelectFieldArray('priority', (string)$vtodo->priority, $priorityOptionsArray,false);
		$access_class_options = CalendarApp::getAccessClassOptions();
		//NEW Reminder
		$reminder_options = CalendarApp::getReminderOptions();
		$reminder_advanced_options = CalendarApp::getAdvancedReminderOptions();
		$reminder_time_options = CalendarApp::getReminderTimeOptions();
		
		//reminder
		$vtodosharees = array();
		$sharedwithByVtodo = \OCP\Share::getItemShared(CalendarApp::SHARETODO, CalendarApp::SHARETODOPREFIX.$id);
		if(is_array($sharedwithByVtodo)) {
			foreach($sharedwithByVtodo as $share) {
				if($share['share_type'] == \OCP\Share::SHARE_TYPE_USER || $share['share_type'] == \OCP\Share::SHARE_TYPE_GROUP) {
					$vtodosharees[] = $share;
				}
			}
		}
		
		$percentCompleted='0';	
		if($vtodo->{'PERCENT-COMPLETE'}){
			$percentCompleted = $vtodo -> getAsString('PERCENT-COMPLETE');
		}

		$aAlarm = $this->setAlarmTask($vtodo, $reminder_options);
		
			$params = [
			'id' => $id,
			'calId' => $calId,
			'orgId' => $orgId,
			'permissions' => $permissions,
			'priorityOptions' => $priorityOptions,
			'access_class_options' => $access_class_options,
			'calendar_options' => $calendar_options,
			'calendar' => $calId,
			'mymode' => $myTaskMode,
			'mycal' => $myTaskCal,
			'bShareCalId' => $bShareCalId,
			'subtaskids' => $subTaskIds,
			'cal_permissions' => $checkShareArray,
			'accessclass' => $accessclass,
			'reminder_options' => $reminder_options,
			'reminder_rules' => (array_key_exists('triggerRequest',$aAlarm)) ? $aAlarm['triggerRequest']:'',
			'reminder' =>  $aAlarm['action'],
			'reminder_time_options' => $reminder_time_options,
			'reminder_advanced_options' => $reminder_advanced_options,
			'reminder_advanced' => 'DISPLAY',
			'remindertimeselect' => (array_key_exists('reminder_time_select',$aAlarm)) ? $aAlarm['reminder_time_select']:'',
			'remindertimeinput' => (array_key_exists('reminder_time_input',$aAlarm)) ? $aAlarm['reminder_time_input']:'',
			'reminderemailinput' => (array_key_exists('email',$aAlarm)) ? $aAlarm['email']:'',
			'reminderdate' => (array_key_exists('reminderdate',$aAlarm)) ? $aAlarm['reminderdate']:'',
			'remindertime' => (array_key_exists('remindertime',$aAlarm)) ? $aAlarm['remindertime']:'',
			'link' => $link,
			'priority' => $priority,
			'TaskDate' => $TaskDate,
			'TaskTime' => $TaskTime,
			'TaskStartDate' => $TaskStartDate,
			'TaskStartTime' => $TaskStartTime,
			'vtodosharees' => $vtodosharees,
			'percentCompleted' => $percentCompleted,
			'sharetodo' =>CalendarApp::SHARETODO,
			'sharetodoprefix' =>CalendarApp::SHARETODOPREFIX,
			'vtodo' => $vtodo,
		];
		
			
		$response = new TemplateResponse($this->appName, 'event.edit',$params, '');	
		
		return $response;
		
	}

    private function parseTriggerDefault($trigger){
    	/*
		 * '-PT5M' => '5 '.(string)$l10n->t('Minutes before'),
			'-PT10M' => '10 '.(string)$l10n->t('Minutes before'),
			'-PT15M' => '15 '.(string)$l10n->t('Minutes before'),
			'-PT30M' => '30 '.(string)$l10n->t('Minutes before'),
			'-PT1H' => '1 '.(string)$l10n->t('Hours before'),
			'-PT2H' => '2 '.(string)$l10n->t('Hours before'),
			'-PT1D' => '1 '.(string)$l10n->t('Days before'),
			'-PT2D' => '2 '.(string)$l10n->t('Days before'),
			'-PT1W' => '1 '.(string)$l10n->t('Weeks before'),*/
			
		switch($trigger){
			case '-PT5M': 
			case '-P5M': 
			return '-PT5M';
			case '-PT10M': 
			case '-P10M': 
			return '-PT10M';
			case '-PT15M': 
			case '-P15M': 
			return '-PT15M';	
			case '-PT30M': 
			case '-P30M': 
			return '-PT30M';
			case '-PT1H': 
			case '-P1H': 
			return '-PT1H';
			case '-PT2H': 
			case '-P2H': 
			return '-PT2H';
			case '-PT1D': 
			case '-P1D': 
			case '-P1DT':
			return '-PT1D';
			case '-PT2D': 
			case '-P2D': 
			case '-PT2DT':
			return '-PT2D';
			case '-PT1W': 
			case '-P1W': 
			case '-PT1WT':
			return '-PT1W';										 	
		}
		
    }
	
	private function setAlarmTask($vtodo, $reminder_options){
		
		$aAlarm='';
		
		if($vtodo -> VALARM){
				
			$valarm = $vtodo -> VALARM;
			$valarmTrigger = $valarm->TRIGGER;
			
			$aAlarm['action'] = $valarm -> getAsString('ACTION');
			$aAlarm['triggerRequest'] = (string) $valarm->TRIGGER;
			//$tempTrigger=$aAlarm['triggerRequest'];
			
			
			$aAlarm['email']='';
			if($valarm ->ATTENDEE){
				$aAlarm['email'] = $valarm -> getAsString('ATTENDEE');
				if(stristr($aAlarm['email'],'mailto:')) $aAlarm['email']=substr($aAlarm['email'],7,strlen($aAlarm['email']));
			}
			
		  
		   if(array_key_exists($this->parseTriggerDefault($aAlarm['triggerRequest']),$reminder_options)){
			   $aAlarm['action'] = $this->parseTriggerDefault($aAlarm['triggerRequest']);
			   $aAlarm['triggerRequest'] =  $aAlarm['action'];
			   $aAlarm['reminderdate'] = '';
			   $aAlarm['remindertime'] = '';
			   
		   }else{
		   	  $aAlarm['action']='OWNDEF';
				if($valarmTrigger->getValueType() === 'DURATION'){
						$tempDescr='';
					    $aAlarm['reminderdate'] = '';
			   			$aAlarm['remindertime'] = '';
						if(stristr($aAlarm['triggerRequest'],'TRIGGER:')){
							$temp = explode('TRIGGER:',trim($aAlarm['triggerRequest']));
							$aAlarm['triggerRequest'] = $temp[1];
							
						}
						
						if(stristr($aAlarm['triggerRequest'],'-P')){
							$tempDescr='before';
						}else{
							$tempDescr='after';
						}
					
					   if(substr_count($aAlarm['triggerRequest'],'PT',0,2) === 1){
						 	$TimeCheck = substr($aAlarm['triggerRequest'], 2);
							$aAlarm['triggerRequest']='+PT'.$TimeCheck;
						}
					  
					   if(substr_count($aAlarm['triggerRequest'],'+PT',0,3) === 1){
						 	$TimeCheck = substr($aAlarm['triggerRequest'], 3);
							$aAlarm['triggerRequest']='+PT'.$TimeCheck;
						}
					   
					  if(substr_count($aAlarm['triggerRequest'],'P',0,1) === 1 && substr_count($aAlarm['triggerRequest'],'PT',0,2) === 0 && substr_count($aAlarm['triggerRequest'],'T',strlen($aAlarm['triggerRequest'])-1,1) === 0){
					  		$TimeCheck = substr($aAlarm['triggerRequest'], 1);
						  	$aAlarm['triggerRequest']='+PT'.$TimeCheck;
					  }
					  if(substr_count($aAlarm['triggerRequest'],'P',0,1) === 1 && substr_count($aAlarm['triggerRequest'],'PT',0,2) === 0 && substr_count($aAlarm['triggerRequest'],'T',strlen($aAlarm['triggerRequest'])-1,1) === 1){
					  		$TimeCheck = substr($aAlarm['triggerRequest'], 1);
							$TimeCheck = substr($TimeCheck, 0, -1);
							$aAlarm['triggerRequest'] = '+PT'.$TimeCheck;  
					  }
					  
					  
					   
					  if(substr_count($aAlarm['triggerRequest'],'-PT',0,3) === 1){
					  		$TimeCheck = substr($aAlarm['triggerRequest'], 3);
						 	$aAlarm['triggerRequest'] = '-PT'.$TimeCheck;  
					  }
 
					  if(substr_count($aAlarm['triggerRequest'],'-P',0,2) === 1 && substr_count($aAlarm['triggerRequest'],'-PT',0,3) === 0 && substr_count($aAlarm['triggerRequest'],'T',strlen($aAlarm['triggerRequest'])-1,1) === 0){
					  		$TimeCheck = substr($aAlarm['triggerRequest'], 2);
						  	$aAlarm['triggerRequest'] = '-PT'.$TimeCheck;  
					  }
					  
					 if(substr_count($aAlarm['triggerRequest'],'-P',0,2) === 1 && substr_count($aAlarm['triggerRequest'],'-PT',0,3) === 0 && substr_count($aAlarm['triggerRequest'],'T',strlen($aAlarm['triggerRequest']) -1,1) === 1){
					  		$TimeCheck = substr($aAlarm['triggerRequest'], 2);
							$TimeCheck = substr($TimeCheck, 0, -1);
							$aAlarm['triggerRequest'] = '-PT'.$TimeCheck;    
					  }
						
						$aAlarm['reminder_time_input']=substr($TimeCheck,0,(strlen($TimeCheck)-1));
						
						//returns M,H,D
						$alarmTimeDescr = substr($aAlarm['triggerRequest'],-1,1);
						
						if($alarmTimeDescr === 'W'){
							$aAlarm['reminder_time_select']='weeks'.$tempDescr;
						}
						
						if($alarmTimeDescr === 'H'){
							$aAlarm['reminder_time_select']='hours'.$tempDescr;
						}
						
						if($alarmTimeDescr === 'M'){
							$aAlarm['reminder_time_select']='minutes'.$tempDescr;
						}
						if($alarmTimeDescr === 'D'){
							$aAlarm['reminder_time_select']='days'.$tempDescr;
						}
						//\OCP\Util::writeLog($this->appName,'foundDESCR  '.$alarmTimeDescr, \OCP\Util::DEBUG);	
				}
				   
				
				if($valarmTrigger->getValueType() === 'DATE'){
					$aAlarm['reminderdate'] = $valarmTrigger -> getDateTime() -> format('d-m-Y');
					$aAlarm['remindertime'] ='';
					$aAlarm['reminder_time_input'] = '';
					$aAlarm['reminder_time_select']='ondate';
				}
				if($valarmTrigger->getValueType() === 'DATE-TIME'){
					$aAlarm['reminderdate'] = $valarmTrigger -> getDateTime() -> format('d-m-Y');
					$aAlarm['remindertime'] = $valarmTrigger -> getDateTime() -> format('H:i');
					$aAlarm['reminder_time_input'] = '';
					$aAlarm['reminder_time_select']='ondate';
					
				//  \OCP\Util::writeLog($this->appName,'foundDESCR  '.$aAlarm['triggerRequest'], \OCP\Util::DEBUG);
				  $aAlarm['triggerRequest'] = 'DATE-TIME:'.$aAlarm['triggerRequest'];
					
				}
				
				
		       
			}
		
		}else{
			$aAlarm['action'] = 'none';
		}
		
		return $aAlarm;
		
	}

	/**
	 * @NoAdminRequired
	 */
	public function deleteTask() {
			
		$id = $this -> params('id');
		
		$task = CalendarApp::getEventObject( $id );
		//Search for Sub Tasks
			$subTaskIds='';
			if($task['relatedto'] === ''){
				$subTaskIds= TasksApp::getSubTasks($task['eventuid']);
				if($subTaskIds !== ''){
				  $tempIds=explode(',',$subTaskIds);	
				  foreach($tempIds as $subIds){
				  	Object::delete($subIds);
				  }
				}
			}
			
		Object::delete($id);
		
		$params=[
			'id' => $id,
		];
		
		$response = new JSONResponse();
		$response -> setData($params);
		return $response;
		
	}
	/**
	 * @NoAdminRequired
	 */
	public function getDefaultValuesTasks() {
			
		$calendars = CalendarCalendar::allCalendars($this->userId);
		$myCalendars=array();
		
		foreach($calendars as $calendar) {
			if(!array_key_exists('active', $calendar)){
				$calendar['active'] = 1;
			}
			if($calendar['active'] == 1) {
				//$calendarInfo[$calendar['id']]=array('bgcolor'=>$calendar['calendarcolor'],'color'=>OCA\CalendarPlus\Calendar::generateTextColor($calendar['calendarcolor']));
				$myCalendars[$calendar['id']]=array('id'=>$calendar['id'],'name'=>$calendar['displayname']);
			}
		}
		
			$checkCat = CalendarApp::loadTags();
			$checkCatTagsList = '';
			$checkCatCategory = '';
			
			
			foreach($checkCat['categories'] as $category){
					$checkCatCategory[] = $category;
			}
			
			
			foreach($checkCat['tagslist'] as $tag){
					$checkCatTagsList[$tag['name']] = array('name'=>$tag['name'],'color'=>$tag['color'],'bgcolor'=>$tag['bgcolor']);
			}
		
		$params=[
			'mycalendars' => $myCalendars,
			'categories' => $checkCatCategory,
			'tags' => $checkCatTagsList
		];
		
		$response = new JSONResponse();
		$response -> setData($params);
		return $response;
	}
	
}

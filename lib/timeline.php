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
 
namespace OCA\TasksPlus;
use \OCA\CalendarPlus\App as CalendarApp;
use \OCA\CalendarPlus\VObject;
use \OCA\CalendarPlus\Object;
use \OCA\CalendarPlus\Calendar;
use \OCA\TasksPlus\Share\Backend\Vtodo;

Timeline::$l10n = \OC::$server->getL10N(App::$appname);
class Timeline{
	
	private $nowTime=0;
	private $aCalendar=array();
	public static $l10n;
	private $sMode='';
	private $iCalId=0;
	private $sDaySelect='';
	private $aSharedTasks=array();
	private $aTasks=array();
	private $aTasksOutput=array();
	private $dUserTimeZone = '';
	private $iCalPermissions = 0;
	private $taskOutPutbyTime=array('today'=>false,'tomorrow'=>false,'week'=>false,'missed'=>false,'notermin'=>false,'commingsoon'=>false);
	private $startDate=0;
	private $endDate=0;
	
	
	public function __construct(){
		$this->nowTime=time();
		$this->dUserTimeZone = CalendarApp::getTimezone();
	}
	public function setStartDate($sStartdate){
		$this->startDate=$sStartdate;
	}
	
	public function getStartDate(){
		return $this->startDate;
	}
	
	public function setEndDate($sEnddate){
		$this->endDate=$sEnddate;
	}
	
	public function getEndDate(){
		return $this->endDate;
	}
	
	public function setCalendars($aCalendar){
		//	$aCalendarNew='';
		foreach($aCalendar as $cal){
			
		//	if($cal['issubscribe'] == 0){	
				$this->aCalendar[$cal['id']] = $cal;
			//}
			//\OCP\Util::writeLog('calendar','Name :'.$cal['displayname'] ,\OCP\Util::DEBUG);	
		}	
			
		//$this->aCalendar=$aCalendarNew;
	}
	public function setTimeLineDay($sDay){
		$this->sDaySelect=$sDay;
		 \OCP\Util::writeLog(App::$appname,'SETTER TIME: '.date('d.m.Y',$this->sDaySelect), \OCP\Util::DEBUG);
	}
	
	public function setCalendarPermissions($iPermissions){
		$this->iCalPermissions=$iPermissions;
	}
	
	public function setSharedTasks($aShareTasks){
		$this->aSharedTasks=$aShareTasks;
	}
	
	public function setTasks($aTasks){
		$this->aTasks=$aTasks;
	}
	
	public function setCalendarId($iCalId){
		$this->iCalId=$iCalId;
	}
	
	public function setTimeLineMode($sMode){
		$this->sMode=$sMode;
	}
	
	public function getToday(){
		  return date('d.m.Y',$this->nowTime);
	}
	
	public function getTommorow(){
		  return date('d.m.Y',$this->nowTime+(24*3600));
	}
	
	public function getStartofTheWeek(){
		   $iTagAkt=date("w",$this->nowTime);
   	       $firstday=1;
     	   $iBackCalc=(($iTagAkt-$firstday)*24*3600);
	     
	       $getStartdate=$this->nowTime-$iBackCalc;
		   
		   return date('d.m.Y',$getStartdate);
	}
	
	public function getEndofTheWeek(){
		    	
		    $iForCalc=(6*24*3600);
		    $getEnddate=strtotime($this->getStartofTheWeek())+$iForCalc;
		   
		   return date('d.m.Y',$getEnddate);
	}
	
	public function generateAddonCalendarTodo(){
	
		 $today=strtotime($this->getToday());
		 $tomorrow = strtotime($this->getTommorow()); 
		 $beginnWeek = strtotime($this->getStartofTheWeek()); 
		 $endWeek = strtotime($this->getEndofTheWeek()); 
		
		$taskOutput='';
		
		// foreach( $this->aCalendar as $cal ) {
		 	 $calendar_tasks = App::all($this->aCalendar, true);
			 $checkCat = CalendarApp::loadTags();
			 $checkCatCache='';
				foreach($checkCat['tagslist'] as $catInfo){
				//	foreach($catInfo as $cat){	
						$checkCatCache[$catInfo['name']]=$catInfo['bgcolor'];
				//	}
				}
			 foreach( $calendar_tasks as $taskInfo ) {
				  
					$taskOutput='';
					  	
				  	  if($taskInfo['objecttype']!='VTODO') {
			                        continue;
			            }
					
					$calId=(string)$taskInfo['calendarid'];
					   
					$object = VObject::parse($taskInfo['calendardata']);
					$vtodo = $object->VTODO; 
					$completed = $vtodo->COMPLETED;
					$accessclass=$vtodo->getAsString('CLASS');
					$categories=$vtodo->getAsArray('CATEGORIES');
					
					
					if($this->aCalendar[$calId]['userid'] !== \OCP\USER::getUser()){
						if($accessclass!='' && $accessclass!='PUBLIC'){
							 continue;
						}
					}
					if(!$completed){
				
					$due = $vtodo->DUE;
					$dtstart = $vtodo->DTSTART;	
					
					$Summary='<span class="description"><a href="'.\OC::$server->getURLGenerator()->linkToRoute(App::$appname.'.page.index').'#'.$taskInfo['id'].'">'.$vtodo->getAsString('SUMMARY').'</a></span>';
					
					$addPrivateImg='&nbsp;';
					if ($accessclass!='' && ($accessclass === 'PRIVATE')){
						
						$addPrivateImg='<i class="ioc ioc-lock" title="private"></i>';
	
					}
					if ($accessclass!='' && ($accessclass === 'CONFIDENTIAL')){
						$addPrivateImg='<i class="ioc ioc-eye" title="confidential"></i>';
					}
					
					$prioOutput = '';
					if(isset($vtodo->PRIORITY)){
						$prio = $vtodo->getAsString('PRIORITY');
						if ($prio >= 1 && $prio < 5) {
							$prioOutput ='<i class="ioc ioc-info-circled priority-' . ( $prio ? $prio : 'n').'" title="'. (string) self::$l10n->t('priority %s ', array((string)self::$l10n->t('high'))).'"></i>';
							
						}
						elseif ($prio  == 5) {
							$prioOutput ='<i class="ioc ioc-info-circled priority-' . ( $prio ? $prio : 'n').'" title="'.  (string) self::$l10n->t('priority %s ', array((string)self::$l10n->t('medium'))).'"></i>';
						}
						
						elseif ($prio >= 6 && $prio <= 9) {
							$prioOutput = '<i class="ioc ioc-info-circled priority-' . ( $prio ? $prio : 'n').'" title="'. (string) self::$l10n->t('priority %s ', array((string)self::$l10n->t('low'))).'"></i>';
							
						}
					}
					
					$addShareImg='';
					 if($taskInfo['shared']) {
					 	$addShareImg='<i class="ioc ioc-share" title="shared"></i>';
					 }
					 $addAlarmImg='';
					 if($taskInfo['isalarm']) {
					 	$addAlarmImg='<i class="ioc ioc-clock" title="reminder"></i>';
					 }
					
		             $addCats='';
		             if(is_array($categories)){
		              	
		             	foreach($categories as $catInfo){
		             		 $bgColor='#ccc';	
		             		if(array_key_exists(trim($catInfo), $checkCatCache)) $bgColor=	$checkCatCache[trim($catInfo)];
		             		$addCats.='<span class="catColPrev" style="float:right;padding:0;margin:0;margin-right:1px;margin-top:4px;line-height:12px;font-size:8px;width:12px;height:12px;background-color:'.$bgColor.'" title="'.$catInfo.'">'.substr(trim($catInfo),0,1).'</span>';
		             	}
		             }
		             $dateTask='<span class="addImagesNoDate">'.$prioOutput.$addPrivateImg.$addAlarmImg.$addShareImg.'</span>'.$addCats.$Summary;
					if($due!=''){
						$dateTask=$due->getDateTime()->format('d.m.Y H:i').$addCats.'<br  /><span class="addImages">'.$prioOutput.$addPrivateImg.$addAlarmImg.$addShareImg.'</span>'.$Summary;
					}
					if($dtstart!=''){
						$dateTask=$dtstart->getDateTime()->format('d.m.Y H:i').$addCats.'<br  /><span class="addImages">'.$prioOutput.$addPrivateImg.$addAlarmImg.$addShareImg.'</span>'.$Summary;
						
					}
					//categories
					
					
					 
			        $taskOutput.='<li class="taskListRow" data-taskid="'.$taskInfo['id'].'">
			                              <span class="colorCal" style="margin-top:6px;background-color:'.$this->aCalendar[$taskInfo['calendarid']]['calendarcolor'].';">&nbsp;</span>
			                              <input class="inputTasksRow regular-checkbox" type="checkbox" id="task-val-'.$taskInfo['id'].'" /><label style="float:left;margin-right:5px;" for="task-val-'.$taskInfo['id'].'"></label> '.$dateTask.'
			                              </li>';
										  
					$bToday=false;
					$bTommorow=false;	
					$bActWeek=false;	
					$bMissed=false;
					$bCommingSoon=false;			  
					if($dtstart){
						$dtstartTmp = $dtstart->getDateTime()->format('d.m.Y');
						$dtstart = strtotime($dtstartTmp); 
						
							
							if($dtstart == $today){
								$this->taskOutPutbyTime['today'].=$taskOutput;
								$bToday=true;
							}
							
							if($dtstart==$tomorrow){
								$this->taskOutPutbyTime['tomorrow'].=$taskOutput;
								$bTommorow=true;
							}
							$bActWeek=false;
							if($dtstart>=$beginnWeek && $dtstart<=$endWeek && !$bToday){
								$this->taskOutPutbyTime['week'].=$taskOutput;
								$bActWeek=true;
							}
							$bMissed=false;
							if($dtstart < $today){
								$this->taskOutPutbyTime['missed'].=$taskOutput;
								$bMissed=true;
							}
							$bCommingSoon=false;
							if($dtstart>$endWeek){
								$this->taskOutPutbyTime['commingsoon'].=$taskOutput;
								$bCommingSoon=true;
							}
					   }
					   
					if($due){
						$dueTmp = $due->getDateTime()->format('d.m.Y');
						$due = strtotime($dueTmp); 
						$bCheck=false;
						
							if($due==$today && !$bToday){
								$this->taskOutPutbyTime['today'].=$taskOutput;
								$bCheck=true;
							}
							
							if($due == $tomorrow && !$bTommorow){
								$this->taskOutPutbyTime['tomorrow'].=$taskOutput;
								$bCheck=true;
							}
							if($due >= $beginnWeek && $due <= $endWeek && !$bCheck && !$bActWeek){
								$this->taskOutPutbyTime['week'].= $taskOutput;
							}
							
							if($due < $today && !$bMissed){
								$this->taskOutPutbyTime['missed'].= $taskOutput;
							}
							
							if($due>$endWeek && !$bCommingSoon){
								$this->taskOutPutbyTime['commingsoon'].= $taskOutput;
							}
					   }

					   if(!$dtstart && !$due){
					        //OhneTermin
							$this->taskOutPutbyTime['notermin'].=$taskOutput;
						}					  
			       }
              }
		 //}
		 return $this->taskOutPutbyTime;
		 
	}
	
	
	public function generateTodoOutput(){
			
			 $aCountCalEvents=array();
			 foreach($this->aCalendar as $calInfo){
			 	$aCountCalEvents[(string)$calInfo['id']]=0;
			 }
			 $aReturnArray=array();
			 $aTaskTime=array();
			 
			 $tasksCount = array('today'=>0,'tomorrow'=>0,'actweek'=>0,'withoutdate'=>0,'missedactweek'=>0,'alltasks'=>0,'alltasksdone'=>0,'sharedtasks'=>0,'comingsoon'=>0);
			  		
		     $today=strtotime($this->getToday());
			 $aTaskTime['today']=$this->getToday();
			 $tomorrow = strtotime($this->getTommorow()); 
			 $aTaskTime['tomorrow']=$this->getTommorow();
			 $beginnWeek = strtotime($this->getStartofTheWeek()); 
			 $endWeek = strtotime($this->getEndofTheWeek()); 
			 $aTaskTime['actweek']=$this->getStartofTheWeek().' - '.$this->getEndofTheWeek();
			
				//foreach( $this->aCalendar as $cal ) {
				   $calendar_tasks = App::all($this->aCalendar);
				   //$aCountCalEvents[$cal['id']]=0;
				   
				  foreach( $calendar_tasks as $task ) {
				  	  if($task['objecttype']!='VTODO') {
			                        continue;
			            }
				   
					    $calId=(string)$task['calendarid'];
					    $aCountCalEvents[$calId]+=1;
					   
					   $object = VObject::parse($task['calendardata']);
					   $vtodo = $object->VTODO;
					   $due = $vtodo->DUE;
					   $dstart = $vtodo->DTSTART;
					   $completed = $vtodo->COMPLETED;
					   $tasksCount['alltasks']+=1;
					   
					   
						
						if($this->aCalendar[$calId]['userid']!=\OCP\USER::getUser()){
							  $accessclass = $vtodo -> getAsString('CLASS');
							 if($accessclass!='' && $accessclass!='PUBLIC'){
						    	if($aCountCalEvents[$calId]>0) $aCountCalEvents[$calId]-=1;
						     }
						}
						
						
						if($completed){
							$tasksCount['alltasksdone']+=1;
						}
						
					   if ($dstart) {
							
							$dstartTmp = $dstart->getDateTime()->format('d.m.Y');
							$dstart = strtotime($dstartTmp); 
							$bToday=false;	
							if($dstart==$today && !$completed){
								$tasksCount['today']+=1;
								 $bToday=true;	
							}
							$bTommorow=false;	
							if($dstart==$tomorrow && !$completed){
								$tasksCount['tomorrow']+=1;
								$bTommorow=true;	
							}
							$bActWeek=false;	
							if($dstart>=$beginnWeek && $dstart<=$endWeek && !$completed){
								$tasksCount['actweek']+=1;
								$bActWeek=true;	
							}
							$bCommingSoon=false;	
							if($dstart>=$endWeek  && !$completed){
								$tasksCount['comingsoon']+=1;
								$bCommingSoon=true;	
							}

							
							
							
						}
					   
						if ($due) {
							
							$dueTmp = $due->getDateTime()->format('d.m.Y');
							$due = strtotime($dueTmp); 
								
							if($due==$today && !$completed && !$bToday){
								$tasksCount['today']+=1;
								
							}
							
							if($due==$tomorrow && !$completed && !$bTommorow){
								$tasksCount['tomorrow']+=1;
								
							}
							
							if($due>=$beginnWeek && $due<=$endWeek && !$completed && !$bActWeek){
								$tasksCount['actweek']+=1;
							}
							if($due>=$endWeek  && !$completed && !$bCommingSoon){
								$tasksCount['comingsoon']+=1;
							}

							if($due<$today && !$completed){
									
								$tasksCount['missedactweek']+=1;
								
							}
							
							
						}
						
						if(!$due && !$dstart){
							//OhneTermin
							if( !$completed) $tasksCount['withoutdate']+=1;
						}
				  }
			//}

	       $singletodos = \OCP\Share::getItemsSharedWith(CalendarApp::SHARETODO, Vtodo::FORMAT_TODO);

           $tasksCount['sharedtasks']=count($singletodos);
		   
		   if($tasksCount['sharedtasks'] > 0){
		    	$tasksCount['alltasks']+=(int) $tasksCount['sharedtasks'];
		   }
		  
		   
		   $aReturnArray=array('tasksCount'=>$tasksCount,'aCountCalEvents'=>$aCountCalEvents,'aTaskTime'=>$aTaskTime);
        
		return $aReturnArray;
	}
   
   public function getCalendarPermissions(){
   	
	   $this->iCalPermissions = Calendar::find($this->iCalId);
	
   }
   
   public function getCalendarAllTasksData(){
   
	   $this->aTasks = App::all($this->aCalendar);
	
   }
   
    public function getCalendarAllInPeriodTasksData(){
   
	   $this->aTasks = App::allInPeriodCalendar($this->aCalendar,$this->sMode,$this->sDaySelect);
	
   }
	
	public function getTaskData(){
		if($this->sMode !=='' && $this->sMode !== 'showall' && $this->sMode !== 'alltasksdone'){
			  $this->getCalendarAllInPeriodTasksData();
		}else{
			 $this->getCalendarAllTasksData();
		}
	}
   
   public function generateCalendarSingleOutput(){
    	     $this->getCalendarPermissions();
			  $this->aCalendar[$this->iCalId] = $this->iCalPermissions;
	          $this->getTaskData();
			  $this->generateTasksToCalendarOutput();
			  
			  if(is_array($this->aTasksOutput)){
				   return $this->aTasksOutput;
			  }else{
			  	return false;
			  } 
    }
   
   public function generateTasksAllOutput(){
   	   $aReturnTasks='';
	  // foreach($this->aCalendar as $calendar ) {
	   	//      $this->setCalendarId($calendar['id']);
	   	  //    $this->getCalendarPermissions();
	          $this->getTaskData();
			  $this->generateTasksToCalendarOutput();
	  // }
	   
	    if(is_array($this->aTasksOutput)) return $this->aTasksOutput;
	    else return false;
   }
   
   public function generateTasksToCalendarOutput(){
   	
	 
	$this->aTasksOutput = \OCP\Share::getItemsSharedWith(CalendarApp::SHARETODO, Vtodo::FORMAT_TODO);
	 foreach( $this->aTasks as $task ) {
	                if($task['objecttype']!='VTODO') {
	                        continue;
	                }
	                if(is_null($task['summary'])) {
	                        continue;
	                }
			$object = VObject::parse($task['calendardata']);
			$vtodo = $object->VTODO;
			$isCompleted=$vtodo->COMPLETED;
			
			try {
				if($this->sMode!='' && $this->sMode!='alltasksdone'){
					//if($isCompleted){	
				   		//$this->aTasksOutput['done'][] = App::arrayForJSON($task['id'], $vtodo, $this->dUserTimeZone,$this->aCalendar[$task['calendarid']],$task);
					//}else{
						$this->aTasksOutput['open'][] = App::arrayForJSON($task['id'], $vtodo, $this->dUserTimeZone,$this->aCalendar[$task['calendarid']],$task);
					//}
				}elseif($this->sMode!='' && $this->sMode=='alltasksdone'){
						if($isCompleted){
							//$dateCompleted=$isCompleted->getDateTime() -> format('d.m.Y');
							$this->aTasksOutput['done'][] = App::arrayForJSON($task['id'], $vtodo, $this->dUserTimeZone,$this->aCalendar[$task['calendarid']],$task);
						}	
				}
				else{
				    	//if($isCompleted){
				    		//$this->aTasksOutput['done'][] = App::arrayForJSON($task['id'], $vtodo, $this->dUserTimeZone,$this->aCalendar[$task['calendarid']],$task);
				    	//}else{
				    		$this->aTasksOutput['open'][] = App::arrayForJSON($task['id'], $vtodo, $this->dUserTimeZone,$this->aCalendar[$task['calendarid']],$task);
				    	//}	
				    	
				}
				
			} catch(\Exception $e) {
	                        \OCP\Util::writeLog(App::$appname, $e->getMessage(), \OCP\Util::ERROR);
	                }
	        }
	 		
	 
   }
   
   public function generateTasksTimeLineOutput(){
   	
	
   }
   
   
   public function getStartDayDB($iTime){
   	   
	   return date('Y-m-d 00:00:00',$iTime);
   }
   
   public function getEndDayDB($iTime){
   	   
	   return date('Y-m-d 23:59:59',$iTime);
   }
   
   public function getTimeLineDB(){
   	        
			
			 $whereSQL='';
			 $aExec=array();
			 	
   	         switch($this->sMode){
			 	case 'dayselect':
					  $start=$this->getStartDayDB($this->sDaySelect);
					 \OCP\Util::writeLog(App::$appname,'SDAY BEGINNTIME: '.$start, \OCP\Util::DEBUG);
		              $end=$this->getEndDayDB($this->sDaySelect);
					  
					  $this->setStartDate($start);
					  $this->setEndDate($end);
					  
					  $whereSQL='AND ((`startdate` >= ? AND `startdate` <= ? AND `repeating` = 0) OR (`enddate` >= ? AND `enddate` <= ? AND `repeating` = 0) OR (`startdate` <= ? AND `repeating` = 1)) ';
					  $aExec=array('VTODO',	$start, $end, $start, $end,	$end);
				break;	
				case 'today':
					  $start=$this->getStartDayDB($this->nowTime);
		              $end=$this->getEndDayDB($this->nowTime);
					  $this->setStartDate($start);
					  $this->setEndDate($end);
					  
					  $whereSQL='AND ((`startdate` >= ? AND `startdate` <= ? AND `repeating` = 0) OR (`enddate` >= ? AND `enddate` <= ? AND `repeating` = 0) OR (`startdate` <= ? AND `repeating` = 1)) ';
					  $aExec=array('VTODO',	$start, $end, $start, $end,	$end);
					break;
					
				case 'tomorrow':
					  $timeTomorrow=strtotime($this->getTommorow());
					  $start=$this->getStartDayDB($timeTomorrow);
		              $end=$this->getEndDayDB($timeTomorrow);
					  $this->setStartDate($start);
					  $this->setEndDate($end);
					  
					  $whereSQL='AND ((`startdate` >= ? AND `startdate` <= ? AND `repeating` = 0) OR (`enddate` >= ? AND `enddate` <= ? AND `repeating` = 0) OR (`startdate` <= ? AND `repeating` = 1)) ';
					  $aExec=array('VTODO',	$start, $end, $start, $end, $end);
					break;
					
				case 'actweek':
					  
					  $getStartdate=strtotime($this->getStartofTheWeek());
					  $getEnddate=strtotime($this->getEndofTheWeek());
					  $start=$this->getStartDayDB($getStartdate);
		              $end=$this->getEndDayDB($getEnddate);
					  
					  $this->setStartDate($start);
					  $this->setEndDate($end);
					   $whereSQL='AND ((`startdate` >= ? AND `startdate` <= ? AND `repeating` = 0) OR (`enddate` >= ? AND `enddate` <= ? AND `repeating` = 0) OR (`startdate` <= ? AND `repeating` = 1)) ';
					   $aExec=array('VTODO',$start, $end, $start, $end,	$end);
					break;
				 
				 case 'withoutdate':
					  $whereSQL='AND ( `startdate` IS NULL AND `enddate` IS NULL AND `repeating` = 0)';
					  $aExec=array('VTODO');
					break;
					
				case 'missedactweek':
					   
					   $start=$this->getStartDayDB($this->nowTime);
						$this->setStartDate($start);
					
					   $whereSQL='AND ( `enddate` < ? AND `repeating` = 0)';
					   $aExec=array('VTODO',$start);
					break;
				case 'comingsoon':
					  
					 // $getStartdate=strtotime($this->getStartofTheWeek());
					  $getEnddate=strtotime($this->getEndofTheWeek());
					  //$start=$this->getStartDayDB($getStartdate);
		              $end=$this->getEndDayDB($getEnddate);
					  $this->setEndDate($end);
					   
					   $whereSQL='AND ((`startdate` >= ?  AND `repeating` = 0) OR (`enddate` >= ?  AND `repeating` = 0)) ';
					   $aExec=array('VTODO', $end, $end);
					break;			
			}

           $addWhereSql='';
		    foreach($this->aCalendar as $calInfo){
				if($addWhereSql=='') {
					$addWhereSql="`calendarid` = ? ";
					array_push($aExec,$calInfo['id']);
				}else{
					$addWhereSql.="OR `calendarid` = ? ";
					array_push($aExec,$calInfo['id']);
				}
				//\OCP\Util::writeLog('calendar','AlarmDB ID :'.$calInfo['id'] ,\OCP\Util::DEBUG);
			}
            
			$whereSQL.=' AND ( '.$addWhereSql.' ) ';
		   
            $aReturnArray=array('wheresql'=>$whereSQL,'execsql'=>$aExec);
             
			 return $aReturnArray;
   }
	
}

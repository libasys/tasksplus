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
 

namespace OCA\TasksPlus\Share\Backend;
use OCA\CalendarPlus\App as CalendarApp;
use \OCA\CalendarPlus\Object;
use \OCA\CalendarPlus\VObject;
use \OCA\TasksPlus\App as TasksApp;

class Vtodo implements \OCP\Share_Backend {

	const FORMAT_TODO = 0;
	
	private static $vtodo;
	
	public function isValidSource($itemSource, $uidOwner) {
	     $itemSource = CalendarApp::validateItemSource($itemSource, CalendarApp::SHARETODOPREFIX);	
	     self::$vtodo = Object::find($itemSource);
		
		if (self::$vtodo) {
			
			return true;
		}
		return false;
		
		return true;
	}
	
	public function isShareTypeAllowed($shareType) {
		 \OCP\Util::writeLog(TasksApp::$appname ,'VALID PASSED', \OCP\Util::DEBUG);		
		return true;
	}

	public function generateTarget($itemSource, $shareWith, $exclude = null) {
		if(!self::$vtodo) {
			$itemSource = CalendarApp::validateItemSource($itemSource,CalendarApp::SHARETODOPREFIX);		
			self::$vtodo = Object::find($itemSource);
		}
	
		return self::$vtodo['summary'];
	}

	public function formatItems($items, $format, $parameters = null) {
		$vtodos = array();
		if ($format === self::FORMAT_TODO) {
			$user_timezone = CalendarApp::getTimezone();
			foreach ($items as $item) {
				$item['item_source'] = CalendarApp::validateItemSource($item['item_source'],CalendarApp::SHARETODOPREFIX);		
				if(!TasksApp::checkSharedTodo($item['item_source'])){	
					$event = TasksApp::getEventObject( $item['item_source'] );
					$vcalendar = VObject::parse($event['calendardata']);
					$vtodo = $vcalendar->VTODO;
				    $accessclass = $vtodo -> getAsString('CLASS');
				    
					if($accessclass=='' || $accessclass=='PUBLIC'){
						$permissions['permissions'] =$item['permissions'];
						$permissions['calendarcolor'] ='#cccccc';
						$permissions['isOnlySharedTodo'] =true;
						$permissions['calendarowner'] = Object::getowner($item['item_source']);
						$permissions['displayname']=$item['uid_owner'];
						//\OCP\Util::writeLog('calendar','Cal Owner :'.$permissions['calendarowner'].$vtodo -> getAsString('SUMMARY') ,\OCP\Util::DEBUG);
						$permissions['iscompleted'] =false;
						if($vtodo->COMPLETED) {
							$permissions['iscompleted'] =true;
							 $vtodos['done'][] = TasksApp::arrayForJSON($item['item_source'], $vtodo, $user_timezone,$permissions,$event);
						}else{
							 $vtodos['open'][] = TasksApp::arrayForJSON($item['item_source'], $vtodo, $user_timezone,$permissions,$event);
						}
						
					    
					}
				}	
				//$vtodos[] = $vtodo;
			}
		}
		return $vtodos;
	}
	
}
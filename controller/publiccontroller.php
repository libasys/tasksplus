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

use \OCP\AppFramework\Controller;
use \OCP\AppFramework\Http\TemplateResponse;
use \OCP\IRequest;
use \OCP\IL10N;
use \OCP\Share;
use \OCP\IURLGenerator;
use \OCP\ISession;
use \OCP\Security\IHasher;
use \OCP\AppFramework\Http\RedirectResponse;
use \OCP\AppFramework\Utility\IControllerMethodReflector;

use \OCA\CalendarPlus\App as CalendarApp;
use \OCA\CalendarPlus\VObject;
use \OCA\CalendarPlus\Object;

use \OCA\TasksPlus\App as TasksApp;

/**
 * Controller class for main page.
 */
class PublicController extends Controller {
	
	
	private $l10n;
	/** @var \OC\URLGenerator */
	protected $urlGenerator;
	
	/**
	 * @type ISession
	 * */
	private $session;
	
	/**
	 * @type IControllerMethodReflector
	 */
	protected $reflector;

	private $token;
	

	public function __construct($appName, IRequest $request,  IL10N $l10n, ISession $session, IControllerMethodReflector $reflector, IURLGenerator $urlGenerator) {
		parent::__construct($appName, $request);
		$this->l10n = $l10n;
		$this->urlGenerator = $urlGenerator;
		$this->session = $session;
		$this->reflector=$reflector;
	}
	
	public function getLanguageCode() {
        return $this->l10n->getLanguageCode();
    }


    public function beforeController($controller, $methodName) {
		if ($this->reflector->hasAnnotation('Guest')) {
			return;
		}
		$isPublicPage = $this->reflector->hasAnnotation('PublicPage');
		if ($isPublicPage) {
			$this->validateAndSetTokenBasedEnv();
		} else {
			//$this->environment->setStandardEnv();
		}
	}
	
	
	private function validateAndSetTokenBasedEnv() {
			$this->token = $this->request->getParam('t');
	}
	
	/**
	*@PublicPage
	 * @NoCSRFRequired
	 * @UseSession
	 */
	 
	public function index($token) {
		
		if ($token) {
			$linkItem = Share::getShareByToken($token, false);
			if (is_array($linkItem) && isset($linkItem['uid_owner'])) {
				$type = $linkItem['item_type'];
				$itemSource = CalendarApp::validateItemSource($linkItem['item_source'],CalendarApp::SHARETODOPREFIX);
				
				$shareOwner = $linkItem['uid_owner'];
				$calendarName= $linkItem['item_target'];
				$rootLinkItem = \OCP\Share::resolveReShare($linkItem);
				
				// stupid copy and paste job
					if (isset($linkItem['share_with'])) {
						// Authenticate share_with
						
						$password=$this->params('password');
						
						if (isset($password)) {
							
							if ($linkItem['share_type'] === \OCP\Share::SHARE_TYPE_LINK) {
								// Check Password
								$newHash = '';
								if(\OC::$server->getHasher()->verify($password, $linkItem['share_with'], $newHash)) {
									$this->session->set('public_link_authenticated', $linkItem['id']);
									if(!empty($newHash)) {

									}
								} else {
									\OCP\Util::addStyle('files_sharing', 'authenticate');
									$params=array(
									'wrongpw'=>true
									);
									return new TemplateResponse('files_sharing', 'authenticate', $params, 'guest');
									
								}
							} else {
								\OCP\Util::writeLog('share', 'Unknown share type '.$linkItem['share_type'].' for share id '.$linkItem['id'], \OCP\Util::ERROR);
									return false;
							}
			
						} else {
							// Check if item id is set in session
							if ( ! $this->session->exists('public_link_authenticated') || $this->session->get('public_link_authenticated') !== $linkItem['id']) {
								// Prompt for password
								\OCP\Util::addStyle('files_sharing', 'authenticate');
								
									$params=array();
									return new TemplateResponse('files_sharing', 'authenticate', $params, 'guest');
								
							}
						}
					}
				\OCP\Util::addStyle(CalendarApp::$appname, '3rdparty/fontello/css/animation');
				\OCP\Util::addStyle(CalendarApp::$appname, '3rdparty/fontello/css/fontello');
				\OCP\Util::addStyle($this->appName, 'style');
				\OCP\Util::addStyle($this->appName, 'share');
				\OCP\Util::addScript($this->appName, 'share');
				
				$data = TasksApp::getEventObject($itemSource, false, false);
				$l = \OC::$server->getL10N($this->appName);
				$object = VObject::parse($data['calendardata']);
				$vTodo = $object -> VTODO;
				$id=$data['id'];
				
				$object = Object::cleanByAccessClass($id, $object);
		
				$accessclass = $vTodo->getAsString('CLASS');
		        $permissions = TasksApp::getPermissions($id, TasksApp::TODO, $accessclass);
				if($accessclass === 'PRIVATE'){
					header('HTTP/1.0 404 Not Found');
					$response = new TemplateResponse('core', '404','','guest');
					return $response;
				}
				
				$categories = $vTodo -> getAsArray('CATEGORIES');
				$summary = strtr($vTodo -> getAsString('SUMMARY'), array('\,' => ',', '\;' => ';'));
				$location = strtr($vTodo -> getAsString('LOCATION'), array('\,' => ',', '\;' => ';'));
				
				$description = strtr($vTodo -> getAsString('DESCRIPTION'), array('\,' => ',', '\;' => ';'));
				$priorityOptionsArray = TasksApp::getPriorityOptionsFilterd();
				//$priorityOptions=$priorityOptionsArray[(string)$vTodo->priority];
				$priorityOptions=0;
				
				$link = strtr($vTodo -> getAsString('URL'), array('\,' => ',', '\;' => ';'));
				$TaskDate=''; 
				$TaskTime='';
				if($vTodo->DUE){
					 	$dateDueType=$vTodo->DUE->getValueType();
							    
						 if($dateDueType=='DATE'){
						 	$TaskDate = $vTodo->DUE -> getDateTime() -> format('d.m.Y');
							$TaskTime ='';
						 }
						 if($dateDueType=='DATE-TIME'){
						 	$TaskDate = $vTodo->DUE -> getDateTime() -> format('d.m.Y');
							$TaskTime = $vTodo->DUE -> getDateTime() -> format('H:i');
						 }
					
				}
				$TaskStartTime='';
				$TaskStartDate='';
				if($vTodo->DTSTART){
					$dateStartType=$vTodo->DTSTART->getValueType();
							    
						 if($dateStartType === 'DATE'){
						 	$TaskStartDate = $vTodo->DTSTART -> getDateTime() -> format('d.m.Y');
							$TaskStartTime ='';
						 }
						 if($dateStartType === 'DATE-TIME'){
						 	$TaskStartDate = $vTodo->DTSTART -> getDateTime() -> format('d.m.Y');
							$TaskStartTime = $vTodo->DTSTART -> getDateTime() -> format('H:i');
						 }
				}
				
				//PERCENT-COMPLETE
			
			$cptlStatus = (string)$this->l10n->t('needs action');	;	
			$percentComplete = 0;
			
			if($vTodo->{'PERCENT-COMPLETE'}){
				$percentComplete =  $vTodo->{'PERCENT-COMPLETE'};
				
				//$cptlStatus = (string)$this->l10n->t('in procress');	
				if($percentComplete === '0'){
					$cptlStatus = (string)$this->l10n->t('needs action');	
				}
				if($percentComplete > '0' && $percentComplete < '100'){
					$cptlStatus= (string)$this->l10n->t('in procress');
				}
			}
			
			if($vTodo->{'COMPLETED'}){
				$cptlStatus= (string)$this->l10n->t('completed');
			}
			
			$timezone=\OC::$server->getSession()->get('public_link_timezone');	
			
			$sCat = '';
			if(is_array($categories) && count($categories) > 0){
				$sCat=$categories;
			}
			
			$params = [
			'eventid' => $itemSource,
			'permissions' => $permissions,
			'priorityOptions' => $priorityOptions,
			'percentComplete' => $percentComplete,
			'cptlStatus' => $cptlStatus,
			'TaskDate' => (isset($TaskDate)) ? $TaskDate:'',
			'TaskTime' => (isset($TaskTime)) ? $TaskTime:'',
			'TaskStartDate' => (isset($TaskStartDate)) ? $TaskStartDate:'',
			'TaskStartTime' => (isset($TaskStartTime)) ? $TaskStartTime:'',
			'title' => $summary,
			'accessclass' => $accessclass,
			'location' => $location,
			'categories' => $sCat,
			'calendar' => $data['calendarid'],
			'aCalendar' => CalendarApp::getCalendar($data['calendarid'], false, false),
			'calAppName' =>CalendarApp::$appname,
			'description' => $description,
			'repeat_rules' => '',
			'link' => $link,
			'timezone' => $timezone,
			'uidOwner' => $shareOwner,
			'displayName' => \OCP\User::getDisplayName($shareOwner),
			'sharingToken' => $token,
			'token' => $token,
			];	
		
		$response = new TemplateResponse($this->appName, 'publicevent',$params,'base');

		return $response;
		
			}//end isset
			
		}//end token
		
		
		
		$tmpl = new \OCP\Template('', '404', 'guest');
		$tmpl->printPage();
		
	}
}
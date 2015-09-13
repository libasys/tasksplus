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

use \OCA\CalendarPlus\App as CalendarApp;
use \OCA\TasksPlus\App as TasksApp;

/**
 * Controller class for main page.
 */
class PageController extends Controller {
	
	private $userId;
	private $l10n;
	
	

	public function __construct($appName, IRequest $request,  $userId, IL10N $l10n) {
		parent::__construct($appName, $request);
		$this -> userId = $userId;
		$this->l10n = $l10n;
		
	}
	
	public function getLanguageCode() {
        return $this->l10n->getLanguageCode();
    }

	/**
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 */
	public function index() {
			
		if(\OC::$server->getAppManager()->isEnabledForUser('calendarplus'))	{
			
			
			$csp = new \OCP\AppFramework\Http\ContentSecurityPolicy();
			$csp->addAllowedImageDomain(':data');
			
			$config = \OC::$server->getConfig();	
			
			$response = new TemplateResponse($this->appName, 'index');
			$response->setParams(array(
				'allowShareWithLink' => $config->getAppValue('core', 'shareapi_allow_links', 'yes'),
				'mailNotificationEnabled' => $config->getAppValue('core', 'shareapi_allow_mail_notification', 'no'),
				'mailPublicNotificationEnabled' => $config->getAppValue('core', 'shareapi_allow_public_notification', 'no'),
				'appname' => TasksApp::$appname,
				'calappname' => CalendarApp::$appname,
			));
			$response->setContentSecurityPolicy($csp);
		}else{
			\OCP\Util::addStyle($this->appName, 'style');	
			$response = new TemplateResponse($this->appName, 'no-calendar-app');
		}

		return $response;
	}
}
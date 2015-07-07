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
 
namespace OCA\TasksPlus\AppInfo;

use \OCA\CalendarPlus\App as CalendarApp;

$app = new Application();
$c = $app->getContainer();

$taskAppName = $c->getAppName();
// add an navigation entry
$navigationEntry = function () use ($c) {
	return [
		'id' => $c->getAppName(),
		'order' => 1,
		'name' => $c->query('L10N')->t('Tasks+'),
		'href' => $c->query('URLGenerator')->linkToRoute($c->getAppName().'.page.index'),
		'icon' => $c->query('URLGenerator')->imagePath($c->getAppName(), 'tasks.svg'),
	];
};
$c->getServer()->getNavigationManager()->add($navigationEntry);

  
//upcoming version search for 8.2 perhaps patch https://github.com/owncloud/core/pull/17339/files
\OC::$server->getSearch()->registerProvider('\OCA\TasksPlus\Search\Provider', array('app' => $taskAppName));


\OCP\Share::registerBackend(CalendarApp::SHARETODO, '\OCA\TasksPlus\Share\Backend\Vtodo');


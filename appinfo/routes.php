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


use \OCA\TasksPlus\AppInfo\Application;

$application = new Application();
$application->registerRoutes($this, ['routes' => [
		['name' => 'page#index', 'url' => '/', 'verb' => 'GET'],
		['name' => 'public#index', 'url' => '/s/{token}', 'verb' => 'GET'],
		['name' => 'public#index','url'  => '/s/{token}', 'verb' => 'POST', 'postfix' => 'auth'],
		['name' => 'task#newTask',	'url' => '/newtask',	'verb' => 'POST'],
		['name' => 'task#editTask',	'url' => '/edittask',	'verb' => 'POST'],
		['name' => 'task#deleteTask',	'url' => '/deletetask',	'verb' => 'POST'],
		['name' => 'task#getTasks',	'url' => '/gettasks',	'verb' => 'POST'],
		['name' => 'task#addSharedTask',	'url' => '/addsharedtask',	'verb' => 'POST'],
		['name' => 'task#addCategoryTask',	'url' => '/addcategorytask',	'verb' => 'POST'],
		['name' => 'task#buildLeftNavigation',	'url' => '/buildleftnavigation',	'verb' => 'POST'],
		['name' => 'task#setCompleted',	'url' => '/setcompleted',	'verb' => 'POST'],
		['name' => 'task#setCompletedPercentMainTask',	'url' => '/setcompletedpercentmaintask',	'verb' => 'POST'],
		['name' => 'task#getDefaultValuesTasks',	'url' => '/getdefaultvaluestasks',	'verb' => 'GET'],
		['name' => 'task#autoComplete', 'url' => '/taskautocompletelocation', 'verb' => 'GET'],
		]
	]);
	
	

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
 

OC.TasksPlus = {
	calendarAppName:'calendarplus',
	appName:'tasksplus',
	appShareService:'calpltodo',
	firstLoading : true,
	startMode : 'showall',
	categories:null,
	tags:null,
	mycalendars:null,
	popOverElem:null,
	searchTodoId:null,
	aTodo:{},
	currentMode:'showall',
	currentTasklistDiv: '#tasks_list',
	currentCalendar:0,
	
	getReminderonSubmit : function() {
		var sAdvMode = $('#reminderAdvanced option:selected').val();
		var sResult = '';
		if (sAdvMode == 'DISPLAY') {
			var sTimeMode = $('#remindertimeselect option:selected').val();
			//-PT5M
			var rTimeSelect = $('#remindertimeinput').val();

			if (sTimeMode != 'ondate' && (Math.floor(rTimeSelect) == rTimeSelect && $.isNumeric(rTimeSelect))) {
				var sTimeInput = $('#remindertimeinput').val();
				if (sTimeMode == 'minutesbefore') {
					sResult = '-PT' + sTimeInput + 'M';
				}
				if (sTimeMode == 'hoursbefore') {
					sResult = '-PT' + sTimeInput + 'H';
				}
				if (sTimeMode == 'daysbefore') {
					sResult = '-PT' + sTimeInput + 'D';
				}
				if (sTimeMode == 'weeksbefore') {
					sResult = '-PT' + sTimeInput + 'W';
				}
				if (sTimeMode == 'minutesafter') {
					sResult = '+PT' + sTimeInput + 'M';
				}
				if (sTimeMode == 'hoursafter') {
					sResult = '+PT' + sTimeInput + 'H';
				}
				if (sTimeMode == 'daysafter') {
					sResult = '+PT' + sTimeInput + 'D';
				}
				if (sTimeMode == 'weeksafter') {
					sResult = '+PT' + sTimeInput + 'W';
				}
				sResult = 'TRIGGER:' + sResult;
			}
			if (sTimeMode == 'ondate' && $('#reminderdate').val() != '') {
				//20140416T065000Z
				dateTuple = $('#reminderdate').val().split('-');
				timeTuple = $('#remindertime').val().split(':');

				var day, month, year, minute, hour;
				day = dateTuple[0];
				month = dateTuple[1];
				year = dateTuple[2];
				hour = timeTuple[0];
				minute = timeTuple[1];

				var sDate = year + '' + month + '' + day + 'T' + hour + '' + minute + '00Z';

				sResult = 'TRIGGER;VALUE=DATE-TIME:' + sDate;
			}
			if (sResult != '') {
				$("#sReminderRequest").val(sResult);
				var sReader = OC.TasksPlus.reminderToText(sResult);
				$('#reminderoutput').text(sReader);

			} else {
				OC.TasksPlus.reminder('reminderreset');
				alert('Wrong Input!');
			}
		}
		//alert(sResult);

	},
	reminderToText : function(sReminder) {
		if (sReminder !== '') {
			var sReminderTxt = '';
			if (sReminder.indexOf('-PT') !== -1) {
				//before
				var sTemp = sReminder.split('-PT');
				var sTempTF = sTemp[1].substring((sTemp[1].length - 1));
				if (sTempTF === 'S') {
					sReminderTxt = t(OC.TasksPlus.calendarAppName, 'Seconds before');
				}
				if (sTempTF === 'M') {
					sReminderTxt = t(OC.TasksPlus.calendarAppName, 'Minutes before');
				}
				if (sTempTF === 'H') {
					sReminderTxt = t(OC.TasksPlus.calendarAppName, 'Hours before');
				}
				if (sTempTF === 'D') {
					sReminderTxt = t(OC.TasksPlus.calendarAppName, 'Days before');
				}
				if (sTempTF === 'W') {
					sReminderTxt = t(OC.TasksPlus.calendarAppName, 'Weeks before');
				}
				var sTime = sTemp[1].substring(0, (sTemp[1].length - 1));
				sReminderTxt = sTime + ' ' + sReminderTxt;
			} else if (sReminder.indexOf('+PT') !== -1) {
				var sTemp = sReminder.split('+PT');
				var sTempTF = sTemp[1].substring((sTemp[1].length - 1));
				if (sTempTF === 'S') {
					sReminderTxt = t(OC.TasksPlus.calendarAppName, 'Seconds after');
				}
				if (sTempTF === 'M') {
					sReminderTxt = t(OC.TasksPlus.calendarAppName, 'Minutes after');
				}
				if (sTempTF === 'H') {
					sReminderTxt = t(OC.TasksPlus.calendarAppName, 'Hours after');
				}
				if (sTempTF === 'D') {
					sReminderTxt = t(OC.TasksPlus.calendarAppName, 'Days after');
				}
				if (sTempTF === 'W') {
					sReminderTxt = t(OC.TasksPlus.calendarAppName, 'Weeks after');
				}
				var sTime = sTemp[1].substring(0, (sTemp[1].length - 1));
				sReminderTxt = sTime + ' ' + sReminderTxt;
			} else {
				//onDate
				sReminderTxt = t(OC.TasksPlus.calendarAppName, 'on');
				//alert(sReminder);
				var sTemp = sReminder.split('DATE-TIME:');
				sDateTime = sTemp[1].split('T');
				sYear = sDateTime[0].substring(0, 4);
				sMonth = sDateTime[0].substring(4, 6);
				sDay = sDateTime[0].substring(6, 8);
				sHour = sDateTime[1].substring(0, 2);
				sMinute = sDateTime[1].substring(2, 4);
				sTempDate = new Date();
				//today=sTempDate.toDateString();
				today = $.datepicker.formatDate('@', new Date(sTempDate.getFullYear() + ',' + sTempDate.getDate() + ',' + (sTempDate.getMonth() + 1)));
				tomorrow = $.datepicker.formatDate('@', new Date(sTempDate.getFullYear() + ',' + (sTempDate.getDate() + 1) + ',' + (sTempDate.getMonth() + 1)));

				aktDate = $.datepicker.formatDate('@', new Date(sYear + ',' + sDay + ',' + sMonth));
				sReminderTxt = sReminderTxt + ' ' + sDay + '.' + sMonth + '.' + sYear + ' ' + sHour + ':' + sMinute;
				if (aktDate == today) {
					sReminderTxt = t(OC.TasksPlus.appName, 'today') + ' ' + sHour + ':' + sMinute;
				}

				if (aktDate == tomorrow) {
					sReminderTxt = t(OC.TasksPlus.appName, 'tomorrow') + ' ' + sHour + ':' + sMinute;
				}

			}

			return sReminderTxt;
		} else
			return false;
	},

	getReminderSelectLists : function() {
		//INIT
		var sCalendarSel = '#sCalSelect.combobox';
		$(sCalendarSel + ' ul').hide();
		if ($(sCalendarSel + ' li').hasClass('isSelected')) {
			$(sCalendarSel + ' .selector').html('<span class="colCal" style="cursor:pointer;margin-top:5px;background-color:' + $(sCalendarSel + ' li.isSelected').data('color') + '">&nbsp;</span>'+ $(sCalendarSel + ' li.isSelected').text());
		}
		$(sCalendarSel + ' .selector').on('click', function() {
			if ($(sCalendarSel + ' ul').is(':visible')) {
				$(sCalendarSel + ' ul').hide('fast');
			} else {
				$(sCalendarSel + ' ul').show('fast');
			}

		});
		$(sCalendarSel + ' li').click(function() {
			$(this).parents(sCalendarSel).find('.selector').html('<span class="colCal" style="margin-top:5px;background-color:' + $(this).data('color') + '">&nbsp;</span>'+ $(this).text());
			$(sCalendarSel + ' li .colCal').removeClass('isSelectedCheckbox');
			$(sCalendarSel + ' li').removeClass('isSelected');
			$('#hiddenCalSelection').val($(this).data('id'));
			$(this).addClass('isSelected');
			$(this).find('.colCal').addClass('isSelectedCheckbox');
			$(sCalendarSel + ' ul').hide();
		});
		//ENDE

		//sRepeatSelect
		var sReminderSel = '#sReminderSelect.combobox';
		$(sReminderSel + ' ul').hide();
		$('#showOwnReminderDev').hide();

		if ($(sReminderSel + ' li').hasClass('isSelected')) {
			$(sReminderSel + ' .selector').html($(sReminderSel + ' li.isSelected').text());
			if ($(sReminderSel + ' li.isSelected').data('id') != 'OWNDEF') {
				$('#reminderoutput').hide();
			}
		}
		$(sReminderSel + ' .comboSelHolder').on('click', function() {
			$(sReminderSel + ' ul').toggle();
		});
		$(sReminderSel + ' li').click(function() {
			$(sReminderSel + ' li .colCal').removeClass('isSelectedCheckbox');
			$(sReminderSel + ' li').removeClass('isSelected');
			$('#reminder').val($(this).data('id'));
			if ($(this).data('id') == 'OWNDEF') {
				$('#showOwnReminderDev').show();
				$('#reminderoutput').show();
			} else {
				$('#sReminderRequest').val('TRIGGER:' + $(this).data('id'));
				$('#reminderoutput').hide();
			}
			if ($(this).data('id') == 'none') {
				$('#reminderoutput').hide();
			}
			$(this).addClass('isSelected');
			$(this).parents(sReminderSel).find('.selector').html($(this).text());
			$(this).find('.colCal').addClass('isSelectedCheckbox');
			$(sReminderSel + ' ul').hide();
		});


		$('#remindertime').timepicker({
	        'showDuration': false,
	        'timeFormat': 'H:i',
	        lang: {
				am: t(OC.TasksPlus.calendarAppName, 'am'),
				pm: t(OC.TasksPlus.calendarAppName, 'pm'),
				AM:t(OC.TasksPlus.calendarAppName, 'AM'),
				PM:t(OC.TasksPlus.calendarAppName, 'PM'),
				decimal: '.',
				mins:t(OC.TasksPlus.calendarAppName, 'mins'),
				hr:t(OC.TasksPlus.calendarAppName, 'hr'),
				hrs: t(OC.TasksPlus.calendarAppName, 'hrs')
			}
	    });
	    
	     $('#reminderdate').datepicker({
	        minDate : null,
	        dateFormat : 'dd-mm-yy',
	        'autoclose': true,
	     });
		

		OC.TasksPlus.reminder('init');
		$('#reminderAdvanced').change(function() {
			OC.TasksPlus.reminder('reminder');
		});
		$('#remindertimeselect').change(function() {
			OC.TasksPlus.reminder('remindertime');
		});

	},
	taskRendering : function(taskSingleArray) {
		if ( typeof taskSingleArray.id == 'undefined') {
			//alert('found');
		}
		if ( typeof taskSingleArray.id != 'undefined') {
			var SubClass = '';
			if (taskSingleArray.relatedto != '') {
				SubClass = ' subtask';
			}
			
			
			var isShared ='';
			if(taskSingleArray.isOnlySharedTodo){
				isShared = ' shared';
			}
			var bLock = false;
			if ($(OC.TasksPlus.currentTasklistDiv+' .task[data-id="'+taskSingleArray.id +'"]').length === 1) {
				var tmpTask = $(OC.TasksPlus.currentTasklistDiv+' .task[data-id="'+taskSingleArray.id +'"]');
				var uid = $(OC.TasksPlus.currentTasklistDiv+' .task[data-id="'+taskSingleArray.id +'"]').data('uid');
				
				if($(OC.TasksPlus.currentTasklistDiv+' .task[data-relatedto="'+uid +'"]').length > 0){
					taskSingleArray.subtask = true;
				}
				tmpTask.removeAttr('data-calid');
				tmpTask.attr('data-calid', taskSingleArray.calendarid);
				tmpTask.html('');
			
				bLock = true;
			}else{
				var tmpTask = $('<div class="task dropzone' + SubClass + isShared+'" data-startsearch="' + taskSingleArray.startsearch + '" data-duesearch="' + taskSingleArray.duesearch + '" data-duemode="' + taskSingleArray.perioddue + '" data-startmode="' + taskSingleArray.period + '" data-calid="' + taskSingleArray.calendarid + '" data-id="' + taskSingleArray.id + '" data-uid="' + taskSingleArray.eventuid + '" data-relatedto="' + taskSingleArray.relatedto + '">');
			}
			
			
			
			if (taskSingleArray.orgevent) {
				tmpTask = $('<div class="task dropzone" style="border:2px dotted #000;" data-id="' + taskSingleArray.id + '">');
			}
			
			//is subtask
			var uidname ='';	
			if (taskSingleArray.relatedto != '' && $('div[data-uid="' + taskSingleArray.relatedto + '"]').length > 0 && bLock === false) {
				var uidname = $('div[data-uid="' + taskSingleArray.relatedto + '"]').find('.summary').text();
				tmpTask.attr('data-uidname',uidname);
				//FIXME
				var mainTaskDiv = $(OC.TasksPlus.currentTasklistDiv+' div[data-uid="' + taskSingleArray.relatedto + '"]');
					mainTaskDiv.after(tmpTask);
					
				if(mainTaskDiv.find('.is-arrow').length === 0){
					var id = mainTaskDiv.data('id');
					var ArrowDiv =$('<div style="float:left;margin-top:0px;width:30px;text-align:center;">')
					.append($('<i class="is-arrow" id="arrow_' + id + '">')
					.addClass('ioc ioc-angle-down ioc-rotate-270'));
					
					mainTaskDiv.find('.colCal').after(ArrowDiv);
					$('#arrow_' + id).on('click', OC.TasksPlus.ToggleView);
				}
				
				
				
				
			} else {
				if($(OC.TasksPlus.currentTasklistDiv+' .task[data-calid="'+taskSingleArray.calendarid +'"]').length > 0 && bLock === false){
					count = $(OC.TasksPlus.currentTasklistDiv+' .task[data-calid="'+taskSingleArray.calendarid +'"]').length;
					$($(OC.TasksPlus.currentTasklistDiv+' .task[data-calid="'+taskSingleArray.calendarid +'"]')[(count-1)]).after(tmpTask);
					bLock = true;
				}
				
				if(bLock === false){
				
				
				$(OC.TasksPlus.currentTasklistDiv).append(tmpTask);
				
				 
					
				}
			}
			
			tmpTask.droppable({
				activeClass : "activeHover",
				hoverClass : "dropHover",
				accept : '#categoryTasksList .categorieslisting .groupname',
				over : function(event, ui) {
	
				},
				drop : function(event, ui) {
					if ($(this).data('id') != null)
						OC.TasksPlus.addCategory($(this).data('id'), ui.draggable.data('id'));
				}
			});
		
			var checkbox = $('<input type="checkbox" class="regular-checkbox" id="chk_' + taskSingleArray.id + '"><label for="chk_' + taskSingleArray.id + '"></label>');

			if (taskSingleArray.iscompleted) {
				checkbox.attr('checked', 'checked');
				tmpTask.addClass('done');
			} else {
				tmpTask.addClass('opentask');
			}

			var DivCompleted = $('<div>').addClass('completed');
			DivCompleted.append(checkbox);

			DivCompleted.prependTo(tmpTask);

			if (taskSingleArray.permissions & OC.PERMISSION_UPDATE) {
				$('#chk_' + taskSingleArray.id).on('click', OC.TasksPlus.completedHandler);
			} else {
				checkbox.attr('disabled', 'disabled');
			}
			$('<div>').addClass('colCal').css({
				'background-color' : taskSingleArray.bgcolor,
				'color' : taskSingleArray.color
			}).appendTo(tmpTask);
			
			if (taskSingleArray.subtask) {

				$('<div style="float:left;margin-top:0px;width:30px;text-align:center;">').append($('<i class="is-arrow" id="arrow_' + taskSingleArray.id + '">').addClass('ioc ioc-angle-down ioc-rotate-270')).appendTo(tmpTask);
				$('#arrow_' + taskSingleArray.id).on('click', OC.TasksPlus.ToggleView);
			}

			//Div for the add Icons

			var priority = taskSingleArray.priority;
			if (priority != '') {
				$('<div  title="'+taskSingleArray.priorityDescr+'">').addClass('ioc ioc-info-circled toolTip priority priority-' + ( priority ? priority : 'n')).appendTo(tmpTask);
			 	tmpTask.attr('data-prio',taskSingleArray.priorityLang);
			}

			var iconDiv = $('<div>').addClass('icons');
			iconDiv.appendTo(tmpTask);

			var imgShare = '';
			if (taskSingleArray.shared) {
				imgShare = ' <i class="ioc ioc-share" title="' + t('core', 'Shared') + '"></i>&nbsp; ';
				$(imgShare).appendTo(iconDiv);
			}

			var imgPrivate = '';

			if (taskSingleArray.privat == 'private') {
				imgPrivate = ' <i class="ioc ioc-lock" title="private"></i> ';
				$(imgPrivate).appendTo(iconDiv);
			}

			if (taskSingleArray.privat == 'confidential') {
				imgPrivate = ' <i class="ioc ioc-eye" title="confidential"></i> ';
				$(imgPrivate).appendTo(iconDiv);
			}
			
			var repeatDescr = '';
			if (taskSingleArray.repeating) {
				if (taskSingleArray.day != undefined) {
					repeatDescr = t(OC.TasksPlus.appName,'daily')+' ' + taskSingleArray.day;
				}
			}
			var mainTaskName ='';
			if(uidname !==''){
				mainTaskName ='<div class="uidname"><i class="ioc ioc-forward"></i> ('+uidname+')</div>';
			}
			//summary
			var summary = $('<div>').addClass('summary').attr('data-todoid',taskSingleArray.id).html(taskSingleArray.summary+ mainTaskName + repeatDescr);
			summary.appendTo(tmpTask);
			if(taskSingleArray.permissions & OC.PERMISSION_UPDATE){
				summary.on('click', OC.TasksPlus.showEditTask);
			}
			
			if(taskSingleArray.url){
				var urlIcon = $('<a class="ioc ioc-link-ext toolTip" />').attr({'href':taskSingleArray.url,'title':t(OC.TasksPlus.appName,'URL')+' '+taskSingleArray.url,'target':'_blank'});
				urlIcon.appendTo(tmpTask);
			}
			if(taskSingleArray.description){
				var descriptionIcon = $('<i class="ioc ioc-notice toolTip" />').attr({'title':taskSingleArray.description});
				descriptionIcon.appendTo(tmpTask);
			}
			if(taskSingleArray.location){
				var locationIcon = $('<a class="ioc ioc-location toolTip" />').attr({'href':'http://open.mapquest.com/?q='+taskSingleArray.location,'title':t(OC.TasksPlus.appName,'Location')+' '+taskSingleArray.location,'target':'_blank'});
				locationIcon.appendTo(tmpTask);
			}
		
			var cpDate = '';
			if (taskSingleArray.iscompleted) {
				cpDate = taskSingleArray.completed;
			}
			$('<div>').addClass('completeDate').text(cpDate).appendTo(tmpTask);
			//Categoriesif (taskSingleArray.permissions & OC.PERMISSION_CREATE) {
			if (taskSingleArray.relatedto == '') {
				var bCreate = false;
				if(taskSingleArray.permissions & OC.PERMISSION_CREATE){
					var SubTaskHandler = $('<i id="newsubtask_' + taskSingleArray.id + '" data-calid="'+taskSingleArray.calendarid+'"/>').attr('title',t(OC.TasksPlus.appName,'Add Subtask')).addClass('ioc ioc-add toolTip').css({
						'cursor' : 'pointer',
						'font-size' : '20px',
						'float' : 'right',
						'margin-right' : '50px',
						'margin-top' : '15px'
					});
					SubTaskHandler.appendTo(tmpTask);
					
					$('#newsubtask_' + taskSingleArray.id).on('click', OC.TasksPlus.newTask);
					bCreate = true;
				}
				if(taskSingleArray.permissions & OC.PERMISSION_UPDATE){
					var margRight = 10;
					if(bCreate === false){
						margRight = 50;
					}
					
					var TaskCompleteHandler = $('<i id="newcomplete_' + taskSingleArray.id + '"  />').attr('title',t(OC.TasksPlus.appName,'Calculate Complete Main Task')).addClass('ioc ioc-refresh').css({
						'cursor' : 'pointer',
						'font-size' : '20px',
						'float' : 'right',
						'margin-right' : margRight+'px',
						'margin-top' : '15px'
					});
					TaskCompleteHandler.appendTo(tmpTask);
					$('#newcomplete_' + taskSingleArray.id).on('click', OC.TasksPlus.newCompleteCalc);
				}
			}
			
			var $categories = $('<div>').addClass('categories').appendTo(tmpTask);

			$(taskSingleArray.categories).each(function(i, category) {
				bgcolor = '#ccc';
				color = '#000';
				if (OC.TasksPlus.tags[category] != undefined) {
					bgcolor = OC.TasksPlus.tags[category]['bgcolor'];
					color = OC.TasksPlus.tags[category]['color'];
				}

				$categories.append($('<a>').addClass('tag').css({
					'background-color' : bgcolor,
					'color' : color
				}).attr('title', category).text(category.substring(0, 1)).on('click', OC.TasksPlus.filterCategoryHandler));
			});

			if (taskSingleArray.due || taskSingleArray.startdate) {
				$('<br style="clear:both;">').appendTo(tmpTask);
				sAlarm = '';
				if (taskSingleArray.sAlarm) {
					sAlarm = '(' + t(OC.TasksPlus.appName, 'Reminder') + ' ';
					$.each(taskSingleArray.sAlarm, function(i, el) {
						sAlarm += ' ' + OC.TasksPlus.reminderToText(el);
					});
					sAlarm += ')';
				}
				var sStart = '';
				if (taskSingleArray.startdate) {
					sStart = t(OC.TasksPlus.appName, 'Start') + ' ' + taskSingleArray.startdate + ' ';
				}
				var sDue = '';
				if (taskSingleArray.due) {
					sDue = t(OC.TasksPlus.appName, 'Due') + ' ' + taskSingleArray.due + ' ';
				}
				$('<div>').addClass('dueDate').text(sStart + sDue + ' ' + sAlarm).appendTo(tmpTask);
			}

			//  if (taskSingleArray.complete > 0) {
			if (!taskSingleArray.due && !taskSingleArray.startdate) {
				$('<br style="clear:both;">').appendTo(tmpTask);
			}
			var complPercent = taskSingleArray.complete;
			if (taskSingleArray.iscompleted) {
				complPercent = 100;
			}

			var MainTaskClass = '';
			if (taskSingleArray.relatedto == '') {
				MainTaskClass = 'maintask ';
			}
			//$('<br style="clear:both;">').appendTo(tmpTask);
			$('<div>').addClass('completeLine').html('<div data-width="' + complPercent + '" title="' + complPercent + '% Completed" class="' + MainTaskClass + 'completeActual bgcolor-' + complPercent + '" style="width:' + complPercent + '%"></div>').appendTo(tmpTask);
			//  }
		}
	},
	filterCategoryHandler : function(event) {
		$Task = $(this).closest('.task');
		if ($Task.hasClass('filterActive')) {
			$Task.removeClass('filterActive');
			$('.task').each(function(i, el) {
				$(el).show('fast');
				if($(el).find('.ioc-angle-down').hasClass('ioc-rotate-270')){
					$(el).find('.ioc-angle-down').removeClass('ioc-rotate-270');
				}
			});
		} else {
			$('.task [data-val="counterdone"]').addClass('arrowDown');
			OC.TasksPlus.filter($(this).attr('title'));
		}
	},
	addCategory : function(iId, category) {
		
		$.ajax({
			type : 'POST',
			url : OC.generateUrl('apps/'+OC.TasksPlus.appName+'/addcategorytask'),
			data :{
				id : iId,
				category : category
			},
			success : function(jsondata) {
				OC.TasksPlus.taskRendering(jsondata);
				OC.TasksPlus.updateCounterTasks();
			}
		});
		
	},
	
	initActionHandler : function() {

		$( "#accordion" ).accordion({
		      collapsible: true,
		      heightStyle: "content",
		      active: false,
		      animate:false
		    });
		    
		

		$('.toolTip').tipsy({
			html : true,
			gravity : $.fn.tipsy.autoNS
		});

		$('#sWV').datepicker({
			dateFormat : "dd.mm.yy",
			minDate : null
		});
		
		$('#sWV_time').timepicker({
	        'showDuration': false,
	        'timeFormat': 'H:i',
	        lang: {
				am: t(OC.TasksPlus.calendarAppName, 'am'),
				pm: t(OC.TasksPlus.calendarAppName, 'pm'),
				AM:t(OC.TasksPlus.calendarAppName, 'AM'),
				PM:t(OC.TasksPlus.calendarAppName, 'PM'),
				decimal: '.',
				mins:t(OC.TasksPlus.calendarAppName, 'mins'),
				hr:t(OC.TasksPlus.calendarAppName, 'hr'),
				hrs: t(OC.TasksPlus.calendarAppName, 'hrs')
			}
		    });
		
		

		$('#startdate').datepicker({
			dateFormat : "dd.mm.yy",
			minDate : null
		});
		
		$('#startdate_time').timepicker({
	        'showDuration': false,
	        'timeFormat': 'H:i',
	        lang: {
				am: t(OC.TasksPlus.calendarAppName, 'am'),
				pm: t(OC.TasksPlus.calendarAppName, 'pm'),
				AM:t(OC.TasksPlus.calendarAppName, 'AM'),
				PM:t(OC.TasksPlus.calendarAppName, 'PM'),
				decimal: '.',
				mins:t(OC.TasksPlus.calendarAppName, 'mins'),
				hr:t(OC.TasksPlus.calendarAppName, 'hr'),
				hrs: t(OC.TasksPlus.calendarAppName, 'hrs')
			}
	    });
		
		//$('#ldatetime')
		var sDateTimeText='';
		if($('#startdate').val()!=''){
			sDateTimeText+=t(OC.TasksPlus.appName,'Start')+' '+ $('#startdate').val();
		}
		if($('#startdate_time').val()!=''){
			sDateTimeText+= ' '+$('#startdate_time').val();
		}
		if($('#sWV').val()!=''){
			sDateTimeText+=' '+t(OC.TasksPlus.appName,'Due')+' '+ $('#sWV').val();
		}
		if($('#sWV_time').val()!=''){
			sDateTimeText+= ' '+$('#sWV_time').val();
		}
		if(sDateTimeText !=''){
			$('#ldatetime').text(sDateTimeText);
		}
		
		$('#accordion span.ioc-checkmark').hide();
		if($('#taskForm input[name="link"]').val() != ''){
			$('#accordion span.lurl').show();
		}
		if($('#taskForm textarea[name="noticetxt"]').val() != ''){
			$('#accordion span.lnotice').show();
		}
		if($('#taskForm input[name="taskcategories"]').val() != ''){
			$('#accordion span.ltag').show();
		}
				
		//Tagsmanager
		aExitsTags = false;
		if ($('#taskcategories').val() != '') {
			var sExistTags = $('#taskcategories').val();
			var aExitsTags = sExistTags.split(",");
		}

		$('#tagmanager').tagit({
			tagSource : OC.TasksPlus.categories,
			maxTags : 4,
			initialTags : aExitsTags,
			allowNewTags : false,
			placeholder : t(OC.TasksPlus.calendarAppName, 'Add Tags'),
		});

		//Init Slider Complete
		$('#percentVal').text($("#percCompl").val() + '%');
		$("#slider").slider({
			value : $("#percCompl").val(),
			range : "min",
			min : 0,
			max : 100,
			step : 1,
			slide : function(event, ui) {
				$("#percCompl").val(ui.value);
				$('#percentVal').text(ui.value + '%');
			}
		});

		//Init Slider Priority
		$('#prioVal').text($("#priority").val());
		$("#sliderPriority").slider({
			value : $("#priority").val(),
			range : "min",
			min : 0,
			max : 9,
			step : 1,
			slide : function(event, ui) {
				$("#priority").val(ui.value);
				$('#prioVal').text(ui.value);
			}
		});
		//Init

		var aAccess = {
			'PUBLIC' : {
				'val' : 1,
				'color' : '#8ae234',
				'txt' : t(OC.TasksPlus.calendarAppName, 'Show full event')
			},
			'CONFIDENTIAL' : {
				'val' : 2,
				'color' : '#FBDD52',
				'txt' : t(OC.TasksPlus.calendarAppName, 'Busy')
			},
			'PRIVATE' : {
				'val' : 3,
				'color' : '#D9534F',
				'txt' : t(OC.TasksPlus.calendarAppName, 'Hide event')
			}
		};

		var initVal = aAccess[$('#accessclass').val()]['val'];

		$('#showAsVal').text(aAccess[$('#accessclass').val()]['txt']);
		// Init Access Class
		$("#sliderShowAs").slider({
			range : "min",
			value : initVal,
			min : 0,
			max : 3,
			step : 1,
			change : function(event, ui) {
				var color = '#8ae234';
				var sText = 'frei';
				var sAccess = 'PUBLIC';
				if (ui.value == 0) {
					$("#sliderShowAs").slider('value', 1);
					color = aAccess['PUBLIC']['color'];
					sText = aAccess['PUBLIC']['txt'];
					sAccess = 'PUBLIC';
				}
				if (ui.value == 1) {
					color = aAccess['PUBLIC']['color'];
					sText = aAccess['PUBLIC']['txt'];
					sAccess = 'PUBLIC';
				}
				if (ui.value == 2) {
					color = aAccess['CONFIDENTIAL']['color'];
					sText = aAccess['CONFIDENTIAL']['txt'];
					sAccess = 'CONFIDENTIAL';
				}
				if (ui.value == 3) {
					color = aAccess['PRIVATE']['color'];
					sText = aAccess['PRIVATE']['txt'];
					sAccess = 'PRIVATE';
				}

				$("#sliderShowAs .ui-widget-header").css('background', color);
				$('#showAsVal').text(sText);
				$('#accessclass').val(sAccess);

				//$( "#percCompl" ).val(ui.value );
			}
		});
		$("#sliderShowAs .ui-widget-header").css('background', aAccess[$('#accessclass').val()]['color']);

	},
	showEditTask : function(event) {
		if (!event['id']) {
			$Task = $(this).closest('.task');
			TaskId = $Task.attr('data-id');
			myMode = $(OC.TasksPlus.currentTasklistDiv+' #donetodo').data('mode');
			myCal = $(OC.TasksPlus.currentTasklistDiv+' #donetodo').data('cal');
			//Find Main Id	
		}else{
			TaskId = event.id;
			myMode = $(OC.TasksPlus.currentTasklistDiv+' #donetodo').data('mode');
			myCal = $(OC.TasksPlus.currentTasklistDiv+' #donetodo').data('cal');
		}
		//$('<div>').addClass('summary').attr('data-todoid',taskSingleArray.id)
		OC.TasksPlus.destroyExisitingPopover();
		
		OC.TasksPlus.popOverElem = $('.summary[data-todoid="'+TaskId+'"]'); 	
			
		OC.TasksPlus.popOverElem.webuiPopover({
			url:OC.generateUrl('apps/'+OC.TasksPlus.appName+'/edittask'),
			async:{
				type:'POST',
				data : {
					tid : TaskId,
					mytaskmode : myMode,
					mytaskcal : myCal
				},
				success:function(that,data){
					that.displayContent();
					//that.getContentElement().css('height','auto');
					
					$('#showOnShare').hide();
	
					$('#editTodo-submit').on('click', function() {
						if(OC.Share.droppedDown){
							OC.Share.hideDropDown();
						}
						
						if ($('#tasksummary').val() != '') {
							OC.TasksPlus.SubmitForm('edititTask', '#taskForm', '#tasks_list_details');
							$('.task[data-id="' + TaskId + '"]').addClass('highlightTask');
						} else {
							OC.TasksPlus.showMeldung(t(OC.TasksPlus.appName, 'Title is missing'));
						}
					});
					$('#editTodo-cancel').on('click', function() {
						if(OC.Share.droppedDown){
							OC.Share.hideDropDown();
						}
						OC.TasksPlus.popOverElem.webuiPopover('destroy');
						OC.TasksPlus.popOverElem = null;
						$('#edit-event').remove();
						$('.task[data-id="' + TaskId + '"]').removeClass('highlightTask');
					});
					$('#deleteTodo-submit').on('click', function() {
						taskId = $('#taskid').val();
						OC.TasksPlus.deleteHandler(taskId);
						$('.task[data-id="' + TaskId + '"]').removeClass('highlightTask');
					});
	
					OC.TasksPlus.getReminderSelectLists();
					if ($('#sReminderRequest').val() != '') {
						$('#reminderoutput').text(OC.TasksPlus.reminderToText($('#sReminderRequest').val()));
						$('#lreminder').html('<i class="ioc ioc-clock" style="font-size:14px;"></i> '+OC.TasksPlus.reminderToText($('#sReminderRequest').val()));
					}
					
					OC.TasksPlus.initActionHandler();
	
					OC.Share.loadIcons(OC.TasksPlus.appShareService, '');

					that.reCalcPos();
				}
			},
			multi:false,
			closeable:false,
			cache:false,
			type:'async',
			width:400,
			
			trigger:'manual',
		}).webuiPopover('show');	

		return false;
	},

	editHandler : function(event) {
		$Task = $(this).closest('.task');
		TaskId = $Task.attr('data-id');

		OC.TasksPlus.showEditTask(TaskId);

	},
	addSharedHandler : function(event) {
		$Task = $(this).closest('.task');
		TaskId = $Task.attr('data-id');

		OC.TasksPlus.openShareDialog(TaskId);
	},
	ToggleView : function() {
		$Task = $(this).closest('.task');
		TaskId = $Task.attr('data-id');
		var uid = $Task.data('uid'); 
				
		if ($('div[data-id="' + TaskId + '"]').find('i.ioc-angle-down').hasClass('ioc-rotate-270')) {
			$('div[data-id="' + TaskId + '"]').find('i.ioc-angle-down').removeClass('ioc-rotate-270');
			$('.task[data-relatedto="'+uid +'"]').show();
		} else {
			$('div[data-id="' + TaskId + '"]').find('i.ioc-angle-down').addClass('ioc-rotate-270');
			$('.task[data-relatedto="'+uid +'"]').hide();
		}

	},
	renderComplete : function(taskdata) {
		$task = $('div[data-id="' + taskdata.id + '"]');
		myClone = $task.clone(true);
		if (taskdata.completed) {

			myClone.addClass('done').css('display', 'none');
			myClone.removeClass('opentask');
			myClone.find('#chk_' + taskdata.id).attr('checked', 'checked');
			myClone.find('.completeDate').text($.datepicker.formatDate('dd.mm.yy', new Date()));
			myClone.find('.completeActual').css('width','100%');

			if (myClone.attr('data-relatedto') != '' && $('div.done[data-uid="' + myClone.attr('data-relatedto') + '"]').length > 0) {
				$('div.done[data-uid="' + myClone.attr('data-relatedto') + '"]').append(myClone);

			} else {
				$('#donetodo').after(myClone);
			}

			// $('.task [data-val="counterdone"]').toggleClass('arrowDown');
			if ($('.task.done').is(':visible')) {
				//		$('span[data-val="counterdone"]:before').css('content','\25BC');

				myClone.show('fast');
			} else {
				myClone.hide('fast');
			}

			//myClone.find('input[type="checkbox"]').attr('checked','checked');
		} else {
			myClone.removeClass('done');
			myClone.addClass('opentask');
			myClone.find('#chk_' + taskdata.id).removeAttr('checked');
			myClone.find('.completeDate').text('');
			myClone.find('.completeActual').css('width',0);
			myClone.show('fast');

			if (myClone.attr('data-relatedto') != '' && $('div.opentask[data-uid="' + myClone.attr('data-relatedto') + '"]').length > 0) {
				$('div.opentask[data-uid="' + myClone.attr('data-relatedto') + '"]').after(myClone);

			} else {
				if($('.opentask[data-calid="'+myClone.attr('data-calid') +'"]').length > 0){
					count = $(' .opentask[data-calid="'+myClone.attr('data-calid') +'"]').length;
					$($(' .opentask[data-calid="'+myClone.attr('data-calid') +'"]')[(count-1)]).after(myClone);
					
				}else{
				$('#tasks_list').append(myClone);
				}
				
			}
			
		}
		$task.remove();
	},
	completedHandler : function(event) {
		$Task = $(this).closest('.task');
		TaskId = $Task.attr('data-id');
		checked = $(this).is(':checked');
		
		 $.ajax({
			type : 'POST',
			url : OC.generateUrl('apps/'+OC.TasksPlus.appName+'/setcompleted'),
			data :{
				id : TaskId,
				checked : checked ? 1 : 0
			},
			success : function(jsondata) {
				task = jsondata;
				OC.TasksPlus.rebuildLeftTaskView();
				//$Task.data('task', task)
				$(task).each(function(i, el) {
					OC.TasksPlus.renderComplete(el);
				});

				$('.task [data-val="counterdone"]').text($('.task.done').length);
			}
		});
		
		
		//return false;
	},
	deleteHandler : function(TASKID) {
		
		
		var handleDelete=function(YesNo){
			 
				 	if(YesNo){
					
							$.ajax({
								type : 'POST',
								url : OC.generateUrl('apps/'+OC.TasksPlus.appName+'/deletetask'),
								data :{
									'id' : TASKID
								},
								success : function(jsondata) {
									
									if ($('.task[data-id="' + TASKID + '"]').hasClass('done')) {
										var tempCount = parseInt($('.task [data-val="counterdone"]').text());
										$('.task [data-val="counterdone"]').text(tempCount - 1);
									}
									var uid = $('.task[data-id="' + TASKID + '"]').data('uid');
									
									if($('.task[data-relatedto="' + uid + '"]').length > 0){
										if ($('.task[data-relatedto="' + uid + '"]').hasClass('done')) {
											var tempCount = parseInt($('.task [data-val="counterdone"]').text());
											$('.task [data-val="counterdone"]').text(tempCount - parseInt($('.task[data-relatedto="' + uid + '"]').length));
										}
										$('.task[data-relatedto="' + uid + '"]').remove();
										
									}
									
									$('.task[data-id="' + TASKID + '"]').remove();
									
									OC.TasksPlus.destroyExisitingPopover();
									OC.TasksPlus.updateCounterTasks();
								}
							});
					}
				};
			 
			  OC.dialogs.confirm(t(OC.TasksPlus.appName, 'Are you sure') + '?',t(OC.TasksPlus.appName, 'Delete Task'),handleDelete);
		
	},
	openShareDialog : function(TaskId) {
		
		$('body').append('<div id="dialogSmall"></div>');
			
			var html = '<p>' + t(OC.TasksPlus.calendarAppName, 'Please choose a calendar') + '</p>';
			   	  html += '<select name="calendar" id="calendarAdd">';
				$.each(OC.TasksPlus.mycalendars, function(i, elem) {
					if(elem.issubscribe === 0){
						 html +='<option value="' + elem['id'] + '">' + elem['name'] + '</option>';
					}
				});
				html+='</select><br />';

		
				$('#dialogSmall').html(html).ocdialog({
					modal: true,
					closeOnEscape: true,
					title : t(OC.TasksPlus.appName, 'Add Task'),
					height: 'auto', width: 'auto',
					buttons : [{
						text : t('core', 'Add'),
						click : function() {
							var oDialog = $(this);
							var CalId = $('#calendarAdd option:selected').val();
	
							$.post(url, {
								'eventid' : EventId,
								'calid' : CalId
							}, function(jsondata) {
								if (jsondata.status == 'success') {
									
									oDialog.ocdialog('close');
									OC.TasksPlus.updateList(0);
									OC.TasksPlus.rebuildLeftTaskView();
									OC.TasksPlus.destroyExisitingPopover();
									
									
								} else {
									alert(jsondata.msg);
								}
							});
						},
						defaultButton: true
					}, {
						text : t(OC.TasksPlus.calendarAppName, 'Cancel'),
						click : function() {
							$(this).ocdialog('close');
						}
					}],
					close: function(/*event, ui*/) {
					$(this).ocdialog('destroy').remove();
					$('#dialogSmall').remove();
					
					},
				});
			return false;
			
	},
	newCompleteCalc : function() {
		$Task = $(this).closest('.task');
		TaskId = $Task.attr('data-id');
		$.ajax({
			type : 'POST',
			url : OC.generateUrl('apps/'+OC.TasksPlus.appName+'/setcompletedpercentmaintask'),
			data : {
				id : TaskId
			},
			success : function(jsondata) {
				var gesamtCptl = jsondata.percentCptl;

				$('div[data-id="' + jsondata.id + '"]  .completeActual.maintask').attr({
					'data-width' : gesamtCptl,
					'title' : gesamtCptl + '% Completed',
					'class' : 'maintask completeActual bgcolor-' + gesamtCptl,
				}).css('width', gesamtCptl + '%');
			}
		});

	},
	newTask : function(event) {

		var accessMode = $(OC.TasksPlus.currentTasklistDiv+' #donetodo').data('mode');
		
		if(accessMode === 'showall' || accessMode === 'calendar' || accessMode === 'dayselect'){
			
			$('#newTodoButton').removeAttr('disabled','disabled');
			
			$Task = $(this).closest('.task');
			TaskUid = $Task.attr('data-uid');
			calId = $(this).data('calid');
			if (TaskUid == undefined) {
				TaskUid = '';
				calId = '';
			}
			OC.TasksPlus.destroyExisitingPopover();
			
			OC.TasksPlus.popOverElem = $(event.target); 	
				
				OC.TasksPlus.popOverElem.webuiPopover({
					url:OC.generateUrl('apps/'+OC.TasksPlus.appName+'/newtask'),
					async:{
						type:'POST',
						data : {
							mytaskmode : $(OC.TasksPlus.currentTasklistDiv+' #donetodo').data('mode'),
							mytaskcal : $(OC.TasksPlus.currentTasklistDiv+' #donetodo').data('cal'),
							relatedto : TaskUid,
							calId : calId
						},
						success:function(that,data){
							that.displayContent();
							that.getContentElement().css('height','auto');
							
							if ($(OC.TasksPlus.currentTasklistDiv+' #donetodo').data('mode') == 'dayselect') {
								$('#startdate').val($('#taskmanagertitle').attr('data-date'));
							}
			
							$('#newTodo-submit').on('click', function() {
								if ($('#tasksummary').val() != '') {
									OC.TasksPlus.SubmitForm('newitTask', '#taskForm', '#tasks_list_details');
								} else {
									OC.TasksPlus.showMeldung(t(OC.TasksPlus.appName, 'Title is missing'));
								}
							});
			
							$('#tasksummary').bind('keydown', function(event) {
								if (event.which == 13) {
									if ($('#tasksummary').val() != '') {
										OC.TasksPlus.SubmitForm('newitTask', '#taskForm', '#tasks_list_details');
									} else {
										OC.TasksPlus.showMeldung(t(OC.TasksPlus.appName, 'Title is missing'));
									}
								}
							});
			
							$('#newTodo-cancel').on('click', function() {
								OC.TasksPlus.popOverElem.webuiPopover('destroy');
								OC.TasksPlus.popOverElem = null;
								$('#new-event').remove();
							});
			
							OC.TasksPlus.getReminderSelectLists();
			
							OC.TasksPlus.initActionHandler();
							that.reCalcPos();
						}
					},
					multi:false,
					closeable:false,
					cache:false,
					placement:'auto',
					type:'async',
					width:400,
					trigger:'manual',
				}).webuiPopover('show');	
	
			return false;
		}else{
			$('#newTodoButton').attr('disabled','disabled');
		}
	},
	SubmitForm : function(VALUE, FormId, UPDATEAREA) {

		var string = '';
		var objTags = $('#tagmanager').tagit('tags');
		$(objTags).each(function(i, el) {
			if (string == '') {
				string = el.value;
			} else {
				string += ',' + el.value;
			}
		});
		$('#taskcategories').val(string);

		actionFile = 'newtask';
		if (VALUE == 'newitTask') {
			actionFile = 'newtask';
		}
		if (VALUE == 'edititTask') {
			actionFile = 'edittask';
		}

		$(FormId + ' input[name=hiddenfield]').attr('value', VALUE);
        
        $url=OC.generateUrl('apps/'+OC.TasksPlus.appName+'/'+actionFile);
        $.ajax({
			type : 'POST',
			url : $url,
			data :$(FormId).serialize(),
			success : function(jsondata) {
				

				if (VALUE == 'newitTask') {
					OC.TasksPlus.showMeldung(t(OC.TasksPlus.appName, 'Task creating success!'));
					OC.TasksPlus.destroyExisitingPopover();
					OC.TasksPlus.taskRendering(jsondata);
					//OC.TasksPlus.rebuildLeftTaskView();
					OC.TasksPlus.updateCounterTasks();
				}
				if (VALUE == 'edititTask') {
					OC.TasksPlus.showMeldung(t(OC.TasksPlus.appName, 'Update success!'));
					OC.TasksPlus.destroyExisitingPopover();
					
					OC.TasksPlus.taskRendering(jsondata);
					
					var uid = jsondata.eventuid;
					if(jsondata.calendarid !== jsondata.oldcalendarid){
						 uid = jsondata.olduid;
						 if(OC.TasksPlus.currentMode === 'calendar'){
							$('.task.opentask[data-calid="'+jsondata.calendarid+'"]').hide();
						}
						if($('.task.opentask[data-relatedto="'+uid+'"]').length>0){
						
						$('.task.opentask[data-relatedto="'+uid+'"]').each(function(i,el){
							$(el).find('.colCal').css('background-color',jsondata.bgcolor);
							$(el).removeAttr('data-calid');
							$(el).attr('data-calid',jsondata.calendarid);
							$(el).removeAttr('data-relatedto');
							$(el).attr('data-relatedto',jsondata.eventuid);
							
							var myClone = $(el).clone();
							$('.task.opentask[data-uid="'+uid+'"]').after(myClone);
							if(OC.TasksPlus.currentMode === 'calendar'){
								myClone.hide();
							}
							$(el).remove();
							
						});
						
					}
					}
					
					
					
					
					OC.TasksPlus.updateCounterTasks();
				}
				
				//OC.TasksPlus.rebuildLeftTaskView();
			}
			
		});

	},
	showMeldung : function(TXT) {

		var leftMove = ($(window).width() / 2) - 150;
		var myMeldungDiv = $('<div id="iMeldung" style="z-index:3000;left:' + leftMove + 'px"></div>');
		$('#content').append(myMeldungDiv);
		$('#iMeldung').html(TXT);

		$('#iMeldung').animate({
			top : 10
		}).delay(3000).animate({
			top : '-300'
		}, function() {
			$('#iMeldung').remove();
		});

	},
	filter : function(tagText) {
		//$Task=$(this).closest('.task');
		//TaskId=$Task.attr('data-id');
		var saveArray = [];
		
		var taskListDiv = '#tasks_list';
		
		$(taskListDiv+' .categories').find('a').each(function(i, el) {

			if ($(el).attr('title') != '' && $(el).attr('title') == tagText) {
				$Task = $(this).closest('.task');
				TaskId = $Task.attr('data-id');

				saveArray[TaskId] = 1;
			}
		});
		if (saveArray.length > 0) {

			$(taskListDiv+' .task').each(function(i, el) {
				if (saveArray[$(el).attr('data-id')] != undefined && saveArray[$(el).attr('data-id')]) {
					$(el).addClass('filterActive').show('fast');
				} else {
					if ($(el).attr('id') != 'donetodo'){
						$(el).hide('fast');
					}
				}
			});
		}

	},
	generateTaskList : function(jsondata, tasklist) {
		
		
		$('#donetodo').on('click', function() {
			$('.task [data-val="counterdone"]').toggleClass('arrowDown');
			if(OC.TasksPlus.currentMode === 'calendar'){
				if (!$('.task.done.dropzone[data-calid="'+OC.TasksPlus.currentCalendar+'"]').is(':visible')) {
					$('.task.done.dropzone[data-calid="'+OC.TasksPlus.currentCalendar+'"]').show('fast');
				} else {
					$('.task.done.dropzone[data-calid="'+OC.TasksPlus.currentCalendar+'"]').hide('fast');
				}
			}else{
				if (!$('.task.done').is(':visible')) {
					$('.task.done').show('fast');
				} else {
					$('.task.done').hide('fast');
				}
			}
		});
			
		
		$(OC.TasksPlus.currentTasklistDiv+' .task [data-val="counterdone"]').text($(jsondata['done']).length);
		
		$(jsondata['open']).each(function(i, task) {
			
			OC.TasksPlus.taskRendering(task);
		});
		
		$('.task .subtask').toggle();

		if (OC.TasksPlus.firstLoading === true) {
			OC.TasksPlus.checkShowEventHash();
			OC.TasksPlus.firstLoading = false;
			OC.TasksPlus.calcDimension();
			OC.TasksPlus.rebuildLeftTaskView();
		}

	},
	updateList : function(CID) {
		
		$('#newTodoButton').removeAttr('disabled');

		OC.TasksPlus.currentCalendar = CID;
		OC.TasksPlus.currentMode = 'calendar';
		$('#totaskfound').hide();
		$('.task.dropzone').hide();
		$('.task .uidname').hide();
		$('.task.opentask[data-calid="'+OC.TasksPlus.currentCalendar+'"]').show();
		$('.task.opentask[data-calid="'+OC.TasksPlus.currentCalendar+'"]').find('.ioc-angle-down').removeClass('ioc-rotate-270');
		//ioc-angle-down ioc-rotate-270
		$('#donetodo').data('mode','calendar').data('cal',OC.TasksPlus.currentCalendar);
		$('#taskmanagertitle').text('Kalender '+$('.calListen[data-id="' + OC.TasksPlus.currentCalendar + '"]').find('.descr').text());
		
		$('.task [data-val="counterdone"]').text($('.task.done[data-calid="'+OC.TasksPlus.currentCalendar+'"]').length);
		$('#donetodo').show();
		$('.task [data-val="counterdone"]').removeClass('arrowDown');
		$('.task.done[data-calid="'+OC.TasksPlus.currentCalendar+'"]').hide();
		
		if($('.calListen[data-id="' + OC.TasksPlus.currentCalendar + '"]').find('.iCount').text() == 0){
			$('#totaskfound').show();
		}
		

	},
	updateListByPeriod : function(MODE) {
		var daySelect = '';
		OC.TasksPlus.currentMode = MODE;
		
		
			
		if(MODE === 'showall'){
			$('#loading').show();
			$('#donetodo').show();
			$('#totaskfound').hide();
			$('#newTodoButton').removeAttr('disabled');
			
			if(MODE === 'showall'){
				$('#tasks_list').html('');
				
				OC.TasksPlus.currentTasklistDiv = '#tasks_list';
			}
			
				$.post(OC.generateUrl('apps/'+OC.TasksPlus.appName+'/gettasks'), {
					mode : MODE,
					sday : daySelect
				}, function(jsondata) {
					$('#loading').hide();
					
					
					$('<div class="task" id="donetodo" data-mode="' + MODE + '" data-cal="0"><span class="iCount" data-val="counterdone">0</span> <label>'+t(OC.TasksPlus.appName,'done')+'</label></div>').appendTo($(OC.TasksPlus.currentTasklistDiv));
					
					
					OC.TasksPlus.generateTaskList(jsondata,OC.TasksPlus.currentTasklistDiv);
					
					$('<div class="task" id="newtodo" style="display:none;"></div>').appendTo($(OC.TasksPlus.currentTasklistDiv));
					
					
					
					$('.task.subtask').hide();
					$('.task .uidname').hide();
					$('.task [data-val="counterdone"]').text($('.task.done').length);
					if(OC.TasksPlus.searchTodoId !== null){
						var jsEvent = {};
						jsEvent.id = OC.TasksPlus.searchTodoId;
						jsEvent.target = $('.task .summary[data-todoid="'+OC.TasksPlus.searchTodoId+'"]');
						
						OC.TasksPlus.showEditTask(jsEvent);
						OC.TasksPlus.searchTodoId = null;
					}
					
					OC.TasksPlus.updateCounterTasks();
					if($('.task.dropzone').length === 0){
						$('#totaskfound').show();
					}
					
					$('.toolTip').tipsy({
						html : true,
						gravity : $.fn.tipsy.autoNS
					});
					
				});
				
		}else{
			$('.task.dropzone').hide();
			$('#donetodo').hide();
			$('#totaskfound').hide();
			$('.toolTip').tipsy({
			html : true,
			gravity : $.fn.tipsy.autoNS
		});
			$('#newTodoButton').attr('disabled','disabled');
			if(MODE === 'actweek'){
				var modes = ['yesterday','today','tomorrow','actweek'];
				
				$.each(modes,function(i,el){
					$('.task.opentask[data-startmode="'+el+'"]').show();
					$('.task.opentask[data-startmode="'+el+'"]').find('.ioc-angle-down').removeClass('ioc-rotate-270');
					$('.task.opentask[data-duemode="'+el+'"]').show();
					$('.task.opentask[data-duemode="'+el+'"]').find('.ioc-angle-down').removeClass('ioc-rotate-270');
				});
				
			}
			else if(MODE === 'missedactweek'){
				var modes = ['yesterday','missedactweek'];
				
				$.each(modes,function(i,el){
					$('.task.opentask[data-startmode="'+el+'"]').show();
					$('.task.opentask[data-startmode="'+el+'"]').find('.ioc-angle-down').removeClass('ioc-rotate-270');
					$('.task.opentask[data-duemode="'+el+'"]').show();
					$('.task.opentask[data-duemode="'+el+'"]').find('.ioc-angle-down').removeClass('ioc-rotate-270');
				});
				
			}else if(MODE === 'alltasksdone'){
				$('.task .uidname').show();
				
				$('.task.dropzone.done').show();
				$('.task.dropzone.done').find('.ioc-angle-down').removeClass('ioc-rotate-270');
				
				
			}else if(MODE === 'sharedtasks'){
				$('.task.opentask.shared').show();
				 $('.task.opentask.shared').find('.ioc-angle-down').removeClass('ioc-rotate-270');
			}else if(MODE === 'prio'){
				//FIXME
				$('.task.opentask[data-prio="high"]').show();
				$('.task.opentask[data-prio="high"]').find('.ioc-angle-down').removeClass('ioc-rotate-270');
			}
			else if(MODE === 'dayselect'){
				 var searchDate = $('#taskmanagertitle').attr('data-date');
				$('#totaskfound').hide();
				$('#newTodoButton').removeAttr('disabled');
			
				$('.task.opentask[data-startsearch="'+searchDate+'"]').show();
				$('.task.opentask[data-startsearch="'+searchDate+'"]').find('.ioc-angle-down').removeClass('ioc-rotate-270');
				$('.task.opentask[data-duesearch="'+searchDate+'"]').show();
				$('.task.opentask[data-duesearch="'+searchDate+'"]').find('.ioc-angle-down').removeClass('ioc-rotate-270');
			
				if(!$('.task.opentask[data-startsearch="'+searchDate+'"]').length && !$('.task.opentask[data-duesearch="'+searchDate+'"]').length){
					$('#totaskfound').show();
						
				}
				 
			}else{
				$('.task.opentask[data-startmode="'+MODE+'"]').show();
				$('.task.opentask[data-startmode="'+MODE+'"]').find('.ioc-angle-down').removeClass('ioc-rotate-270');
				$('.task.opentask[data-duemode="'+MODE+'"]').show();
				$('.task.opentask[data-duemode="'+MODE+'"]').find('.ioc-angle-down').removeClass('ioc-rotate-270');
			}
			
			if(MODE !== 'dayselect' && $('.taskstimerow[data-id="'+MODE+'"]').find('.iCount').text() == 0){
				$('#totaskfound').show();
			}
			
			$('.task.opentask .uidname').show();
			$(OC.TasksPlus.currentTasklistDiv+' #donetodo').data('mode',MODE).data('cal',0);
			
		}
		
		
		
		
		
		return false;
	},
	reminder : function(task) {
		if (task == 'init') {
			$('#remCancel').on('click', function() {
				$('#showOwnReminderDev').hide();
				if ($('#new-event').length != 0 || $('#sReminderRequest').val() == '') {
					OC.TasksPlus.reminder('reminderreset');

				} else {
					//if($('#sReminderRequest').val()!=''){}
				}
				return false;
			});
			$('#remOk').on('click', function() {
				OC.TasksPlus.getReminderonSubmit();
				$('#showOwnReminderDev').hide();
				return false;
			});

			$('#showOwnReminderDev').hide();

			//$('.advancedReminder').css('display', 'none');

			OC.TasksPlus.reminder('reminder');
			OC.TasksPlus.reminder('remindertime');
		}
		if (task == 'reminderreset') {
			var sReminderSel = '#sReminderSelect.combobox';
			$(sReminderSel + ' li .colCal').removeClass('isSelectedCheckbox');
			$(sReminderSel + ' li').removeClass('isSelected');
			$('#reminder').val('none');
			$('#reminderoutput').hide();
			$("#reminderoutput").text('');
			$("#sReminderRequest").val('');
			$(sReminderSel + ' li[data-id=none]').addClass('isSelected');
			$(sReminderSel + ' li[data-id=none]').parents(sReminderSel).find('.selector').html($(sReminderSel + ' li[data-id=none]').text());
			$(sReminderSel + ' li[data-id=none]').find('.colCal').addClass('isSelectedCheckbox');
		}

		if (task == 'reminder') {
			$('.advancedReminder').css('display', 'none');

			if ($('#reminderAdvanced option:selected').val() == 'DISPLAY') {

				$('#reminderemailinputTable').css('display', 'none');
				$('#reminderTable').css('display', 'block');
				$('#remindertimeinput').css('display', 'block');
			}
			if ($('#reminderAdvanced option:selected').val() == 'EMAIL') {
				$('#reminderemailinputTable').css('display', 'block');
				$('#reminderTable').css('display', 'block');
				$('#remindertimeinput').css('display', 'block');
			}
		}
		if (task == 'remindertime') {

			$('#reminderemailinputTable').css('display', 'none');
			$('#reminderdateTable').css('display', 'none');
			$('#remindertimeinput').css('display', 'block');
			if ($('#remindertimeselect option:selected').val() == 'ondate') {
				$('#reminderdateTable').css('display', 'block');
				$('#remindertimeinput').css('display', 'none');
			}
		}
	},
	choosenCalendar : function(calendarid) {
			$.post(OC.generateUrl('apps/'+OC.TasksPlus.calendarAppName+'/setmyactivecalendar'), {
				calendarid : calendarid
			}, function(jsondata) {
				if (jsondata.status == 'success') {
					$('.calListen[data-id=' + jsondata.choosencalendar + ']').addClass('isActiveCal');
				}
			});

		},
	rebuildLeftTaskView : function() {

		$.post(OC.generateUrl('apps/'+OC.TasksPlus.appName+'/buildleftnavigation'), function(data) {
			$('#tasks_lists').html(data);
			if ($(OC.TasksPlus.currentTasklistDiv+' #donetodo').data('mode') === 'calendar') {
				$('.calListen[data-id="' + $(OC.TasksPlus.currentTasklistDiv+' #donetodo').data('cal') + '"]').addClass('active');
			}
			if ($(OC.TasksPlus.currentTasklistDiv+' #donetodo').data('mode') !== 'calendar') {
				$('.taskstimerow[data-id="' + $(OC.TasksPlus.currentTasklistDiv+' #donetodo').data('mode') + '"]').addClass('active');
			}

			$('.calListen .descr').each(function(i, el) {

				$(el).on('click', function() {
					$('.taskstimerow').removeClass('active');
					$('.calListen').removeClass('active');
					$(el).parent().addClass('active');
					$('#taskmanagertitle').text($(el).parent().attr('title'));
					OC.TasksPlus.updateList($(el).parent().attr('data-id'));

				});
			});
			
			$('.app-navigation-entry-utils-menu-button button').on('click',function(){
				if(!$(this).parent().find('.app-navigation-entry-menu').hasClass('open')){
				  $('.app-navigation-entry-menu').removeClass('open');
				  $(this).parent().find('.app-navigation-entry-menu').addClass('open');
				  //$(this).parent().find('.app-navigation-entry-menu').css('right',$(window).width() - 222+'px');
				
				}else{
					 $(this).parent().find('.app-navigation-entry-menu').removeClass('open');
					  
				}
			
			});
			
			//deleteCalendar
			$('.app-navigation-entry-menu li.icon-delete').on('click',function(){
				var calId =$(this).closest('.app-navigation-entry-menu').data('calendarid');
				//CalendarPlus.UI.Calendar.deleteCalendar(calId);
			});
			
			//Show Caldav url
			$('.app-navigation-entry-menu li i.ioc-globe').on('click',function(){
				if($('.calclone').length === 1){
					 $('.app-navigation-entry-menu').removeClass('open');
					var calId =$(this).closest('.app-navigation-entry-menu').data('calendarid');
					var myClone = $('#calendar-clone').clone();
					$('li.calListen[data-id="'+calId+'"]').after(myClone);
					myClone.attr('data-calendar',calId).show();
					$('li.calListen[data-id="'+calId+'"]').hide();
					myClone.find('input[name="displayname"]').hide();
					var calDavUrl = OC.linkToRemote(OC.TasksPlus.calendarAppName)+'/calendars/' +  oc_current_user + '/' +OC.TasksPlus.mycalendars[calId].uri;
					myClone.find('input[name="caldavuri"]').val(calDavUrl).show();
					
					myClone.find('button.icon-checkmark').on('click',function(){
						myClone.remove();
						$('li.calListen[data-id="'+calId+'"]').show();
					});
				}
			});
			
			$('.iCalendar').on('click', function(event) {
				if (!$(this).closest('.calListen').hasClass('isActiveCal')) {
					$('.calListen').removeClass('isActiveCal');
			
					CalId = $(this).closest('.calListen').attr('data-id');
					OC.TasksPlus.choosenCalendar(CalId);
				}

			});
			
			

			$('.taskstimerow').each(function(i, el) {

				$(el).on('click', function() {
					$('.taskstimerow').removeClass('active');
					$('.calListen').removeClass('active');
					$(el).addClass('active');
					$('#taskmanagertitle').text($(el).attr('title'));
					OC.TasksPlus.updateListByPeriod($(el).attr('data-id'));

				});
			});
			
			
			
			OC.TasksPlus.buildCategoryList();
			OC.TasksPlus.updateCounterTasks();
			
			$('.toolTip').tipsy({
				html : true,
				gravity : $.fn.tipsy.autoNS
			});
				
			$('#categoryTasksList').hide();
			$('#showCategory').click(function() {
	
				if (! $('#categoryTasksList').is(':visible')) {
					$('h3 #showCategory i.ioc-angle-down').removeClass('ioc-rotate-270');
					$('#categoryTasksList').show('fast');
				} else {
					$('#categoryTasksList').hide('fast');
					$('h3 #showCategory i.ioc-angle-down').addClass('ioc-rotate-270');
				}
			});
			
			
		     $('#showcal').on('click',function(){
		     	$("#datepicker").toggleClass('open');
		     });
		     
			$("#datepicker").datepicker({
					minDate : null,
					onSelect : function(value, inst) {
					var date = inst.input.datepicker('getDate');
					$('#taskmanagertitle').attr('data-date', $.datepicker.formatDate('dd.mm.yy', date));
					$('#taskmanagertitle').text(t(OC.TasksPlus.appName, 'Tasks') + ' '+t(OC.TasksPlus.appName, 'on')+' ' + $.datepicker.formatDate('DD, dd.mm.yy', date));
					OC.TasksPlus.updateListByPeriod('dayselect');
				}
			});

			if (OC.TasksPlus.firstLoading == true && OC.TasksPlus.searchTodoId === null) {
			
				$('.taskstimerow[data-id="' + OC.TasksPlus.startMode + '"]').addClass('active');
				$('#taskmanagertitle').text($('.taskstimerow[data-id="' + OC.TasksPlus.startMode + '"]').attr('title'));
				
			}

		});

	},
	updateCounterTasks:function(){
		
		var SumCount = 0;
		$('.calListen').each(function(i, el) {
			var iCount = $('.task.dropzone[data-calid="'+$(el).data('id')+'"]').length;
			$(el).find('.iCount').text(iCount);
			SumCount+= iCount;
		});
		SumCount += parseInt($('.task.dropzone.shared').length);
		
		$('.taskstimerow[data-id="alltasksdone"]').find('.iCount').text($('.task.dropzone.done').length);
		$('.taskstimerow[data-id="sharedtasks"]').find('.iCount').text($('.task.dropzone.shared').length);
		$('.taskstimerow[data-id="prio"]').find('.iCount').text($('.task.opentask[data-prio="high"]').length);
	
		
		var iClosedTasks = parseInt($('.taskstimerow[data-id="alltasksdone"]').find('.iCount').text());
		var allCountText='('+iClosedTasks+' / '+(SumCount - iClosedTasks)+')';
		$('.taskstimerow[data-id="showall"]').find('.iCount').attr('title','( done / open )').text(allCountText);	
		
		$('#taskstime .taskstimerow').each(function(i,el){
				var mode =  $(el).data('id');
				
				if(mode === 'today' || mode === 'tomorrow' || mode === 'comingsoon' || mode === 'withoutdate'){
					var iCount = $('.task.opentask[data-startmode="'+mode+'"]').length;
					var iCountDue = $('.task.opentask[data-duemode="'+mode+'"]').length;
					$('.task.opentask[data-startmode="'+mode+'"]').each(function(i,el){
						if($(el).data('duemode') === mode){
							iCountDue --;
						}
					});
				}else if(mode === 'actweek'){
					var iCount = $('.task.opentask[data-startmode="'+mode+'"]').length;
					var iCountDue = $('.task.opentask[data-duemode="'+mode+'"]').length;
					var iCLock = false;
					$('.task.opentask[data-startmode="'+mode+'"]').each(function(i,el){
						if($(el).data('duemode') === mode){
							iCountDue --;
							iCLock = true;
						}
					});
					if(iCLock === false){
						$('.task.opentask[data-duemode="'+mode+'"]').each(function(i,el){
							if($(el).data('startmode') === mode){
								iCount --;
							}
						});
					}
					
					var iCountT = $('.task.opentask[data-startmode="today"]').length;
					var iCountTDue = $('.task.opentask[data-duemode="today"]').length;
					var iTLock = false;
					$('.task.opentask[data-startmode="today"]').each(function(i,el){
						if($(el).data('duemode') === 'today' || $(el).data('duemode') === mode){
							iCountTDue --;
							iTLock = true;
						}
					});
					if(iTLock === false){
						$('.task.opentask[data-duemode="today"]').each(function(i,el){
							if($(el).data('startmode') === 'today' || $(el).data('startmode') === mode){
								iCountT --;
							}
						});
					}
					
					var iCountTo = $('.task.opentask[data-startmode="tomorrow"]').length;
					var iCountToDue = $('.task.opentask[data-duemode="tomorrow"]').length;
					var iToLock = false;
					$('.task.opentask[data-startmode="tomorrow"]').each(function(i,el){
						if($(el).data('duemode') === 'tomorrow' || $(el).data('duemode') === mode){
							iCountToDue --;
							iToLock = true;
						}
					});
					
					if(iToLock === false){
						$('.task.opentask[data-duemode="tomorrow"]').each(function(i,el){
							if($(el).data('startmode') === 'tomorrow' || $(el).data('startmode') === mode){
								iCountTo --;
							}
						});
					}
					
					var iCountY = $('.task.opentask[data-startmode="yesterday"]').length;
					var iCountYDue = $('.task.opentask[data-duemode="yesterday"]').length;
					var iYLock = false;
					$('.task.opentask[data-startmode="yesterday"]').each(function(i,el){
						if($(el).data('duemode') === 'yesterday' || $(el).data('duemode') === mode){
							iCountYDue --;
							iYLock = true;
						}
					});
					if(iYLock === false){
						$('.task.opentask[data-duemode="yesterday"]').each(function(i,el){
							if($(el).data('startmode') === 'yesterday' || $(el).data('startmode') === mode){
								iCountY --;
							}
						});
					}
					
					iCount = iCount + iCountT + iCountTo + iCountY;
					iCountDue = iCountDue + iCountTDue + iCountToDue + iCountYDue;
					
				}else if(mode === 'missedactweek'){
					var iCount = $('.task.opentask[data-startmode="'+mode+'"]').length;
					var iCountDue = $('.task.opentask[data-duemode="'+mode+'"]').length;
					$('.task.opentask[data-startmode="'+mode+'"]').each(function(i,el){
						if($(el).data('duemode') === mode){
							iCountDue --;
						}
					});
					var iCountY = $('.task.opentask[data-startmode="yesterday"]').length;
					var iCountYDue = $('.task.opentask[data-duemode="yesterday"]').length;
					$('.task.opentask[data-startmode="yesterday"]').each(function(i,el){
						if($(el).data('duemode') === 'yesterday'){
							iCountYDue --;
						}
					});
					iCount = iCount + iCountY;
					iCountDue = iCountDue + iCountYDue;
				}
				
				$(el).find('.iCount').text(iCount+iCountDue);
			});
			
			$('.categorieslisting').find('.counter').text(0);
			
			$('.categories').find('a').each(function(i, el) {
				var iCounter = parseInt($('.categorieslisting[data-id="'+$(el).attr('title')+'"]').find('.counter').text());
				$('.categorieslisting[data-id="'+$(el).attr('title')+'"]').find('.counter').text(iCounter+1);
			});
			
	},
	checkShowEventHash : function() {
		var id = parseInt(window.location.hash.substr(1));
		if (id) {
				OC.TasksPlus.startMode = 'showall';
				OC.TasksPlus.searchTodoId = id;
				if(OC.TasksPlus.firstLoading === false){
					myMode = 'showall';
					if(!$('.taskstimerow[data-id="showall"]').hasClass('active')){
						OC.TasksPlus.updateListByPeriod(myMode);
						
						$('.taskstimerow').removeClass('active');
						$('.calListen').removeClass('active');
						$('.taskstimerow[data-id="showall"]').addClass('active');
					}else{
						var jsEvent = {};
						jsEvent.id = OC.TasksPlus.searchTodoId;
						jsEvent.target = $('.task .summary[data-id="'+OC.TasksPlus.searchTodoId+'"]');
						
						OC.TasksPlus.showEditTask(jsEvent);
						OC.TasksPlus.searchTodoId = null;
					}
				}
			

		}
	},
	
	buildCategoryList : function() {
		
		var htmlCat = '';
			$.each(OC.TasksPlus.tags, function(i, elem) {
				
				htmlCat += '<li class="categorieslisting" data-grpid="' + elem['id'] + '" data-id="' + elem['name'] + '"><span class="catColPrev" style="background-color:'+elem['bgcolor']+';color:'+elem['color']+';">' + elem['name'].substring(0, 1) + '</span><span class="groupname" data-id="' + elem['name'] + '"> ' + elem['name'] + '</span><i class="ioc ioc-rename"></i><i class="ioc ioc-delete"></i><span class="counter">0</span></li>';
			});
			//our clone
			htmlCat+='<li class="app-navigation-entry-edit groupclone" id="group-clone" data-group="">'
							+'<input type="text" name="group" id="group" value="" placeholder="groupname" />'
							+'<button class="icon-checkmark"></button>'
							+'</li>';

			$('#categoryTasksList').html(htmlCat);
			$('.categorieslisting .groupname').each(function(i, el) {
				$(el).on('click', function() {
					if ($(this).parent('li').hasClass('isFilter')) {
					$(this).parent('li').removeClass('isFilter');
					$('.task .categories a').each(function(i, el) {
						$Task = $(this).closest('.task');
						$Task.removeClass('filterActive');
						$('.task').each(function(i, el) {
							if($(el).find('.ioc-angle-down').hasClass('ioc-rotate-270')){
								$(el).find('.ioc-angle-down').removeClass('ioc-rotate-270');
							}
							$(el).show('fast');
						});
					});
				} else {
					var iCounter = parseInt($(this).parent('li').find('.counter').text());
					if(iCounter > 0){
						$('.categorieslisting').removeClass('isFilter');
						$('.task [data-val="counterdone"]').addClass('arrowDown');
						OC.TasksPlus.filter($(this).attr('data-id'));
						$(this).parent('li').addClass('isFilter');
					}
				}
				});
			});
			
			$('#addGroup').on('click',function(){
				
				if($('.groupclone').length === 1){
					
					var grpId = 'new';
					var myClone = $('#group-clone').clone();
					
					$('#categoryTasksList').prepend(myClone);
					myClone.attr('data-group',grpId).show();
					myClone.find('input[name="group"]').bind('keydown', function(event){
						if (event.which == 13){
							if(myClone.find('input[name="group"]').val()!==''){
								var saveForm = $('.groupclone[data-group="'+grpId+'"]');
								var groupname = saveForm.find('input[name="group"]').val();
								
								OC.Tags.addTag(groupname,'event').then(function(tags){
									myClone.remove();
									
									OC.TasksPlus.getUserInit();
								
									//return false;
								});
								
							}else{
								myClone.remove();
							}
						}
					}).focus();
					
					myClone.on('keyup',function(evt){
						if (evt.keyCode===27){
							myClone.remove();
						}
					});
					
					myClone.find('button.icon-checkmark').on('click',function(){
						if(myClone.find('input[name="group"]').val()!==''){
							var saveForm = $('.groupclone[data-group="'+grpId+'"]');
							var groupname = saveForm.find('input[name="group"]').val();
							OC.Tags.addTag(groupname,'event').then(function(tags){
								myClone.remove();
								OC.TasksPlus.getUserInit();
								
							});
							
						}else{
							myClone.remove();
						}
					});
				}
				return false;
			});
			
			$('#categoryTasksList li .ioc-rename').on('click',function(){
				
				if($('.groupclone').length === 1){
					
					var grpId =$(this).parent().data('grpid');
					var grpName = $(this).parent().data('id');
					var myClone = $('#group-clone').clone();
					$('li.categorieslisting[data-grpid="'+grpId+'"]').after(myClone);
					myClone.attr('data-group',grpId).show();
					$('li.categorieslisting[data-grpid="'+grpId+'"]').hide();
					
					myClone.find('input[name="group"]')
					.bind('keydown', function(event){
						if (event.which == 13){
							if(myClone.find('input[name="group"]').val()!==''){
								var saveForm = $('.groupclone[data-group="'+grpId+'"]');
								var groupname = saveForm.find('input[name="group"]').val();
								
								$.getJSON(OC.generateUrl('apps/'+OC.TasksPlus.calendarAppName+'/updatetag'), {
									grpid:grpId,
									newname:groupname
								}, function(jsondata) {
									if(jsondata.status == 'success'){
										
										myClone.remove();
										OC.TasksPlus.getUserInit();
										
									}
									if(jsondata.status == 'error'){
										alert('could not update tag');
									}
									
									});
								
							}else{
								myClone.remove();
								$('li.categorieslisting[data-grpid="'+grpId+'"]').show();
							}
						}
					})
					.val(grpName).focus();
					
					
					myClone.on('keyup',function(evt){
						if (evt.keyCode===27){
							myClone.remove();
							$('li.categorieslisting[data-grpid="'+grpId+'"]').show();
						}
					});
					myClone.find('button.icon-checkmark').on('click',function(){
						var saveForm = $('.groupclone[data-group="'+grpId+'"]');
						var groupname = saveForm.find('input[name="group"]').val();
						if(myClone.find('input[name="group"]').val()!==''){
							$.getJSON(OC.generateUrl('apps/'+OC.TasksPlus.calendarAppName+'/updatetag'), {
								grpid:grpId,
								newname:groupname
							}, function(jsondata) {
								if(jsondata.status == 'success'){
									
									myClone.remove();
									OC.TasksPlus.getUserInit();
									
								}
								if(jsondata.status == 'error'){
									alert('could not update tag');
								}
								
							});
						}
						
					});
				}
			});
			
			$('#categoryTasksList li .ioc-delete').on('click',function(){
				var groupname = $(this).parent().data('id');
				OC.Tags.deleteTags(groupname,'event').then(function(tags){
					$('li.categorieslisting[data-id="'+groupname+'"]').remove();
					
				});
			});	
			
			$(".categorieslisting .groupname").draggable({
				appendTo : "body",
				helper : "clone",
				cursor : "move",
				delay : 500,
				start : function(event, ui) {
					ui.helper.addClass('draggingCategory');
				}
			});

		
	},
	destroyExisitingPopover : function() {
			
		if($('.webui-popover').length>0){
			if(OC.TasksPlus.popOverElem !== null){
				OC.TasksPlus.popOverElem.webuiPopover('destroy');
				OC.TasksPlus.popOverElem = null;
				$('#new-event').remove();
				$('#edit-event').remove();
			}
			$('.webui-popover').each(function(i,el){
				var id = $(el).attr('id');
				$('[data-target="'+id+'"]').removeAttr('data-target');
				$(el).remove();
			});
		}
	},
	calcDimension : function() {
		var winWidth = $(window).width();
		var winHeight = $(window).height();

		if (winWidth > 768) {

			//$('#tasks_list').height(winHeight - 95);
			//$('#tasks_lists').height(winHeight - 95);
			//$('#tasksListOuter').width(winWidth - 273);
			
		} else {
			$('#tasksListOuter').width(winWidth - 8);
			//$('#tasks_list').height(winHeight - 78);
			
			//$('#tasks_lists').height(winHeight - 65);
			
		}
	},
	getUserInit:function(){
		
		$.getJSON(OC.generateUrl('apps/'+OC.TasksPlus.appName+'/getdefaultvaluestasks'), {},
		 function(jsondata) {
			if (jsondata) {
				OC.TasksPlus.categories = jsondata.categories;
				OC.TasksPlus.mycalendars = jsondata.mycalendars;
				OC.TasksPlus.tags = jsondata.tags;
				
				OC.TasksPlus.buildCategoryList();
			}
		}
		);
	},
	getInit : function() {
		$.getJSON(OC.generateUrl('apps/'+OC.TasksPlus.appName+'/getdefaultvaluestasks'), {},
		 function(jsondata) {
			if (jsondata) {
				OC.TasksPlus.categories = jsondata.categories;
				OC.TasksPlus.mycalendars = jsondata.mycalendars;
				OC.TasksPlus.tags = jsondata.tags;
				
				
				if(OC.TasksPlus.searchTodoId === null){
					OC.TasksPlus.updateListByPeriod(OC.TasksPlus.startMode);
				}
			}
		}
		);
	}
};

$(window).bind('hashchange', function() {
	if (OC.TasksPlus.firstLoading === false) {
		OC.TasksPlus.checkShowEventHash();
	}
});

var resizeTimeout = null;
$(window).resize(function() {
	if (resizeTimeout)
		clearTimeout(resizeTimeout);
	resizeTimeout = setTimeout(function() {
		OC.TasksPlus.calcDimension();
		
	}, 500);
});

$(document).ready(function() {
	
	
	OC.TasksPlus.getInit();
	
	$('#newTodoButton').on('click',OC.TasksPlus.newTask);

	$(document).on('click', '#dropdown #dropClose', function(event) {
		event.preventDefault();
		event.stopPropagation();
		OC.Share.hideDropDown();
		return false;
	});
	
	$('body').on('click',function(evt){
			if($('.app-navigation-entry-menu').hasClass('open') 
			&& !$(evt.target).parent().hasClass('app-navigation-entry-utils-menu-button')
			&& $(evt.target).parent().find('.app-navigation-entry-menu').hasClass('open')
			){
				$('.app-navigation-entry-menu').removeClass('open');
			}
			if($('#datepicker').hasClass('open') 
			&& !$(evt.target).hasClass('ioc-calendar')
			&& !$(evt.target).parent().hasClass('ui-corner-all')
			&& !$(evt.target).hasClass('ui-state-disabled')
			&& !$(evt.target).hasClass('ui-datepicker-year')
			){
				$('#datepicker').removeClass('open');
			
			}
	});
	
			
	$(document).on('click', 'a.share', function(event) {
	//	if (!OC.Share.droppedDown) {
		event.preventDefault();
		event.stopPropagation();
		var itemType = $(this).data('item-type');
		var AddDescr = t(OC.TasksPlus.appName,'Calendar')+' ';
		var sService ='';
		if(itemType === 'calpl'){
			AddDescr = t(OC.TasksPlus.appName,'Calendar')+' ';
			sService = 'calpl';
		}
		if(itemType === 'calpltodo'){
			AddDescr =t(OC.TasksPlus.appName,'Task')+' ';
			sService = 'calpltodo';
		
		}
		
		var iSource = $(this).data('title');
			  iSource = '<div>'+AddDescr+iSource+'</div><div id="dropClose"><i class="ioc ioc-close" style="font-size:22px;"></i></div>';
			  
		if (!$(this).hasClass('shareIsOpen') && $('a.share.shareIsOpen').length === 0) {
			$('#infoShare').remove();
			$( '<div id="infoShare">'+iSource+'</div>').prependTo('#dropdown');
				
		}else{
			$('a.share').removeClass('shareIsOpen');
			$(this).addClass('shareIsOpen');
			//OC.Share.hideDropDown();
		}
		//if (!OC.Share.droppedDown) {
			$('#dropdown').css('opacity',0);
			$('#dropdown').animate({
				'opacity': 1,
			},500);
		//}
    
		(function() {
			
			var targetShow = OC.Share.showDropDown;
			
			OC.Share.showDropDown = function() {
				var r = targetShow.apply(this, arguments);
				$('#infoShare').remove();
				$( '<div id="infoShare">'+iSource+'</div>').prependTo('#dropdown');
				
				return r;
			};
			if($('#linkText').length > 0){
				if(sService === 'calpl'){
					$('#linkText').val($('#linkText').val().replace('public.php?service='+sService+'&t=','index.php/apps/'+OC.TasksPlus.calendarAppName+'/s/'));
				}else{
					$('#linkText').val($('#linkText').val().replace('public.php?service='+sService+'&t=','index.php/apps/'+OC.TasksPlus.appName+'/s/'));

				}
				var target = OC.Share.showLink;
				OC.Share.showLink = function() {
					var r = target.apply(this, arguments);
					if(sService === 'calpl'){
						$('#linkText').val($('#linkText').val().replace('public.php?service='+sService+'&t=','index.php/apps/'+OC.TasksPlus.calendarAppName+'/s/'));
					}else{
						$('#linkText').val($('#linkText').val().replace('public.php?service='+sService+'&t=','index.php/apps/'+OC.TasksPlus.appName+'/s/'));
					}
					
					return r;
				};
			}
		})();
		if (!$('#linkCheckbox').is(':checked')) {
				$('#linkText').hide();
		}
		return false;
		//}
	});
	
	$(document).on('focus', '#tasklocation', function() {
			if ( !$(this).data("autocomplete") ) { // If the autocomplete wasn't called yet:
		
					// don't navigate away from the field on tab when selecting an item
					$(this)
					.bind('keydown', function (event) {
						if (event.keyCode === $.ui.keyCode.TAB &&
							typeof $(this).data('autocomplete') !== 'undefined' &&
							$(this).data('autocomplete').menu.active) {
							event.preventDefault();
						}
					})
					.autocomplete({
						source:function (request, response) {
							$.getJSON(
								OC.generateUrl('/apps/'+OC.TasksPlus.appName+'/taskautocompletelocation'),
								{
									term:request.term
								}, response);
						},
						search:function () {
							
							return this.value.length >= 2;
		
						},
						focus:function () {
							// prevent value inserted on focus
							return false;
						},
						select:function (event, ui) {
							
							return ui.item.value;
						}
					});
				}
		});

	 $('link[rel="shortcut icon"]').attr('href', OC.filePath(OC.TasksPlus.appName, 'img', 'favicon.png'));
	
	
}); 
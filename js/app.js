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
				if (sTimeMode == 'minutesafter') {
					sResult = '+PT' + sTimeInput + 'M';
				}
				if (sTimeMode == 'hoursafter') {
					sResult = '+PT' + sTimeInput + 'H';
				}
				if (sTimeMode == 'daysafter') {
					sResult = '+PT' + sTimeInput + 'D';
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
			$(sCalendarSel + ' .selector').html('<span class="colCal" style="cursor:pointer;float:none;margin-top:5px;background-color:' + $(sCalendarSel + ' li.isSelected').data('color') + '">&nbsp;<span>');
		}
		$(sCalendarSel + ' .selector').on('click', function() {
			if ($(sCalendarSel + ' ul').is(':visible')) {
				$(sCalendarSel + ' ul').hide('fast');
			} else {
				$(sCalendarSel + ' ul').show('fast');
			}

		});
		$(sCalendarSel + ' li').click(function() {
			$(this).parents(sCalendarSel).find('.selector').html('<span class="colCal" style="float:none;margin-top:5px;background-color:' + $(this).data('color') + '">&nbsp;<span>');
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

		//Reminder
		$('#reminderdate').datetimepicker({
			altField : '#remindertime',
			dateFormat : 'dd-mm-yy',
			stepMinute : 5,
			numberOfMonths : 1,
			timeOnlyTitle: t(OC.TasksPlus.calendarAppName,'Choose Time'),
			timeText: t(OC.TasksPlus.calendarAppName,'Time'),
			hourText: t(OC.TasksPlus.calendarAppName,'Hour'),
			minuteText: t(OC.TasksPlus.calendarAppName,'Minute'),
			secondText: t(OC.TasksPlus.calendarAppName,'Second'),
			addSliderAccess : true,
			sliderAccessArgs : {
				touchonly : false
			},
			showButtonPanel : false
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

			var tmpTask = $('<div class="task dropzone' + SubClass + '"  data-id="' + taskSingleArray.id + '" data-uid="' + taskSingleArray.eventuid + '" data-relatedto="' + taskSingleArray.relatedto + '">');

			if (taskSingleArray.orgevent) {
				tmpTask = $('<div class="task dropzone" style="border:2px dotted #000;" data-id="' + taskSingleArray.id + '">');
			}
			
			if (taskSingleArray.relatedto != '' && $('div[data-uid="' + taskSingleArray.relatedto + '"]').length > 0) {
				$('div[data-uid="' + taskSingleArray.relatedto + '"]').append(tmpTask);
				
			} else {
				if ($('#newtodo').length > 0) {
					$('.task[id="newtodo"]').before(tmpTask);
				} else {
					$('#tasks_list').append(tmpTask);
				}
			}

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
			
			if (taskSingleArray.subtask) {

				$('<div style="float:left;margin-top:0px;width:30px;text-align:center;">').append($('<i id="arrow_' + taskSingleArray.id + '">').addClass('ioc ioc-angle-down ioc-rotate-270')).appendTo(tmpTask);
				$('#arrow_' + taskSingleArray.id).on('click', OC.TasksPlus.ToggleView);
			}

			$('<div>').addClass('colCal').css({
				'background-color' : taskSingleArray.bgcolor,
				'color' : taskSingleArray.color
			}).html(taskSingleArray.displayname.substring(0, 1)).appendTo(tmpTask);

			//Div for the add Icons

			var priority = taskSingleArray.priority;
			if (priority != '') {
				$('<div>').addClass('ioc ioc-flash priority priority-' + ( priority ? priority : 'n')).appendTo(tmpTask);
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
			var subTaskIcon='';
			if (taskSingleArray.relatedto != '' && $('div[data-uid="' + taskSingleArray.relatedto + '"]').length === 0){
				subTaskIcon ='<i class="ioc ioc-forward" title="Subtask related to '+taskSingleArray.relatedto+'"></i>';
				$(subTaskIcon).appendTo(iconDiv);	
			}
			var repeatDescr = '';
			if (taskSingleArray.repeating) {
				if (taskSingleArray.day != undefined) {
					repeatDescr = ' taeglich -> ' + taskSingleArray.day;
				}
			}
			$('<div>').addClass('summary').attr('data-todoid',taskSingleArray.id).text(taskSingleArray.summary + repeatDescr).on('click', OC.TasksPlus.showEditTask).appendTo(tmpTask);
			//summary
			

			var cpDate = '';
			if (taskSingleArray.iscompleted) {
				cpDate = taskSingleArray.completed;
			}
			$('<div>').addClass('completeDate').text(cpDate).appendTo(tmpTask);
			//Categories
			if (taskSingleArray.relatedto == '') {

				var SubTaskHandler = $('<i id="newsubtask_' + taskSingleArray.id + '"/>').attr('title',t(OC.TasksPlus.appName,'Add Subtask')).addClass('ioc ioc-add').css({
					'cursor' : 'pointer',
					'font-size' : '20px',
					'float' : 'right',
					'margin-right' : '50px',
					'margin-top' : '15px'
				});
				SubTaskHandler.appendTo(tmpTask);
				
				$('#newsubtask_' + taskSingleArray.id).on('click', OC.TasksPlus.newTask);

				var TaskCompleteHandler = $('<i id="newcomplete_' + taskSingleArray.id + '"/>').attr('title',t(OC.TasksPlus.appName,'Calculate Complete Main Task')).addClass('ioc ioc-refresh').css({
					'cursor' : 'pointer',
					'font-size' : '20px',
					'float' : 'right',
					'margin-right' : '10px',
					'margin-top' : '15px'
				});
				TaskCompleteHandler.appendTo(tmpTask);
				$('#newcomplete_' + taskSingleArray.id).on('click', OC.TasksPlus.newCompleteCalc);

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
				myMode = $('#donetodo').data('mode');
				myCal = $('#donetodo').data('cal');

				if (myMode == 'calendar') {
					OC.TasksPlus.updateList(myCal);
				}

				if (myMode != 'calendar') {
					OC.TasksPlus.updateListByPeriod(myMode);
				}
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
			showPeriodLabels : false,
			showButtonPanel : false,
			timeOnlyTitle: t(OC.TasksPlus.calendarAppName,'Choose Time'),
			timeText: t(OC.TasksPlus.calendarAppName,'Time'),
			hourText: t(OC.TasksPlus.calendarAppName,'Hour'),
			minuteText: t(OC.TasksPlus.calendarAppName,'Minute'),
			secondText: t(OC.TasksPlus.calendarAppName,'Second'),
		});

		$('#startdate').datepicker({
			dateFormat : "dd.mm.yy",
			minDate : null
		});
		$('#startdate_time').timepicker({
			showPeriodLabels : false,
			showButtonPanel : false,
			timeOnlyTitle: t(OC.TasksPlus.calendarAppName,'Choose Time'),
			timeText: t(OC.TasksPlus.calendarAppName,'Time'),
			hourText: t(OC.TasksPlus.calendarAppName,'Hour'),
			minuteText: t(OC.TasksPlus.calendarAppName,'Minute'),
			secondText: t(OC.TasksPlus.calendarAppName,'Second'),
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
			myMode = $('#donetodo').data('mode');
			myCal = $('#donetodo').data('cal');
			//Find Main Id	
		}else{
			TaskId = event.id;
			myMode = $('#donetodo').data('mode');
			myCal = $('#donetodo').data('cal');
		}
		
		if($('.webui-popover').length>0){
			if(OC.TasksPlus.popOverElem !== null){
				OC.TasksPlus.popOverElem.webuiPopover('destroy');
				OC.TasksPlus.popOverElem = null;
				$('#edit-event').remove();
			}
		}
		
		
		
		OC.TasksPlus.popOverElem = $(event.target); 	
			
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
					that.getContentElement().css('height','auto');
					
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

					
				}
			},
			multi:false,
			closeable:false,
			cache:false,
			placement:'auto',
			type:'async',
			width:400,
			animation:'pop',
			height:250,
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
		if ($('div[data-id="' + TaskId + '"]').find('i.ioc-angle-down').hasClass('ioc-rotate-270')) {
			$('div[data-id="' + TaskId + '"]').find('i.ioc-angle-down').removeClass('ioc-rotate-270');
			$('div[data-id="' + TaskId + '"]').find('.subtask').show();
		} else {
			$('div[data-id="' + TaskId + '"]').find('i.ioc-angle-down').addClass('ioc-rotate-270');
			$('div[data-id="' + TaskId + '"]').find('.subtask').hide();
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
				$('div.opentask[data-uid="' + myClone.attr('data-relatedto') + '"]').append(myClone);

			} else {
				$('#tasks_list').append(myClone);
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
		// $Task=$(this).closest('.task');
		//TaskId=$Task.attr('data-id');
		$("#dialogSmall").html(t(OC.TasksPlus.appName, 'Are you sure') + '?');

		$("#dialogSmall").dialog({
			resizable : false,
			title : t(OC.TasksPlus.appName, 'Delete Task'),
			width : 200,
			height : 160,
			position : {
				my : "center center",
				at : "center center",
				of : window
			},
			modal : true,
			buttons : [{
				text : t(OC.TasksPlus.appName, 'No'),
				click : function() {
					$(this).dialog("close");
				}
			}, {
				text : t(OC.TasksPlus.appName, 'Yes'),
				click : function() {
					var oDialog = $(this);
					
				$.ajax({
					type : 'POST',
					url : OC.generateUrl('apps/'+OC.TasksPlus.appName+'/deletetask'),
					data :{
						'id' : TASKID
					},
					success : function(jsondata) {
						oDialog.dialog("close");
						$("#dialogmore").dialog("close");
						if ($('.task[data-id="' + TASKID + '"]').hasClass('done')) {
							tempCount = parseInt($('.task [data-val="counterdone"]').text());
							tempCount -= 1;
							$('.task [data-val="counterdone"]').text(tempCount);
						}
						$('.task[data-id="' + TASKID + '"]').remove();
						OC.TasksPlus.rebuildLeftTaskView();
					}
				});
				
				}
			}],
		});

		return false;
	},
	openShareDialog : function(TaskId) {

		var selCal = $('<select name="calendar" id="calendarAdd"></select>');
		$.each(OC.TasksPlus.mycalendars, function(i, elem) {
			var option = $('<option value="' + elem['id'] + '">' + elem['name'] + '</option>');
			selCal.append(option);
		});

		$('<p>' + t(OC.TasksPlus.calendarAppName, 'Please choose a calendar') + '</p>').appendTo("#dialogmore");
		selCal.appendTo("#dialogmore");

		$("#dialogmore").dialog({
			resizable : false,
			title : t(OC.TasksPlus.appName, 'Add Task'),
			width : 350,
			height : 200,
			modal : true,
			buttons : [{
				text : t('core', 'Add'),
				click : function() {
					var oDialog = $(this);
					var CalId = $('#calendarAdd option:selected').val();

					$.ajax({
						type : 'POST',
						url : OC.generateUrl('apps/'+OC.TasksPlus.appName+'/addsharedtask'),
						data :{
							'taskid' : TaskId,
							'calid' : CalId
						},
						success : function(jsondata) {
								OC.TasksPlus.updateList(0);
								OC.TasksPlus.rebuildLeftTaskView();
								$("#dialogmore").html('');
								oDialog.dialog("close");
						}
					});
					
					
				}
			}, {
				text : t(OC.TasksPlus.calendarAppName, 'Cancel'),
				click : function() {
					$(this).dialog("close");
					$("#dialogmore").html('');
				}
			}],

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

		$Task = $(this).closest('.task');
		TaskUid = $Task.attr('data-uid');
		if (TaskUid == undefined) {
			TaskUid = '';
		}
		//position = $(this).position();
		if($('.webui-popover').length>0){
				if(OC.TasksPlus.popOverElem !== null){
					OC.TasksPlus.popOverElem.webuiPopover('destroy');
					OC.TasksPlus.popOverElem = null;
					$('#new-event').remove();
				}
			}
		
		OC.TasksPlus.popOverElem = $(event.target); 	
			
			OC.TasksPlus.popOverElem.webuiPopover({
				url:OC.generateUrl('apps/'+OC.TasksPlus.appName+'/newtask'),
				async:{
					type:'POST',
					data : {
						mytaskmode : $('#donetodo').data('mode'),
						mytaskcal : $('#donetodo').data('cal'),
						relatedto : TaskUid
					},
					success:function(that,data){
						that.displayContent();
						that.getContentElement().css('height','auto');
						
						if ($('#donetodo').data('mode') == 'dayselect') {
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
						
					}
				},
				multi:false,
				closeable:false,
				cache:false,
				placement:'auto',
				type:'async',
				width:400,
				animation:'pop',
				height:250,
				trigger:'manual',
			}).webuiPopover('show');	

		return false;
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
					OC.TasksPlus.popOverElem.webuiPopover('destroy');
					OC.TasksPlus.popOverElem = null;
					$('#new-event').remove();
					OC.TasksPlus.taskRendering(jsondata);
				}
				if (VALUE == 'edititTask') {
					OC.TasksPlus.showMeldung(t(OC.TasksPlus.appName, 'Update success!'));
					OC.TasksPlus.popOverElem.webuiPopover('destroy');
					OC.TasksPlus.popOverElem = null;
					$('#edit-event').remove();
					
					if ($('.calListen').hasClass('active')) {
						OC.TasksPlus.updateList($('.calListen.active').data('id'));
					}

					if ($('.taskstimerow').hasClass('active')) {
						OC.TasksPlus.updateListByPeriod($('.taskstimerow.active').data('id'));
					}
				}
				
				OC.TasksPlus.rebuildLeftTaskView();
			}
			
		});

	},
	showMeldung : function(TXT) {

		var leftMove = ($(window).width() / 2) - 150;
		var myMeldungDiv = $('<div id="iMeldung" style="left:' + leftMove + 'px"></div>');
		$('#content').append(myMeldungDiv);
		$('#iMeldung').html(TXT);

		$('#iMeldung').animate({
			top : 200
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

		$('#tasks_list .categories').find('a').each(function(i, el) {

			if ($(el).attr('title') != '' && $(el).attr('title') == tagText) {
				$Task = $(this).closest('.task');
				TaskId = $Task.attr('data-id');

				saveArray[TaskId] = 1;
			}
		});
		if (saveArray.length > 0) {

			$('#tasks_list .task').each(function(i, el) {
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
	generateTaskList : function(jsondata) {
		$('#donetodo').on('click', function() {
			$('.task [data-val="counterdone"]').toggleClass('arrowDown');
			if (! $('.task.done').is(':visible')) {
				$('span[data-val="counterdone"]:before').css('content', '\25BC');
				$('.task.done').show('fast');
			} else {
				$('.task.done').hide('fast');
			}
		});

		$('.task [data-val="counterdone"]').text($(jsondata['done']).length);
		$(jsondata['done']).each(function(i, task) {
			OC.TasksPlus.taskRendering(task);
		});

		$(jsondata['open']).each(function(i, task) {
			OC.TasksPlus.taskRendering(task);
		});
		if ($(jsondata['done']).length == 0 && $(jsondata['open']).length == 0) {
			var tmpTask = $('<div class="task" data-id="notodo">').html('<label>' + t(OC.TasksPlus.appName, 'No Todos') + '</label>');
			$('#tasks_list').append(tmpTask);
		}
		$('.task .subtask').toggle();

		$(".dropzone").droppable({
			activeClass : "activeHover",
			hoverClass : "dropHover",
			accept : '#categoryTasksList .categorieslisting',
			over : function(event, ui) {

			},
			drop : function(event, ui) {
				if ($(this).data('id') != null)
					OC.TasksPlus.addCategory($(this).data('id'), ui.draggable.attr('title'));
			}
		});

		if (OC.TasksPlus.firstLoading === true) {
			OC.TasksPlus.checkShowEventHash();
			OC.TasksPlus.firstLoading = false;
			OC.TasksPlus.calcDimension();
		}

	},
	updateList : function(CID) {
		$('#loading').show();
		$('#tasks_list').html('');
		$.post(OC.generateUrl('apps/'+OC.TasksPlus.appName+'/gettasks'), {
			calid : CID
		}, function(jsondata) {
			$('#loading').hide();
			
			var doneTask = $('<div class="task" id="donetodo" data-mode="calendar" data-cal="' + CID + '"><span class="iCount" data-val="counterdone">0</span> <label>'+t(OC.TasksPlus.appName,'done')+'</label></div>').appendTo($('#tasks_list'));

			OC.TasksPlus.generateTaskList(jsondata);
			$('.calListen[data-id="' + CID + '"]').find('.iCount').text($('.task.dropzone').length);
			//alert($('.task').length -1);
			$('<div class="task" id="newtodo" style="display:none;"></div>').appendTo($('#tasks_list'));
			if ($('.calListen[data-id="' + CID + '"]').data('permissions') & OC.PERMISSION_CREATE) {
					$('#newTodoButton').show();
			} else {
				$('#newTodoButton').hide();
			}
			$('.task .colCal').hide();
			$('.categorieslisting').find('.counter').text(0);
			
			$('#tasks_list .categories').find('a').each(function(i, el) {
				var iCounter = parseInt($('.categorieslisting[data-name="'+$(el).attr('title')+'"]').find('.counter').text());
				$('.categorieslisting[data-name="'+$(el).attr('title')+'"]').find('.counter').text(iCounter+1);
			});
			
			

		});

	},
	updateListByPeriod : function(MODE) {
		var daySelect = '';
		if (MODE == 'dayselect') {
			daySelect = $('#taskmanagertitle').attr('data-date');

		}
		$('#loading').show();
		$('#tasks_list').html('');
		$.post(OC.generateUrl('apps/'+OC.TasksPlus.appName+'/gettasks'), {
			mode : MODE,
			sday : daySelect
		}, function(jsondata) {
			$('#loading').hide();
			
	
			$('<div class="task" id="donetodo" data-mode="' + MODE + '" data-cal="0"><span class="iCount" data-val="counterdone">0</span> <label>'+t(OC.TasksPlus.appName,'done')+'</label></div>').appendTo($('#tasks_list'));

			OC.TasksPlus.generateTaskList(jsondata);
			$('<div class="task" id="newtodo" style="display:none;"></div>').appendTo($('#tasks_list'));
			
			if (MODE == 'dayselect') {
			$('#newTodoButton').show();
			} else {
				$('#newTodoButton').hide();
			}
			if (MODE == 'alltasksdone') {
				$('.task [data-val="counterdone"]').addClass('arrowDown');
				$('.task.done').show('fast');
			}
			
			$('.categorieslisting').find('.counter').text(0);
			
			$('#tasks_list .categories').find('a').each(function(i, el) {
				var iCounter = parseInt($('.categorieslisting[data-name="'+$(el).attr('title')+'"]').find('.counter').text());
				$('.categorieslisting[data-name="'+$(el).attr('title')+'"]').find('.counter').text(iCounter+1);
			});
			
			if(OC.TasksPlus.searchTodoId !== null){
				var jsEvent = {};
				jsEvent.id = OC.TasksPlus.searchTodoId;
				jsEvent.target = $('.task .summary[data-todoid="'+OC.TasksPlus.searchTodoId+'"]');
				
				OC.TasksPlus.showEditTask(jsEvent);
				OC.TasksPlus.searchTodoId = null;
			}
			
		});
		
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
	rebuildLeftTaskView : function() {

		$.post(OC.generateUrl('apps/'+OC.TasksPlus.appName+'/buildleftnavigation'), function(data) {
			$('#tasks_lists').html(data);
			if ($('#donetodo').data('mode') === 'calendar') {
				$('.calListen[data-id="' + $('#donetodo').data('cal') + '"]').addClass('active');
			}
			if ($('#donetodo').data('mode') !== 'calendar') {
				$('.taskstimerow[data-id="' + $('#donetodo').data('mode') + '"]').addClass('active');
			}

			$('.calListen').each(function(i, el) {

				$(el).on('click', function() {
					$('.taskstimerow').removeClass('active');
					$('.calListen').removeClass('active');
					$(el).addClass('active');
					$('#taskmanagertitle').text($(el).attr('title'));
					OC.TasksPlus.updateList($(el).attr('data-id'));

				});
			});

			$('.toolTip').tipsy({
				html : true,
				gravity : $.fn.tipsy.autoNS
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
			
			$('div[data-id="lTimelineHolder"]').hide();
			$('#lTimeline').click(function() {
	
				if (! $('div[data-id="lTimelineHolder"]').is(':visible')) {
					$('h3 #lTimeline i.ioc-angle-down').removeClass('ioc-rotate-270');
					$('div[data-id="lTimelineHolder"]').show('fast');
				} else {
					$('div[data-id="lTimelineHolder"]').hide('fast');
					$('h3 #lTimeline i.ioc-angle-down').addClass('ioc-rotate-270');
				}
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
			
			
			$('#lCalendar').click(function() {
				if (! $('#datepickerNav').is(':visible')) {
					$('h3 #lCalendar i.ioc-angle-down').removeClass('ioc-rotate-270');
					$('#datepickerNav').show('fast');
				} else {
					$('#datepickerNav').hide('fast');
					$('h3 #lCalendar i.ioc-angle-down').addClass('ioc-rotate-270');
				}
			});

			
			$("#datepickerNav").datepicker({
				minDate : null,
				onSelect : function(value, inst) {
					var date = inst.input.datepicker('getDate');
					$('#taskmanagertitle').attr('data-date', $.datepicker.formatDate('dd.mm.yy', date));
					$('#taskmanagertitle').text(t(OC.TasksPlus.appName, 'Tasks') + ' '+t(OC.TasksPlus.appName, 'on')+' ' + $.datepicker.formatDate('DD, dd.mm.yy', date));
					OC.TasksPlus.updateListByPeriod('dayselect');
				}
			});

			if (OC.TasksPlus.firstLoading == true && OC.TasksPlus.searchTodoId === null) {
				//$('#tasks_list').height($(window).height() - 78);
				//$('#tasks_list').width($(window).width() - 260);
				//$('#tasksListOuter').width($(window).width() - 262);
				//$('#tasks_list_details').height($(window).height() - 90);

				$('.taskstimerow[data-id="' + OC.TasksPlus.startMode + '"]').addClass('active');
				$('#taskmanagertitle').text($('.taskstimerow[data-id="' + OC.TasksPlus.startMode + '"]').attr('title'));

			}

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
	categoriesChanged : function(newcategories) {
		categoriesSel = $.map(newcategories, function(v) {
			return v;
		});
		var newCat = {};
		$.each(newcategories, function(i, el) {
			newCat[el.name] = el.color;
		});
		OC.TasksPlus.categories = newCat;

		$('#taskcategories').multiple_autocomplete('option', 'source', categoriesSel);
		OC.TasksPlus.buildCategoryList();
	},
	buildCategoryList : function() {
		var htmlCat = '';
		$.each(OC.TasksPlus.tags, function(i, elem) {
			htmlCat += '<li class="categorieslisting" data-name="' + elem['name'] + '" title="' + elem['name'] + '"><span class="catColPrev" style="background-color:' + elem['bgcolor'] + ';color:' + elem['color'] + '">' + elem['name'].substring(0, 1) + '</span> ' + elem['name'] + '<span class="counter">0</span></li>';
		});

		$('#categoryTasksList').html(htmlCat);

		$('.categorieslisting').each(function(i, el) {
			$(el).on('click', function() {
				//$('.categorieslisting').removeClass('isFilter');
				if ($(this).hasClass('isFilter')) {
					$(this).removeClass('isFilter');
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
					var iCounter = parseInt($(this).find('.counter').text());
					if(iCounter > 0){
						$('.categorieslisting').removeClass('isFilter');
						$('.task [data-val="counterdone"]').addClass('arrowDown');
						OC.TasksPlus.filter($(this).attr('title'));
						$(this).addClass('isFilter');
					}
				}
			});
		});
		$(".categorieslisting").draggable({
			appendTo : "body",
			helper : "clone",
			cursor : "move",
			delay : 500,
			start : function(event, ui) {
				ui.helper.addClass('draggingCategory');
			}
		});

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
			$('#tasks_list').width(winWidth - 7).height(winHeight - 78);
			$('#tasks_lists').height(winHeight - 65);
			
		}
	},
	getInit : function() {
		$.getJSON(OC.generateUrl('apps/'+OC.TasksPlus.appName+'/getdefaultvaluestasks'), {},
		 function(jsondata) {
			if (jsondata) {
				OC.TasksPlus.categories = jsondata.categories;
				OC.TasksPlus.mycalendars = jsondata.mycalendars;
				OC.TasksPlus.tags = jsondata.tags;
				
				OC.TasksPlus.rebuildLeftTaskView();
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
		if ($("#dialogmore").is(':visible')) {
			$('#dialogmore').dialog('option', "position", {
				my : 'center center',
				at : 'center center',
				of : $('#app-content')
			});
		}
	}, 500);
});

$(document).ready(function() {
	$('#newTodoButton').hide();
	$('#newTodoButton').on('click', OC.TasksPlus.newTask);
	
	OC.TasksPlus.getInit();
	
	$(document).on('click', '#dropdown #dropClose', function(event) {
		event.preventDefault();
		event.stopPropagation();
		OC.Share.hideDropDown();
		return false;
	});
		
	$(document).on('click', 'a.share', function(event) {
	//	if (!OC.Share.droppedDown) {
		event.preventDefault();
		event.stopPropagation();
		var iType = $(this).data('item-type');
		var AddDescr =t(OC.TasksPlus.appName,'Task')+' ';
		var sService = OC.TasksPlus.appShareService;
		
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
				$('#linkText').val($('#linkText').val().replace('public.php?service='+sService+'&t=','index.php/apps/'+OC.TasksPlus.appName+'/s/'));
	
				var target = OC.Share.showLink;
				OC.Share.showLink = function() {
					var r = target.apply(this, arguments);
					
					$('#linkText').val($('#linkText').val().replace('public.php?service='+sService+'&t=','index.php/apps/'+OC.TasksPlus.appName+'/s/'));
					
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
	
	
	
	
}); 
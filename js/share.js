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
 
$(document).ready(function(){
	
	$('#body-public').addClass('appbody-tasksplus');
	$('#body-public').removeClass('appbody-gallery');
	
	$("#showLocation").tooltip({
				items : "img, [data-geo], [title]",
				position : {
					my : "left+15 center",
					at : "right center"
				},
				content : function() {
					var element = $(this);
					if (element.is("[data-geo]")) {
						var text = element.text();
						return "<img class='map' alt='" + text + "' src='http://maps.google.com/maps/api/staticmap?" + "zoom=14&size=350x350&maptype=terrain&sensor=false&center=" + text + "'>";
					}
					if (element.is("[title]")) {
						return element.attr("title");
					}
					if (element.is("img")) {
						return element.attr("alt");
					}
				}
			});
	
});
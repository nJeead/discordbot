# NeverMiss Calendar Bot

NeverMiss is a Discord Bot with Google Calendar integration allowing users to collaboratively plan and share
events through Discord servers and create Discord roles to easily communicate with all others using the same calendar. Users can subscribe to calendars and add themselves to certain Discord roles to keep up to date with events in that calendar.

Created using Google Calendar API and Discord.js. ProstgreSQL database holds Discord server and Google Calendar information.

## Commands List
* calstats
```
!calstats    aliases: [stats,list]            
  displays stats for a calendar

!stats [calendar/role] [property] [option]
!stats calendars (<-displays all available calendars)

Properties:
  due: all options apply
  exams: no options, lists all exams
Options:
  today:
  tomorrow:
  week:
  all:
  
 Example: !stats existingRole due today
```
* edit
```
!edit            
  change an existing event's properties

!edit cal: [name], event: [name], option: [property], edit: [change]

Date format: [MM/DD] or [Day(Mon, Tues, ...)]
Time format: [HH:mm] or [hh:mm:pm/am]

Properties : [edit format]:
    start: [date]-[time]
    end: [date]-[time]
    startend: [date]-[time] (makes start and end the same time)
    description: [string without commas]
    location: [string without commas]
    name: [changes event name without commas]

Examples: 
  !edit cal: Some Calendar, event: Some Event, option: start, edit: friday-8:00:pm
  !edit cal: Another Calendar, event: Event2, option: description, edit: this description can have spaces and     any character EXCEPT for commas
```
* event
```
!event    aliases: [ev,e]
  create event for a Google Calendar

!event name: [name], start: [date]-[time], cal: [class/role], ...

Date format: [MM/DD] or [Day(Mon, Tues, ...)]
Time format: [HH:mm] or [hh:mm:pm/am]

Optional parameters (in any order):
    end: [date]-[time]
    description: [string without commas]
    location: [string without commas]

Examples: 
    !event name: Some Event, cal: Calendar Name, start: tomorrow-22:00
    !event cal: A Calendar, name: Random Event, start: 1/15-4:00:pm, end: 1/16-4:00:pm, description: this is a    description without commas, location: 123 UT Drive
```
* help
```
!help                
    provides list of commands and their basic formatting

!help
!help [command]
```
* joinclass
```
!joinclass    aliases: [joinrole,join]            
    join a class role

!joinclass @{classRole} @{classRole} ...

Example: !joinclass @casuals @EE302 @EXISTINGROLE
```
* leaveclass
```
!leaveclass     aliases: [leaverole,leave]            
    remove yourself from a class role

!leaverole @{classRole} @{classRole} ...

Example: !leave @casuals @EE302 @EXISTINGROLE
```
* newgcal
```
!newgcal    aliases: [newcal,newrole,cal]            
    create a new Google calendar and role (ADMIN ONLY)

!newcal cal: [calendar name], role: [role name (optional)], description: [description (optional)]

Note: both role and calendar will have the same name if role name is not specified

Example: !newcal cal: CalendarName, description: some random description for the calendar
```
* remove
```
!remove   aliases: [rm,delete]            
    delete a event or a role and its calendar (role and calendar removal for ADMINS ONLY)


!rm [@role]
!rm cal: [calendarName] event: [eventName]

Examples: 
  !rm @ExistsingRole
  !rm cal: EE302, event: assignment1
```
* request
```
!request    aliases: [requestclass,req]            
    a message with the requested class information will be sent to all admins

!request [course number] [professor] [class description]

Example: !request EE313 Cuevas Linear Systems and Signals
```
* subscribe
```
!subscribe    aliases: [sub]            
    subscribe to a specific role/class calendar

!sub [@role(s)], email: [your email]

Example: !sub @Role1 , @Role2 , email: myemail@example.edu
```

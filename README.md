# Classroom Companion
 - an application for teachers and students that allows them to manage their classes, in terms of schedule and announcements  
 - they can automatically add the scheduled events directly into their Google Calendar  
 - teachers can create meetings on Google Meet, that will be accessible to every student  
 - everybody receives an email notification 15 minutes before one of their classes start  
   ![ClassRemainder](https://github.com/georgiana-ojoc/ClassroomCompanion/blob/main/images/ClassRemainder.png)  
 - students receive an email notification every time when one of their teachers posts an announcement  
   ![NewAnnouncement](https://github.com/georgiana-ojoc/ClassroomCompanion/blob/main/images/NewAnnouncement.png)  
### Documentation
[Documentation](https://docs.google.com/presentation/d/e/2PACX-1vQcGN8eZAtrGcWVZWJNOOznXANvw1eW1xhiUerAzn_4pBDMeLC35UdriNoBXm_s9N1jbyyQtExagdWW/pub?start=true&loop=false&delayms=15000)  
### Quality
![Quality](https://github.com/georgiana-ojoc/ClassroomCompanion/blob/main/images/SonarQube.png)  
## Back-end
![Functionality](https://youtu.be/kfMnwFLzWQw)
#### API
 - Node.js RESTful API with Express.js  
 - database: Cloud SQL for SQL Server  
#### Google Cloud Functions
 - sendClassRemainderEmail: Cloud Scheduler - Cloud Pub/Sub - Cloud Functions  
 - sendWelcomeEmailToNewUser and sendNewAnnouncementEmail: Aggregated sink - Cloud Pub/Sub - Cloud Functions  
## Front-end
![Functionality](https://youtu.be/F0F7P-aqqKo)
 - Blazor (web framework using C#)  
 - Razden Blazor Component Library  
## Authentication and Authorization
 - Azure Active Directory B2C  

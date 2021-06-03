# Classroom Companion
 - an application for teachers and students that allows them to manage their classes, in terms of schedule and announcements  
 - they can automatically add the scheduled events directly into their Google Calendar  
 - teachers can create meetings on Google Meet, that will be accessible to every student  
 - everybody receives an email notification 15 minutes before one of their classes start  
   ![ClassRemainder](https://github.com/georgiana-ojoc/ClassroomCompanion/blob/main/images/ClassRemainder.png)  
 - students receive an email notification every time when one of their teachers posts an announcement  
   ![NewAnnouncement](https://github.com/georgiana-ojoc/ClassroomCompanion/blob/main/images/NewAnnouncement.png)  
### Documentation
[Documentation](https://docs.google.com/presentation/d/1r3oxVQH1YWOk8rnLy1_hVN5n9pAqf2c7mWTm0Iwiwl8/edit?usp=sharing)  
### Quality
![Quality](https://github.com/georgiana-ojoc/ClassroomCompanion/blob/main/images/SonarQube.png)  
## Back-end
![Functionality](https://github.com/georgiana-ojoc/ClassroomCompanion/blob/main/videos/API.mp4)
#### API
 - Node.js RESTful API with Express.js  
 - database: Cloud SQL for SQL Server  
#### Google Cloud Functions
 - sendClassRemainderEmail: Cloud Scheduler - Cloud Pub/Sub - Cloud Functions  
 - sendWelcomeEmailToNewUser and sendNewAnnouncementEmail: Aggregated sink - Cloud Pub/Sub - Cloud Functions  
## Front-end
![Functionality](https://github.com/georgiana-ojoc/ClassroomCompanion/blob/main/videos/Client.mp4)
 - Blazor (web framework using C#)  
 - Razden Blazor Component Library  
## Authentication and Authorization
 - Azure Active Directory B2C  

# Classroom Companion
 - an application for teachers and students that allows them to manage their classes, in terms of schedule and announcements  
 - they can automatically add the scheduled events directly into their Google Calendar  
 - teachers can create meetings on Google Meet, that will be accessible to every student  
 - everybody receives an email notification 15 minutes before one of their classes start  
   ![ClassRemainder]()  
 - students receive an email notification every time when one of their teachers posts an announcement  
   ![NewAnnouncement]()  
### Case Study
![CaseStudy]()  
### Quality
![Quality]()  
## Back-end
![Functionality]()
#### API
 - Node.js RESTful API with Express.js  
 - database: Cloud SQL for SQL Server  
#### Google Cloud Functions
 - sendClassRemainderEmail: Cloud Scheduler - Cloud Pub/Sub - Cloud Functions  
 - sendWelcomeEmailToNewUser and sendNewAnnouncementEmail: Aggregated sink - Cloud Pub/Sub - Cloud Functions  
## Front-end
![Functionality]()
 - Blazor (web framework using C#)  
 - Razden Blazor Component Library  
## Authentication and Authorization
 - Azure Active Directory B2C  
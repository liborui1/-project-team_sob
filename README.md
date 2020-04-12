# app URL

https://www.drawshare.me/

# Video URL

https://www.youtube.com/watch?v=-9HKllvfvMI&feature=youtu.be

# project-team_sob
project-team_sob created by GitHub Classroom

# Title: Board Share

contributor 1: Syed Sohail Ahmed

contributor 2: Ohm Negi

contributor 3: Borui Li 

## Description of the web application 
	
An online whiteboard where multiple users can simultaneously interact with the board. The board’s primary purpose is to be used as a platform for users to teach each other material which is difficult to explain in words but is simpler to explain quickly through drawings. Our goal is to make this whiteboard  easy to use, fast to jump into, and provide additional functionality for users. 

## Features to implement in Beta Version

### Sharing

Users should be able to generate links to send to other users and give them the authentication to edit the whiteboard.

### Toolbar and drawing
All users users should be able to draw figures on the whiteboard and have access to the toolbar, that allows the users to draw
Moving and zooming
Users should be able to move by clicking and dragging and zoom by scrolling the mouse wheel

### Timeline and saving
Users should be able to save their changes on the whiteboard

## Features to implement in Final Version

### Admin operations

Admins (users who create a Lobby and invite others to join the Lobby) should be able to kick users and give them permission or prevent them from drawing on the board.

### chat system

There should be a chat system for users in a lobby to communicate with each other.

### Audio chat

Users in a lobby should be able to communicate with each other through audio and mute themselves or block audio if they want.

### Ping and page assist

Users should be able to bring everyone’s screen into one location and alert the other users



## Description of the technology

Since our application involves users doing collaborative work on a whiteboard, we will require real-time communication between browsers. Therefore, we have planned to use **PeerJS**. The main advantage of using PeerJS provides a complete, configurable, and easy-to-use peer-to-peer connection API. We will be using **MongoDB**, a NO SQL database, for storing data.



## Five technical challenges
### 1. Implementing all the ideas and features

In Total, for our project we have come up with multiple ideas and features to make this project interesting and functional. Additional features such as adding more drawing tools, implementing chat systems, implementing converters and code compilers and many more, are all ideas we wish to include in our website.
    
Each feature requires different ways to implement and combining all features to work with each other correctly will require the complete understanding of each implementation.  To resolve this problem, we might sacrifice some tedious features and forces more on the core features of this web application.

### 2. Database management

Database is the most important part of a well designed website, as it is the foundation of the website. Having proper database management will make the designing process of the website much simpler.  However, with a project of allowing multiple users having access to an online white board will prove to be challenging.  The database needs to keep track of each edit of individual users as well as the group changes. To overcome this challenge we need to dive deep into the understanding of the database we choose to use and create the most efficient database as possible.

### 3. Syncing users and drawings

The most crucial functionality of our website is to have proper synchronization between the users. To have a flawless, no delay synchronization is heavily dependent on both the processing speed of the database and how the site is being designed.  We are planning to learn and master peerjs to accomplish this goal.

### 4. Saving function

Individually keeping track of each user’s actions as well as the team’s actions is going to be complex. As each user will be able to save their own creation, as well as the team saving the entire board visual. We will overcome this challenge by implementing the snapshot method where periodic snapshots are being saved and not the entire board visual. This way we can minimize the load on the backend database, as well as keep track the action of each individual user.

### 5. Getting use to all new applications and libraries

Applications such as PeerJs for frontend development and MongoDB for the backend require extensive time to learn and understand the use of these new applications. Using new libraries will post a challenge as well as each of us need to learn most from scratch.

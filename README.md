# COMP9323
## codeing review website
1. install nodejs `$brew install node`
2. terminal run `$npm install`
3. check version `$node -v`, mine is v10.11.0; `$npm -v`, mine is 6.4.1. 
4. Go into "workspace" file
5. terminal run `$nodemon app.js`
6. Browser opens `http://127.0.0.1:3000/`

## Operations
### 1. sign up/sign in 
After opens `http://127.0.0.1:3000/`, left up corner will show have two button sign up and sign in;
Sign up/Sign in page is a floppy disk. Click yellow block to change to sign up or sign in.
### 2. create coderoom
After login, left bottom in the sidebar, there is a yellow button "create coderoom". 
Type in coderoom name and short descriptions to create a new coderoom.
It will directly go into the new coderoom.
### 3. run code
(All coderoom can handle codes with out some input which needs to be write from terminal.)
After you paste some python codes in the coderoom, click "Run" button in the most top part.
Results will show in below.
### 4. give comments
Login user can give comments by select strings.
Click "show comments" in the most top part.
Select certain strings, type in content of comment in the right bottom part, and click submit.
The comment will show in real time.
### 5. reply comments
Click "show comments" in the most top part.
Choose any comment user wants to reply, click it, and there is a reply area pops up. Type in sentences, and click "reply"(close for cancel the reply). The reply will show under that parent comment in real time.
### 6. ask for permission
If userA does not hold the permission for writing in, click the "request permission" button in the most top part.
The personB who is holding the permission can click "user list" to pass it.
Then A can write in.
### 7. revoke permission
If personB is also the creator of the coderoom, B can revoke permission in the homepage.
There is a "3 dot" button in each coderoom that created by B.
B can click it and revoke permission.
### 8. delete coderoom
There is a "3 dot" button in each coderoom that created by B.
B can click it and delete coderoom.
### 9. others profile----owned coderooms/follower/following
There are 3 section to show users:
    I. realtime user: homepage coderoom
    II. realtime user: inside coderoom,user list
    III. comments area.
Avatars in every section can be clicked to go to that user's profile to follow them or view their coderooms or view who are following them or who are followed by them.
### 10. like or dislike
User can like/dislike each coderoom and each comments and each subcomments.
like/dislike coderoom: inside coderoom, thumbs up/down buttons are in the sidebar.
like/dislike comments/subcomments: inside coderoom, arrow up/down to like or dislike.
### 11. setting user profile
User can change profile by click the setting button in the left bottom corner.
There is an option called profile, and user can change basic information/view owned rooms/view follower and following in there.
### 12. log out
Click setting button, there is a log out option
### 13. search
Search bar in navigation bar is for searching author name.
"Filter tasks" search bar for search by title.
### 14. admin
Admin can delete any coderoom by login admin account.

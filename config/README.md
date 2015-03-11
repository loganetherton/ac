### User Types
This document describes the different user types available on the Appraisal Scope platform.

#### Super Admin
The _Super Admin_ is a special user having full administrative access to the Appraisal Scope platform. Only one Super Admin account can be created per sub. The Super Admin account is also used by Appraisal Scope developers and management for diagnostic purposes. The Super Admin account is invisible to the sub.

##### How Are Super Admin Accounts Created?
The Super Admin account can only be created during the sub's account setup phase.

##### v1 Sample Access
Access can be found in [User Type Access](https://github.com/ascope/manuals/blob/master/Developer's%20Guide/Guidelines/Overview/User%20Type%20Access.md).

#### Admin/Staff
The Appraisal Scope platform is primarily designed to accommodate the workflow of [AMC](https://github.com/ascope/manuals/blob/master/Developer's%20Guide/Guidelines/Overview/Glossary.md)s and lenders. Internally, we refer to Appraisal Scope Subscribers as [subs](https://github.com/ascope/manuals/blob/master/Developer's%20Guide/Guidelines/Overview/Glossary.md). Staff members of these subs will be given _Admin/Staff_ access.

##### How Are Admin/Staff Accounts Created?
- Login to [Super Admin account](https://github.com/ascope/manuals/blob/master/Developer's%20Guide/Guidelines/Overview/User%20Type%20Access.md).
- Click on the `STAFF` tab, `Staff` sub-tab.
- Under the `Create New Admin` section, new admin/staff accounts can be created. [Screenshot](http://screencast.com/t/1qGxitew).

##### v1 Sample Access 
Access can be found in [User Type Access](https://github.com/ascope/manuals/blob/master/Developer's%20Guide/Guidelines/Overview/User%20Type%20Access.md).   

#### Client
_Clients_ are typically banks or lenders who submit new appraisals to subs. Subs will then complete the appraisals and submit appraisal reports back to the clients.
  
##### How Are Client Accounts Created?
The Client View is typically used by sub users created under client companies. The client company itself will not usually sign in to the client view.

There are three methods for creating a client company in the Appraisal Scope platform:
1. Using the `CLIENT SIGN UP` tab on the Appraisal Scope login screen.
2. By creating a new company using the Admin/Staff View.
  * Log in to the [Admin/Staff View](https://github.com/ascope/manuals/blob/master/Developer's%20Guide/Guidelines/Overview/User%20Type%20Access.md).
  * Go to the `USERS` tab, `CLIENT` sub-tab.
  * Select `NEW COMPANY`. [Screenshot](http://screencast.com/t/yIWrumxacWt1).
3. By importing client companies using the Admin View.
  * Log in to the [Admin/Staff View](https://github.com/ascope/manuals/blob/master/Developer's%20Guide/Guidelines/Overview/User%20Type%20Access.md).
  * Go to the `SETTINGS` tab, `Import Client` sub-tab.
  * Upload a CSV document with the following columns:
    * Company Name
    * Contact First Name
    * Contact Last Name
    * Email
    * Address
    * City
    * State
    * Zip Code
    * Phone

##### How Are Sub Users Under a Client Company Created?
There are three methods for creating a sub user in the Appraisal Scope platform:
1. By sending a signup link from within the Admin/Staff view.
   * Log in to the [Admin/Staff View](https://github.com/ascope/manuals/blob/master/Developer's%20Guide/Guidelines/Overview/User%20Type%20Access.md).
   * Go to the `USERS` tab, `CLIENT` sub-tab.
   * Search for an existing company from within the search panel on the left portion of the screen.
   * Select a company from within the results container immediately beneath the search box.
   * Click `Email Signup Link` in the profile that displays on the right portion of the screen.
   * Enter up to four separate email addresses, and then click `Send`. [Screenshot](http://screencast.com/t/R90ooRE71vi)
2. By adding a user from an existing company from within the Admin/Staff view.
   * Log in to the [Admin/Staff View](https://github.com/ascope/manuals/blob/master/Developer's%20Guide/Guidelines/Overview/User%20Type%20Access.md).
   * Go to the `USERS` tab, `CLIENT` sub-tab.
   * Search for an existing company from within the search panel on the left portion of the screen.
   * Select a company from within the results container immediately beneath the search box.
   * Click `Add Users` from within the profile that displays on the right portion of the screen.
   * Follow the instructions on the screen.
3. By importing client sub users from within the Admin View.
   * Log in to the [Admin/Staff View](https://github.com/ascope/manuals/blob/master/Developer's%20Guide/Guidelines/Overview/User%20Type%20Access.md).
   * Go to the `SETTINGS` tab, `Import Users` sub-tab.
   * Upload a CSV document with the following columns:
  
* Company Name
* First Name
* Last Name
* Username
* Password
* Email
* User Type
 
##### v1 Sample Access
Access can be found in [User Type Access](https://github.com/ascope/manuals/blob/master/Developer's%20Guide/Guidelines/Overview/User%20Type%20Access.md).

#### Manager & Appraiser
This role is basically assigned to people who are created as both appraisers and managers under appraisal companies. They can take/track orders from subs for themselves as well as for the appraisers working in the same appraiser company.

##### How can a Manager & Appraiser account be created?
1. Login to Admin View.  
2. Go to `USERS > APPRAISER` tab and select some client company from search panel on the left.   
3. Click on the appraisal company from the search container to open that appraiser's profile, then click on the `ADD USER` tab.   
4. From the appraiser listing for the company seen under the `ADD USER` tab, you can use the Appraiser Manager checkbox to make the given appraiser a manager, too. [Screenshot](http://screencast.com/t/Zn63XTwf4ZHw).   

##### v1 Sample Access
Access can be found in [User Type Access](https://github.com/ascope/manuals/blob/master/Developer's%20Guide/Guidelines/Overview/User%20Type%20Access.md).

#### Company Manager

If an individual is working specifically as a manager in an appraisal company, then he is created as a manager only under that appraisal company. This type of user can accept/track orders for any other appraiser working in the same appraisal company, but cannot accept work for themselves.

##### How can a Company Manager account be created?
1. Login to Admin View.  
2. Go to the `USERS > APPRAISER` tab and select a client company from the search panel on the left.
3. Click on the appraisal company from the search container to open the appraiser's profile, then click on the `ADD USER` tab.  
4. Now use `ADD MANAGER` section under `ADD USER` page to add new manager under this appraiser company. [Screenshot](http://screencast.com/t/lNYdb7BElKf).    

##### v1 Sample Access
Access can be found in [User Type Access](https://github.com/ascope/manuals/blob/master/Developer's%20Guide/Guidelines/Overview/User%20Type%20Access.md).

#### Appraiser

Appraisers are the people who do the property appraisals assigned to them by subs and generate appraisal reports to send back to the subs, who in turn will forward to the Client (who originally submitted appraisal to subs).

Appraisers can work as independent appraisers, as well as under appraiser companies.

##### How can an Appraiser account be created?
There is an ASC database of certified appraisers already available on the [government website](https://www.asc.gov) from which the ASC (Appraisal Subcommittee) database is periodically imported to Appraisal Scope. 

Only appraisers available in ASC can register on the Appraisal Scope Platform using the `APPRAISER REGISTRATION` tab on the Appraisal Scope authentication page.   

To add an appraiser under an appraiser company:  
1. Login to the Admin View.     
2. Go to `USERS > APPRAISER`, then select a client company from the left search panel.
3. Click on the appraiser company from the search container to open the appraiser's profile. Click on the `ADD USER` tab.   
4. Use the `ADD APPRAISER` section under the `ADD USER` page to add a new appraiser under the selected appraisal company. [Screenshot](http://screencast.com/t/5lJXdwUL7p).   

##### v1 Sample Access
Access can be found in [User Type Access](https://github.com/ascope/manuals/blob/master/Developer's%20Guide/Guidelines/Overview/User%20Type%20Access.md).

Testing out ordered lists

1. Using the `CLIENT SIGN UP` tab on the Appraisal Scope login screen.
2. By creating a new company using the Admin/Staff View.
  * Log in to the [Admin/Staff View](https://github.com/ascope/manuals/blob/master/Developer's%20Guide/Guidelines/Overview/User%20Type%20Access.md).
  * Go to the `USERS` tab, `CLIENT` sub-tab.
  * Select `NEW COMPANY`. [Screenshot](http://screencast.com/t/yIWrumxacWt1).
3. By importing client companies using the Admin View.
  * Log in to the [Admin/Staff View](https://github.com/ascope/manuals/blob/master/Developer's%20Guide/Guidelines/Overview/User%20Type%20Access.md).
  * Go to the `SETTINGS` tab, `Import Client` sub-tab.
  * Upload a CSV document with the following columns:
    * Company Name
    * Contact First Name
    * Contact Last Name
    * Email
    * Address
    * City
    * State
    * Zip Code
    * Phone
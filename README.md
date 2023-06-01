# NODE

This is a small project to manage account migration

## Overview

Migration Management Service is a component providing an orchestration of the existing customers' billing transition  from ITBS system to the NGBS-based system. General scheme of the process is represented in the figure below. Approaches to development of the circled modules are described in this document:

https://lucid.app/lucidchart/invitations/accept/inv_d435d61e-766c-46e9-853c-d58784a05c43?viewport_loc=-705%2C-198%2C2601%2C1261%2C~VZ2Y6_ja11j

## Pre-requirements
To receive the source data for the migration the following permissions  need to be received in advance:
<ul>
<li>Access to the production SFDC account
<li>Access to the DWH 
    <ul>
    <li>Database credentials. For Production environment, it requires access to the database server via <i>Pulse Secure</i> VPN and configured <i>SecurID</i></li>
    <li>Access to <i>bsconsole.ringcentral.com</i> with the permission to download NiC monthly files and customer invoices</li>
    </ul>
</li>
</ul>

## Installation and configuration of Database

Initially, all data collected from various sources is loaded into a SQL database for analysis, presentation to the business team for approval, and use for later loading into the migration procedure. 

### SQLite

In the project we use <i>SQLite</i>, a C-language library that implements a small, fast, self-contained, high-reliability, full-featured, SQL database engine. 
Download the SQLite package for your operating system and install it:
https://www.sqlite.org

### DB Browser for SQLite

Most data operations are performed by scripts in this repository. However, some steps require direct access to the data. In addition, direct access is required to monitor the status of the data and troubleshoot potential data issues.
The installed SQLite package includes a command line utility for manipulating the data in the database file. However, it is recommended to install <i>DB Browser for SQLite</i>, a free application with a user interface that greatly simplifies manual data manipulation. Please follow the link to learn more about the tool:
https://sqlitebrowser.org/

## Installation of the Scripts

Clone the directory to an appropriate directory on your computer. The package consists of the following directories:
<ul>
<li>SQL - contains SQL scripts for initial configuration of the SQLite database</li>
<li>DWH_SQL - contains SQL requests supposed to be run on DWH database</li>
<li>src - contains a set of JavaScripts files used for data uploading to SQLite and manipulations</li>
</ul>

### Initial configuration of the Database
Run 


## Receiving source data




## Data Warehouse




## SFDC




## Monthly files




## Data upload 
### CSV files
### Handling C2C data
## Preparing batches
### Batch criteria
### Preparing data for business review and approval
### Review data import and 
### Error analysis

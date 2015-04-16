// eventually, you'll have some code here that uses the code in `archive-helpers.js`
// to actually download the urls you want to download.


var archive = require('../helpers/archive-helpers');
archive.readListOfUrls(archive.downloadUrls);


/*
crontab -e  //opens editor
man crontab //shows information

* = everytime, every minute or every day etc

1 /5 //every 5 minutes
1
*/
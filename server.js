/* Scraping into DB (18.2.5)
 * ========================== */

// Dependencies
var express = require("express");
var mongojs = require("mongojs");

var bodyParser = require("body-parser");

// Require request and cheerio. This makes the scraping possible
var request = require("request");
var cheerio = require("cheerio");





// Initialize Express
var app = express();
var PORT = process.env.PORT || 8000;

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.text());
app.use(bodyParser.json({ type: "application/vnd.api+json" }));


// Static directory
app.use(express.static("./public"));


// Set Handlebars.
var exphbs = require("express-handlebars");
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");




// Database configuration
var databaseUrl = "mongodb://me:password@ds155631.mlab.com:55631/scraper2";
var collections = ["scrapedData"];


// Hook mongojs configuration to the db variable
var db = mongojs(databaseUrl, collections);
db.on("error", function(error) {
  console.log("Database Error:", error);
});


// Main route (simple Hello World Message)
app.get("/", function(req, res) {
  res.render("index",{});
});

// Retrieve data from the db
app.get("/all", function(req, res) {
  // Find all results from the scrapedData collection in the db
  db.scrapedData.find({}, function(error, found) {
    // Throw any errors to the console
    if (error) {
      console.log(error);
    }
    // If there are no errors, send the data to the browser as a json
    else {
      res.json(found);
    }
  });
});

// Scrape data from one site and place it into the mongodb db
app.post("/scrape", function(req, res) {
  var scrapeLink = req.body.ebayUrl;

  var ebayBaseUrl = "http://www.ebay.com/sch/i.html?_from=R40&_trksid=p2051541.m570.l1313.TR8.TRC0.A0.H0.Xharley.TRS2&_nkw=";

  scrapeLink = ebayBaseUrl + scrapeLink + "&_sacat=6000"

  if (scrapeLink.length < 2) {

    res.redirect("/");
  }

  console.log(scrapeLink);
  // Make a request from ebay
  request(scrapeLink, function(error, response, html) {
    // Load the html body from request into cheerio
    var $ = cheerio.load(html);
    console.log("Here");


    // For each element with a "ListViewInner" Id
    $("li.sresult").each(function(i, element) {
      // Save the text of each link enclosed in the current element

     

     

      var title = $(this).find("h3").text();
      title = title.replace(/[\n\t\r]/g,"");
      
     
      // Save the href value of each link enclosed in the current element
      var link = $(this).find(".imgWr2").attr("href");
      

      // Save the href value of each link enclosed in the current element
      var image = $(this).find("img").attr("imgurl");
     

      
var itemId = $(this).attr("listingid");
      
      //price = price.replace(/[\n\t\r]/g,"");
      

   var price = $(this).find("li.lvprice.prc:first-child").text();
       price = price.replace(/[\n\t\r]/g,"");
      

      var sold = $(this).find("div.hotness-signal").text();
      sold = sold.replace(/^\s+|\s+$/g,'');
      sold = sold.replace(/[\n\t\r]/g,"");
      

      // If this title element had both a title and a link
      if (title && link && image) {
        // Save the data in the scrapedData db
        db.scrapedData.save({
          title: title,
          link: link,
          image: image,
          price: price,
          itemid: itemId,
          sold: sold,
          notes: ""
        },
        function(error, saved) {
          // If there's an error during this query
          if (error) {
            // Log the error
            console.log(error);
          }
         // Otherwise,
      console.log("saved data");
        });
      }
    });
  });

 
   res.render("results",{});
});

// Retrieve data from the db
app.get("/view", function(req, res) {



  // Find all results from the scrapedData collection in the db
  db.scrapedData.find({}, function(error, data) {
    // Throw any errors to the console
    if (error) {
      console.log(error);
    }
    // If there are no errors, send the data to the browser as a json
    else {


      //res.json(found);

      var recordsFound = data.length;
      console.log(recordsFound);

        data.reverse();

      res.render("found",{data,recordsFound});
    }
  });
});

app.post("/delete", function(req, res) {
  console.log(req.body.deleteRec);
  var recordId = {itemid : req.body.deleteRec};

    console.log(recordId);

db.scrapedData.remove(recordId, function(err, collection) {
 res.redirect("/view");
   
});


});

app.post("/update", function(req, res) {
   var recordId = {itemid : req.body.updateRec};
  var noteBox = req.body.deleteNote

  if (noteBox == "on") {
var noteUpdate = {$set : {notes : "",
                            bg : ""}}

  }
  else {
         var noteUpdate = {$set : {notes : req.body.notes,
                            bg : "darkred;"}}
  }


    console.log(recordId);
     console.log(noteUpdate);

db.scrapedData.update(recordId, noteUpdate, function(err, collection) {
 //res.redirect("/view");
  res.redirect("/view");
   
});


});


app.get("/reset", function(req, res) {
  

db.scrapedData.remove({}, function(err, collection) {
 res.redirect("/");
   
});


});

// Listen on port 3000
app.listen(PORT, function() {
  console.log("App running on port "+ PORT +"!");
});

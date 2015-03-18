//simple http request client,make http calls
var request = require('request');
//node-feedparser use for transform stream
//operating object mode XML in JS out balabala...
var FeedParser = require('feedparser');
//rss site configure
var rssSite = require('./rssSite.json');
//iconv use for text recoding
var IconV = require('iconv').Iconv;
//big hack tools
var _ = require('lodash');

/*
 * function Featch
 * 刚开始觉得写这段的大神好牛逼，后来发现是feedparser's iconv.js example
 * */
function fetchRss(feed, typeId) {
    var posts;

    // Define streams
    var req = request(feed, {timeout: 10000, pool: false});
    req.setMaxListeners(50);

    // 对于一些阻止非user-agent就不响应的处理
    req.setHeader('user-agent', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/31.0.1650.63 Safari/537.36')
        .setHeader('accept', 'text/html,application/xhtml+xml');

    var feedparser = new FeedParser();

    //Define handles
    req.on('error', function(error) {
        console.log("req.on() breakdown :(");
    });
    req.on('response', function(res) {
        var stream = this;
        posts = [];
        if (res.statusCode !== 200) {
            return this.emit('error', new Error('Bad status code :('));
        }
        stream.pipe(feedparser);
    });
    //feedparser.on('error');
    feedparser.on('end', function(err) {
        if (err) {
            reject(err);
        }
    //    resolve(posts);
    });
    feedparser.on('readable', function() {
        var post;
        var needopt = ['title', 'link', 'author'];
        while(post = this.read()) {
            post = _.pick(post, needopt);
        }
    });
    
    function transToPost(post) {
        var mPost = new Post({
            title: post.title,
            link: post.link,
            description: post.description,
            pubDate: post.pubDate,
            source: post.source,
            author: post.author,
            typeId: typeId
        }); 
        return mPost;
    }
}


/*=============================
 判断订阅频道数目
 如果work不为false则log出channel name
==============================*/
var channels = rssSite.channel;
channels.forEach( function(e, i) {
    if(e.work != false) {
        console.log("begin: " + e.title); 
        fetchRss(e.link, e.typeId).then( function(data) {
            console.log(data);
        });
        
    }
});

/*
 * Create Server
 */
/*
exports.channels = channels;
exports.fetchRss = fetchRss;
*/

/*
var server = require('http').createServer(function (req, res) {
    var stream = require('fs').createReadStream(require('path').resolve(__dirname, './test/feeds' + req.url));
    stream.pipe(res);
});
server.listen(0, function () {
    fetchRss('http://localhost:' + this.address().port + '/rss2sample.xml');
});
*/

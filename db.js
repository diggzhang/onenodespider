
/**
 * DB
 */

var PostSchema = new mongoose.Schema({
    title: String,
    link: String,
    description: String,
    pubDate: String,
    source: String,
    author: String,
    typeId: Number
});

module.exports = Post;

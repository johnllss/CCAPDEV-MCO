const mongoose = require('mongoose');
const User = require('./models/User');
const Post = require('./models/Post');
const Comment = require('./models/Comment');

process.on('uncaughtException', err => {
    console.error('Uncaught Exception:', err.message);
    process.exit(1);
});

process.on('unhandledRejection', err => {
    console.error('Unhandled Rejection:', err.message);
    process.exit(1);
});

async function seed() {
    await mongoose.connect("mongodb://127.0.0.1:27017/userDB");
    console.log('MongoDB connected');

    await User.deleteMany({});
    await Post.deleteMany({});
    await Comment.deleteMany({});

    const users = await User.insertMany([
        { username: 'JohnDuck', email: 'johnduck@email.com', password: 'password123', profile: { photo: 'https://i.pravatar.cc/150?img=12' }},
        { username: 'DanielD', email: 'danield@email.com', password: 'password123', profile: { photo: 'https://i.pravatar.cc/150?img=33' }},
        { username: 'PeterQ', email: 'peterq@email.com', password: 'password123', profile: { photo: 'https://i.pravatar.cc/150?img=68' }},
        { username: 'Username1', email: 'username1@email.com', password: 'password123', profile: { photo: 'https://i.pravatar.cc/150?img=47' }},
        { username: 'AntonD', email: 'antond@email.com', password: 'password123', profile: { photo: 'https://i.pravatar.cc/150?img=52' }},
        { username: 'MikeM', email: 'mikem@email.com', password: 'password123', profile: { photo: 'https://i.pravatar.cc/150?img=15' }},
        { username: 'SarahJ', email: 'sarahj@email.com', password: 'password123', profile: { photo: 'https://i.pravatar.cc/150?img=20' }},
        { username: 'TechLover99', email: 'techlover99@email.com', password: 'password123', profile: { photo: 'https://i.pravatar.cc/150?img=60' }}
    ]);

    const posts = await Post.insertMany([
        { 
            title: 'Found ducklings in my pool. The mom never came back even hours later. Help identifying breed?', 
            body: 'We found these 7 cute ducklings swimming in our pool yesterday afternoon...', 
            user: users[0]._id,
            image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/Mallard-duck-and-ducklings.jpg/640px-Mallard-duck-and-ducklings.jpg'
        },
        { 
            title: 'Out of context.', 
            body: '(from a real post: https://www.reddit.com/r/duck/comments/1i2fc3f)', 
            user: users[1]._id,
            image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bf/Bucephala-albeola-010.jpg/640px-Bucephala-albeola-010.jpg'
        },
        { 
            title: 'I dressed my ducks up as bowling pins for halloween', 
            body: 'Since runners come 90% bowling pin I added the other 10%... The stripe.', 
            user: users[2]._id,
            image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Indian_runner_ducks.jpg/640px-Indian_runner_ducks.jpg'
        },
        { 
            title: 'my 1yo and her dad put 100 rubber duckies on my computer.', 
            body: '(from a real post: https://www.reddit.com/r/duck/comments/1iedw5b)', 
            user: users[3]._id,
            image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/Rubber_duckies_on_a_table.jpg/640px-Rubber_duckies_on_a_table.jpg'
        },
        { 
            title: 'I found this at walmart for like $4 It is now my bathroom nightlight.', 
            body: '(from a real post: https://www.reddit.com/r/rubberducks/comments/1fgxow9)', 
            user: users[4]._id,
            image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Rubber_duck_assorted.jpg/640px-Rubber_duck_assorted.jpg'
        }
    ]);

    const comments = await Comment.insertMany([
        { content: 'This is a great point! I completely agree.', author: users[0]._id, post: posts[0]._id, parentComment: null, isEdited: false },
        { content: 'Thanks for sharing your thoughts!', author: users[3]._id, post: posts[0]._id, parentComment: null, isEdited: false },
        { content: 'I have a different perspective on this, but it\'s an interesting discussion!', author: users[4]._id, post: posts[0]._id, parentComment: null, isEdited: true },
        { content: 'The evolution of web development has been fascinating to watch over the years.', author: users[5]._id, post: posts[0]._id, parentComment: null, isEdited: true },
        { content: 'AI integration is definitely going to change everything.', author: users[7]._id, post: posts[0]._id, parentComment: null, isEdited: false },
        { content: 'Serverless architecture has made deployment so much easier!', author: users[1]._id, post: posts[0]._id, parentComment: null, isEdited: false },
        { content: 'Looking forward to seeing where WebAssembly takes us in the future.', author: users[3]._id, post: posts[0]._id, parentComment: null, isEdited: false },
    ]);

    await Comment.insertMany([
        { content: 'I agree too! Very well said.', author: users[1]._id, post: posts[0]._id, parentComment: comments[0]._id, isEdited: false },
        { content: 'Absolutely! I remember when jQuery was the big thing.', author: users[6]._id, post: posts[0]._id, parentComment: comments[3]._id, isEdited: false },
        { content: 'Great point! AI-assisted coding is just the beginning.', author: users[0]._id, post: posts[0]._id, parentComment: comments[4]._id, isEdited: false },
        { content: 'Yes! No more worrying about server maintenance.', author: users[2]._id, post: posts[0]._id, parentComment: comments[5]._id, isEdited: false },
    ]);

    console.log('✅ Database seeded successfully!');
    await mongoose.connection.close();
}

seed().catch(err => {
    console.error('❌ Seed failed:', err.message);
    mongoose.connection.close();
    process.exit(1);
});
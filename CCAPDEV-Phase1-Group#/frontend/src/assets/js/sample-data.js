const sampleUsers = [
    { id: 1, username: "JohnDuck", avatar: "https://i.pravatar.cc/150?img=12" },
    { id: 2, username: "DanielD", avatar: "https://i.pravatar.cc/150?img=33" },
    { id: 3, username: "PeterQ", avatar: "https://i.pravatar.cc/150?img=68" },
    { id: 4, username: "Username1", avatar: "https://i.pravatar.cc/150?img=47" },
    { id: 5, username: "AntonD", avatar: "https://i.pravatar.cc/150?img=52" },
    { id: 6, username: "MikeM", avatar: "https://i.pravatar.cc/150?img=15" },
    { id: 7, username: "SarahJ", avatar: "https://i.pravatar.cc/150?img=20" },
    { id: 8, username: "TechLover99", avatar: "https://i.pravatar.cc/150?img=60" }
];

const sampleComments = [
    {
        id: 1,
        postId: 1,
        userId: 1,
        text: "This is a great point! I completely agree.",
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        parentCommentId: null,
        isEdited: false
    },
    {
        id: 2,
        postId: 1,
        userId: 2,
        text: "I agree too! Very well said.",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        parentCommentId: 1,
        isEdited: false
    },
    {
        id: 3,
        postId: 1,
        userId: 3,
        text: "Couldn't have put it better!",
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        parentCommentId: 2,
        isEdited: false
    },
    {
        id: 4,
        postId: 1,
        userId: 4,
        text: "Thanks for sharing your thoughts!",
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        parentCommentId: null,
        isEdited: false
    },
    {
        id: 5,
        postId: 1,
        userId: 5,
        text: "I have a different perspective on this, but it's an interesting discussion!",
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        parentCommentId: null,
        isEdited: true
    },
    {
        id: 6,
        postId: 1,
        userId: 6,
        text: "The evolution of web development has been fascinating to watch over the years.",
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        parentCommentId: null,
        isEdited: true
    },
    {
        id: 7,
        postId: 1,
        userId: 7,
        text: "Absolutely! I remember when jQuery was the big thing.",
        timestamp: new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString(),
        parentCommentId: 6,
        isEdited: false
    },
    {
        id: 8,
        postId: 1,
        userId: 8,
        text: "AI integration is definitely going to change everything. Already seeing it with tools like GitHub Copilot.",
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        parentCommentId: null,
        isEdited: false
    },
    {
        id: 9,
        postId: 1,
        userId: 1,
        text: "Great point! AI-assisted coding is just the beginning.",
        timestamp: new Date(Date.now() - 5.5 * 60 * 60 * 1000).toISOString(),
        parentCommentId: 8,
        isEdited: false
    },
    {
        id: 10,
        postId: 1,
        userId: 2,
        text: "Serverless architecture has made deployment so much easier!",
        timestamp: new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString(),
        parentCommentId: null,
        isEdited: false
    },
    {
        id: 11,
        postId: 1,
        userId: 3,
        text: "Yes! No more worrying about server maintenance.",
        timestamp: new Date(Date.now() - 6.5 * 60 * 60 * 1000).toISOString(),
        parentCommentId: 10,
        isEdited: false
    },
    {
        id: 12,
        postId: 1,
        userId: 4,
        text: "Looking forward to seeing where WebAssembly takes us in the future.",
        timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
        parentCommentId: null,
        isEdited: false
    }
];

const currentUser = {
    id: 1,
    username: "JohnDuck",
    avatar: "https://i.pravatar.cc/150?img=12"
};

const session = require('express-session');

class MongoSessionStore extends session.Store {
    constructor({ mongooseConnection, collectionName = 'sessions', defaultTtlMs = 1000 * 60 * 60 * 24 } = {}) {
        super();
        this.mongooseConnection = mongooseConnection;
        this.collectionName = collectionName;
        this.defaultTtlMs = defaultTtlMs;
        this.collectionPromise = null;
    }

    async getCollection() {
        if (this.collectionPromise) {
            return this.collectionPromise;
        }

        this.collectionPromise = (async () => {
            if (this.mongooseConnection.readyState === 0) {
                await this.mongooseConnection.asPromise();
            }

            const collection = this.mongooseConnection.collection(this.collectionName);
            await collection.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
            return collection;
        })();

        return this.collectionPromise;
    }

    getExpirationDate(sess = {}) {
        const cookie = sess.cookie || {};

        if (cookie.expires) {
            return new Date(cookie.expires);
        }

        if (cookie.originalMaxAge) {
            return new Date(Date.now() + cookie.originalMaxAge);
        }

        if (cookie.maxAge) {
            return new Date(Date.now() + cookie.maxAge);
        }

        return new Date(Date.now() + this.defaultTtlMs);
    }

    async get(sid, callback = () => {}) {
        try {
            const collection = await this.getCollection();
            const record = await collection.findOne({ _id: sid });

            if (!record) {
                return callback(null, null);
            }

            if (record.expiresAt && record.expiresAt <= new Date()) {
                await collection.deleteOne({ _id: sid });
                return callback(null, null);
            }

            return callback(null, record.session || null);
        } catch (error) {
            return callback(error);
        }
    }

    async set(sid, sess, callback = () => {}) {
        try {
            const collection = await this.getCollection();
            await collection.updateOne(
                { _id: sid },
                {
                    $set: {
                        session: sess,
                        expiresAt: this.getExpirationDate(sess)
                    }
                },
                { upsert: true }
            );

            return callback(null);
        } catch (error) {
            return callback(error);
        }
    }

    async destroy(sid, callback = () => {}) {
        try {
            const collection = await this.getCollection();
            await collection.deleteOne({ _id: sid });
            return callback(null);
        } catch (error) {
            return callback(error);
        }
    }

    async touch(sid, sess, callback = () => {}) {
        try {
            const collection = await this.getCollection();
            await collection.updateOne(
                { _id: sid },
                {
                    $set: {
                        expiresAt: this.getExpirationDate(sess)
                    }
                }
            );

            return callback(null);
        } catch (error) {
            return callback(error);
        }
    }
}

module.exports = MongoSessionStore;
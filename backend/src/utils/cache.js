import redis from '../config/redis.js';

/**
 * Retrieves a parsed JSON value from the Redis cache.
 * @param {string} key - The cache key.
 * @returns {Promise<any | null>} The parsed object or null if not found.
 */
export const getCache = async (key) => {
    try {
        const data = await redis.get(key);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.warn(`[getCache] Error reading key ${key}:`, error.message);
        return null; // Fallback to fetching directly if Redis fails
    }
};

/**
 * Stores a value in the Redis cache as a JSON string.
 * @param {string} key - The cache key.
 * @param {any} value - The value to store.
 * @param {number} expirationInSeconds - Time to live in seconds (default: 3600).
 */
export const setCache = async (key, value, expirationInSeconds = 3600) => {
    try {
        await redis.set(key, JSON.stringify(value), 'EX', expirationInSeconds);
    } catch (error) {
        console.warn(`[setCache] Error setting key ${key}:`, error.message);
    }
};

/**
 * Deletes one or more keys from the cache.
 * @param {string|string[]} keys - A single cache key or an array of keys.
 */
export const delCache = async (keys) => {
    try {
        if (Array.isArray(keys) && keys.length > 0) {
            await redis.del(...keys);
        } else if (typeof keys === 'string') {
            await redis.del(keys);
        }
    } catch (error) {
        console.warn(`[delCache] Error deleting keys:`, error.message);
    }
};

/**
 * Deletes all keys matching a specific prefix.
 * @param {string} prefix - The prefix to match (e.g., 'businesses_paginated:').
 */
export const clearCachePrefix = async (prefix) => {
    try {
        const keys = await redis.keys(`${prefix}*`);
        if (keys.length > 0) {
            await redis.del(...keys);
        }
    } catch (error) {
        console.warn(`[clearCachePrefix] Error clearing prefix ${prefix}:`, error.message);
    }
};

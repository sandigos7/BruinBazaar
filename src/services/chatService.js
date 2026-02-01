/**
 * BruinBazaar chat service.
 * Conversations and messages. Real-time listeners for messages (cursorrules: limit to active chat).
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../config/firebase';

const CONVERSATIONS_COLLECTION = 'conversations';
const MESSAGES_SUBCOLLECTION = 'messages';
const PAGE_SIZE = 20;

/**
 * Get a single conversation by ID.
 * @param {string} conversationId
 * @returns {Promise<object | null>}
 */
export async function getConversation(conversationId) {
  try {
    const docRef = doc(db, CONVERSATIONS_COLLECTION, conversationId);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() };
  } catch (err) {
    console.error('chatService.getConversation:', err);
    throw new Error('Failed to fetch conversation. Please try again.');
  }
}

/**
 * Get all conversations for a user (sorted by most recent).
 * @param {string} userId
 * @returns {Promise<object[]>}
 */
export async function getConversations(userId) {
  try {
    const colRef = collection(db, CONVERSATIONS_COLLECTION);
    const q = query(
      colRef,
      where('participants', 'array-contains', userId),
      orderBy('lastMessageTime', 'desc'),
      limit(PAGE_SIZE)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.error('chatService.getConversations:', err);
    throw new Error('Failed to fetch conversations. Please try again.');
  }
}

/**
 * Find or create a conversation between two users for a listing.
 * @param {string} buyerId
 * @param {string} sellerId
 * @param {string} listingId
 * @param {string} listingTitle
 * @returns {Promise<object>} Conversation doc
 */
export async function getOrCreateConversation(buyerId, sellerId, listingId, listingTitle) {
  try {
    const colRef = collection(db, CONVERSATIONS_COLLECTION);
    const participants = [buyerId, sellerId].sort();
    const existingQuery = query(
      colRef,
      where('participants', '==', participants),
      where('listingId', '==', listingId),
      limit(1)
    );
    const existingSnap = await getDocs(existingQuery);
    if (!existingSnap.empty) {
      const d = existingSnap.docs[0];
      return { id: d.id, ...d.data() };
    }

    const docData = {
      participants,
      listingId,
      listingTitle,
      lastMessage: '',
      lastMessageTime: serverTimestamp(),
      unreadBy: [],
    };
    const docRef = await addDoc(colRef, docData);
    return { id: docRef.id, ...docData };
  } catch (err) {
    console.error('chatService.getOrCreateConversation:', err);
    if (err.code === 'permission-denied') {
      throw new Error('You must be logged in to start a conversation.');
    }
    throw new Error('Failed to start conversation. Please try again.');
  }
}

/**
 * Update conversation (lastMessage, lastMessageTime, unreadBy).
 * @param {string} conversationId
 * @param {object} updates
 * @returns {Promise<void>}
 */
export async function updateConversation(conversationId, updates) {
  try {
    const docRef = doc(db, CONVERSATIONS_COLLECTION, conversationId);
    await updateDoc(docRef, updates);
  } catch (err) {
    console.error('chatService.updateConversation:', err);
    throw new Error('Failed to update conversation. Please try again.');
  }
}

/**
 * Delete a conversation and all its messages.
 * @param {string} conversationId
 * @returns {Promise<void>}
 */
export async function deleteConversation(conversationId) {
  try {
    const convRef = doc(db, CONVERSATIONS_COLLECTION, conversationId);
    const messagesRef = collection(db, `${CONVERSATIONS_COLLECTION}/${conversationId}/${MESSAGES_SUBCOLLECTION}`);
    const messagesSnap = await getDocs(messagesRef);

    const batch = writeBatch(db);
    messagesSnap.docs.forEach((d) => batch.delete(d.ref));
    batch.delete(convRef);
    await batch.commit();
  } catch (err) {
    console.error('chatService.deleteConversation:', err);
    if (err.code === 'permission-denied') {
      throw new Error('You do not have permission to delete this conversation.');
    }
    throw new Error('Failed to delete conversation. Please try again.');
  }
}

/**
 * Send a message. Creates message doc and updates conversation lastMessage/lastMessageTime/unreadBy.
 * @param {string} conversationId
 * @param {string} senderId
 * @param {string} text
 * @param {string[]} [participants] - Optional; fetched from conversation if not provided
 * @returns {Promise<object>} Created message
 */
export async function sendMessage(conversationId, senderId, text, participants) {
  try {
    const messagesRef = collection(db, `${CONVERSATIONS_COLLECTION}/${conversationId}/${MESSAGES_SUBCOLLECTION}`);
    const messageData = {
      senderId,
      text: String(text).trim(),
      timestamp: serverTimestamp(),
      read: false,
    };
    const docRef = await addDoc(messagesRef, messageData);

    let participantIds = participants;
    if (!participantIds?.length) {
      const convSnap = await getDoc(doc(db, CONVERSATIONS_COLLECTION, conversationId));
      participantIds = convSnap.exists() ? convSnap.data().participants ?? [] : [];
    }
    const unreadBy = participantIds.filter((id) => id !== senderId);
    await updateDoc(doc(db, CONVERSATIONS_COLLECTION, conversationId), {
      lastMessage: messageData.text.slice(0, 100),
      lastMessageTime: serverTimestamp(),
      unreadBy,
    });

    return { id: docRef.id, ...messageData };
  } catch (err) {
    console.error('chatService.sendMessage:', err);
    if (err.code === 'permission-denied') {
      throw new Error('You must be logged in to send messages.');
    }
    throw new Error('Failed to send message. Please try again.');
  }
}

/**
 * Mark messages as read.
 * @param {string} conversationId
 * @param {string} userId - User marking as read
 * @returns {Promise<void>}
 */
export async function markConversationRead(conversationId, userId) {
  try {
    const convRef = doc(db, CONVERSATIONS_COLLECTION, conversationId);
    const convSnap = await getDoc(convRef);
    if (!convSnap.exists()) return;
    const unreadBy = convSnap.data().unreadBy ?? [];
    const next = unreadBy.filter((id) => id !== userId);
    if (next.length === unreadBy.length) return;
    await updateDoc(convRef, { unreadBy: next });
  } catch (err) {
    console.error('chatService.markConversationRead:', err);
  }
}

/**
 * Get messages (one-time fetch). Prefer subscribeToMessages for real-time.
 * @param {string} conversationId
 * @param {number} [maxCount=50]
 * @returns {Promise<object[]>}
 */
export async function getMessages(conversationId, maxCount = 50) {
  try {
    const messagesRef = collection(db, `${CONVERSATIONS_COLLECTION}/${conversationId}/${MESSAGES_SUBCOLLECTION}`);
    const q = query(
      messagesRef,
      orderBy('timestamp', 'asc'),
      limit(maxCount)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.error('chatService.getMessages:', err);
    throw new Error('Failed to fetch messages. Please try again.');
  }
}

/**
 * Real-time listener for messages. Unsubscribe via returned function (cursorrules: cleanup in useEffect).
 * @param {string} conversationId
 * @param {(messages: object[]) => void} callback
 * @returns {() => void} Unsubscribe
 */
export function subscribeToMessages(conversationId, callback) {
  const messagesRef = collection(db, `${CONVERSATIONS_COLLECTION}/${conversationId}/${MESSAGES_SUBCOLLECTION}`);
  const q = query(messagesRef, orderBy('timestamp', 'asc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const messages = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      callback(messages);
    },
    (err) => {
      console.error('chatService.subscribeToMessages:', err);
      callback([]);
    }
  );
}

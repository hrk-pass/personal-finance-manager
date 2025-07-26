import { db } from './firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, where, serverTimestamp } from 'firebase/firestore';
import { Account } from '@/types';

const ACCOUNTS_COLLECTION = 'accounts';

export const createAccount = async (userId: string, accountData: Omit<Account, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => {
  try {
    const docRef = await addDoc(collection(db, ACCOUNTS_COLLECTION), {
      ...accountData,
      userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating account:', error);
    throw error;
  }
};

export const updateAccount = async (accountId: string, accountData: Partial<Omit<Account, 'id' | 'createdAt' | 'updatedAt' | 'userId'>>) => {
  try {
    const accountRef = doc(db, ACCOUNTS_COLLECTION, accountId);
    await updateDoc(accountRef, {
      ...accountData,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating account:', error);
    throw error;
  }
};

export const deleteAccount = async (accountId: string) => {
  try {
    const accountRef = doc(db, ACCOUNTS_COLLECTION, accountId);
    await deleteDoc(accountRef);
  } catch (error) {
    console.error('Error deleting account:', error);
    throw error;
  }
};

export const getAccounts = async (userId: string): Promise<Account[]> => {
  try {
    const q = query(collection(db, ACCOUNTS_COLLECTION), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as Account[];
  } catch (error) {
    console.error('Error getting accounts:', error);
    throw error;
  }
}; 
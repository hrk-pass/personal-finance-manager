import { db } from './firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, serverTimestamp } from 'firebase/firestore';
import { Account } from '@/types';

const ACCOUNTS_COLLECTION = 'accounts';

export const createAccount = async (accountData: Omit<Account, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const docRef = await addDoc(collection(db, ACCOUNTS_COLLECTION), {
      ...accountData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating account:', error);
    throw error;
  }
};

export const updateAccount = async (accountId: string, accountData: Partial<Omit<Account, 'id' | 'createdAt' | 'updatedAt'>>) => {
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

export const getAccounts = async (): Promise<Account[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, ACCOUNTS_COLLECTION));
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
import { db } from './firebase';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  serverTimestamp,
  runTransaction,
} from 'firebase/firestore';
import { Transaction } from '@/types';

const TRANSACTIONS_COLLECTION = 'transactions';
const ACCOUNTS_COLLECTION = 'accounts';

export const createTransaction = async (
  transactionData: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>
) => {
  try {
    await runTransaction(db, async (transaction) => {
      // 新しい取引を作成
      const transactionRef = await addDoc(collection(db, TRANSACTIONS_COLLECTION), {
        ...transactionData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // アカウントの残高を更新
      const accountRef = doc(db, ACCOUNTS_COLLECTION, transactionData.accountId);
      const accountDoc = await transaction.get(accountRef);
      if (!accountDoc.exists()) {
        throw new Error('Account not found');
      }

      let balanceChange = 0;
      switch (transactionData.type) {
        case 'income':
          balanceChange = transactionData.amount;
          break;
        case 'expense':
          balanceChange = -transactionData.amount;
          break;
        case 'transfer':
          balanceChange = -transactionData.amount;
          if (transactionData.toAccountId) {
            const toAccountRef = doc(db, ACCOUNTS_COLLECTION, transactionData.toAccountId);
            const toAccountDoc = await transaction.get(toAccountRef);
            if (!toAccountDoc.exists()) {
              throw new Error('Destination account not found');
            }
            transaction.update(toAccountRef, {
              balance: toAccountDoc.data().balance + transactionData.amount,
              updatedAt: serverTimestamp(),
            });
          }
          break;
      }

      transaction.update(accountRef, {
        balance: accountDoc.data().balance + balanceChange,
        updatedAt: serverTimestamp(),
      });

      return transactionRef.id;
    });
  } catch (error) {
    console.error('Error creating transaction:', error);
    throw error;
  }
};

export const updateTransaction = async (
  transactionId: string,
  oldData: Transaction,
  newData: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>
) => {
  try {
    await runTransaction(db, async (transaction) => {
      // 古い取引の影響を元に戻す
      const oldAccountRef = doc(db, ACCOUNTS_COLLECTION, oldData.accountId);
      const oldAccountDoc = await transaction.get(oldAccountRef);
      if (!oldAccountDoc.exists()) {
        throw new Error('Original account not found');
      }

      let oldBalanceChange = 0;
      switch (oldData.type) {
        case 'income':
          oldBalanceChange = -oldData.amount;
          break;
        case 'expense':
          oldBalanceChange = oldData.amount;
          break;
        case 'transfer':
          oldBalanceChange = oldData.amount;
          if (oldData.toAccountId) {
            const oldToAccountRef = doc(db, ACCOUNTS_COLLECTION, oldData.toAccountId);
            const oldToAccountDoc = await transaction.get(oldToAccountRef);
            if (!oldToAccountDoc.exists()) {
              throw new Error('Original destination account not found');
            }
            transaction.update(oldToAccountRef, {
              balance: oldToAccountDoc.data().balance - oldData.amount,
              updatedAt: serverTimestamp(),
            });
          }
          break;
      }

      transaction.update(oldAccountRef, {
        balance: oldAccountDoc.data().balance + oldBalanceChange,
        updatedAt: serverTimestamp(),
      });

      // 新しい取引の影響を適用
      const newAccountRef = doc(db, ACCOUNTS_COLLECTION, newData.accountId);
      const newAccountDoc = await transaction.get(newAccountRef);
      if (!newAccountDoc.exists()) {
        throw new Error('New account not found');
      }

      let newBalanceChange = 0;
      switch (newData.type) {
        case 'income':
          newBalanceChange = newData.amount;
          break;
        case 'expense':
          newBalanceChange = -newData.amount;
          break;
        case 'transfer':
          newBalanceChange = -newData.amount;
          if (newData.toAccountId) {
            const newToAccountRef = doc(db, ACCOUNTS_COLLECTION, newData.toAccountId);
            const newToAccountDoc = await transaction.get(newToAccountRef);
            if (!newToAccountDoc.exists()) {
              throw new Error('New destination account not found');
            }
            transaction.update(newToAccountRef, {
              balance: newToAccountDoc.data().balance + newData.amount,
              updatedAt: serverTimestamp(),
            });
          }
          break;
      }

      transaction.update(newAccountRef, {
        balance: newAccountDoc.data().balance + newBalanceChange,
        updatedAt: serverTimestamp(),
      });

      // 取引自体を更新
      const transactionRef = doc(db, TRANSACTIONS_COLLECTION, transactionId);
      transaction.update(transactionRef, {
        ...newData,
        updatedAt: serverTimestamp(),
      });
    });
  } catch (error) {
    console.error('Error updating transaction:', error);
    throw error;
  }
};

export const deleteTransaction = async (transactionId: string, transactionData: Transaction) => {
  try {
    await runTransaction(db, async (transaction) => {
      // アカウントの残高を更新
      const accountRef = doc(db, ACCOUNTS_COLLECTION, transactionData.accountId);
      const accountDoc = await transaction.get(accountRef);
      if (!accountDoc.exists()) {
        throw new Error('Account not found');
      }

      let balanceChange = 0;
      switch (transactionData.type) {
        case 'income':
          balanceChange = -transactionData.amount;
          break;
        case 'expense':
          balanceChange = transactionData.amount;
          break;
        case 'transfer':
          balanceChange = transactionData.amount;
          if (transactionData.toAccountId) {
            const toAccountRef = doc(db, ACCOUNTS_COLLECTION, transactionData.toAccountId);
            const toAccountDoc = await transaction.get(toAccountRef);
            if (!toAccountDoc.exists()) {
              throw new Error('Destination account not found');
            }
            transaction.update(toAccountRef, {
              balance: toAccountDoc.data().balance - transactionData.amount,
              updatedAt: serverTimestamp(),
            });
          }
          break;
      }

      transaction.update(accountRef, {
        balance: accountDoc.data().balance + balanceChange,
        updatedAt: serverTimestamp(),
      });

      // 取引を削除
      const transactionRef = doc(db, TRANSACTIONS_COLLECTION, transactionId);
      transaction.delete(transactionRef);
    });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    throw error;
  }
};

export const getTransactions = async (): Promise<Transaction[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, TRANSACTIONS_COLLECTION));
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date.toDate(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as Transaction[];
  } catch (error) {
    console.error('Error getting transactions:', error);
    throw error;
  }
}; 
import { db } from './firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, where, serverTimestamp, getDoc } from 'firebase/firestore';
import { Budget } from '@/types';

const BUDGETS_COLLECTION = 'budgets';

export const createBudget = async (userId: string, budgetData: Omit<Budget, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
  try {
    const docRef = await addDoc(collection(db, BUDGETS_COLLECTION), {
      ...budgetData,
      userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating budget:', error);
    throw error;
  }
};

export const updateBudget = async (budgetId: string, budgetData: Partial<Omit<Budget, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>) => {
  try {
    const budgetRef = doc(db, BUDGETS_COLLECTION, budgetId);
    await updateDoc(budgetRef, {
      ...budgetData,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating budget:', error);
    throw error;
  }
};

export const deleteBudget = async (budgetId: string) => {
  try {
    const budgetRef = doc(db, BUDGETS_COLLECTION, budgetId);
    await deleteDoc(budgetRef);
  } catch (error) {
    console.error('Error deleting budget:', error);
    throw error;
  }
};

export const getBudgets = async (userId: string): Promise<Budget[]> => {
  try {
    const q = query(collection(db, BUDGETS_COLLECTION), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      startDate: doc.data().startDate?.toDate(),
      endDate: doc.data().endDate?.toDate(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as Budget[];
  } catch (error) {
    console.error('Error getting budgets:', error);
    throw error;
  }
};

export const getBudgetProgress = async (budgetId: string) => {
  try {
    const budgetRef = doc(db, BUDGETS_COLLECTION, budgetId);
    const budgetDoc = await getDoc(budgetRef);
    
    if (!budgetDoc.exists()) {
      throw new Error('Budget not found');
    }

    const budget = { id: budgetDoc.id, ...budgetDoc.data() } as Budget;

    // 予算期間内の取引を取得
    const transactionsQuery = query(
      collection(db, 'transactions'),
      where('userId', '==', budget.userId),
      where('categoryId', 'in', budget.categoryIds),
      where('date', '>=', budget.startDate),
      where('date', '<=', budget.endDate || new Date())
    );

    const transactions = await getDocs(transactionsQuery);
    const totalSpent = transactions.docs.reduce((sum, doc) => {
      const transaction = doc.data();
      return sum + (transaction.type === 'expense' ? transaction.amount : 0);
    }, 0);

    return {
      budgetAmount: budget.amount,
      spentAmount: totalSpent,
      remainingAmount: budget.amount - totalSpent,
      percentageUsed: (totalSpent / budget.amount) * 100,
    };
  } catch (error) {
    console.error('Error getting budget progress:', error);
    throw error;
  }
}; 
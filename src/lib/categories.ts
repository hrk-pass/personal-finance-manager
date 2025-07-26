import { db } from './firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, where, serverTimestamp } from 'firebase/firestore';
import { TransactionCategory } from '@/types';

const CATEGORIES_COLLECTION = 'categories';

export const createCategory = async (userId: string, categoryData: Omit<TransactionCategory, 'id' | 'userId'>) => {
  try {
    const docRef = await addDoc(collection(db, CATEGORIES_COLLECTION), {
      ...categoryData,
      userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating category:', error);
    throw error;
  }
};

export const updateCategory = async (categoryId: string, categoryData: Partial<Omit<TransactionCategory, 'id' | 'userId'>>) => {
  try {
    const categoryRef = doc(db, CATEGORIES_COLLECTION, categoryId);
    await updateDoc(categoryRef, {
      ...categoryData,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating category:', error);
    throw error;
  }
};

export const deleteCategory = async (categoryId: string) => {
  try {
    const categoryRef = doc(db, CATEGORIES_COLLECTION, categoryId);
    await deleteDoc(categoryRef);
  } catch (error) {
    console.error('Error deleting category:', error);
    throw error;
  }
};

export const getCategories = async (userId: string): Promise<TransactionCategory[]> => {
  try {
    const q = query(collection(db, CATEGORIES_COLLECTION), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as TransactionCategory[];
  } catch (error) {
    console.error('Error getting categories:', error);
    throw error;
  }
};

// デフォルトカテゴリーの作成
export const createDefaultCategories = async (userId: string) => {
  const defaultCategories = [
    { name: '給与', type: 'income', color: '#4CAF50', icon: '💰' },
    { name: '投資収入', type: 'income', color: '#2196F3', icon: '📈' },
    { name: 'その他収入', type: 'income', color: '#9C27B0', icon: '🎁' },
    { name: '食費', type: 'expense', color: '#F44336', icon: '🍴' },
    { name: '交通費', type: 'expense', color: '#FF9800', icon: '🚃' },
    { name: '住居費', type: 'expense', color: '#795548', icon: '🏠' },
    { name: '光熱費', type: 'expense', color: '#607D8B', icon: '💡' },
    { name: '通信費', type: 'expense', color: '#00BCD4', icon: '📱' },
    { name: '娯楽費', type: 'expense', color: '#E91E63', icon: '🎮' },
    { name: '医療費', type: 'expense', color: '#8BC34A', icon: '🏥' },
    { name: '保険料', type: 'expense', color: '#3F51B5', icon: '🏦' },
    { name: '教育費', type: 'expense', color: '#009688', icon: '📚' },
    { name: '買い物', type: 'expense', color: '#FF5722', icon: '🛍️' },
    { name: 'その他支出', type: 'expense', color: '#9E9E9E', icon: '📝' },
  ] as const;

  try {
    const existingCategories = await getCategories(userId);
    if (existingCategories.length === 0) {
      await Promise.all(
        defaultCategories.map(category => createCategory(userId, category as any))
      );
    }
  } catch (error) {
    console.error('Error creating default categories:', error);
    throw error;
  }
}; 
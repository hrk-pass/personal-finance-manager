import { GoogleAuthProvider, signInWithPopup, signOut, AuthError } from 'firebase/auth';
import { auth } from './firebase';

export async function signInWithGoogle() {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    console.log('ログイン成功:', result.user);
    return result.user;
  } catch (error) {
    console.error('Googleログインエラー:', error);
    const authError = error as AuthError;
    if (authError.code === 'auth/popup-closed-by-user') {
      throw new Error('ログインがキャンセルされました');
    } else if (authError.code === 'auth/popup-blocked') {
      throw new Error('ポップアップがブロックされました。ポップアップを許可してください。');
    } else {
      throw new Error('ログインに失敗しました。もう一度お試しください。');
    }
  }
}

export async function signOutUser() {
  try {
    await signOut(auth);
    console.log('ログアウト成功');
  } catch (error) {
    console.error('ログアウトエラー:', error);
    throw new Error('ログアウトに失敗しました。もう一度お試しください。');
  }
} 
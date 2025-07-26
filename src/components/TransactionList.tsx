import { Transaction, Account } from '@/types';

type TransactionListProps = {
  transactions: Transaction[];
  accounts: Account[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (transactionId: string) => void;
};

export default function TransactionList({ transactions, accounts, onEdit, onDelete }: TransactionListProps) {
  const getTransactionTypeLabel = (type: Transaction['type']) => {
    switch (type) {
      case 'income':
        return '収入';
      case 'expense':
        return '支出';
      case 'transfer':
        return '振替';
      default:
        return type;
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // 口座ごとにトランザクションをグループ化
  const transactionsByAccount = accounts.map(account => {
    const accountTransactions = transactions.filter(t => 
      t.accountId === account.id || 
      (t.type === 'transfer' && t.toAccountId === account.id)
    );

    // 口座の残高を計算
    const balance = accountTransactions.reduce((sum, t) => {
      if (t.accountId === account.id) {
        return sum + (t.type === 'income' ? t.amount : -t.amount);
      } else if (t.type === 'transfer' && t.toAccountId === account.id) {
        return sum + t.amount;
      }
      return sum;
    }, account.balance);

    return {
      account,
      transactions: accountTransactions,
      balance
    };
  });

  return (
    <div className="space-y-8">
      {transactionsByAccount.map(({ account, transactions: accountTransactions, balance }) => (
        <div key={account.id} className="overflow-hidden bg-white shadow sm:rounded-lg">
          <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">{account.name}</h3>
              <span className={`text-lg font-medium ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ¥{balance.toLocaleString()}
              </span>
            </div>
          </div>
          <ul role="list" className="divide-y divide-gray-200">
            {accountTransactions.length === 0 ? (
              <li className="px-4 py-4 text-center text-gray-500">
                取引履歴がありません
              </li>
            ) : (
              accountTransactions
                .sort((a, b) => b.date.getTime() - a.date.getTime())
                .map((transaction) => (
                  <li key={transaction.id} className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <div className="flex items-center space-x-3">
                          <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium">
                            {getTransactionTypeLabel(transaction.type)}
                          </span>
                          <p className="text-sm font-medium text-indigo-600">{transaction.description}</p>
                        </div>
                        <div className="mt-1">
                          {transaction.type === 'transfer' && (
                            <p className="text-sm text-gray-500">
                              {transaction.accountId === account.id ? (
                                <>送金先: {accounts.find(a => a.id === transaction.toAccountId)?.name}</>
                              ) : (
                                <>送金元: {accounts.find(a => a.id === transaction.accountId)?.name}</>
                              )}
                            </p>
                          )}
                          <p className="text-sm text-gray-500">
                            {formatDate(transaction.date)} • {transaction.category}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className={`text-sm font-medium ${
                          transaction.type === 'income' || (transaction.type === 'transfer' && transaction.toAccountId === account.id)
                            ? 'text-green-600' 
                            : transaction.type === 'expense' || (transaction.type === 'transfer' && transaction.accountId === account.id)
                            ? 'text-red-600'
                            : 'text-gray-900'
                        }`}>
                          {transaction.type === 'income' || (transaction.type === 'transfer' && transaction.toAccountId === account.id)
                            ? '+' 
                            : '-'}
                          ¥{transaction.amount.toLocaleString()}
                        </span>
                        <button
                          onClick={() => onEdit(transaction)}
                          className="rounded bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-600 shadow-sm hover:bg-blue-100"
                        >
                          編集
                        </button>
                        <button
                          onClick={() => onDelete(transaction.id)}
                          className="rounded bg-red-50 px-2 py-1 text-xs font-semibold text-red-600 shadow-sm hover:bg-red-100"
                        >
                          削除
                        </button>
                      </div>
                    </div>
                  </li>
                ))
            )}
          </ul>
        </div>
      ))}
    </div>
  );
} 
import { Account } from '@/types';

type AccountListProps = {
  accounts: Account[];
  onEdit: (account: Account) => void;
  onDelete: (accountId: string) => void;
};

export default function AccountList({ accounts, onEdit, onDelete }: AccountListProps) {
  const getAccountTypeLabel = (type: Account['type']) => {
    switch (type) {
      case 'bank':
        return '銀行口座';
      case 'emoney':
        return '電子マネー';
      case 'wallet':
        return '財布';
      default:
        return type;
    }
  };

  return (
    <div className="overflow-hidden bg-white shadow sm:rounded-lg">
      <ul role="list" className="divide-y divide-gray-200">
        {accounts.map((account) => (
          <li key={account.id} className="px-4 py-4 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <p className="truncate text-sm font-medium text-indigo-600">{account.name}</p>
                <p className="text-sm text-gray-500">{getAccountTypeLabel(account.type)}</p>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-gray-900">
                  ¥{account.balance.toLocaleString()}
                </span>
                <button
                  onClick={() => onEdit(account)}
                  className="rounded bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-600 shadow-sm hover:bg-blue-100"
                >
                  編集
                </button>
                <button
                  onClick={() => onDelete(account.id)}
                  className="rounded bg-red-50 px-2 py-1 text-xs font-semibold text-red-600 shadow-sm hover:bg-red-100"
                >
                  削除
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
} 
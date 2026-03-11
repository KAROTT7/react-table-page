import { Dropdown } from 'antd';
import { Home, KeyRound, LogOut, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AppHeader() {
  const navigate = useNavigate();

  const handleMenuClick = ({ key }: { key: string }) => {
    if (key === 'sign-out') {
      // 清空登录状态
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      // 跳转到登录页
      navigate('/login');
    } else if (key === 'change-password') {
      // TODO: 实现修改密码功能
      console.log('修改密码');
    }
  };

  const userMenuItems = [
    {
      key: 'change-password',
      label: (
        <span className="inline-flex items-center gap-2">
          <KeyRound className="w-4 h-4" />
          Modify Password
        </span>
      ),
    },
    {
      key: 'sign-out',
      label: (
        <span className="inline-flex items-center gap-2">
          <LogOut className="w-4 h-4" />
          Sign Out
        </span>
      ),
    },
  ];

  return (
    <header className="bg-white shadow-sm flex items-center h-10">
      <div className="w-62 px-4">
        <div className="flex items-center gap-2 text-gray-900 font-semibold">
          <Home className="w-5 h-5 text-indigo-600" />
          Vibe Console
        </div>
      </div>
      <div className="flex-1 flex justify-end items-center px-4">
        {/* <button
          type="button"
          onClick={onToggleExpand}
          className="text-sm text-gray-600 hover:text-indigo-600 transition-colors cursor-pointer"
        >
          {expand ? 'Collapse' : 'Expand'}
        </button> */}
        <Dropdown
          menu={{ items: userMenuItems, onClick: handleMenuClick }}
          trigger={['hover']}
          placement="bottomRight"
        >
          <button
            type="button"
            className="inline-flex items-center gap-2 px-3 py-2 rounded-md text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
          >
            <User className="w-4 h-4" />
            <span className="text-sm font-medium">admin</span>
          </button>
        </Dropdown>
      </div>
    </header>
  );
}

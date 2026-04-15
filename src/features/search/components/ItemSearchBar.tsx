import React, { useState } from 'react';
import { Search, X } from 'lucide-react';
import './ItemSearchBar.css';

interface ItemSearchBarProps {
  onSearch: (keyword: string) => void;
  placeholder?: string;
}

export const ItemSearchBar: React.FC<ItemSearchBarProps> = ({
  onSearch,
  placeholder = "주사 이름이나 검사 항목을 검색해 보세요",
}) => {
  const [value, setValue] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(value);
  };

  const handleClear = () => {
    setValue('');
    onSearch('');
  };

  return (
    <div className="item-search-bar-container">
      <form className="item-search-form" onSubmit={handleSubmit}>
        <div className="search-input-wrapper">
          <Search size={18} className="icon-search" />
          <input
            type="text"
            className="search-input"
            value={value}
            onChange={handleChange}
            placeholder={placeholder}
          />
          {value && (
            <button type="button" className="btn-clear" onClick={handleClear}>
              <X size={16} />
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

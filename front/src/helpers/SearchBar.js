import { SearchIcon } from './icons/SearchIcon';
import './SearchBar.css';

export const SearchBar = (p) => {
  return (
    <div className={`searchBarContainer ${p.className}`}>
      <SearchIcon size={20} />
      <input type="text" placeholder={p.placeholder} onChange={p.onChange} />
    </div>
  );
};
